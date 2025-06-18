import { RSSFeed, Article } from "@/types/rss";

export const mockFeeds: RSSFeed[] = [
    // Sport
    {
        id: "1",
        title: "Fanatik",
        url: "https://www.fanatik.ro/feed",
        description: "Sport news",
        favicon: "⚽",
        category: "Sport",
        lastUpdated: new Date(),
    },
    {
        id: "2",
        title: "Prosport",
        url: "https://www.prosport.ro/feed",
        description: "Sport news",
        favicon: "⚽",
        category: "Sport",
        lastUpdated: new Date(),
    },
    {
        id: "3",
        title: "Digisport",
        url: "https://www.digisport.ro/rss",
        description: "Sport news",
        favicon: "⚽",
        category: "Sport",
        lastUpdated: new Date(),
    },
    {
        id: "4",
        title: "Liga 2",
        url: "https://liga2.prosport.ro/feed",
        description: "Liga 2 news",
        favicon: "⚽",
        category: "Sport",
        lastUpdated: new Date(),
    },
    {
        id: "5",
        title: "IAM Sport",
        url: "https://iamsport.ro/rss",
        description: "IAM Sport news",
        favicon: "⚽",
        category: "Sport",
        lastUpdated: new Date(),
    },
    // Stiri TV
    {
        id: "6",
        title: "Antena 3",
        url: "https://www.antena3.ro/rss",
        description: "TV news",
        favicon: "📺",
        category: "Stiri TV",
        lastUpdated: new Date(),
    },
    {
        id: "7",
        title: "ProTV",
        url: "https://rss.stirileprotv.ro/",
        description: "TV news",
        favicon: "📺",
        category: "Stiri TV",
        lastUpdated: new Date(),
    },
    {
        id: "8",
        title: "Digi24",
        url: "https://www.digi24.ro/rss",
        description: "TV news",
        favicon: "📺",
        category: "Stiri TV",
        lastUpdated: new Date(),
    },
    // Ziare
    {
        id: "9",
        title: "HotNews",
        url: "https://hotnews.ro/feed",
        description: "General news",
        favicon: "📰",
        category: "Ziare",
        lastUpdated: new Date(),
    },
    {
        id: "10",
        title: "Biziday",
        url: "https://www.biziday.ro/feed/",
        description: "Business news",
        favicon: "📰",
        category: "Ziare",
        lastUpdated: new Date(),
    },
    // Investigatii
    {
        id: "11",
        title: "Recorder",
        url: "https://recorder.ro/feed/",
        description: "Investigative journalism",
        favicon: "🔍",
        category: "Investigatii",
        lastUpdated: new Date(),
    },
    {
        id: "12",
        title: "Snoop",
        url: "https://snoop.ro/feed/",
        description: "Investigative journalism",
        favicon: "🔍",
        category: "Investigatii",
        lastUpdated: new Date(),
    },
];

// Empty articles array since we'll fetch real articles from the RSS feeds
export const mockArticles: Article[] = [];
