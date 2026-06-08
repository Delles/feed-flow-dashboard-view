"use client";

import { useMemo } from "react";
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

    const feedsMap = useMemo(() => {
        return new Map(feeds.map((f) => [f.id, f]));
    }, [feeds]);

    if (shouldUseVirtualization) {
        return (
            <ArticleGridVirtual
                articles={articles}
                feedsMap={feedsMap}
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
            feedsMap={feedsMap}
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={onLoadMore}
            totalAvailable={totalAvailable}
        />
    );
}
