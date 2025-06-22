import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ArticleGridInfinite } from "@/components/ArticleGridInfinite";
import { SearchInput } from "@/components/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp } from "lucide-react";
import { useIncrementalFeeds } from "@/hooks/useIncrementalFeeds";
import { useInfiniteArticles } from "@/hooks/useInfiniteArticles";
import { Article, RSSFeed } from "@/types/rss";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
    const {
        feeds: loadedFeeds,
        articles: loadedArticles,
        isInitialLoading,
    } = useIncrementalFeeds();
    const [feeds, setFeeds] = useState<RSSFeed[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [enabledFeeds, setEnabledFeeds] = useState<Record<string, boolean>>(
        {}
    );
    const [enabledCategories, setEnabledCategories] = useState<
        Record<string, boolean>
    >({});

    // Memoize feed IDs to detect new feeds and prevent infinite loops
    const currentFeedIds = useMemo(
        () => new Set(loadedFeeds.map((f) => f.id)),
        [loadedFeeds]
    );

    const currentArticleIds = useMemo(
        () => new Set(loadedArticles.map((a) => a.id)),
        [loadedArticles]
    );

    // Track processed IDs to prevent re-processing
    const processedFeedIds = useRef(new Set<string>());
    const processedArticleIds = useRef(new Set<string>());

    const isMobile = useIsMobile();

    useEffect(() => {
        // Find truly new feeds that haven't been processed
        const newFeedIds = Array.from(currentFeedIds).filter(
            (id) => !processedFeedIds.current.has(id)
        );
        const newArticleIds = Array.from(currentArticleIds).filter(
            (id) => !processedArticleIds.current.has(id)
        );

        if (newFeedIds.length > 0 || newArticleIds.length > 0) {
            // Mark new items as processed
            newFeedIds.forEach((id) => processedFeedIds.current.add(id));
            newArticleIds.forEach((id) => processedArticleIds.current.add(id));

            // Only update if we have new feeds
            if (newFeedIds.length > 0) {
                const newFeeds = loadedFeeds.filter((f) =>
                    newFeedIds.includes(f.id)
                );

                setFeeds((prev) => {
                    const existingIds = new Set(prev.map((f) => f.id));
                    const merged = [...prev];
                    newFeeds.forEach((f) => {
                        if (!existingIds.has(f.id)) merged.push(f);
                    });
                    return merged;
                });

                // Enable new feeds & categories
                setEnabledFeeds((prev) => {
                    const updated = { ...prev };
                    newFeeds.forEach((f) => {
                        if (!(f.id in updated)) updated[f.id] = true;
                    });
                    return updated;
                });

                setEnabledCategories((prev) => {
                    const updated = { ...prev };
                    newFeeds.forEach((f) => {
                        const cat = f.category ?? "Altele";
                        if (!(cat in updated)) updated[cat] = true;
                    });
                    return updated;
                });
            }

            // Only update articles if we have new ones
            if (newArticleIds.length > 0) {
                const newArticles = loadedArticles.filter((a) =>
                    newArticleIds.includes(a.id)
                );

                setArticles((prev) => {
                    const existingIds = new Set(prev.map((a) => a.id));
                    const combined = [...prev];
                    newArticles.forEach((a) => {
                        if (!existingIds.has(a.id)) combined.push(a);
                    });
                    // sort newest first
                    combined.sort(
                        (a, b) =>
                            new Date(b.pubDate).getTime() -
                            new Date(a.pubDate).getTime()
                    );
                    return combined;
                });
            }
        }
    }, [currentFeedIds, currentArticleIds, loadedFeeds, loadedArticles]);

    // Use infinite articles hook for optimized rendering and memory usage
    const {
        displayedArticles,
        hasMore,
        isLoading: isLoadingMore,
        loadMore,
        reset,
        totalAvailable,
        isSearching,
    } = useInfiniteArticles({
        allArticles: articles,
        feeds,
        searchQuery,
        selectedFeed,
        selectedCategory,
        enabledFeeds,
        enabledCategories,
    });

    // Reset infinite scroll when search changes
    useEffect(() => {
        reset();
    }, [searchQuery, reset]);

    // Reset infinite scroll when filters change
    useEffect(() => {
        reset();
    }, [selectedFeed, selectedCategory, reset]);

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

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

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
    if (isInitialLoading) {
        // Detailed skeleton that matches the final layout to prevent CLS
        return (
            <SidebarProvider>
                <div className="min-h-screen flex w-full bg-background justify-center">
                    {!isMobile ? (
                        // Desktop skeleton layout
                        <>
                            <div className="w-80 border-r border-border p-6 shrink-0">
                                {/* Sidebar Header Skeleton */}
                                <div className="flex items-center gap-4 pb-6 border-b border-border">
                                    <Skeleton className="h-12 w-12 rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-24" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                                {/* Sidebar Content Skeleton */}
                                <div className="space-y-2 py-4">
                                    <Skeleton className="h-24 w-full rounded-lg" />
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="pt-4 space-y-4">
                                            <div className="flex justify-between items-center px-2">
                                                <Skeleton className="h-8 w-2/5" />
                                                <Skeleton className="h-6 w-12 rounded-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <Skeleton className="h-16 w-full rounded-lg" />
                                                <Skeleton className="h-16 w-full rounded-lg" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <main className="flex-1 p-6">
                                {/* Header Skeleton */}
                                <div className="flex flex-col gap-2 px-4 py-2 mb-6 md:px-0">
                                    <div className="flex items-center gap-4 h-12">
                                        <div className="flex-1">
                                            <Skeleton className="h-10 w-full max-w-xl" />
                                        </div>
                                        <Skeleton className="h-9 w-9 rounded-full" />
                                    </div>
                                    <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
                                        <Skeleton className="h-8 w-24" />
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-6 w-32 rounded-full" />
                                            <Skeleton className="h-4 w-28" />
                                        </div>
                                    </div>
                                </div>

                                {/* Article Grid Skeleton */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex flex-col h-[460px] overflow-hidden rounded-lg border bg-card"
                                        >
                                            <Skeleton className="w-full aspect-video" />
                                            <div className="p-4 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="w-4 h-4" />
                                                    <Skeleton className="w-24 h-4" />
                                                    <Skeleton className="w-16 h-4" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Skeleton className="w-full h-5" />
                                                    <Skeleton className="w-11/12 h-5" />
                                                </div>
                                            </div>
                                            <div className="p-4 pt-0 flex-grow space-y-1.5">
                                                <Skeleton className="w-full h-3.5" />
                                                <Skeleton className="w-full h-3.5" />
                                                <Skeleton className="w-5/6 h-3.5" />
                                            </div>
                                            <div className="p-4 pt-0 mt-auto">
                                                <Skeleton className="w-28 h-5" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </main>
                        </>
                    ) : (
                        // Mobile skeleton layout
                        <div className="flex flex-col flex-1 w-full max-w-6xl mx-4">
                            <header className="sticky top-0 z-10 flex flex-col gap-2 px-0 py-2 bg-background/95 border-b backdrop-blur">
                                <div className="flex items-center gap-4 h-12">
                                    <Skeleton className="h-9 w-9" />
                                    <Skeleton className="h-10 flex-1" />
                                    <Skeleton className="h-9 w-9 rounded-full" />
                                </div>
                                <div className="flex flex-col items-start gap-2">
                                    <Skeleton className="h-8 w-24" />
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-6 w-32 rounded-full" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>
                                </div>
                            </header>
                            <main className="flex-1 pt-4">
                                <div className="space-y-4">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex flex-col h-[460px] overflow-hidden rounded-lg border bg-card"
                                        >
                                            <Skeleton className="w-full aspect-video" />
                                            <div className="p-4 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="w-4 h-4" />
                                                    <Skeleton className="w-24 h-4" />
                                                    <Skeleton className="w-16 h-4" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Skeleton className="w-full h-5" />
                                                    <Skeleton className="w-11/12 h-5" />
                                                </div>
                                            </div>
                                            <div className="p-4 pt-0 flex-grow space-y-1.5">
                                                <Skeleton className="w-full h-3.5" />
                                                <Skeleton className="w-full h-3.5" />
                                                <Skeleton className="w-5/6 h-3.5" />
                                            </div>
                                            <div className="p-4 pt-0 mt-auto">
                                                <Skeleton className="w-28 h-5" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </main>
                        </div>
                    )}
                </div>
            </SidebarProvider>
        );
    }

    // We no longer show a global error state because feeds load incrementally.

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
                                    {totalAvailable} articole
                                </span>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 p-6 pt-4 md:pt-6">
                        <ArticleGridInfinite
                            articles={displayedArticles}
                            feeds={feeds}
                            hasMore={hasMore}
                            isLoading={isLoadingMore}
                            onLoadMore={loadMore}
                            totalAvailable={totalAvailable}
                        />
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
