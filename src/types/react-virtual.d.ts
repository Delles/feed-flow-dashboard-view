declare module "@tanstack/react-virtual" {
    export function useVirtualizer<
        TScrollElement = Element,
        TItemElement = Element
    >(opts: Record<string, unknown>): Record<string, unknown>;
}
