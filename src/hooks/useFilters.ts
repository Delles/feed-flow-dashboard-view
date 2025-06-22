import { useState, useCallback } from "react";

export function useFilters() {
    const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState("");

    const handleSelectFeed = useCallback((feedId: string | null) => {
        setSelectedFeed(feedId);
        setSelectedCategory(null);
    }, []);

    const handleSelectCategory = useCallback((category: string | null) => {
        setSelectedCategory(category);
        setSelectedFeed(null);
    }, []);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    return {
        selectedFeed,
        selectedCategory,
        searchQuery,
        handleSelectFeed,
        handleSelectCategory,
        handleSearch,
    };
}
