import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const queryClient = new QueryClient();

// Lazily loaded pages & third-party scripts to keep initial bundle small
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LazyAnalytics = lazy(() => import("@/components/LazyAnalytics"));

const App = () => (
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
);

export default App;
