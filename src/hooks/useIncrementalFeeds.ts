import { useQueries } from "@tanstack/react-query";
import { mockFeeds } from "@/lib/mockData";
import { parseRSSFeed } from "@/lib/rssParser";
import { RSSFeed, Article } from "@/types/rss";

export interface IncrementalFeedsResult {
    feeds: RSSFeed[];
    articles: Article[];
    isInitialLoading: boolean; // true until at least one feed loaded
    isFetching: boolean; // any query still fetching
}

export function useIncrementalFeeds(): IncrementalFeedsResult {
    const queryResults = useQueries({
        queries: mockFeeds.map((mockFeed) => ({
            queryKey: ["feed", mockFeed.id],
            queryFn: async () => {
                const { feed, articles } = await parseRSSFeed(mockFeed.url);
                // keep original id and title defined in mockData for consistency
                const updatedFeed: RSSFeed = {
                    ...mockFeed,
                    description: feed.description || mockFeed.description,
                    lastUpdated: new Date(),
                };
                const updatedArticles: Article[] = articles.map((a, idx) => ({
                    ...a,
                    id: `${mockFeed.id}-${idx}`,
                    feedId: mockFeed.id,
                }));
                return { feed: updatedFeed, articles: updatedArticles };
            },
            staleTime: 10 * 60 * 1000,
            retry: 2,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
        })),
    });

    const feeds: RSSFeed[] = [];
    const articles: Article[] = [];

    queryResults.forEach((qr) => {
        if (qr.data) {
            feeds.push(qr.data.feed);
            articles.push(...qr.data.articles);
        }
    });

    // sort articles by date (newest first)
    articles.sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    const isInitialLoading =
        feeds.length === 0 && queryResults.some((qr) => qr.isLoading);
    const isFetching = queryResults.some((qr) => qr.isFetching);

    return { feeds, articles, isInitialLoading, isFetching };
}
