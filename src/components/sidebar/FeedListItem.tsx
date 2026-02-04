import { memo } from "react";
import { Eye, EyeOff } from "lucide-react";
import { RSSFeed } from "@/types/rss";
import { motion } from "framer-motion";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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
            className={`transition-all duration-500 ${!isFeedEnabled || shouldDim ? "opacity-30 grayscale" : "opacity-100"
                }`}
        >
            <button
                onClick={() => {
                    if (!isItemEnabled) return;
                    onSelectFeed(feed.id);
                }}
                className={`w-full group relative px-4 py-2 rounded-xl transition-all duration-500 ${isSelected
                    ? "bg-primary/5 text-primary"
                    : "bg-transparent text-foreground/60 hover:bg-accent/20 hover:text-foreground dark:text-foreground/50 dark:hover:text-foreground"
                    }`}
            >
                <div className="flex items-center w-full gap-3">
                    {isSelected && (
                        <motion.div
                            layoutId="active-dot"
                            className="absolute left-1.5 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                        />
                    )}

                    <span className="text-sm flex-shrink-0 transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100">
                        {feed.favicon ? (
                            <img
                                src={feed.favicon}
                                alt={`${feed.title} favicon`}
                                className="w-4 h-4 object-contain"
                            />
                        ) : (
                            "📰"
                        )}
                    </span>

                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <h4
                            className={`font-sans font-bold text-[13px] tracking-tight truncate transition-colors duration-300 ${isSelected ? "text-primary" : "text-foreground/80 dark:text-foreground/70 group-hover:text-foreground"
                                }`}
                        >
                            {feed.title}
                        </h4>

                        <div className="flex items-center gap-2 flex-shrink-0 transition-opacity">
                            <span className="text-[10px] font-black tabular-nums tracking-tighter text-foreground/60 dark:text-foreground/50">
                                {articleCount}
                            </span>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleFeed(feed.id, !isFeedEnabled);
                                        }}
                                        className={`transition-all duration-300 p-1 rounded-md ${isSelected ? "text-primary hover:bg-primary/10" : "text-muted-foreground/60 dark:text-foreground/40 hover:text-primary hover:bg-primary/5"
                                            }`}
                                    >
                                        {isItemEnabled ? (
                                            <Eye className="h-3 w-3" />
                                        ) : (
                                            <EyeOff className="h-3 w-3" />
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="bg-foreground text-background font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded-xl border-none ml-2">
                                    {isItemEnabled ? "Ascunde Sursa" : "Afișează Sursa"}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </button>
        </div>
    );
});

export { FeedListItem };
