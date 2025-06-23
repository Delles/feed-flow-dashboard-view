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
            className={`transition-all duration-300 animate-fade-in ${
                hasActiveFilter && !isActive
                    ? "opacity-60 scale-95"
                    : "opacity-100 scale-100"
            }`}
        >
            <button
                onClick={onSelectAll}
                className={`w-full h-auto p-3 rounded-xl mb-4 floating-card scale-hover focus-ring transition-all duration-300 ${
                    isActive
                        ? "highlight-gradient-strong"
                        : "bg-card border-border sidebar-hover-border"
                }`}
            >
                <div className="flex items-center w-full gap-3">
                    <div
                        className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                            isActive
                                ? "icon-gradient shadow-md"
                                : "bg-sidebar-primary/10 sidebar-hover-bg"
                        }`}
                    >
                        <Globe
                            className={`h-5 w-5 transition-all duration-300 ${
                                isActive
                                    ? "text-white"
                                    : "text-sidebar-primary sidebar-hover-scale"
                            }`}
                            aria-hidden="true"
                        />
                        {isActive && (
                            <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse-glow"></div>
                        )}
                    </div>
                    <div className="flex-1 text-left">
                        <div
                            className={`font-bold text-base transition-colors duration-300 ${
                                isActive
                                    ? "text-sidebar-primary"
                                    : "text-foreground sidebar-hover-text"
                            }`}
                        >
                            Toate articolele
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-sidebar-primary rounded-full animate-pulse"></div>
                                <span className="text-xs text-muted-foreground font-medium">
                                    {feedCount}{" "}
                                    {feedCount === 1 ? "sursă" : "surse"}
                                </span>
                            </div>
                            <span className="text-muted-foreground text-xs">
                                •
                            </span>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-muted-foreground font-medium">
                                    {articleCount} articole
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </button>
        </div>
    );
}
