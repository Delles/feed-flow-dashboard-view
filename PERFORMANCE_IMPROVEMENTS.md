# Performance Improvements

This document tracks performance optimizations implemented to improve Core Web Vitals.

## Recent Lighthouse Issues Addressed (2025-01-20)

### Cumulative Layout Shift (CLS) - Reduced from 0.863

-   **ArticleCard Layout Stability**:

    -   Added permanent placeholder background to prevent image loading shifts
    -   Used absolute positioning for images over placeholders
    -   Added explicit dimensions (`width={384} height={216}`) to images
    -   Fixed favicon dimensions with `flex-shrink-0` and explicit sizes

-   **Reduced Initial DOM Size**:
    -   Decreased articles per page from 20 → 15
    -   Reduced max cached articles from 500 → 300
    -   Limited skeleton placeholders: mobile 2→1, desktop 6→3

### Largest Contentful Paint (LCP) - Target under 1.5s

-   **Priority Image Loading**:
    -   Added `fetchPriority="high"` to first article image
    -   Kept `loading="eager"` for first image, `lazy` for others

### Image Optimization - 72KB savings potential

-   **Right-sized Images**:
    -   Optimized default image width: 640px → 384px (matches ~350px display)
    -   Improved srcSet: `320w,640w,960w` → `384w,512w,768w`
    -   Better sizes attribute: `33vw` → `384px` for desktop
    -   Increased compression quality for smaller files (quality=80)

### Network Optimizations

-   **Resource Hints**:
    -   Added `preconnect` to `corsproxy.io` for faster RSS feed loading
    -   Existing `preconnect` to `images.weserv.nl` for image proxy

### Build Optimizations

-   **Enhanced Minification**:
    -   Enabled `cssMinify: true`
    -   Using `esbuild` minification (faster than terser, no extra dependencies)
    -   Aggressive tree-shaking and compression

## Legacy Optimizations

### Initial Load Performance

-   RSS feeds load incrementally with React Query
-   Image lazy loading with Intersection Observer
-   Virtual scrolling for large article lists
-   Chunked vendor bundles (React, Radix UI, Tanstack Query, Lucide)

### Memory Management

-   Article list virtualization prevents memory bloat
-   Intersection Observer-based infinite scroll
-   Smart cache limits to prevent excessive DOM

### Image Delivery

-   WebP/AVIF via images.weserv.nl proxy
-   Responsive images with srcset
-   Fallback to original URLs on proxy failure

### Bundle Optimization

-   Brotli compression enabled
-   Manual vendor chunking for better caching
-   CSS and JS minification

## Expected Impact

-   **CLS**: Significant reduction from 0.863 to target <0.1
-   **LCP**: Faster image loading, target <1.5s consistently
-   **Bundle Size**: ~23KB JavaScript savings from minification
-   **Image Bandwidth**: ~72KB savings per page load
-   **DOM Size**: Reduced initial elements for faster rendering

Run Lighthouse after deployment to verify improvements.
