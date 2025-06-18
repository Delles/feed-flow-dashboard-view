import { useMemo } from "react";
import { Rss, Globe, TrendingUp, Eye, EyeOff } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { RSSFeed, Article } from "@/types/rss";

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

    // Pre-compute article counts per feed so we don't O(feeds×articles) each render
    const articleCountsByFeed = useMemo(() => {
        return articles.reduce((acc, article) => {
            acc[article.feedId] = (acc[article.feedId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [articles]);

    return (
        <Sidebar className="border-r border-border no-scrollbar sidebar-offset-left">
            <SidebarHeader className="border-b border-border p-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl shadow-sm">
                        <Rss
                            className="h-6 w-6 text-primary-foreground"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="flex-1">
                        <h1 className="font-bold text-xl text-foreground tracking-tight">
                            Feed Flow
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">
                            {feeds.length}{" "}
                            {feeds.length === 1 ? "sursă" : "surse"} •{" "}
                            {articles.length} articole
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 py-4 overflow-y-auto no-scrollbar">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem
                                className={`transition-opacity duration-200 ${
                                    hasActiveFilter ? "opacity-60" : ""
                                }`}
                            >
                                <SidebarMenuButton
                                    isActive={!hasActiveFilter}
                                    onClick={() => {
                                        onSelectFeed(null);
                                        onSelectCategory(null);
                                    }}
                                    className="h-auto p-3 rounded-lg mb-2 bg-card border border-border shadow-sm hover:shadow-md hover:bg-accent data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md data-[state=active]:opacity-100 transition-all duration-200"
                                >
                                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl mr-4">
                                        <Globe
                                            className="h-5 w-5 text-primary"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold text-foreground text-base">
                                            Toate articolele
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Vizualizare generală
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center min-w-[3rem] h-8 bg-muted rounded-lg px-3">
                                        <span className="text-sm font-bold text-muted-foreground">
                                            {articles.length}
                                        </span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {categories.map((category) => {
                    const isCategoryEnabled =
                        enabledCategories[category] ?? true;
                    const isCategorySelected = selectedCategory === category;
                    const isFeedInThisCategorySelected = feedsByCategory[
                        category
                    ].some((f) => f.id === selectedFeed);
                    const isGroupActive =
                        isCategorySelected || isFeedInThisCategorySelected;

                    return (
                        <SidebarGroup
                            key={category}
                            className={`mb-2 pb-2 border-b last:mb-0 last:border-b-0 transition-opacity duration-200 ${
                                !isCategoryEnabled ? "opacity-40" : ""
                            }`}
                        >
                            <div className="flex items-center justify-between mb-4 px-2">
                                <SidebarGroupLabel
                                    onClick={() => {
                                        if (!isCategoryEnabled) return;
                                        if (selectedCategory === category) {
                                            onSelectCategory(null);
                                        } else {
                                            onSelectCategory(category);
                                        }
                                    }}
                                    className={`text-sm font-bold text-foreground uppercase tracking-wider flex-1 transition-all duration-200 ${
                                        !isCategoryEnabled
                                            ? "cursor-not-allowed"
                                            : "cursor-pointer hover:text-primary"
                                    } ${
                                        isCategorySelected ? "text-primary" : ""
                                    } ${
                                        hasActiveFilter && !isGroupActive
                                            ? "opacity-60"
                                            : ""
                                    }`}
                                >
                                    {category}
                                </SidebarGroupLabel>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-full font-semibold">
                                        {feedsByCategory[category].length}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleCategory(
                                                category,
                                                !isCategoryEnabled
                                            );
                                        }}
                                        className="h-8 w-8 p-0 hover:bg-accent rounded-lg"
                                    >
                                        {isCategoryEnabled ? (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <EyeOff className="h-4 w-4 text-muted-foreground/50" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {feedsByCategory[category].map((feed) => {
                                        const isFeedEnabled =
                                            enabledFeeds[feed.id] ?? true;
                                        const isItemEnabled =
                                            isFeedEnabled && isCategoryEnabled;
                                        const isFeedSelected =
                                            selectedFeed === feed.id;

                                        return (
                                            <SidebarMenuItem
                                                key={feed.id}
                                                className={`transition-opacity duration-200 ${
                                                    !isFeedEnabled
                                                        ? "opacity-50"
                                                        : ""
                                                } ${
                                                    hasActiveFilter &&
                                                    !isFeedSelected
                                                        ? "opacity-60"
                                                        : ""
                                                }`}
                                            >
                                                <SidebarMenuButton
                                                    isActive={
                                                        selectedFeed === feed.id
                                                    }
                                                    onClick={() => {
                                                        if (!isItemEnabled)
                                                            return;
                                                        onSelectFeed(feed.id);
                                                    }}
                                                    className={`h-auto p-0 rounded-lg bg-card border border-border shadow-sm hover:shadow-md hover:bg-accent data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md data-[state=active]:opacity-100 transition-all duration-200 group ${
                                                        !isItemEnabled
                                                            ? "cursor-not-allowed"
                                                            : ""
                                                    }`}
                                                >
                                                    <div className="flex items-center p-3 w-full gap-3">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center border border-border">
                                                                {feed.favicon ? (
                                                                    <span className="text-base">
                                                                        {
                                                                            feed.favicon
                                                                        }
                                                                    </span>
                                                                ) : (
                                                                    <Rss className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1 min-w-0 pr-3">
                                                                    <h4 className="font-semibold text-foreground text-sm leading-tight">
                                                                        {
                                                                            feed.title
                                                                        }
                                                                    </h4>
                                                                </div>
                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                    <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                                                                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                                                        <span className="text-xs font-medium text-foreground">
                                                                            {articleCountsByFeed[
                                                                                feed
                                                                                    .id
                                                                            ] ??
                                                                                0}
                                                                        </span>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            onToggleFeed(
                                                                                feed.id,
                                                                                !isFeedEnabled
                                                                            );
                                                                        }}
                                                                        className="h-7 w-7 p-0 hover:bg-accent rounded-md"
                                                                        disabled={
                                                                            !isCategoryEnabled
                                                                        }
                                                                    >
                                                                        {isItemEnabled ? (
                                                                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                                                        ) : (
                                                                            <EyeOff className="h-3.5 w-3.5 text-muted-foreground/50" />
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    );
                })}
            </SidebarContent>

            {/* Add feed functionality disabled for MVP */}
        </Sidebar>
    );
}
