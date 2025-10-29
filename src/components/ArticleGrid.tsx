import { Article, RSSFeed } from "@/types/rss";
import { ArticleGridInfinite } from "./ArticleGridInfinite";
import { ArticleGridVirtual } from "./ArticleGridVirtual";

interface ArticleGridProps {
    articles: Article[];
    feeds: RSSFeed[];
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    totalAvailable: number;
}

export function ArticleGrid({
    articles,
    feeds,
    hasMore,
    isLoading,
    onLoadMore,
    totalAvailable,
}: ArticleGridProps) {
    const shouldUseVirtualization = articles.length >= 50;

    if (shouldUseVirtualization) {
        return (
            <ArticleGridVirtual
                articles={articles}
                feeds={feeds}
                hasMore={hasMore}
                isLoading={isLoading}
                onLoadMore={onLoadMore}
                totalAvailable={totalAvailable}
            />
        );
    }

    return (
        <ArticleGridInfinite
            articles={articles}
            feeds={feeds}
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={onLoadMore}
            totalAvailable={totalAvailable}
        />
    );
}
