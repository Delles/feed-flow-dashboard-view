"use client";

import { useMemo, useEffect, useState } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus, Rss } from "lucide-react";
import { RSSFeed, Article } from "@/types/rss";
import { motion } from "framer-motion";
import {
    SidebarHeaderStats,
    AllArticlesMenuItem,
    CategoryAccordion,
} from "./sidebar";

/**
 * Default category name for feeds without an explicit category
 */
const DEFAULT_CATEGORY = "Altele";

/**
 * Props for the AppSidebar component
 */
interface AppSidebarProps {
    /** Array of RSS feeds to display */
    feeds: RSSFeed[];
    /** Array of articles for counting and stats */
    articles: Article[];
    /** Callback to open the add feed dialog */
    onOpenAddFeedDialog?: () => void;
    /** Callback when a feed is removed */
    onRemoveFeed: (feedId: string) => void;
    /** Currently selected feed ID */
    selectedFeed: string | null;
    /** Callback when a feed is selected */
    onSelectFeed: (feedId: string | null) => void;
    /** Currently selected category */
    selectedCategory: string | null;
    /** Callback when a category is selected */
    onSelectCategory: (category: string | null) => void;
    /** Record of enabled/disabled feeds */
    enabledFeeds: Record<string, boolean>;
    /** Record of enabled/disabled categories */
    enabledCategories: Record<string, boolean>;
    /** Callback to toggle feed enabled state */
    onToggleFeed: (feedId: string, enabled: boolean) => void;
    /** Callback to toggle category enabled state */
    onToggleCategory: (category: string, enabled: boolean) => void;
}

/**
 * Main application sidebar component with feed navigation and filtering
 */
export function AppSidebar({
    feeds,
    articles,
    onOpenAddFeedDialog,
    selectedFeed,
    onSelectFeed,
    selectedCategory,
    onSelectCategory,
    enabledFeeds,
    enabledCategories,
    onToggleFeed,
    onToggleCategory,
}: AppSidebarProps) {
    const hasActiveFilter = selectedFeed !== null || selectedCategory !== null;

    // Group feeds by category and maintain category order in a single pass
    const { feedsByCategory, categories } = useMemo(() => {
        const feedsMap: Record<string, RSSFeed[]> = {};
        const categoriesList: string[] = [];

        for (let i = 0; i < feeds.length; i++) {
            const feed = feeds[i];
            const category = feed.category ?? DEFAULT_CATEGORY;

            if (!feedsMap[category]) {
                feedsMap[category] = [];
                categoriesList.push(category);
            }
            feedsMap[category].push(feed);
        }

        return { feedsByCategory: feedsMap, categories: categoriesList };
    }, [feeds]);

    // Manage accordion open/closed state
    const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

    // Memoize feed lookup for O(1) access
    const feedById = useMemo(() => {
        const map = new Map<string, RSSFeed>();
        feeds.forEach((feed) => {
            map.set(feed.id, feed);
        });
        return map;
    }, [feeds]);

    // Auto-expand category when a feed is selected
    useEffect(() => {
        if (selectedFeed) {
            const selectedFeedObj = feedById.get(selectedFeed);
            if (selectedFeedObj) {
                const category = selectedFeedObj.category ?? DEFAULT_CATEGORY;
                setOpenCategories((prev) =>
                    prev.has(category) ? prev : new Set(prev).add(category)
                );
            }
        }
    }, [selectedFeed, feedById]);

    // Auto-expand category when a category is selected
    useEffect(() => {
        if (selectedCategory) {
            setOpenCategories((prev) =>
                prev.has(selectedCategory)
                    ? prev
                    : new Set(prev).add(selectedCategory)
            );
        }
    }, [selectedCategory]);

    // Pre-compute article counts per feed
    const articleCountsByFeed = useMemo(() => {
        return articles.reduce((acc, article) => {
            acc[article.feedId] = (acc[article.feedId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [articles]);

    return (
        <Sidebar className="border-r border-border/40 bg-background/50 backdrop-blur-2xl">
            <SidebarHeader className="p-0">
                <div className="p-6 pb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
                        >
                            <Rss className="w-[18px] h-[18px] text-white" />
                        </motion.div>
                        <div>
                            <h2 className="font-serif font-black text-lg tracking-tight text-foreground leading-none">
                                Feed <span className="text-primary italic">Flow</span>
                            </h2>
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-1">
                                Ediția Digitală
                            </p>
                        </div>
                    </div>
                </div>
                <SidebarHeaderStats
                    feedCount={feeds.length}
                    articleCount={articles.length}
                />
            </SidebarHeader>

            <SidebarContent className="px-3 py-6 no-scrollbar">
                <div className="space-y-10">
                    <div className="px-1">
                        <AllArticlesMenuItem
                            isActive={!hasActiveFilter}
                            onSelectAll={() => {
                                onSelectFeed(null);
                                onSelectCategory(null);
                            }}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="px-4 flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/70 dark:text-foreground/60">
                                Surse pe Categorii
                            </h3>
                            <div className="w-10 h-px bg-primary/40" />
                        </div>

                        <Accordion
                            type="multiple"
                            value={Array.from(openCategories)}
                            onValueChange={(val) => setOpenCategories(new Set(val))}
                            className="space-y-1"
                        >
                            {categories.map((category) => (
                                <CategoryAccordion
                                    key={category}
                                    category={category}
                                    feeds={feedsByCategory[category]}
                                    articleCounts={articleCountsByFeed}
                                    selectedFeed={selectedFeed}
                                    selectedCategory={selectedCategory}
                                    enabledFeeds={enabledFeeds}
                                    isCategoryEnabled={
                                        enabledCategories[category] ?? true
                                    }
                                    hasActiveFilter={hasActiveFilter}
                                    openCategories={openCategories}
                                    onSelectFeed={onSelectFeed}
                                    onSelectCategory={onSelectCategory}
                                    onToggleFeed={onToggleFeed}
                                    onToggleCategory={onToggleCategory}
                                />
                            ))}
                        </Accordion>
                    </div>
                </div>
            </SidebarContent>

            <SidebarFooter className="p-6 border-t border-border/40 bg-secondary/10 backdrop-blur-md">
                <Button
                    variant="outline"
                    className="w-full rounded-2xl font-bold uppercase tracking-widest text-[9px] h-12 bg-background/50 border-border/40 hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 shadow-sm hover:shadow-primary/20 group"
                    onClick={onOpenAddFeedDialog ?? undefined}
                    disabled={!onOpenAddFeedDialog}
                    aria-disabled={!onOpenAddFeedDialog}
                >
                    <Plus className="mr-2 h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
                    Adaugă Sursă
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
export default AppSidebar;
