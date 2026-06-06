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

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  if ("status" in error && typeof (error as { status: unknown }).status === "number") {
    return (error as { status: number }).status;
  }
  if ("response" in error && typeof error.response === "object" && error.response !== null) {
    if ("status" in error.response && typeof (error.response as { status: unknown }).status === "number") {
      return (error.response as { status: number }).status;
    }
  }
  if ("statusCode" in error && typeof (error as { statusCode: unknown }).statusCode === "number") {
    return (error as { statusCode: number }).statusCode;
  }

  return undefined;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: (failureCount: number, error: unknown) => {
          const status = getErrorStatus(error);
          if (typeof status === 'number' && status >= 400 && status < 500) {
            return false;
          }
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
