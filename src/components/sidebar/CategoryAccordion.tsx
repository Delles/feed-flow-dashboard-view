import { memo } from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import {
    AccordionContent,
    AccordionItem,
} from "@/components/ui/accordion";
import { RSSFeed } from "@/types/rss";
import { FeedListItem } from "./FeedListItem";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { motion } from "framer-motion";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface CategoryAccordionProps {
    category: string;
    feeds: RSSFeed[];
    articleCounts: Record<string, number>;
    selectedFeed: string | null;
    selectedCategory: string | null;
    enabledFeeds: Record<string, boolean>;
    isCategoryEnabled: boolean;
    hasActiveFilter: boolean;
    openCategories: string[];
    onSelectFeed: (feedId: string | null) => void;
    onSelectCategory: (category: string | null) => void;
    onToggleFeed: (feedId: string, enabled: boolean) => void;
    onToggleCategory: (category: string, enabled: boolean) => void;
}

function CategoryAccordionComponent({
    category,
    feeds,
    articleCounts,
    selectedFeed,
    selectedCategory,
    enabledFeeds,
    isCategoryEnabled,
    hasActiveFilter,
    openCategories,
    onSelectFeed,
    onSelectCategory,
    onToggleFeed,
    onToggleCategory,
}: CategoryAccordionProps) {
    const isCategorySelected = selectedCategory === category;
    const isOpen = openCategories.includes(category);

    // Determine if feeds in this category should be dimmed
    const shouldDimFeeds = hasActiveFilter && !isCategorySelected;

    return (
        <AccordionItem
            value={category}
            className={`border-none mb-1 transition-all duration-500 ${!isCategoryEnabled ? "opacity-30 grayscale px-2" : "opacity-100"
                }`}
        >
            <div
                className={`relative flex items-center gap-1 rounded-xl transition-all duration-500 group/cat ${isCategorySelected ? "bg-primary/5 shadow-sm ring-1 ring-primary/10" : "hover:bg-accent/20"
                    }`}
            >
                <button
                    onClick={() => {
                        if (!isCategoryEnabled) return;
                        if (selectedCategory === category) {
                            onSelectCategory(null);
                        } else {
                            onSelectCategory(category);
                        }
                    }}
                    className={`flex-1 text-left font-serif font-black text-[15px] px-4 py-2.5 rounded-lg transition-colors truncate ${isCategorySelected ? "text-primary" : "text-foreground/90 dark:text-foreground/80 group-hover/cat:text-foreground"
                        }`}
                >
                    {category}
                </button>

                <div className="flex items-center gap-0.5 pr-2 transition-opacity duration-300">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleCategory(category, !isCategoryEnabled);
                                }}
                                className={`p-1.5 rounded-lg transition-all duration-300 ${isCategoryEnabled ? "text-primary/60 hover:text-primary hover:bg-primary/10" : "text-muted-foreground/40 dark:text-foreground/30 hover:text-muted-foreground hover:bg-muted"
                                    }`}
                            >
                                {isCategoryEnabled ? (
                                    <Eye className="h-3.5 w-3.5" />
                                ) : (
                                    <EyeOff className="h-3.5 w-3.5" />
                                )}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-foreground text-background font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded-xl border-none">
                            {isCategoryEnabled ? "Dezactivează Categoria" : "Activează Categoria"}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <AccordionPrimitive.Trigger className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-all duration-300 group/trig">
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-500 ${isOpen ? "rotate-180 text-primary" : "rotate-0"}`} />
                            </AccordionPrimitive.Trigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-foreground text-background font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded-xl border-none">
                            {isOpen ? "Ascunde Sursele" : "Vezi Sursele"}
                        </TooltipContent>
                    </Tooltip>
                </div>

                {isCategorySelected && !openCategories.includes(category) && (
                    <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                    />
                )}
            </div>

            <AccordionContent className="pt-2 pl-4">
                <div className="space-y-1 relative">
                    <div className="absolute left-4 top-0 bottom-4 w-px bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
                    <div className="pl-6 space-y-1">
                        {feeds.map((feed) => (
                            <FeedListItem
                                key={feed.id}
                                feed={feed}
                                articleCount={articleCounts[feed.id] ?? 0}
                                isSelected={selectedFeed === feed.id}
                                isFeedEnabled={
                                    enabledFeeds[feed.id] ?? true
                                }
                                isCategoryEnabled={isCategoryEnabled}
                                shouldDim={
                                    shouldDimFeeds &&
                                    selectedFeed !== feed.id
                                }
                                onSelectFeed={onSelectFeed}
                                onToggleFeed={onToggleFeed}
                            />
                        ))}
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

export const CategoryAccordion = memo(CategoryAccordionComponent);