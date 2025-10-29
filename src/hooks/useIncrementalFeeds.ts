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

                    const updatedArticles: Article[] = articles.map((a, idx) => ({
                        ...a,
                        id: `${mockFeed.id}-${idx}`,
                        feedId: mockFeed.id,
                    }));

                    return { feed: updatedFeed, articles: updatedArticles };
                } catch (error) {
                    handleError(error, `Feed ${mockFeed.title}`);

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
            staleTime: 5 * 60 * 1000, // 5 minutes (reduced from 10)
            gcTime: 60 * 60 * 1000, // 1 hour (increased from 30 minutes)
            retry: (failureCount, error) => {
                // Don't retry on 4xx errors
                if (error instanceof Error && error.message.includes('4')) {
                    return false;
                }
                // Retry up to 3 times for network errors
                return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Network-aware refetching
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            // Enable background refetching
            refetchInterval: 15 * 60 * 1000, // 15 minutes
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
    const isError = queryResults.some((qr) => qr.error);

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
