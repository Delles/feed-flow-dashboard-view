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

/**
 * Main page component for the RSS feed dashboard.
 *
 * This component orchestrates the entire application by:
 * - Managing RSS feed data and filtering state
 * - Handling infinite scrolling and search functionality
 * - Providing responsive layout with sidebar and main content
 * - Implementing scroll-to-top functionality for mobile
 * - Enhanced error handling and network-aware data fetching
 */
const Index = () => {
    // ===== DATA MANAGEMENT =====
    // Encapsulated hook for managing RSS feed data and loading states
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

    // ===== FILTER STATE MANAGEMENT =====
    // Encapsulated hook for managing user filter selections
    const {
        selectedFeed,
        selectedCategory,
        searchQuery,
        handleSelectFeed,
        handleSelectCategory,
        handleSearch,
    } = useFilters();


    // ===== INFINITE SCROLL MANAGEMENT =====
    // Hook for managing article display with infinite scrolling
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

    // ===== UI STATE =====
    // State for mobile scroll-to-top button visibility
    const [showScrollTop, setShowScrollTop] = useState(false);

    // ===== EFFECTS =====
    // Reset infinite scroll when filter criteria change
    useEffect(() => {
        reset();
    }, [searchQuery, selectedFeed, selectedCategory, reset]);

    // Handle scroll-to-top button visibility
    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // ===== UTILITY FUNCTIONS =====
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (isInitialLoading) {
        return <LoadingSkeleton />;
    }

    // ===== RENDER =====
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background justify-center">
                {/* ===== SIDEBAR ===== */}
                {/* Navigation and filter controls */}
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

                {/* ===== MAIN CONTENT ===== */}
                <div className="flex flex-col flex-1 w-full max-w-6xl mx-4 md:mx-8">
                    {/* ===== HEADER ===== */}
                    {/* Search, navigation, and action buttons */}
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
                        onAddFeed={() => {}} // Placeholder, not implemented
                    />

                    {/* ===== ARTICLE GRID ===== */}
                    {/* Main content area with infinite scrolling */}
                    <main className="flex-1 p-6 pt-4 md:pt-6">
                        <ArticleGrid
                            articles={displayedArticles}
                            feeds={feeds}
                            hasMore={hasMore}
                            isLoading={isLoadingMore}
                            onLoadMore={loadMore}
                            totalAvailable={totalAvailable}
                        />
                    </main>

                    {/* ===== SCROLL TO TOP BUTTON ===== */}
                    {/* Mobile-only floating action button */}
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
