import { useMemo } from "react";
import { ChevronDown, Eye, EyeOff, Rss } from "lucide-react";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { RSSFeed, Article } from "@/types/rss";
import { FeedListItem } from "./FeedListItem";

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
            className={`border-none transition-all duration-300 animate-fade-in ${
                !isCategoryEnabled
                    ? "opacity-40 scale-95"
                    : shouldDimCategory
                    ? "opacity-50 scale-95"
                    : "opacity-100 scale-100"
            }`}
        >
            <div className="flex items-center justify-between mb-3 px-2">
                <button
                    onClick={() => {
                        if (!isCategoryEnabled) return;
                        if (selectedCategory === category) {
                            onSelectCategory(null);
                        } else {
                            onSelectCategory(category);
                        }
                    }}
                    className={`text-sm font-bold text-foreground uppercase tracking-wider flex-1 text-left transition-all duration-300 px-4 py-3 rounded-2xl floating-card scale-hover focus-ring ${
                        !isCategoryEnabled
                            ? "cursor-not-allowed opacity-40"
                            : "cursor-pointer"
                    } ${
                        isCategorySelected
                            ? "highlight-gradient"
                            : "bg-card border-border sidebar-hover-border"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                isCategorySelected
                                    ? "bg-sidebar-primary/20 border border-sidebar-primary/30"
                                    : "bg-muted sidebar-hover-bg"
                            }`}
                        >
                            {feeds[0]?.favicon ? (
                                <span className="text-sm transition-transform duration-300 sidebar-hover-scale">
                                    {feeds[0].favicon}
                                </span>
                            ) : (
                                <Rss
                                    className={`h-3 w-3 transition-colors duration-300 ${
                                        isCategorySelected
                                            ? "text-sidebar-primary"
                                            : "text-muted-foreground sidebar-hover-text"
                                    }`}
                                />
                            )}
                        </div>
                        <span
                            className={`transition-colors duration-300 ${
                                isCategorySelected
                                    ? "text-sidebar-primary"
                                    : "sidebar-hover-text"
                            }`}
                        >
                            {category}
                        </span>
                    </div>
                </button>
                <div className="flex items-center gap-3 ml-3">
                    <div
                        className={`flex items-center justify-center min-w-[2rem] h-8 rounded-xl px-3 transition-all duration-300 ${
                            isCategorySelected
                                ? "bg-sidebar-primary/20 border border-sidebar-primary/30"
                                : "bg-muted"
                        }`}
                    >
                        <span
                            className={`text-xs font-bold transition-colors duration-300 ${
                                isCategorySelected
                                    ? "text-sidebar-primary"
                                    : "text-muted-foreground"
                            }`}
                        >
                            {feeds.length}
                        </span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleCategory(category, !isCategoryEnabled);
                        }}
                        className="h-9 w-9 p-0 sidebar-hover-bg rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 scale-hover focus-ring"
                    >
                        {isCategoryEnabled ? (
                            <Eye className="h-4 w-4 text-sidebar-primary transition-transform duration-300 sidebar-hover-scale" />
                        ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground/50" />
                        )}
                    </button>
                </div>
            </div>
            <AccordionTrigger className="px-4 py-2 hover:no-underline text-sm text-muted-foreground rounded-xl sidebar-hover-bg transition-all duration-300">
                <div className="flex items-center gap-2">
                    <span className="font-medium sidebar-hover-text transition-colors duration-300">
                        Afișează fluxuri
                    </span>
                    <div className="w-1.5 h-1.5 bg-sidebar-primary rounded-full animate-pulse"></div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4">
                <div className="space-y-3 mt-3">
                    {/* TODO: Consider @tanstack/react-virtual for feeds list if performance degrades beyond ~200 feeds */}
                    {feeds.map((feed, index) => (
                        <div
                            key={feed.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <FeedListItem
                                feed={feed}
                                articleCount={articleCountsByFeed[feed.id] ?? 0}
                                isSelected={selectedFeed === feed.id}
                                isFeedEnabled={enabledFeeds[feed.id] ?? true}
                                isCategoryEnabled={isCategoryEnabled}
                                hasActiveFilter={hasActiveFilter}
                                shouldDim={
                                    shouldDimFeeds && selectedFeed !== feed.id
                                }
                                onSelectFeed={onSelectFeed}
                                onToggleFeed={onToggleFeed}
                            />
                        </div>
                    ))}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
