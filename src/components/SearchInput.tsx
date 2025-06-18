import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchInputProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    debounceDelay?: number;
    isLoading?: boolean;
}

export function SearchInput({
    onSearch,
    placeholder = "Caută articole…",
    debounceDelay = 300,
    isLoading = false,
}: SearchInputProps) {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, debounceDelay);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        onSearch(debouncedQuery);
    }, [debouncedQuery, onSearch]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const clearSearch = () => {
        setQuery("");
    };

    return (
        <div className="relative w-full max-w-xl mx-auto">
            {isLoading ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
            ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            )}
            <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={handleInputChange}
                className="pl-10 pr-14 sm:pr-20"
            />
            {query ? (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-6 p-0"
                >
                    <X className="h-3 w-3" />
                </Button>
            ) : (
                <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            )}
        </div>
    );
}
