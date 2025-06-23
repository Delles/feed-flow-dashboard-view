import { Rss } from "lucide-react";

interface SidebarHeaderStatsProps {
    feedCount: number;
    articleCount: number;
}

export function SidebarHeaderStats({
    feedCount,
    articleCount,
}: SidebarHeaderStatsProps) {
    return (
        <div className="glass border-b border-border/50 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="flex items-center justify-center w-14 h-14 icon-gradient rounded-2xl shadow-lg floating-card scale-hover">
                        <Rss
                            className="h-7 w-7 text-sidebar-primary-foreground animate-bounce-gentle"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse-glow"></div>
                </div>
                <div className="flex-1">
                    <h1 className="font-bold text-2xl text-foreground tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
                        Feed Flow
                    </h1>
                </div>
            </div>
        </div>
    );
}
