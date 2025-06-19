import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Returns a resized, compressed WebP/AVIF image delivered via the free
// images.weserv.nl proxy. If the original url is already a data URI / blob or
// the host blocks the proxy we simply return the original url.
export function getOptimisedImage(src: string, width = 640): string {
    if (!src.startsWith("http")) return src;
    const encoded = encodeURIComponent(src);
    return `https://images.weserv.nl/?url=${encoded}&w=${width}&output=auto&il&fit=cover`;
}
