import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Suspense, lazy, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Root App component with optimized configuration.
 *
 * Features:
 * - Enhanced TanStack Query client with smart caching
 * - Network-aware focus and online management
 * - Lazy-loaded routes for better performance
 * - Comprehensive error boundaries and loading states
 * - Theme and tooltip providers
 */

// Enhanced QueryClient with optimized configuration
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Network-aware refetching
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,

            // Smart stale time - RSS feeds don't change that often
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)

            // Intelligent retry strategy
            retry: (failureCount, error) => {
                // Don't retry on 4xx errors (client errors)
                if (error instanceof Error && error.message.includes('4')) {
                    return false;
                }
                // Retry up to 3 times for network/server errors
                return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Background refetching for better UX
            refetchInterval: 15 * 60 * 1000, // 15 minutes background refresh
            refetchIntervalInBackground: true,
        },
        mutations: {
            // Optimistic updates and error recovery
            onError: (error, variables, context) => {
                console.error('Mutation error:', error);
                // Could implement error recovery logic here
            },
            retry: 1,
        },
    },
});

// Network status management for offline support
onlineManager.setEventListener((setOnline) => {
    return () => {
        setOnline(navigator.onLine);
    };
});

// Focus management for better performance
focusManager.setEventListener((handleFocus) => {
    if (typeof window !== 'undefined' && window.addEventListener) {
        // Listen to page visibility changes instead of focus/blur
        const handleVisibilityChange = () => {
            handleFocus();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange, false);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }
});

// Lazily loaded pages & third-party scripts to keep initial bundle small
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LazyAnalytics = lazy(() => import("@/components/LazyAnalytics"));

const App = () => {

    // Service Worker registration for offline support and caching
    useEffect(() => {
        if ('serviceWorker' in navigator && import.meta.env.PROD) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration.scope);

                    // Handle updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content is available, notify user
                                    console.log('New content is available and will be used when all tabs for this page are closed.');
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }, []);

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
