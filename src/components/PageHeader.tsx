"use client";

import { useMemo } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RefreshButton } from "@/components/RefreshButton";
import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { SearchInput } from "@/components/SearchInput";
import { RSSFeed } from "@/types/rss";

/**
 * Props for the PageHeader component
 */
interface PageHeaderProps {
    /** Array of RSS feeds for navigation and breadcrumbs */
    feeds: RSSFeed[];
    /** Currently selected feed ID */
    selectedFeed: string | null;
    /** Currently selected category */
    selectedCategory: string | null;
    /** Current search query */
    searchQuery: string;
    /** Total number of available articles */
    totalAvailable: number;
    /** Whether search is in progress */
    isSearching: boolean;
    /** Whether articles are being refreshed */
    isRefreshing?: boolean;
    /** Callback for search */
    onSearch: (query: string) => void;
    /** Callback to refresh articles */
    onRefresh: () => Promise<void>;
    /** Callback when a feed is selected */
    onSelectFeed: (feedId: string | null) => void;
    /** Callback when a category is selected */
    onSelectCategory: (category: string | null) => void;
    /** Optional callback to add a new feed */
    onAddFeed?: () => void;
}

/**
 * Page header component with navigation, search, and actions.
 *
 * Features:
 * - Breadcrumb navigation for current selection
 * - Search input with Cmd/Ctrl+K shortcut
 * - Article stats and count display
 * - Responsive design with mobile optimizations
 */
export function PageHeader({
    feeds,
    selectedFeed,
    selectedCategory,
    searchQuery,
    totalAvailable,
    isSearching,
    isRefreshing = false,
    onSearch,
    onRefresh,
    onSelectFeed,
    onSelectCategory,
    onAddFeed,
}: PageHeaderProps) {

    // Determine active filter name for display
    const activeFilterName = useMemo(() => {
        if (selectedFeed) {
            return feeds.find((f) => f.id === selectedFeed)?.title || "Filtru";
        }
        return selectedCategory || "Toate articolele";
    }, [feeds, selectedFeed, selectedCategory]);

    // Generate breadcrumb items
    const breadcrumbItems = useMemo(() => {
        const items = [
            { label: "Știri", href: "/", isActive: !selectedFeed && !selectedCategory }
        ];

        if (selectedCategory) {
            items.push({
                label: selectedCategory,
                href: "#",
                isActive: !selectedFeed
            });
        }

        if (selectedFeed) {
            const feed = feeds.find(f => f.id === selectedFeed);
            if (feed) {
                items.push({
                    label: feed.title,
                    href: "#",
                    isActive: true
                });
            }
        }

        return items;
    }, [feeds, selectedFeed, selectedCategory]);

    return (
        <header
            className="sticky top-0 z-30 flex flex-col bg-background/80 backdrop-blur-xl border-b border-border/40 px-6 py-3"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="lg:hidden hover:bg-accent rounded-xl transition-colors" />
                    <div>
                        <h1 className="font-serif font-black text-xl tracking-tight text-foreground leading-none">
                            Feed <span className="text-primary italic">Flow</span>
                        </h1>
                        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 leading-none mt-1">
                            Panou Digital
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <RefreshButton
                        onRefresh={onRefresh}
                        isRefreshing={isRefreshing}
                    />
                    <ThemeToggle />
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                    <SearchInput
                        onSearch={onSearch}
                        placeholder="Caută în arhivă..."
                        isLoading={isSearching}
                    />
                </div>
                <div className="flex items-center gap-6 border-l border-border/30 pl-6 hidden md:flex">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Filtru</span>
                        <span className="font-serif font-black text-sm text-foreground/80 truncate max-w-[120px]">{activeFilterName}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Total</span>
                        <span className="font-serif font-black text-sm text-foreground/80 tabular-nums">{totalAvailable}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

