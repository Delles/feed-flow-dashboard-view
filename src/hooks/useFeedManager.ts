import { useState, useEffect, useRef } from "react";
import { useIncrementalFeeds } from "@/hooks/useIncrementalFeeds";
import { Article, RSSFeed } from "@/types/rss";

export function useFeedManager() {
    const {
        feeds: loadedFeeds,
        articles: loadedArticles,
        isInitialLoading,
        isFetching,
        refetch,
    } = useIncrementalFeeds();

    const [feeds, setFeeds] = useState<RSSFeed[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [enabledFeeds, setEnabledFeeds] = useState<Record<string, boolean>>(
        {}
    );
    const [enabledCategories, setEnabledCategories] = useState<
        Record<string, boolean>
    >({});

    const processedFeedIds = useRef(new Set<string>());
    const processedArticleIds = useRef(new Set<string>());
    const isRefreshing = useRef(false);

    useEffect(() => {
        if (isRefreshing.current) {
            // During refresh: replace all data instead of incremental add
            const allFeeds = loadedFeeds;
            const allArticles = loadedArticles;

            if (allFeeds.length > 0) {
                allFeeds.forEach((f) => processedFeedIds.current.add(f.id));
                setFeeds(allFeeds);
                setEnabledFeeds((prev) => {
                    const updated = { ...prev };
                    allFeeds.forEach((f) => {
                        if (!(f.id in updated)) updated[f.id] = true;
                    });
                    return updated;
                });
                setEnabledCategories((prev) => {
                    const updated = { ...prev };
                    allFeeds.forEach((f) => {
                        const cat = f.category ?? "Altele";
                        if (!(cat in updated)) updated[cat] = true;
                    });
                    return updated;
                });
            }

            if (allArticles.length > 0) {
                allArticles.forEach((a) =>
                    processedArticleIds.current.add(a.id)
                );
                setArticles(
                    allArticles.sort(
                        (a, b) =>
                            new Date(b.pubDate).getTime() -
                            new Date(a.pubDate).getTime()
                    )
                );
            }

            isRefreshing.current = false;
        } else {
            // Normal operation: incremental loading
            const newFeeds = loadedFeeds.filter(
                (f) => !processedFeedIds.current.has(f.id)
            );
            const newArticles = loadedArticles.filter(
                (a) => !processedArticleIds.current.has(a.id)
            );

            if (newFeeds.length > 0) {
                newFeeds.forEach((f) => processedFeedIds.current.add(f.id));
                setFeeds((prev) => [...prev, ...newFeeds]);
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

            if (newArticles.length > 0) {
                newArticles.forEach((a) =>
                    processedArticleIds.current.add(a.id)
                );
                setArticles((prev) =>
                    [...prev, ...newArticles].sort(
                        (a, b) =>
                            new Date(b.pubDate).getTime() -
                            new Date(a.pubDate).getTime()
                    )
                );
            }
        }
    }, [loadedFeeds, loadedArticles]);

    const handleToggleFeed = (feedId: string, enabled: boolean) => {
        setEnabledFeeds((prev) => ({ ...prev, [feedId]: enabled }));
    };

    const handleToggleCategory = (category: string, enabled: boolean) => {
        setEnabledCategories((prev) => ({ ...prev, [category]: enabled }));

        const feedsInCategory = feeds.filter(
            (f) => (f.category ?? "Altele") === category
        );
        setEnabledFeeds((prev) => {
            const updated = { ...prev };
            feedsInCategory.forEach((feed) => {
                updated[feed.id] = enabled;
            });
            return updated;
        });
    };

    const handleRefresh = async () => {
        // Set refresh flag to change behavior in useEffect
        isRefreshing.current = true;

        // Clear processed IDs to allow fresh data
        processedFeedIds.current.clear();
        processedArticleIds.current.clear();

        // Trigger the refetch - data will be handled differently due to isRefreshing flag
        await refetch();
    };

    return {
        feeds,
        articles,
        isInitialLoading,
        isFetching,
        enabledFeeds,
        enabledCategories,
        handleToggleFeed,
        handleToggleCategory,
        refetch: handleRefresh,
    };
}
