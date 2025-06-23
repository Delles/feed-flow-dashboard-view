import { useMemo } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchInput } from "@/components/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RefreshButton } from "@/components/RefreshButton";
import { Badge } from "@/components/ui/badge";
import { RSSFeed } from "@/types/rss";

interface PageHeaderProps {
    feeds: RSSFeed[];
    selectedFeed: string | null;
    selectedCategory: string | null;
    searchQuery: string;
    totalAvailable: number;
    isSearching: boolean;
    isRefreshing?: boolean;
    onSearch: (query: string) => void;
    onRefresh: () => Promise<void>;
}

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
}: PageHeaderProps) {
    const activeFilterName = useMemo(() => {
        if (selectedFeed) {
            return feeds.find((f) => f.id === selectedFeed)?.title || "Filtru";
        }
        return selectedCategory || "Toate articolele";
    }, [feeds, selectedFeed, selectedCategory]);

    return (
        <header className="sticky top-0 z-10 flex flex-col gap-2 px-4 py-2 bg-background/95 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 min-h-[96px]">
            <div className="flex items-center gap-4 h-12">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex-1">
                    <SearchInput onSearch={onSearch} isLoading={isSearching} />
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
                <h1 className="text-lg font-bold text-foreground md:text-2xl">
                    Știri
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <Badge
                        variant="outline"
                        className="border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold"
                    >
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
