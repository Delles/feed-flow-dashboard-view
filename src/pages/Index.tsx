import { useState, useEffect, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ArticleCard } from "@/components/ArticleCard";
import { SearchInput } from "@/components/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp } from "lucide-react";
import { useInitialFeedData } from "@/hooks/useInitialFeedData";
import { Article, RSSFeed } from "@/types/rss";
import { normalizeText } from "@/lib/normalizeText";
import { Badge } from "@/components/ui/badge";

const Index = () => {
    const { data, isLoading, error } = useInitialFeedData();
    const [feeds, setFeeds] = useState<RSSFeed[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [enabledFeeds, setEnabledFeeds] = useState<Record<string, boolean>>(
        {}
    );
    const [enabledCategories, setEnabledCategories] = useState<
        Record<string, boolean>
    >({});

    // Set initial data when it loads
    useEffect(() => {
        if (data) {
            console.log("📊 Setting initial data:", {
                feedCount: data.feeds.length,
                articleCount: data.articles.length,
                feeds: data.feeds.map((f) => ({ id: f.id, title: f.title })),
                sampleArticles: data.articles.slice(0, 3).map((a) => ({
                    id: a.id,
                    feedId: a.feedId,
                    title: a.title,
                })),
            });
            setFeeds(data.feeds);
            // Sort articles by date when setting initial data
            const sortedArticles = [...data.articles].sort((a, b) => {
                return (
                    new Date(b.pubDate).getTime() -
                    new Date(a.pubDate).getTime()
                );
            });
            setArticles(sortedArticles);

            // Initialize enabled states for feeds and categories
            const initialEnabledFeeds: Record<string, boolean> = {};
            const initialEnabledCategories: Record<string, boolean> = {};

            data.feeds.forEach((feed) => {
                initialEnabledFeeds[feed.id] = true;
                const category = feed.category ?? "Altele";
                if (!(category in initialEnabledCategories)) {
                    initialEnabledCategories[category] = true;
                }
            });

            setEnabledFeeds(initialEnabledFeeds);
            setEnabledCategories(initialEnabledCategories);
        }
    }, [data]);

    const filteredArticles = useMemo(() => {
        return articles
            .filter((article) => {
                const feed = feeds.find((f) => f.id === article.feedId);
                const category = feed?.category ?? "Altele";

                // Filter by enabled state first
                if (
                    !enabledFeeds[article.feedId] ||
                    !enabledCategories[category]
                ) {
                    return false;
                }

                // Filter by selected feed or category
                let categoryMatch = true;
                let feedMatch = true;

                if (selectedFeed) {
                    feedMatch = article.feedId === selectedFeed;
                } else if (selectedCategory) {
                    categoryMatch = category === selectedCategory;
                }

                // Prepare normalized versions for diacritic-insensitive matching
                const normalizedQuery = normalizeText(searchQuery);
                const titleNorm = normalizeText(article.title);
                const descNorm = normalizeText(article.description);

                const searchMatch = searchQuery
                    ? titleNorm.includes(normalizedQuery) ||
                      descNorm.includes(normalizedQuery)
                    : true;

                return feedMatch && categoryMatch && searchMatch;
            })
            .sort((a, b) => {
                // Sort by publication date, newest first
                return (
                    new Date(b.pubDate).getTime() -
                    new Date(a.pubDate).getTime()
                );
            });
    }, [
        articles,
        feeds,
        selectedFeed,
        selectedCategory,
        searchQuery,
        enabledFeeds,
        enabledCategories,
    ]);

    useEffect(() => {
        setIsSearching(true);
        const timer = setTimeout(() => setIsSearching(false), 500); // Simulate search time
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Show/Hide scroll-to-top button on mobile
    useEffect(() => {
        const onScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const addFeed = (feed: RSSFeed, newArticles: Article[]) => {
        console.log(
            "Adding feed:",
            feed.title,
            "with",
            newArticles.length,
            "articles"
        );
        setFeeds((prev) => [...prev, feed]);
        setArticles((prev) => {
            // Combine existing and new articles, then sort by date
            const combinedArticles = [...prev, ...newArticles];
            return combinedArticles.sort((a, b) => {
                return (
                    new Date(b.pubDate).getTime() -
                    new Date(a.pubDate).getTime()
                );
            });
        });

        // Enable the new feed and its category by default
        setEnabledFeeds((prev) => ({ ...prev, [feed.id]: true }));
        const category = feed.category ?? "Altele";
        setEnabledCategories((prev) => ({ ...prev, [category]: true }));
    };

    const removeFeed = (feedId: string) => {
        setFeeds((prev) => prev.filter((feed) => feed.id !== feedId));
        setArticles((prev) =>
            prev.filter((article) => article.feedId !== feedId)
        );
        setEnabledFeeds((prev) => {
            const { [feedId]: removed, ...rest } = prev;
            return rest;
        });
        if (selectedFeed === feedId) {
            setSelectedFeed(null);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleToggleFeed = (feedId: string, enabled: boolean) => {
        setEnabledFeeds((prev) => ({ ...prev, [feedId]: enabled }));
    };

    const handleToggleCategory = (category: string, enabled: boolean) => {
        setEnabledCategories((prev) => ({ ...prev, [category]: enabled }));

        // If disabling category, also disable all feeds in that category
        if (!enabled) {
            const feedsInCategory = feeds.filter(
                (f) => (f.category ?? "Altele") === category
            );
            setEnabledFeeds((prev) => {
                const updated = { ...prev };
                feedsInCategory.forEach((feed) => {
                    updated[feed.id] = false;
                });
                return updated;
            });
        } else {
            // If enabling category, enable all feeds in that category
            const feedsInCategory = feeds.filter(
                (f) => (f.category ?? "Altele") === category
            );
            setEnabledFeeds((prev) => {
                const updated = { ...prev };
                feedsInCategory.forEach((feed) => {
                    updated[feed.id] = true;
                });
                return updated;
            });
        }
    };

    const handleSelectCategory = (category: string | null) => {
        setSelectedCategory(category);
        setSelectedFeed(null); // Clear feed selection when selecting category
    };

    const handleSelectFeed = (feedId: string | null) => {
        setSelectedFeed(feedId);
        setSelectedCategory(null); // Clear category selection when selecting feed
    };

    // Show loading state
    if (isLoading) {
        return (
            <SidebarProvider>
                <div className="min-h-screen flex w-full bg-background justify-center">
                    <div className="w-64 border-r border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-6">
                            <Skeleton className="h-6 w-6 rounded" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-12 w-full rounded"
                                />
                            ))}
                        </div>
                    </div>
                    <main className="flex-1 p-6">
                        <div className="flex items-center justify-between mb-8">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-8 w-8 rounded" />
                        </div>
                        <Skeleton className="h-10 w-full max-w-lg mb-6" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-64 rounded-lg" />
                            ))}
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        );
    }

    // Show error state
    if (error) {
        return (
            <SidebarProvider>
                <div className="min-h-screen flex w-full bg-background justify-center">
                    <main className="flex-1 p-6">
                        <div className="text-center py-12">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                Nu s-au putut încărca fluxurile
                            </h3>
                            <p className="text-muted-foreground">
                                A apărut o eroare la încărcarea datelor
                                inițiale. Reîncarcă pagina și încearcă din nou.
                            </p>
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background justify-center">
                <AppSidebar
                    feeds={feeds}
                    articles={articles}
                    onAddFeed={addFeed}
                    onRemoveFeed={removeFeed}
                    selectedFeed={selectedFeed}
                    onSelectFeed={handleSelectFeed}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleSelectCategory}
                    enabledFeeds={enabledFeeds}
                    enabledCategories={enabledCategories}
                    onToggleFeed={handleToggleFeed}
                    onToggleCategory={handleToggleCategory}
                />
                <div className="flex flex-col flex-1 w-full max-w-6xl mx-4 md:mx-8">
                    <header className="sticky top-0 z-10 flex flex-col gap-2 px-4 py-2 bg-background/95 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
                        <div className="flex items-center gap-4 h-12">
                            <SidebarTrigger className="lg:hidden" />
                            <div className="flex-1">
                                <SearchInput
                                    onSearch={handleSearch}
                                    isLoading={isSearching}
                                />
                            </div>
                            <ThemeToggle />
                        </div>
                        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
                            <h1 className="text-lg font-bold text-foreground md:text-2xl">
                                Știri
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                <Badge
                                    variant="outline"
                                    className="border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold"
                                >
                                    {selectedFeed
                                        ? feeds.find(
                                              (f) => f.id === selectedFeed
                                          )?.title
                                        : selectedCategory ||
                                          "Toate articolele"}
                                </Badge>
                                {searchQuery && (
                                    <Badge
                                        variant="secondary"
                                        className="font-normal"
                                    >
                                        "{searchQuery}"
                                    </Badge>
                                )}
                                <span className="font-medium text-foreground/80 whitespace-nowrap">
                                    {filteredArticles.length} din{" "}
                                    {articles.length} articole
                                </span>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 p-6 pt-4 md:pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredArticles.map((article) => (
                                <ArticleCard
                                    key={article.id}
                                    article={article}
                                    feeds={feeds}
                                />
                            ))}
                        </div>

                        {filteredArticles.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-muted-foreground text-6xl mb-4">
                                    {searchQuery ? "🔍" : "📰"}
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    {searchQuery
                                        ? "Nu am găsit articole"
                                        : "Nu există articole"}
                                </h3>
                                <p className="text-muted-foreground">
                                    {searchQuery
                                        ? `Încearcă alți termeni sau șterge căutarea.`
                                        : "Adaugă fluxuri RSS pentru a începe!"}
                                </p>
                            </div>
                        )}
                    </main>
                    {showScrollTop && (
                        <button
                            onClick={scrollToTop}
                            className="fixed bottom-20 right-4 lg:hidden bg-primary text-primary-foreground shadow-lg rounded-full p-3"
                            aria-label="Înapoi sus"
                        >
                            <ChevronUp className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Index;
