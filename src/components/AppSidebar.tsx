import { useMemo, useEffect, useState } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus, Settings, HelpCircle, Eye } from "lucide-react";
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

            <SidebarContent className="px-2 py-2 overflow-y-auto no-scrollbar">
                {/* All Articles Section */}
                <div className="mb-4 px-1">
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
                <div className="space-y-1">
                    <div className="px-3 py-2 mb-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Categorii
                            </h3>
                            <div className="h-px flex-1 bg-border"></div>
                            <span className="text-xs text-muted-foreground font-medium">
                                {categories.length}
                            </span>
                        </div>
                        {/* Legend */}
                        <div className="flex items-center justify-end gap-3 text-[10px] text-muted-foreground/70 uppercase tracking-wide">
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded bg-muted flex items-center justify-center text-[8px]">3</span>
                                Surse
                            </span>
                            <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                Activ
                            </span>
                        </div>
                    </div>

                    <Accordion
                        type="multiple"
                        value={openCategories}
                        onValueChange={setOpenCategories}
                        className="space-y-1"
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
            <SidebarFooter className="border-t border-sidebar-border/50 p-3 mt-auto">
                <div className="space-y-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2 h-9 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        onClick={() => onAddFeed?.({} as RSSFeed, [])} // Placeholder for dialog trigger
                        disabled={!onAddFeed}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Adaugă sursă RSS
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 justify-center gap-1.5 h-8 text-xs hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <Settings className="h-3.5 w-3.5" />
                            Setări
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 justify-center gap-1.5 h-8 text-xs hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <HelpCircle className="h-3.5 w-3.5" />
                            Ajutor
                        </Button>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
