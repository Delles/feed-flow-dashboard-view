import { SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export function LoadingSkeleton() {
    const isMobile = useIsMobile();

    const ArticleCardSkeleton = () => (
        <div className="flex flex-col h-[420px] rounded-xl border border-border/50 bg-card/50 overflow-hidden animate-pulse">
            <div className="w-full aspect-video bg-muted/40" />
            <div className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-muted rounded-full" />
                    <div className="w-24 h-3 bg-muted rounded-full" />
                </div>
                <div className="space-y-3">
                    <div className="w-full h-5 bg-muted rounded-md" />
                    <div className="w-2/3 h-5 bg-muted rounded-md" />
                </div>
                <div className="space-y-2">
                    <div className="w-full h-3 bg-muted/60 rounded-full" />
                    <div className="w-full h-3 bg-muted/60 rounded-full" />
                    <div className="w-4/5 h-3 bg-muted/60 rounded-full" />
                </div>
            </div>
        </div>
    );

    const HeaderSkeleton = () => (
        <header className="sticky top-0 z-30 flex flex-col bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-6">
            <div className="flex justify-between items-center mb-8">
                <div className="h-8 w-40 bg-muted rounded-lg" />
                <div className="flex gap-3">
                    <div className="h-10 w-10 bg-muted rounded-full" />
                    <div className="h-10 w-10 bg-muted rounded-full" />
                </div>
            </div>
            <div className="h-11 w-full max-w-2xl bg-muted rounded-full" />
        </header>
    );

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background justify-center">
                {!isMobile ? (
                    <>
                        <div className="w-80 border-r border-border/50 bg-sidebar-background/30 shrink-0 flex flex-col p-8">
                            <div className="flex items-center gap-3 mb-12">
                                <div className="w-10 h-10 bg-muted rounded-xl" />
                                <div className="h-6 w-24 bg-muted rounded-md" />
                            </div>
                            
                            <div className="grid grid-cols-2 border-y border-border/30 mb-12">
                                <div className="p-6 border-r border-border/30 h-24 flex flex-col items-center gap-2">
                                    <div className="h-3 w-10 bg-muted/40 rounded-full" />
                                    <div className="h-8 w-12 bg-muted rounded-md" />
                                </div>
                                <div className="p-6 h-24 flex flex-col items-center gap-2">
                                    <div className="h-3 w-10 bg-muted/40 rounded-full" />
                                    <div className="h-8 w-12 bg-muted rounded-md" />
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div className="h-20 w-full bg-muted rounded-2xl" />
                                <div className="space-y-4">
                                    <div className="h-3 w-20 bg-muted/30 rounded-full ml-4" />
                                    <div className="h-12 w-full bg-muted/40 rounded-xl" />
                                    <div className="h-12 w-full bg-muted/40 rounded-xl" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col flex-1 w-full max-w-7xl">
                            <HeaderSkeleton />
                            <main className="flex-1 p-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <ArticleCardSkeleton key={i} />
                                    ))}
                                </div>
                            </main>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col flex-1 w-full">
                        <HeaderSkeleton />
                        <main className="flex-1 p-6 space-y-10">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <ArticleCardSkeleton key={i} />
                            ))}
                        </main>
                    </div>
                )}
            </div>
        </SidebarProvider>
    );
}
