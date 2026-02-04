interface SidebarHeaderStatsProps {
    feedCount: number;
    articleCount: number;
}

export function SidebarHeaderStats({
    feedCount,
    articleCount,
}: SidebarHeaderStatsProps) {
    return (
        <div className="flex px-6 py-4 border-y border-border/40 bg-secondary/10 divide-x divide-border/20">
            <div className="flex-1 flex flex-col items-start gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 dark:text-foreground/50">Surse</span>
                <span className="font-serif font-black text-2xl text-primary tabular-nums leading-none">{feedCount}</span>
            </div>
            <div className="flex-1 flex flex-col items-end gap-1 pl-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 dark:text-foreground/50 text-right">Articole</span>
                <span className="font-serif font-black text-2xl text-primary tabular-nums leading-none">{articleCount}</span>
            </div>
        </div>
    );
}
