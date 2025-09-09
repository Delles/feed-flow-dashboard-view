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

/**
 * Smart article grid component that automatically chooses between:
 * - Regular grid for small lists (< 50 articles)
 * - Virtualized grid for large lists (>= 50 articles)
 *
 * This provides optimal performance while maintaining good UX for all list sizes.
 */
export function ArticleGrid({
    articles,
    feeds,
    hasMore,
    isLoading,
    onLoadMore,
    totalAvailable,
}: ArticleGridProps) {
    // Use virtualization for larger lists to improve performance
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
