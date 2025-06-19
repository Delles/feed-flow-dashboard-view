import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Article, RSSFeed } from "@/types/rss";
import { ArticleCard } from "./ArticleCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface ArticleGridVirtualProps {
    articles: Article[];
    feeds: RSSFeed[];
}

/**
 * Virtualised grid for article cards. It renders only the rows that are close to
 * the viewport, dramatically reducing DOM size and layout/paint work.
 *
 * The grid adapts to 1 / 2 / 3 column layout via CSS break-points. We derive the
 * current column count by inspecting the container width on every render and on
 * resize events fired by the virtualizer.
 */
export function ArticleGridVirtual({
    articles,
    feeds,
}: ArticleGridVirtualProps) {
    const parentRef = useRef<HTMLDivElement | null>(null);

    // Approximate card height (image 16:9 + padding + text).
    // Add extra gap to match Tailwind's gap-6 (1.5rem = 24px) between rows.
    const CARD_ESTIMATE = 484; // card height 460 + gap
    const ROW_GAP = 24; // gap-6 (1.5rem)
    const EST_ROW_HEIGHT = CARD_ESTIMATE + ROW_GAP;

    const columnCount = useColumnCount();

    // Group articles into rows based on column count
    const rows = useMemo(() => {
        // columnCount should be at least 1
        const out: Article[][] = [];
        for (let i = 0; i < articles.length; i += columnCount) {
            out.push(articles.slice(i, i + columnCount));
        }
        return out;
    }, [articles, columnCount]);

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => EST_ROW_HEIGHT,
        overscan: 5,
    });

    return (
        <div ref={parentRef} className="h-full overflow-auto no-scrollbar">
            <div
                style={{
                    height: rowVirtualizer.getTotalSize(),
                    position: "relative",
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const rowArticles = rows[virtualRow.index];
                    return (
                        <div
                            key={virtualRow.index}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6"
                        >
                            {rowArticles.map((article, idx) => (
                                <ArticleCard
                                    key={article.id}
                                    article={article}
                                    feeds={feeds}
                                    isFirst={
                                        virtualRow.index === 0 && idx === 0
                                    }
                                />
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Hook: derive column count from CSS break-points by reading container width
function useColumnCount() {
    const isMobile = useIsMobile();
    // crude detection for lg
    if (isMobile) return 1;
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        return 3;
    }
    return 2;
}
