import { useRef, useEffect, useCallback } from "react";
import { Article, RSSFeed } from "@/types/rss";
import { ArticleCard } from "./ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface ArticleGridInfiniteProps {
    articles: Article[];
    feeds: RSSFeed[];
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    totalAvailable: number;
}

/**
 * Optimized infinite scrolling grid that:
 * 1. Uses intersection observer for efficient scroll detection
 * 2. Renders articles in a responsive grid
 * 3. Shows loading states and handles empty states
 * 4. Optimizes image loading with progressive enhancement
 */
export function ArticleGridInfinite({
    articles,
    feeds,
    hasMore,
    isLoading,
    onLoadMore,
    totalAvailable,
}: ArticleGridInfiniteProps) {
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    // Intersection Observer for infinite scrolling
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
            rootMargin: "100px", // Trigger 100px before the element comes into view
        });

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [handleIntersection]);

    // Empty state
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
        <div
            className="space-y-6"
            style={{
                containIntrinsicSize: "1px 1px",
                contentVisibility: "auto",
            }}
        >
            {/* Articles Grid */}
            {!isMobile ? (
                // Desktop layout - grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article, index) => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            feeds={feeds}
                            isFirst={index === 0}
                        />
                    ))}
                </div>
            ) : (
                // Mobile layout - single column
                <div className="space-y-4">
                    {articles.map((article, index) => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            feeds={feeds}
                            isFirst={index === 0}
                        />
                    ))}
                </div>
            )}

            {/* Loading More Indicator */}
            {hasMore && (
                <div ref={loadMoreRef} className="py-8">
                    {isLoading ? (
                        <>
                            {!isMobile ? (
                                // Desktop skeleton - grid layout
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="space-y-3 h-[460px] flex flex-col overflow-hidden"
                                        >
                                            <Skeleton className="aspect-video w-full rounded-lg" />
                                            <div className="space-y-2 p-2 flex-grow">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                                <Skeleton className="h-3 w-full" />
                                                <Skeleton className="h-3 w-2/3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Mobile skeleton - single column layout
                                <div className="space-y-4">
                                    {Array.from({ length: 2 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="bg-card rounded-lg border p-4 space-y-3 h-[460px] flex flex-col overflow-hidden"
                                        >
                                            <Skeleton className="aspect-video w-full rounded-lg" />
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-4 w-4 rounded" />
                                                    <Skeleton className="h-3 w-20" />
                                                    <Skeleton className="h-3 w-16" />
                                                </div>
                                                <Skeleton className="h-5 w-full" />
                                                <Skeleton className="h-5 w-3/4" />
                                                <div className="space-y-1">
                                                    <Skeleton className="h-3 w-full" />
                                                    <Skeleton className="h-3 w-5/6" />
                                                    <Skeleton className="h-3 w-2/3" />
                                                </div>
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground">
                                Se încarcă mai multe articole...
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* End of Results */}
            {!hasMore && articles.length > 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground border-t">
                    <p>
                        Afișate toate articolele disponibile ({totalAvailable})
                    </p>
                    {articles.length >= 500 && (
                        <p className="mt-2 text-xs">
                            Pentru performanță optimă, se afișează maximum 500
                            de articole.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
