import { useState, useEffect, useTransition } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { ArticleGrid } from "@/components/ArticleGrid";
import { ChevronUp } from "lucide-react";
import { useInfiniteArticles } from "@/hooks/useInfiniteArticles";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useFeedManager } from "@/hooks/useFeedManager";
import { useFilters } from "@/hooks/useFilters";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = () => {
    const {
        feeds,
        articles,
        isInitialLoading,
        isFetching,
        enabledFeeds,
        enabledCategories,
        handleToggleFeed,
        handleToggleCategory,
        refetch,
    } = useFeedManager();

    const {
        selectedFeed,
        selectedCategory,
        searchQuery,
        handleSelectFeed,
        handleSelectCategory,
        handleSearch,
    } = useFilters();

    const [isPending, startTransition] = useTransition();

    const onSelectFeedWrapped = (feedId: string | null) => {
        startTransition(() => {
            handleSelectFeed(feedId);
        });
    };

    const onSelectCategoryWrapped = (category: string | null) => {
        startTransition(() => {
            handleSelectCategory(category);
        });
    };

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

    const [showScrollTop, setShowScrollTop] = useState(false);
    useEffect(() => reset(), [searchQuery, selectedFeed, selectedCategory, reset]);

    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    if (isInitialLoading) return <LoadingSkeleton />;

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background justify-center">
                <AppSidebar
                    feeds={feeds}
                    articles={articles}
                    onOpenAddFeedDialog={() => { }} // Placeholder, not implemented
                    onRemoveFeed={() => { }} // Placeholder, not implemented
                    selectedFeed={selectedFeed}
                    onSelectFeed={onSelectFeedWrapped}
                    selectedCategory={selectedCategory}
                    onSelectCategory={onSelectCategoryWrapped}
                    enabledFeeds={enabledFeeds}
                    enabledCategories={enabledCategories}
                    onToggleFeed={handleToggleFeed}
                    onToggleCategory={handleToggleCategory}
                />

                <div className="flex flex-col flex-1 w-full max-w-7xl">
                    <PageHeader
                        feeds={feeds}
                        selectedFeed={selectedFeed}
                        selectedCategory={selectedCategory}
                        searchQuery={searchQuery}
                        totalAvailable={totalAvailable}
                        isSearching={isSearching}
                        isRefreshing={isFetching || isPending}
                        onSearch={handleSearch}
                        onRefresh={refetch}
                        onSelectFeed={onSelectFeedWrapped}
                        onSelectCategory={onSelectCategoryWrapped}
                        onAddFeed={() => { }}
                    />

                    <main className="flex-1 p-6 md:p-12">
                        <ErrorBoundary>
                            <ArticleGrid
                                articles={displayedArticles}
                                feeds={feeds}
                                hasMore={hasMore}
                                isLoading={isLoadingMore || isPending}
                                onLoadMore={loadMore}
                                totalAvailable={totalAvailable}
                            />
                        </ErrorBoundary>
                    </main>

                    {showScrollTop && (
                        <button
                            onClick={scrollToTop}
                            className="fixed bottom-10 right-10 bg-primary text-white w-14 h-14 rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center transition-all duration-500 hover:-translate-y-2 hover:scale-110 active:scale-95 z-50 group"
                            aria-label="Înapoi sus"
                        >
                            <ChevronUp className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1" />
                        </button>
                    )}
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Index;
