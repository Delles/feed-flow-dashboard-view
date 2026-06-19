"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Article, RSSFeed } from "@/types/rss";
import { normalizeText } from "@/lib/normalizeText";
import { useDebounce } from "./use-debounce";

const ARTICLES_PER_PAGE = 15; // Reduced from 20 for better initial performance
const MAX_CACHED_ARTICLES = 300; // Reduced from 500 to limit DOM size

export interface InfiniteArticlesConfig {
    allArticles: Article[];
    feeds: RSSFeed[];
    searchQuery: string;
    selectedFeed: string | null;
    selectedCategory: string | null;
    enabledFeeds: Record<string, boolean>;
    enabledCategories: Record<string, boolean>;
}

export interface InfiniteArticlesResult {
    displayedArticles: Article[];
    hasMore: boolean;
    isLoading: boolean;
    loadMore: () => void;
    reset: () => void;
    totalAvailable: number;
    isSearching: boolean;
}

export function useInfiniteArticles(
    config: InfiniteArticlesConfig
): InfiniteArticlesResult {
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const filterConfigRef = useRef(config);

    // Destructure config for better dependency tracking
    const {
        allArticles,
        feeds,
        searchQuery,
        selectedFeed,
        selectedCategory,
        enabledFeeds,
        enabledCategories,
    } = config;

    // Debounce search query for better performance
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const isSearching = searchQuery !== debouncedSearchQuery;

    // Memoize the debounced config to prevent unnecessary re-renders
    const debouncedConfig = useMemo(
        () => ({
            allArticles,
            feeds,
            searchQuery: debouncedSearchQuery,
            selectedFeed,
            selectedCategory,
            enabledFeeds,
            enabledCategories,
        }),
        [
            allArticles,
            feeds,
            debouncedSearchQuery,
            selectedFeed,
            selectedCategory,
            enabledFeeds,
            enabledCategories,
        ]
    );

    // Create stable string keys for object dependencies
    const enabledFeedsKey = Object.keys(enabledFeeds)
        .filter((k) => enabledFeeds[k])
        .sort()
        .join(",");
    const enabledCategoriesKey = Object.keys(enabledCategories)
        .filter((k) => enabledCategories[k])
        .sort()
        .join(",");

    // Check if filter configuration has changed
    const hasFilterChanged = useMemo(() => {
        const prev = filterConfigRef.current;
        return (
            prev.searchQuery !== debouncedConfig.searchQuery ||
            prev.selectedFeed !== debouncedConfig.selectedFeed ||
            prev.selectedCategory !== debouncedConfig.selectedCategory ||
            // Compare using stable keys instead of JSON.stringify
            Object.keys(prev.enabledFeeds)
                .filter((k) => prev.enabledFeeds[k])
                .sort()
                .join(",") !== enabledFeedsKey ||
            Object.keys(prev.enabledCategories)
                .filter((k) => prev.enabledCategories[k])
                .sort()
                .join(",") !== enabledCategoriesKey
        );
    }, [
        debouncedConfig.searchQuery,
        debouncedConfig.selectedFeed,
        debouncedConfig.selectedCategory,
        enabledFeedsKey,
        enabledCategoriesKey,
    ]);

    // Reset pagination when filters change using useEffect to avoid infinite loops
    useEffect(() => {
        if (hasFilterChanged) {
            filterConfigRef.current = debouncedConfig;
            setCurrentPage(0);
        }
    }, [hasFilterChanged, debouncedConfig]);

    // Pre-filter articles efficiently
    const filteredArticleIds = useMemo(() => {
        const {
            allArticles,
            feeds,
            searchQuery,
            selectedFeed,
            selectedCategory,
            enabledFeeds,
            enabledCategories,
        } = debouncedConfig;

        const normalizedQuery = searchQuery ? normalizeText(searchQuery) : "";

        const filtered = allArticles.filter((article) => {
            const feed = feeds.find((f) => f.id === article.feedId);
            const category = feed?.category ?? "Altele";

            // Filter by enabled state first (fastest check)
            if (!enabledFeeds[article.feedId] || !enabledCategories[category]) {
                return false;
            }

            // Filter by selected feed or category
            if (selectedFeed && article.feedId !== selectedFeed) {
                return false;
            }
            if (selectedCategory && category !== selectedCategory) {
                return false;
            }

            // Search filter (most expensive, do last)
            if (normalizedQuery) {
                const titleNorm = normalizeText(article.title);
                const descNorm = normalizeText(article.description);
                return (
                    titleNorm.includes(normalizedQuery) ||
                    descNorm.includes(normalizedQuery)
                );
            }

            return true;
        });

        return filtered
            .sort(
                (a, b) =>
                    new Date(b.pubDate).getTime() -
                    new Date(a.pubDate).getTime()
            )
            .map((article) => article.id);
    }, [debouncedConfig]);

    // Convert IDs back to articles efficiently outside of pagination updates
    const articleMap = useMemo(() => {
        return new Map(allArticles.map((article) => [article.id, article]));
    }, [allArticles]);

    /**
     * Get articles for current pages with memory management.
     * Converts filtered article IDs back to full article objects for display.
     *
     * Fix: Simplified from complex try-catch error handling to basic array operations.
     * Removed unnecessary console warnings and error logging that added complexity without benefit.
     */
    const displayedArticles = useMemo(() => {
        const totalToShow = (currentPage + 1) * ARTICLES_PER_PAGE;
        const articlesToShow = filteredArticleIds.slice(
            0,
            Math.min(totalToShow, MAX_CACHED_ARTICLES)
        );

        return articlesToShow
            .map((id) => articleMap.get(id))
            .filter(Boolean) as Article[];
    }, [filteredArticleIds, currentPage, articleMap]);

    const hasMore = useMemo(() => {
        const totalShown = displayedArticles.length;
        const totalAvailable = filteredArticleIds.length;
        return totalShown < totalAvailable && totalShown < MAX_CACHED_ARTICLES;
    }, [displayedArticles.length, filteredArticleIds.length]);

    /**
     * Load more articles by incrementing the current page.
     * Uses a small delay to provide visual feedback during loading.
     *
     * Fix: Simplified from requestAnimationFrame approach to basic setTimeout for reliability.
     * The original approach was over-engineered for this simple state update.
     */
    const loadMore = useCallback(() => {
        if (hasMore && !isLoading && !isSearching) {
            setIsLoading(true);
            // Small delay to show loading state
            setTimeout(() => {
                setCurrentPage((p) => p + 1);
                setIsLoading(false);
            }, 100);
        }
    }, [hasMore, isLoading, isSearching]);

    const reset = useCallback(() => {
        setCurrentPage(0);
        setIsLoading(false);
    }, []);

    return {
        displayedArticles,
        hasMore,
        isLoading,
        loadMore,
        reset,
        totalAvailable: filteredArticleIds.length,
        isSearching,
    };
}
