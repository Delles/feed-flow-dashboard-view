import { useRef, useEffect, useCallback } from "react";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { Article, RSSFeed } from "@/types/rss";
import { ArticleCard } from "./ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface ArticleGridVirtualProps {
    articles: Article[];
    feedsMap: Map<string, RSSFeed>;
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    totalAvailable: number;
}

export function ArticleGridVirtual({
    articles,
    feedsMap,
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
            <div className="space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 px-2">
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
                    <div ref={desktopLoadMoreRef} className="py-20 flex justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                                Se încarcă mai multe știri...
                            </p>
                        </div>
                    </div>
                )}

                {!hasMore && articles.length > 0 && (
                    <div className="text-center py-24 border-t border-border/30 mt-20 mx-4">
                        <h2 className="font-serif font-black text-3xl text-foreground/80 mb-3">
                            Ești la curent cu tot
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground/60">
                            Ai parcurs toate articolele disponibile.
                        </p>
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
                    const article = articles[virtualItem.index];

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
                                    feedsMap={feedsMap}
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
