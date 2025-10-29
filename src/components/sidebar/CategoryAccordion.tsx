import { useMemo } from "react";
import { ChevronDown, Eye, EyeOff, Rss } from "lucide-react";
import {
    AccordionContent,
    AccordionItem,
} from "@/components/ui/accordion";
import { RSSFeed, Article } from "@/types/rss";
import { FeedListItem } from "./FeedListItem";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

interface CategoryAccordionProps {
    category: string;
    feeds: RSSFeed[];
    articles: Article[];
    selectedFeed: string | null;
    selectedCategory: string | null;
    enabledFeeds: Record<string, boolean>;
    isCategoryEnabled: boolean;
    hasActiveFilter: boolean;
    onSelectFeed: (feedId: string | null) => void;
    onSelectCategory: (category: string | null) => void;
    onToggleFeed: (feedId: string, enabled: boolean) => void;
    onToggleCategory: (category: string, enabled: boolean) => void;
}

export function CategoryAccordion({
    category,
    feeds,
    articles,
    selectedFeed,
    selectedCategory,
    enabledFeeds,
    isCategoryEnabled,
    hasActiveFilter,
    onSelectFeed,
    onSelectCategory,
    onToggleFeed,
    onToggleCategory,
}: CategoryAccordionProps) {
    const isCategorySelected = selectedCategory === category;
    const isFeedInThisCategorySelected = feeds.some(
        (f) => f.id === selectedFeed
    );
    const isGroupActive = isCategorySelected || isFeedInThisCategorySelected;

    // Determine if this category should be dimmed
    const shouldDimCategory = hasActiveFilter && !isGroupActive;

    // Determine if feeds in this category should be dimmed
    const shouldDimFeeds = hasActiveFilter && !isCategorySelected;

    // Pre-compute article counts per feed
    const articleCountsByFeed = useMemo(() => {
        return articles.reduce((acc, article) => {
            acc[article.feedId] = (acc[article.feedId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [articles]);

    return (
        <AccordionItem
            value={category}
            className={`border-none transition-all duration-200 mb-1 ${!isCategoryEnabled
                ? "opacity-40"
                : shouldDimCategory
                    ? "opacity-50"
                    : "opacity-100"
                }`}
        >
            <div className="px-1">
                <div className={`rounded-lg border transition-all duration-200 ${isCategorySelected
                    ? "bg-sidebar-primary/5 border-sidebar-primary/30"
                    : "bg-card border-border hover:border-sidebar-primary/20"
                    }`}>
                    {/* Unified Category Header */}
                    <div className="flex items-center gap-2 px-3 py-2">
                        {/* Category Icon & Name - Clickable to filter */}
                        <button
                            onClick={() => {
                                if (!isCategoryEnabled) return;
                                if (selectedCategory === category) {
                                    onSelectCategory(null);
                                } else {
                                    onSelectCategory(category);
                                }
                            }}
                            className={`flex items-center gap-2 flex-1 min-w-0 focus-ring rounded transition-all duration-200 ${!isCategoryEnabled ? "cursor-not-allowed" : "cursor-pointer"
                                }`}
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isCategorySelected
                                ? "bg-sidebar-primary/20"
                                : "bg-muted"
                                }`}>
                                {feeds[0]?.favicon ? (
                                    <span className="text-xs">{feeds[0].favicon}</span>
                                ) : (
                                    <Rss className={`h-3 w-3 ${isCategorySelected ? "text-sidebar-primary" : "text-muted-foreground"
                                        }`} />
                                )}
                            </div>
                            <span className={`text-sm font-medium truncate transition-colors duration-200 ${isCategorySelected ? "text-sidebar-primary" : "text-foreground"
                                }`}>
                                {category}
                            </span>
                        </button>

                        {/* Feed Count */}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded transition-colors duration-200 ${isCategorySelected
                            ? "text-sidebar-primary bg-sidebar-primary/10"
                            : "text-muted-foreground bg-muted"
                            }`}>
                            {feeds.length}
                        </span>

                        {/* Toggle Visibility */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleCategory(category, !isCategoryEnabled);
                            }}
                            className="p-1 hover:bg-sidebar-primary/10 rounded transition-all duration-200 focus-ring"
                            title={isCategoryEnabled ? "Ascunde categoria" : "Arată categoria"}
                        >
                            {isCategoryEnabled ? (
                                <Eye className="h-4 w-4 text-sidebar-primary" />
                            ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground/50" />
                            )}
                        </button>

                        {/* Expand/Collapse Accordion */}
                        <AccordionPrimitive.Trigger className="p-1 hover:bg-sidebar-primary/10 rounded transition-all duration-200 focus-ring group">
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </AccordionPrimitive.Trigger>
                    </div>

                    {/* Feed List */}
                    <AccordionContent className="px-2 pb-2">
                        <div className="space-y-1 pt-1">
                            {feeds.map((feed) => (
                                <FeedListItem
                                    key={feed.id}
                                    feed={feed}
                                    articleCount={articleCountsByFeed[feed.id] ?? 0}
                                    isSelected={selectedFeed === feed.id}
                                    isFeedEnabled={enabledFeeds[feed.id] ?? true}
                                    isCategoryEnabled={isCategoryEnabled}
                                    shouldDim={shouldDimFeeds && selectedFeed !== feed.id}
                                    onSelectFeed={onSelectFeed}
                                    onToggleFeed={onToggleFeed}
                                />
                            ))}
                        </div>
                    </AccordionContent>
                </div>
            </div>
        </AccordionItem>
    );
}
