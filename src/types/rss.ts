export interface RSSFeed {
    id: string;
    title: string;
    url: string;
    description?: string;
    favicon?: string;
    lastUpdated?: Date;
    category?: string;
    errorCount?: number;
}

export interface Article {
    id: string;
    title: string;
    description: string;
    url: string;
    pubDate: Date;
    feedId: string;
    image?: string;
    author?: string;
}
