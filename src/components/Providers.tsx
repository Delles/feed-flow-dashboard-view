"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense, useState, useEffect } from "react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import dynamic from 'next/dynamic';

const LazyAnalytics = dynamic(() => import('@/components/LazyAnalytics'), { ssr: false });

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
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
  }));

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="rss-dashboard-theme">
          <TooltipProvider>
            {children}
            <Toaster />
            <Sonner />
            <Suspense fallback={null}>
              <LazyAnalytics />
            </Suspense>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
