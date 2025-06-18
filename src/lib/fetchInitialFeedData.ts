import { mockFeeds } from "@/lib/mockData";
import { parseRSSFeed } from "@/lib/rssParser";
import { RSSFeed, Article } from "@/types/rss";

export interface FeedDataResponse {
    feeds: RSSFeed[];
    articles: Article[];
}

export async function fetchInitialFeedData(): Promise<FeedDataResponse> {
    console.log("🔄 Fetching RSS data from initial feeds...");

    const successfulFeeds: RSSFeed[] = [];
    const allArticles: Article[] = [];

    // Fetch data from each RSS feed in parallel
    const feedPromises = mockFeeds.map(async (mockFeed) => {
        try {
            console.log(
                `📡 Fetching from: ${mockFeed.title} (${mockFeed.url})`
            );
            const { feed, articles } = await parseRSSFeed(mockFeed.url);

            // Use the original mock feed ID to maintain consistency
            const updatedFeed: RSSFeed = {
                // Keep all original mock feed metadata, but update fields that make sense after parsing.
                // Do NOT override the title so that we always display the title defined in mockData.
                ...mockFeed,
                description: feed.description || mockFeed.description,
                lastUpdated: new Date(),
            };

            // Update articles to use the original mock feed ID
            const updatedArticles = articles.map((article) => ({
                ...article,
                feedId: mockFeed.id, // Use original mockFeed ID instead of generated one
            }));

            console.log(
                `✅ Successfully loaded ${updatedArticles.length} articles from ${updatedFeed.title}`
            );
            return { feed: updatedFeed, articles: updatedArticles };
        } catch (error) {
            console.warn(
                `❌ Failed to fetch ${mockFeed.title}:`,
                error instanceof Error ? error.message : "Unknown error"
            );
            // Return the mock feed without articles if parsing fails
            return {
                feed: { ...mockFeed, lastUpdated: new Date() },
                articles: [] as Article[],
            };
        }
    });

    // Wait for all feeds to be processed
    const results = await Promise.allSettled(feedPromises);

    results.forEach((result) => {
        if (result.status === "fulfilled") {
            successfulFeeds.push(result.value.feed);
            allArticles.push(...result.value.articles);
        }
    });

    console.log(
        `🎉 Completed initial data fetch: ${successfulFeeds.length} feeds, ${allArticles.length} total articles`
    );

    return {
        feeds: successfulFeeds,
        articles: allArticles,
    };
}
