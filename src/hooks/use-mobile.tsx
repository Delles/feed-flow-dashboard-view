import * as React from "react";

const MOBILE_BREAKPOINT = 768;

// Compute the initial value synchronously to avoid rendering the desktop layout
// first on mobile (which causes a large layout shift / CLS).
function getIsMobile(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}

export function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState<boolean>(getIsMobile());

    React.useEffect(() => {
        const mql = window.matchMedia(
            `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
        );
        const onChange = (event: MediaQueryListEvent) => {
            setIsMobile(event.matches);
        };
        // Ensure state is in sync on mount and listen for changes
        setIsMobile(mql.matches);
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, []);

    return isMobile;
}
