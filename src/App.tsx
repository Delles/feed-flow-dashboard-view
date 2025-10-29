import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Root App component with TanStack Query, routing, and theme providers.
 */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            retry: (failureCount, error) => {
                if (error instanceof Error && error.message.includes('4')) return false;
                return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchInterval: 15 * 60 * 1000,
            refetchIntervalInBackground: true,
        },
        mutations: {
            onError: (error) => console.error('Mutation error:', error),
            retry: 1,
        },
    },
});

// Network and focus management
onlineManager.setEventListener((setOnline) => () => setOnline(navigator.onLine));

focusManager.setEventListener((handleFocus) => {
    if (typeof window !== 'undefined') {
        const handleVisibilityChange = () => handleFocus();
        document.addEventListener('visibilitychange', handleVisibilityChange, false);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    return () => {};
});

// Lazy-loaded pages and analytics
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LazyAnalytics = lazy(() => import("@/components/LazyAnalytics"));

const App = () => {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="light" storageKey="rss-dashboard-theme">
                    <TooltipProvider>
                        <Toaster />
                        <Sonner />

                        {/* Defer heavy analytics bundles */}
                        <Suspense fallback={null}>
                            <LazyAnalytics />
                        </Suspense>

                        <BrowserRouter>
                            <Suspense fallback={<LoadingSkeleton />}>
                                <Routes>
                                    <Route path="/" element={<Index />} />
                                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </Suspense>
                        </BrowserRouter>
                    </TooltipProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
};

export default App;
