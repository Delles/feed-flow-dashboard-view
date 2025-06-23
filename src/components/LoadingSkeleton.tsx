import { SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export function LoadingSkeleton() {
    const isMobile = useIsMobile();

    // The shared skeleton for a single article card, matching its final dimensions
    const ArticleCardSkeleton = () => (
        <div className="flex flex-col h-[460px] overflow-hidden rounded-lg border bg-card">
            <Skeleton className="w-full aspect-video" />
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-16 h-4" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="w-full h-5" />
                    <Skeleton className="w-11/12 h-5" />
                </div>
            </div>
            <div className="p-4 pt-0 flex-grow space-y-1.5">
                <Skeleton className="w-full h-3.5" />
                <Skeleton className="w-full h-3.5" />
                <Skeleton className="w-5/6 h-3.5" />
            </div>
            <div className="p-4 pt-0 mt-auto">
                <Skeleton className="w-28 h-5" />
            </div>
        </div>
    );

    // The shared skeleton for the content header, matching its final classes
    const HeaderSkeleton = () => (
        <header className="sticky top-0 z-10 flex flex-col gap-2 px-4 py-2 bg-background/95 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 min-h-[96px]">
            <div className="flex items-center gap-4 h-12">
                {isMobile && <Skeleton className="h-9 w-9" />}
                <div className="flex-1">
                    <Skeleton className="h-10 w-full max-w-xl" />
                </div>
                <Skeleton className="h-9 w-9 rounded-full" />
            </div>
            <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
                <Skeleton className="h-8 w-24" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-32 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                </div>
            </div>
        </header>
    );

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background justify-center">
                {!isMobile ? (
                    // Desktop skeleton layout
                    <>
                        <div className="w-80 border-r border-border p-6 shrink-0">
                            {/* Sidebar Header Skeleton */}
                            <div className="flex items-center gap-4 pb-6 border-b border-border">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            {/* Sidebar Content Skeleton */}
                            <div className="space-y-2 py-4">
                                <Skeleton className="h-24 w-full rounded-lg" />
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="pt-4 space-y-4">
                                        <div className="flex justify-between items-center px-2">
                                            <Skeleton className="h-8 w-2/5" />
                                            <Skeleton className="h-6 w-12 rounded-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton className="h-16 w-full rounded-lg" />
                                            <Skeleton className="h-16 w-full rounded-lg" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* This container mirrors the final layout's max-width */}
                        <div className="flex flex-col flex-1 w-full max-w-6xl mx-4 md:mx-8">
                            <HeaderSkeleton />
                            <main className="flex-1 p-6 pt-4 md:pt-6">
                                {/* Match the first data page (15 items) so height stays identical when skeletons swap out */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.from({ length: 15 }).map((_, i) => (
                                        <ArticleCardSkeleton key={i} />
                                    ))}
                                </div>
                            </main>
                        </div>
                    </>
                ) : (
                    // Mobile skeleton layout
                    <div className="flex flex-col flex-1 w-full max-w-6xl mx-4">
                        <HeaderSkeleton />
                        {/* The main content area needs p-6 for side padding, and pt-4 to override top padding */}
                        <main className="flex-1 p-6 pt-4">
                            {/* Mobile: show 9 placeholders (3 full viewport heights) */}
                            <div className="space-y-4">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <ArticleCardSkeleton key={i} />
                                ))}
                            </div>
                        </main>
                    </div>
                )}
            </div>
        </SidebarProvider>
    );
}
