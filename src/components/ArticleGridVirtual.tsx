import { useRef, useEffect, useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Article, RSSFeed } from "@/types/rss";
import { ArticleCard } from "./ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Props for the ArticleGridVirtual component
 */
interface ArticleGridVirtualProps {
    /** Array of articles to display */
    articles: Article[];
    /** Array of RSS feeds for article metadata */
    feeds: RSSFeed[];
    /** Whether more articles can be loaded */
    hasMore: boolean;
    /** Whether articles are currently being loaded */
    isLoading: boolean;
    /** Callback to load more articles */
    onLoadMore: () => void;
    /** Total number of available articles */
    totalAvailable: number;
}

/**
 * Virtualized article grid component for optimal performance with large lists.
 *
 * Features:
 * - Renders only visible items using @tanstack/react-virtual
 * - Handles infinite scrolling with intersection observer
 * - Responsive layout (grid on desktop, list on mobile)
 * - Loading states and skeleton placeholders
 * - Memory efficient for large article collections
 */
/**
 * Virtualized article grid component for optimal performance with large lists
 */
export function ArticleGridVirtual({
    articles,
    feeds,
    hasMore,
    isLoading,
    onLoadMore,
    totalAvailable,
}: ArticleGridVirtualProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    // Fixed item height for consistent layout
    const itemHeight = 460;

    // Configure virtualizer for efficient rendering
    const virtualizer = useVirtualizer({
        count: articles.length,
        getScrollElement: () => parentRef.current || null,
        estimateSize: () => itemHeight,
        overscan: 5, // Render 5 extra items for smooth scrolling
    });

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
        return () => observer.disconnect();
    }, [handleIntersection]);

    // Memoize article-feed mapping for performance
    const articlesWithFeeds = useMemo(() =>
        articles.map(article => ({
            article,
            feed: feeds.find(f => f.id === article.feedId)
        })),
        [articles, feeds]
    );

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
            ref={parentRef}
            className="h-[calc(100vh-200px)] overflow-auto"
            style={{
                containIntrinsicSize: "1px 1px",
                contentVisibility: "auto",
            }}
        >
            <div
                className="relative w-full"
                style={{
                    height: `${parentRef.current ? virtualizer.getTotalSize() : articles.length * itemHeight}px`,
                }}
            >
                {(parentRef.current ? virtualizer.getVirtualItems() : []).map((virtualItem) => {
                    const { article, feed } = articlesWithFeeds[virtualItem.index];

                    return (
                        <div
                            key={article.id}
                            className="absolute top-0 left-0 w-full px-2"
                            style={{
                                height: `${virtualItem.size}px`,
                                transform: `translateY(${virtualItem.start}px)`,
                                ...(isMobile ? {} : {
                                    width: itemWidth,
                                    left: '50%',
                                    transform: `translateX(-50%) translateY(${virtualItem.start}px)`,
                                }),
                            }}
                        >
                            <div className="py-2">
                                <ArticleCard
                                    article={article}
                                    feeds={feeds}
                                    isFirst={virtualItem.index === 0}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Loading More Indicator */}
            {hasMore && (
                <div ref={loadMoreRef} className="py-8">
                    {isLoading ? (
                        <>
                            {isMobile ? (
                                // Mobile skeleton - single column layout
                                <div className="space-y-4 px-2">
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
                            ) : (
                                // Desktop skeleton - grid layout
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
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
                <div className="text-center py-8 text-sm text-muted-foreground border-t mx-4">
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
