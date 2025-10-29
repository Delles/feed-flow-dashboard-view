import { Globe } from "lucide-react";

interface AllArticlesMenuItemProps {
    articleCount: number;
    feedCount: number;
    isActive: boolean;
    hasActiveFilter: boolean;
    onSelectAll: () => void;
}

export function AllArticlesMenuItem({
    articleCount,
    feedCount,
    isActive,
    hasActiveFilter,
    onSelectAll,
}: AllArticlesMenuItemProps) {
    return (
        <div
            className={`transition-all duration-200 ${
                hasActiveFilter && !isActive
                    ? "opacity-60"
                    : "opacity-100"
            }`}
        >
            <button
                onClick={onSelectAll}
                className={`w-full p-3 rounded-lg floating-card focus-ring transition-all duration-200 ${
                    isActive
                        ? "bg-sidebar-primary/10 border border-sidebar-primary/30 shadow-sm"
                        : "bg-card border border-border hover:border-sidebar-primary/20 hover:bg-sidebar-primary/5"
                }`}
            >
                <div className="flex items-center w-full gap-3">
                    <div
                        className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                            isActive
                                ? "bg-sidebar-primary text-white"
                                : "bg-sidebar-primary/10 text-sidebar-primary"
                        }`}
                    >
                        <Globe
                            className="h-4 w-4"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="flex-1 text-left">
                        <div
                            className={`font-semibold text-sm transition-colors duration-200 ${
                                isActive
                                    ? "text-sidebar-primary"
                                    : "text-foreground"
                            }`}
                        >
                            Toate articolele
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                                {feedCount} {feedCount === 1 ? "sursă" : "surse"}
                            </span>
                            <span className="text-muted-foreground text-xs">•</span>
                            <span className="text-xs text-muted-foreground">
                                {articleCount} articole
                            </span>
                        </div>
                    </div>
                </div>
            </button>
        </div>
    );
}
