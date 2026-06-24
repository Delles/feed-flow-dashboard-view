"use client";

import { useState, useEffect, useRef } from "react";
import { useIncrementalFeeds } from "@/hooks/useIncrementalFeeds";
import { Article, RSSFeed } from "@/types/rss";

/**
 * Hook to manage the lifecycle of RSS feeds and articles.
 * Handles incremental loading, refreshing, and enabled/disabled states.
 */
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

    // Tracks which IDs have already been processed into state to avoid duplicates
    const processedFeedIds = useRef(new Set<string>());
    const processedArticleIds = useRef(new Set<string>());

    // A version counter to force a full state replacement on refresh
    const [refreshVersion, setRefreshVersion] = useState(0);
    const lastVersionRef = useRef(0);

    useEffect(() => {
        const isNewRefreshCycle = refreshVersion > lastVersionRef.current;

        if (isNewRefreshCycle) {
            // Full refresh: Reset trackers and replace entire state
            processedFeedIds.current.clear();
            processedArticleIds.current.clear();

            if (loadedFeeds.length > 0) {
                loadedFeeds.forEach((f) => { processedFeedIds.current.add(f.id); });
                setFeeds(loadedFeeds);
                setEnabledFeeds((prev) => {
                    const updated = { ...prev };
                    loadedFeeds.forEach((f) => {
                        if (!(f.id in updated)) updated[f.id] = true;
                    });
                    return updated;
                });
                setEnabledCategories((prev) => {
                    const updated = { ...prev };
                    loadedFeeds.forEach((f) => {
                        const cat = f.category ?? "Altele";
                        if (!(cat in updated)) updated[cat] = true;
                    });
                    return updated;
                });
            }

            if (loadedArticles.length > 0) {
                loadedArticles.forEach((a) => {
                    processedArticleIds.current.add(a.id);
                });
                setArticles([...loadedArticles]); // Already sorted in useIncrementalFeeds
            }

            // Only mark the refresh cycle as complete after data has been processed
            if (loadedFeeds.length > 0 || loadedArticles.length > 0) {
                lastVersionRef.current = refreshVersion;
            }
        } else {
            // Normal operation: Process only genuinely new items
            const newFeeds = loadedFeeds.filter(
                (f) => !processedFeedIds.current.has(f.id)
            );
            const newArticles = loadedArticles.filter(
                (a) => !processedArticleIds.current.has(a.id)
            );

            if (newFeeds.length > 0) {
                newFeeds.forEach((f) => { processedFeedIds.current.add(f.id); });
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
                newArticles.forEach((a) => {
                    processedArticleIds.current.add(a.id);
                });
                setArticles((prev) =>
                    [...prev, ...newArticles].sort(
                        (a, b) =>
                            new Date(b.pubDate).getTime() -
                            new Date(a.pubDate).getTime()
                    )
                );
            }
        }
    }, [loadedFeeds, loadedArticles, refreshVersion]);

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

    /**
     * Trigger a fresh fetch of all feeds and replace current state.
     */
    const handleRefresh = async () => {
        try {
            // Clear current display state to show loading skeletons/fresh start
            setArticles([]);
            setFeeds([]);
            processedFeedIds.current.clear();
            processedArticleIds.current.clear();

            // Increment version to trigger the 'isNewRefreshCycle' block in useEffect
            setRefreshVersion(v => v + 1);

            await refetch();
        } catch (error) {
            console.error("Refresh failed:", error);
        }
    };

    const handleAddFeed = (newFeed: RSSFeed, newArticles: Article[]) => {
        if (!processedFeedIds.current.has(newFeed.id)) {
            processedFeedIds.current.add(newFeed.id);
            setFeeds((prev) => [...prev, newFeed]);
            setEnabledFeeds((prev) => ({ ...prev, [newFeed.id]: true }));

            const cat = newFeed.category ?? "Altele";
            setEnabledCategories((prev) => {
                if (!(cat in prev)) return { ...prev, [cat]: true };
                return prev;
            });
        }

        const uniqueNewArticles = newArticles.filter(a => !processedArticleIds.current.has(a.id));
        if (uniqueNewArticles.length > 0) {
            uniqueNewArticles.forEach(a => processedArticleIds.current.add(a.id));
            setArticles((prev) =>
                [...prev, ...uniqueNewArticles].sort(
                    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
                )
            );
        }
    };

    const handleRemoveFeed = (feedId: string) => {
        processedFeedIds.current.delete(feedId);
        setFeeds((prev) => prev.filter((f) => f.id !== feedId));
        setEnabledFeeds((prev) => {
            const updated = { ...prev };
            delete updated[feedId];
            return updated;
        });

        // Remove related articles
        const remainingArticles = articles.filter((a) => {
            if (a.feedId === feedId) {
                processedArticleIds.current.delete(a.id);
                return false;
            }
            return true;
        });
        setArticles(remainingArticles);
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
        handleAddFeed,
        handleRemoveFeed,
        refetch: handleRefresh,
    };
}
