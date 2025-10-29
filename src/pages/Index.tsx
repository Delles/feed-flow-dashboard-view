import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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
        window.addEventListener("scroll", onScroll);
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
                    onAddFeed={() => {}} // Placeholder, not implemented
                    onRemoveFeed={() => {}} // Placeholder, not implemented
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
                    <PageHeader
                        feeds={feeds}
                        selectedFeed={selectedFeed}
                        selectedCategory={selectedCategory}
                        searchQuery={searchQuery}
                        totalAvailable={totalAvailable}
                        isSearching={isSearching}
                        isRefreshing={isFetching}
                        onSearch={handleSearch}
                        onRefresh={refetch}
                        onSelectFeed={handleSelectFeed}
                        onSelectCategory={handleSelectCategory}
                        onAddFeed={() => {}}
                    />

                    <main className="flex-1 p-6 pt-4 md:pt-6">
                        <ErrorBoundary>
                            <ArticleGrid
                                articles={displayedArticles}
                                feeds={feeds}
                                hasMore={hasMore}
                                isLoading={isLoadingMore}
                                onLoadMore={loadMore}
                                totalAvailable={totalAvailable}
                            />
                        </ErrorBoundary>
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
