import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { mockFeeds } from "@/lib/mockData";
import { parseRSSFeed } from "@/lib/rssParser";
import { RSSFeed, Article } from "@/types/rss";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export interface IncrementalFeedsResult {
    feeds: RSSFeed[];
    articles: Article[];
    isInitialLoading: boolean; // true until at least one feed loaded
    isFetching: boolean; // any query still fetching
    isError: boolean; // any query has an error
    errorCount: number; // number of feeds with errors
    refetch: () => Promise<void>; // function to refresh all feeds
    refetchFeed: (feedId: string) => Promise<void>; // refresh specific feed
}

export function useIncrementalFeeds(): IncrementalFeedsResult {
    const queryClient = useQueryClient();
    const { handleError } = useErrorHandler();

    const queryResults = useQueries({
        queries: mockFeeds.map((mockFeed) => ({
            queryKey: ["feed", mockFeed.id],
            queryFn: async () => {
                try {
                    const { feed, articles } = await parseRSSFeed(mockFeed.url);

                    // Enhanced feed data with error handling
                    const updatedFeed: RSSFeed = {
                        ...mockFeed,
                        description: feed.description || mockFeed.description,
                        lastUpdated: new Date(),
                        errorCount: 0, // Track feed-specific errors
                    } as RSSFeed;

                    const updatedArticles: Article[] = articles.map((a, index) => {
                        // Generate a stable ID
                        const uniqueString = a.url || a.title || `unknown-${index}`;
                        // Simple hash function to ensure stable ID
                        let hash = 0;
                        for (let i = 0; i < uniqueString.length; i++) {
                            const char = uniqueString.charCodeAt(i);
                            hash = (hash << 5) - hash + char;
                            hash = hash & hash;
                        }
                        const stableId = a.id || a.url || `${mockFeed.id}-${hash}`;

                        return {
                            ...a,
                            id: stableId,
                            feedId: mockFeed.id,
                        };
                    });

                    return { feed: updatedFeed, articles: updatedArticles };
                } catch (error) {
                    // Silently log background errors to avoid intrusive notifications
                    handleError(error, `Feed ${mockFeed.title}`, true);

                    // Return fallback data on error
                    const fallbackFeed: RSSFeed = {
                        ...mockFeed,
                        description: mockFeed.description,
                        lastUpdated: new Date(),
                        errorCount: (mockFeed.errorCount || 0) + 1,
                    } as RSSFeed;

                    return { feed: fallbackFeed, articles: [] };
                }
            },
            // Enhanced query configuration
            staleTime: 15 * 60 * 1000, // 15 minutes (increased from 5)
            gcTime: 60 * 60 * 1000, // 1 hour
            retry: (failureCount, error) => {
                // Check for HTTP status code from error properties
                const status = (error as any)?.status || (error as any)?.response?.status || (error as any)?.statusCode;
                if (typeof status === 'number' && status >= 400 && status < 600) {
                    return false;
                }

                // Fallback: parse status from error message (e.g., "HTTP 404: Not Found")
                if (error instanceof Error) {
                    const match = error.message.match(/HTTP\s+(\d{3})/);
                    const parsedStatus = match ? Number(match[1]) : null;
                    if (parsedStatus && parsedStatus >= 400 && parsedStatus < 600) {
                        return false;
                    }
                }

                // If no HTTP status detected, allow retry for transient network errors
                return failureCount < 2;
            },
            retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 30000),
            // Network-aware refetching
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            // Enable background refetching
            refetchInterval: 30 * 60 * 1000, // 30 minutes (increased from 15)
            refetchIntervalInBackground: true,
        })),
    });

    // Memoized data processing for better performance
    const { feeds, articles, errorCount } = useMemo(() => {
        const feeds: RSSFeed[] = [];
        const articles: Article[] = [];
        let errorCount = 0;

        queryResults.forEach((qr) => {
            if (qr.data) {
                feeds.push(qr.data.feed);
                articles.push(...qr.data.articles);
                if (qr.data.feed.errorCount && qr.data.feed.errorCount > 0) {
                    errorCount++;
                }
            }
            if (qr.error) {
                errorCount++;
            }
        });

        // Sort articles by date (newest first) with null safety
        articles.sort(
            (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        );

        return { feeds, articles, errorCount };
    }, [queryResults]);

    // Enhanced loading states
    const isInitialLoading = feeds.length === 0 && queryResults.some((qr) => qr.isLoading);
    const isFetching = queryResults.some((qr) => qr.isFetching);
    const isError = errorCount > 0 || queryResults.some((qr) => qr.error);

    // Enhanced refetch functions
    const refetch = useCallback(async () => {
        await Promise.all(queryResults.map((qr) => qr.refetch()));
    }, [queryResults]);

    const refetchFeed = useCallback(async (feedId: string) => {
        await queryClient.invalidateQueries({
            queryKey: ["feed", feedId],
            refetchType: 'active',
        });
    }, [queryClient]);

    return {
        feeds,
        articles,
        isInitialLoading,
        isFetching,
        isError,
        errorCount,
        refetch,
        refetchFeed,
    };
}
