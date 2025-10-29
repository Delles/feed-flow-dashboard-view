import { useRef, useEffect, useCallback, useMemo } from "react";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { Article, RSSFeed } from "@/types/rss";
import { ArticleCard } from "./ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface ArticleGridVirtualProps {
    articles: Article[];
    feeds: RSSFeed[];
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    totalAvailable: number;
}

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
    const desktopLoadMoreRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const itemHeight = 460;

    const virtualizer: Virtualizer<HTMLDivElement, HTMLDivElement> = useVirtualizer<HTMLDivElement, HTMLDivElement>({
        count: articles.length,
        getScrollElement: () => parentRef.current || null,
        estimateSize: () => itemHeight,
        overscan: 5,
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
        const observers: IntersectionObserver[] = [];

        if (isMobile && loadMoreRef.current) {
            const mobileObserver = new IntersectionObserver(handleIntersection, {
                rootMargin: "100px",
            });
            mobileObserver.observe(loadMoreRef.current);
            observers.push(mobileObserver);
        }

        if (!isMobile && desktopLoadMoreRef.current) {
            const desktopObserver = new IntersectionObserver(handleIntersection, {
                rootMargin: "100px",
            });
            desktopObserver.observe(desktopLoadMoreRef.current);
            observers.push(desktopObserver);
        }

        return () => observers.forEach(observer => observer.disconnect());
    }, [handleIntersection, isMobile]);

    const articlesWithFeeds = useMemo(() =>
        articles.map(article => ({
            article,
            feed: feeds.find(f => f.id === article.feedId)
        })),
        [articles, feeds]
    );

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

    if (!isMobile) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
                    {articles.map((article, index) => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            feeds={feeds}
                            isFirst={index === 0}
                        />
                    ))}
                </div>

                {hasMore && (
                    <>
                        {isLoading ? (
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
                        ) : (
                            <div ref={desktopLoadMoreRef} className="h-20" />
                        )}
                    </>
                )}

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
                    const { article } = articlesWithFeeds[virtualItem.index];

                    return (
                        <div
                            key={article.id}
                            className="absolute top-0 left-0 w-full px-2"
                            style={{
                                height: `${virtualItem.size}px`,
                                transform: `translateY(${virtualItem.start}px)`,
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

                {hasMore && (
                    <div ref={loadMoreRef} className="py-8">
                        {isLoading ? (
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
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground">
                                    Se încarcă mai multe articole...
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
        </div>
    );
}
