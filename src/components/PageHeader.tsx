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
            className="sticky top-0 z-10 flex flex-col gap-2 px-4 py-2 bg-background/95 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 min-h-[96px]"
            style={{ containIntrinsicSize: "96px", contentVisibility: "auto" }}
        >
            <div className="flex items-center gap-4 h-12">
                <SidebarTrigger
                    className="lg:hidden"
                    aria-label="Toggle navigation sidebar"
                />
                <div className="flex-1">
                    <SearchInput
                        onSearch={onSearch}
                        placeholder="Caută articole..."
                        isLoading={isSearching}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <RefreshButton
                        onRefresh={onRefresh}
                        isRefreshing={isRefreshing}
                    />
                    <ThemeToggle />
                </div>
            </div>
            <div className="flex flex-col items-start gap-2 md:flex-row md:flex-nowrap md:items-center md:justify-between">
                <nav className="hidden md:block" aria-label="Breadcrumb navigation">
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbItems.map((item, index) => (
                                <div key={item.label} className="flex items-center">
                                    {index > 0 && <BreadcrumbSeparator />}
                                    <BreadcrumbItem>
                                        {item.isActive ? (
                                            <BreadcrumbPage className="font-semibold">
                                                {item.label}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink href={item.href} className="hover:text-foreground">
                                                {item.label}
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </div>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </nav>
                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary font-semibold">
                        {activeFilterName}
                    </Badge>
                    {searchQuery && (
                        <Badge variant="secondary" className="font-normal">
                            "{searchQuery}"
                        </Badge>
                    )}
                    <span className="font-medium text-foreground/80 whitespace-nowrap text-right min-w-[6.5rem] tabular-nums">
                        {totalAvailable} articole
                    </span>
                </div>
            </div>
        </header>
    );
}

