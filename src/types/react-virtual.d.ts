declare module "@tanstack/react-virtual" {
    export interface VirtualizerOptions<TScrollElement = Element, TItemElement = Element> {
        count: number;
        getScrollElement: () => TScrollElement | null;
        estimateSize: (index: number) => number;
        overscan?: number;
        horizontal?: boolean;
        [key: string]: unknown;
    }

    export interface Virtualizer<TScrollElement = Element, TItemElement = Element> {
        getVirtualItems(): Array<{
            index: number;
            start: number;
            size: number;
            end: number;
            key: number | string;
        }>;
        getTotalSize(): number;
        scrollToIndex(index: number, options?: { align?: 'start' | 'center' | 'end' }): void;
        scrollToOffset(offset: number, options?: { align?: 'start' | 'center' | 'end' }): void;
        measure(): void;
        getScrollElement(): TScrollElement | null;
        [key: string]: unknown;
    }

    export function useVirtualizer<
        TScrollElement = Element,
        TItemElement = Element
    >(opts: VirtualizerOptions<TScrollElement, TItemElement>): Virtualizer<TScrollElement, TItemElement>;
}
