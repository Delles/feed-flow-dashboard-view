import { useMemo, useEffect, useState } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Settings, HelpCircle } from "lucide-react";
import { RSSFeed, Article } from "@/types/rss";
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
    /** Callback when a new feed is added */
    onAddFeed: (feed: RSSFeed, articles: Article[]) => void;
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
    onAddFeed,
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

    // Group feeds by category for efficient rendering
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

    // Maintain category order as they appear in the feeds array
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

    // Manage accordion open/closed state
    const [openCategories, setOpenCategories] = useState<string[]>([]);

    // Auto-expand category when a feed is selected
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

    // Auto-expand category when a category is selected
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
                {/* Overview Stats */}
                <div className="mb-6 px-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-sidebar-primary/5 to-sidebar-accent/5 border border-sidebar-border/50">
                        <Badge variant="secondary" className="text-xs">
                            {feeds.length} surse
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {articles.length} articole
                        </Badge>
                    </div>
                </div>

                {/* All Articles Section */}
                <div className="mb-6">
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
                </div>

                {/* Categories Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-3 mb-3">
                        <h3 className="text-sm font-semibold text-sidebar-foreground">
                            Categorii
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                            {categories.length}
                        </Badge>
                    </div>

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
                </div>
            </SidebarContent>

            {/* Footer Actions */}
            <SidebarFooter className="border-t border-sidebar-border/50 p-4">
                <div className="space-y-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        onClick={() => onAddFeed?.({} as RSSFeed, [])} // Placeholder for dialog trigger
                        disabled={!onAddFeed}
                    >
                        <Plus className="h-4 w-4" />
                        Adaugă sursă RSS
                    </Button>

                    <Separator />

                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 justify-start gap-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <Settings className="h-4 w-4" />
                            Setări
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 justify-start gap-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <HelpCircle className="h-4 w-4" />
                            Ajutor
                        </Button>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
