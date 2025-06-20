# Search Troubleshooting Guide

## Issues Fixed

### 1. ESLint Warning: React Hook useMemo Dependencies

**Problem**: The `debouncedConfig` object was causing dependencies of useMemo Hook to change on every render.

**Solution**:

-   Destructured the config object at the top level
-   Used individual config properties in the dependency array
-   Memoized the debouncedConfig properly

### 2. Search Functionality Verification

The search functionality should work correctly with these features:

#### How Search Works:

1. **Input**: User types in the SearchInput component
2. **Debouncing**: Query is debounced by 300ms to prevent excessive filtering
3. **Normalization**: Both search query and article text are normalized to handle diacritics and case
4. **Filtering**: Searches in both article title and description
5. **Results**: Filtered articles are displayed with infinite scroll

#### Search Features:

-   **Diacritic Insensitive**: "caută" matches "CĂUTĂ"
-   **Case Insensitive**: "Football" matches "football"
-   **Multi-field**: Searches in both title and description
-   **Debounced**: 300ms delay prevents excessive filtering
-   **Real-time**: Results update as you type (after debounce)

#### Testing Search:

1. **Open the app in development mode**: `npm run dev`
2. **Try these test searches**:
    - Search for "sport" (should find sports articles)
    - Search for "românia" (should match "Romania" with diacritics)
    - Search for "politică" (should work with diacritics)
    - Clear search to see all articles return

#### Debug Search Issues:

If search seems broken:

1. **Check Console**: Open browser DevTools → Console for any errors
2. **Verify Articles**: Make sure articles are loaded (`totalAvailable > 0`)
3. **Check Filters**: Ensure categories/feeds are enabled
4. **Test Queries**: Try simple English words first
5. **Clear Filters**: Reset all category/feed filters

#### Performance Notes:

-   Search uses `normalizeText()` function for diacritic handling
-   Debouncing prevents excessive re-filtering during typing
-   Search runs on pre-filtered article list for better performance
-   Memory is capped at 500 articles maximum

## Code Locations:

-   **Search Logic**: `src/hooks/useInfiniteArticles.ts` (lines 107-138)
-   **Input Component**: `src/components/SearchInput.tsx`
-   **Text Normalization**: `src/lib/normalizeText.ts`
-   **Main Integration**: `src/pages/Index.tsx`

## Common Issues:

### Search Returns No Results:

-   Check if articles are loaded
-   Verify enabled feeds/categories
-   Try simpler search terms
-   Clear all filters

### Search Too Slow:

-   Normal behavior: 300ms debounce is intentional
-   If slower: check for console errors
-   Large datasets: memory cap should prevent issues

### Diacritics Not Working:

-   Should work automatically via `normalizeText()`
-   Test with simple cases first
-   Check browser console for errors
