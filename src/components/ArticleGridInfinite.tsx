import { useRef, useEffect, useCallback } from "react";
import { Article, RSSFeed } from "@/types/rss";
import { ArticleCard } from "./ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface ArticleGridInfiniteProps {
    articles: Article[];
    feedsMap: Map<string, RSSFeed>;
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    totalAvailable: number;
}

export function ArticleGridInfinite({
    articles,
    feedsMap,
    hasMore,
    isLoading,
    onLoadMore,
    totalAvailable,
}: ArticleGridInfiniteProps) {
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    const handleIntersection = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !isLoading) {
                onLoadMore();
            }
        },
        [hasMore, isLoading, onLoadMore]
    );

    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(handleIntersection, {
            rootMargin: "100px",
        });

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [handleIntersection]);

    if (articles.length === 0 && !isLoading) {
        return (
            <div className="text-center py-12">
                <div className="text-muted-foreground text-6xl mb-4">📰</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                    Nu există articole
                </h3>
                <p className="text-muted-foreground">
                    Încercați să schimbați filtrele sau să adăugați mai multe
                    fluxuri RSS.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {articles.map((article, index) => (
                    <ArticleCard
                        key={article.id}
                        article={article}
                        feedsMap={feedsMap}
                        isFirst={index === 0}
                        index={index}
                    />
                ))}
            </div>

            {hasMore && (
                <div ref={loadMoreRef} className="py-20 flex justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                            Se încarcă articole noi...
                        </p>
                    </div>
                </div>
            )}

            {!hasMore && articles.length > 0 && (
                <div className="text-center py-24 border-t border-border/30 mt-20">
                    <h2 className="font-serif font-black text-3xl text-foreground/80 mb-3">
                        Ești la curent cu tot
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground/60 max-w-xs mx-auto">
                        Ai parcurs toate cele {totalAvailable} articole disponibile în acest moment.
                    </p>
                    <div className="mt-10 flex justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/30 mx-1" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/30 mx-1" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/30 mx-1" />
                    </div>
                </div>
            )}
        </div>
    );
}
