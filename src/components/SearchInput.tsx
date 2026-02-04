import { useState, useEffect, useRef, startTransition } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

/**
 * Props for the SearchInput component
 */
interface SearchInputProps {
    /** Callback function called when user searches */
    onSearch: (query: string) => void;
    /** Placeholder text for the search input */
    placeholder?: string;
    /** Debounce delay in milliseconds (default: 300) */
    debounceDelay?: number;
    /** Whether to show loading spinner */
    isLoading?: boolean;
}

/**
 * Search input component with debounced search and keyboard shortcuts.
 *
 * Features:
 * - Debounced search with configurable delay
 * - Cmd/Ctrl+K keyboard shortcut to focus
 * - Loading state with spinner
 * - Clear button when text is present
 * - Keyboard shortcut indicator
 * - Responsive design
 */
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
        // Defer the potentially heavy search to a transition to avoid blocking input responsiveness
        startTransition(() => {
            onSearch(debouncedQuery);
        });
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
        <div className="relative w-full max-w-2xl">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isLoading ? (
                    <Loader2 className="size-3.5 text-primary animate-spin" />
                ) : (
                    <Search className="size-3.5 text-muted-foreground/50" />
                )}
            </div>
            <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={handleInputChange}
                className="h-10 pl-10 pr-24 bg-secondary/20 border-none rounded-full font-medium text-xs placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {query && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="size-6 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                )}
                <kbd className="hidden h-5 select-none items-center gap-1 rounded-full border border-border bg-background px-2 font-sans text-[9px] font-bold text-muted-foreground/40 sm:flex">
                    ⌘ K
                </kbd>
            </div>
        </div>
    );
}
