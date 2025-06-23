import { memo } from "react";
import { Rss, TrendingUp, Eye, EyeOff } from "lucide-react";
import { RSSFeed } from "@/types/rss";

interface FeedListItemProps {
    feed: RSSFeed;
    articleCount: number;
    isSelected: boolean;
    isFeedEnabled: boolean;
    isCategoryEnabled: boolean;
    hasActiveFilter: boolean;
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
    hasActiveFilter,
    shouldDim = false,
    onSelectFeed,
    onToggleFeed,
}: FeedListItemProps) {
    const isItemEnabled = isFeedEnabled && isCategoryEnabled;

    // Simulate feed status for demo (in real app, this would come from feed data)
    const getFeedStatus = () => {
        const random = Math.random();
        if (random > 0.8) return "error";
        if (random > 0.6) return "warning";
        return "online";
    };

    const feedStatus = getFeedStatus();

    return (
        <div
            className={`transition-all duration-300 animate-fade-in ${
                !isFeedEnabled
                    ? "opacity-50 scale-95"
                    : shouldDim
                    ? "opacity-50 scale-95"
                    : "opacity-100 scale-100"
            }`}
        >
            <button
                onClick={() => {
                    if (!isItemEnabled) return;
                    onSelectFeed(feed.id);
                }}
                className={`w-full h-auto p-0 rounded-2xl floating-card scale-hover focus-ring transition-all duration-300 ${
                    !isItemEnabled ? "cursor-not-allowed" : ""
                } ${
                    isSelected
                        ? "highlight-gradient"
                        : "bg-card border-border sidebar-hover-border"
                }`}
            >
                <div className="flex items-center p-4 w-full gap-3">
                    <div className="flex-shrink-0 relative">
                        <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 status-indicator ${
                                isSelected
                                    ? "icon-subtle"
                                    : "bg-muted border-border sidebar-hover-border"
                            } status-${feedStatus}`}
                        >
                            {feed.favicon ? (
                                <span className="text-lg transition-transform duration-300 sidebar-hover-scale">
                                    {feed.favicon}
                                </span>
                            ) : (
                                <Rss
                                    className={`h-5 w-5 transition-all duration-300 ${
                                        isSelected
                                            ? "text-sidebar-primary"
                                            : "text-muted-foreground sidebar-hover-text sidebar-hover-scale"
                                    }`}
                                />
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 pr-3">
                                <h4
                                    className={`font-bold text-sm leading-tight transition-colors duration-300 ${
                                        isSelected
                                            ? "text-sidebar-primary"
                                            : "text-foreground sidebar-hover-text"
                                    }`}
                                >
                                    {feed.title}
                                </h4>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                                        isSelected
                                            ? "bg-sidebar-primary/20 border border-sidebar-primary/30"
                                            : "bg-muted sidebar-hover-bg"
                                    }`}
                                >
                                    <TrendingUp
                                        className={`h-3 w-3 transition-colors duration-300 ${
                                            isSelected
                                                ? "text-sidebar-primary"
                                                : "text-muted-foreground sidebar-hover-text"
                                        }`}
                                    />
                                    <span
                                        className={`text-xs font-bold transition-colors duration-300 ${
                                            isSelected
                                                ? "text-sidebar-primary"
                                                : "text-foreground sidebar-hover-text"
                                        }`}
                                    >
                                        {articleCount}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleFeed(feed.id, !isFeedEnabled);
                                    }}
                                    className={`h-8 w-8 p-0 sidebar-hover-bg rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 scale-hover focus-ring ${
                                        !isCategoryEnabled
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    {isItemEnabled ? (
                                        <Eye className="h-4 w-4 text-sidebar-primary transition-transform duration-300 sidebar-hover-scale" />
                                    ) : (
                                        <EyeOff className="h-4 w-4 text-muted-foreground/50" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </button>
        </div>
    );
});

export { FeedListItem };
