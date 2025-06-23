import { useMemo, useEffect, useState } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { Accordion } from "@/components/ui/accordion";
import { RSSFeed, Article } from "@/types/rss";
import {
    SidebarHeaderStats,
    AllArticlesMenuItem,
    CategoryAccordion,
} from "./sidebar";

// Fallback category name used when a feed has no explicit category
const DEFAULT_CATEGORY = "Altele";

interface AppSidebarProps {
    feeds: RSSFeed[];
    articles: Article[];
    onAddFeed: (feed: RSSFeed, articles: Article[]) => void;
    onRemoveFeed: (feedId: string) => void;
    selectedFeed: string | null;
    onSelectFeed: (feedId: string | null) => void;
    selectedCategory: string | null;
    onSelectCategory: (category: string | null) => void;
    enabledFeeds: Record<string, boolean>;
    enabledCategories: Record<string, boolean>;
    onToggleFeed: (feedId: string, enabled: boolean) => void;
    onToggleCategory: (category: string, enabled: boolean) => void;
}

export function AppSidebar({
    feeds,
    articles,
    onAddFeed: _onAddFeed,
    onRemoveFeed,
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

    // Group feeds by category (memoised for performance)
    const feedsByCategory = useMemo(() => {
        return feeds.reduce((acc, feed) => {
            const category = feed.category ?? DEFAULT_CATEGORY;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(feed);
            return acc;
        }, {} as Record<string, RSSFeed[]>);
    }, [feeds]);

    // Preserve category order as it appears in the feeds array (same order as in mockData)
    const categories = useMemo(() => {
        const ordered: string[] = [];
        const seen = new Set<string>();

        feeds.forEach((feed) => {
            const category = feed.category ?? DEFAULT_CATEGORY;
            if (!seen.has(category)) {
                seen.add(category);
                ordered.push(category);
            }
        });

        return ordered;
    }, [feeds]);

    // Manage accordion open state - auto-open category when feed is selected
    const [openCategories, setOpenCategories] = useState<string[]>([]);

    useEffect(() => {
        if (selectedFeed) {
            const selectedFeedObj = feeds.find((f) => f.id === selectedFeed);
            if (selectedFeedObj) {
                const category = selectedFeedObj.category ?? DEFAULT_CATEGORY;
                setOpenCategories((prev) =>
                    prev.includes(category) ? prev : [...prev, category]
                );
            }
        }
    }, [selectedFeed, feeds]);

    useEffect(() => {
        if (selectedCategory) {
            setOpenCategories((prev) =>
                prev.includes(selectedCategory)
                    ? prev
                    : [...prev, selectedCategory]
            );
        }
    }, [selectedCategory]);

    return (
        <Sidebar className="border-r border-border no-scrollbar sidebar-offset-left">
            <SidebarHeader>
                <SidebarHeaderStats
                    feedCount={feeds.length}
                    articleCount={articles.length}
                />
            </SidebarHeader>

            <SidebarContent className="px-2 py-4 overflow-y-auto no-scrollbar">
                <AllArticlesMenuItem
                    articleCount={articles.length}
                    feedCount={feeds.length}
                    isActive={!hasActiveFilter}
                    hasActiveFilter={hasActiveFilter}
                    onSelectAll={() => {
                        onSelectFeed(null);
                        onSelectCategory(null);
                    }}
                />

                <Accordion
                    type="multiple"
                    value={openCategories}
                    onValueChange={setOpenCategories}
                    className="space-y-2"
                >
                    {categories.map((category) => (
                        <CategoryAccordion
                            key={category}
                            category={category}
                            feeds={feedsByCategory[category]}
                            articles={articles}
                            selectedFeed={selectedFeed}
                            selectedCategory={selectedCategory}
                            enabledFeeds={enabledFeeds}
                            isCategoryEnabled={
                                enabledCategories[category] ?? true
                            }
                            hasActiveFilter={hasActiveFilter}
                            onSelectFeed={onSelectFeed}
                            onSelectCategory={onSelectCategory}
                            onToggleFeed={onToggleFeed}
                            onToggleCategory={onToggleCategory}
                        />
                    ))}
                </Accordion>
            </SidebarContent>

            {/* Add feed functionality disabled for MVP */}
        </Sidebar>
    );
}
