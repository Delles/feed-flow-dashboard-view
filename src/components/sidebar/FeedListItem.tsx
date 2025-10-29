import { memo } from "react";
import { Rss, Eye, EyeOff } from "lucide-react";
import { RSSFeed } from "@/types/rss";

interface FeedListItemProps {
    feed: RSSFeed;
    articleCount: number;
    isSelected: boolean;
    isFeedEnabled: boolean;
    isCategoryEnabled: boolean;
    shouldDim?: boolean;
    onSelectFeed: (feedId: string | null) => void;
    onToggleFeed: (feedId: string, enabled: boolean) => void;
}

const FeedListItem = memo(function FeedListItem({
    feed,
    articleCount,
    isSelected,
    isFeedEnabled,
    isCategoryEnabled,
    shouldDim = false,
    onSelectFeed,
    onToggleFeed,
}: FeedListItemProps) {
    const isItemEnabled = isFeedEnabled && isCategoryEnabled;

    return (
        <div
            className={`transition-all duration-200 ${
                !isFeedEnabled || shouldDim ? "opacity-50" : "opacity-100"
            }`}
        >
            <button
                onClick={() => {
                    if (!isItemEnabled) return;
                    onSelectFeed(feed.id);
                }}
                className={`w-full px-2 py-2 rounded-md focus-ring transition-all duration-200 ${
                    !isItemEnabled ? "cursor-not-allowed" : ""
                } ${
                    isSelected
                        ? "bg-sidebar-primary/10 border border-sidebar-primary/30"
                        : "hover:bg-sidebar-primary/5"
                }`}
            >
                <div className="flex items-center w-full gap-2">
                    {/* Feed Icon */}
                    <div className="flex-shrink-0">
                        <div
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 ${
                                isSelected
                                    ? "bg-sidebar-primary/20"
                                    : "bg-muted"
                            }`}
                        >
                            {feed.favicon ? (
                                <span className="text-sm">
                                    {feed.favicon}
                                </span>
                            ) : (
                                <Rss
                                    className={`h-3.5 w-3.5 ${
                                        isSelected
                                            ? "text-sidebar-primary"
                                            : "text-muted-foreground"
                                    }`}
                                />
                            )}
                        </div>
                    </div>

                    {/* Feed Name & Count */}
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <h4
                            className={`font-medium text-sm truncate transition-colors duration-200 ${
                                isSelected
                                    ? "text-sidebar-primary"
                                    : "text-foreground"
                            }`}
                        >
                            {feed.title}
                        </h4>
                        
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* Article Count */}
                            <span
                                className={`text-xs font-medium px-1.5 py-0.5 rounded transition-colors duration-200 ${
                                    isSelected
                                        ? "text-sidebar-primary bg-sidebar-primary/10"
                                        : "text-muted-foreground bg-muted"
                                }`}
                            >
                                {articleCount}
                            </span>

                            {/* Toggle Visibility */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFeed(feed.id, !isFeedEnabled);
                                }}
                                className={`p-0.5 hover:bg-sidebar-primary/10 rounded transition-all duration-200 focus-ring ${
                                    !isCategoryEnabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                title={isFeedEnabled ? "Ascunde sursa" : "Arată sursa"}
                            >
                                {isItemEnabled ? (
                                    <Eye className="h-3.5 w-3.5 text-sidebar-primary" />
                                ) : (
                                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground/50" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </button>
        </div>
    );
});

export { FeedListItem };
