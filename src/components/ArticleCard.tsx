import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Article, RSSFeed } from "@/types/rss";
import { Rss, Clock, ExternalLink } from "lucide-react";
import { getOptimisedImage } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/**
 * Props for the ArticleCard component
 */
interface ArticleCardProps {
    /** Article data to display */
    article: Article;
    /** Array of RSS feeds for metadata lookup */
    feeds: RSSFeed[];
    /** Whether this is the first article (for image priority) */
    isFirst?: boolean;
}

/**
 * Converts a date to a relative time string (e.g., "acum 2 ore")
 */
function timeSince(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    const intervals = [
        { divisor: 31536000, singular: "an", plural: "ani" },
        { divisor: 2592000, singular: "lună", plural: "luni" },
        { divisor: 86400, singular: "zi", plural: "zile" },
        { divisor: 3600, singular: "oră", plural: "ore" },
        { divisor: 60, singular: "minut", plural: "minute" },
    ];

    for (const { divisor, singular, plural } of intervals) {
        const interval = seconds / divisor;
        if (interval >= 1) {
            const count = Math.floor(interval);
            return `acum ${count} ${count === 1 ? singular : plural}`;
        }
    }

    return "chiar acum";
}

/**
 * Article card component displaying article content with image, metadata, and interactive elements.
 *
 * Features:
 * - Responsive image with lazy loading and fallbacks
 * - Feed metadata with avatar and category badges
 * - Hover effects and external link indicators
 * - Accessible keyboard navigation
 * - Optimized image loading for performance
 */
export function ArticleCard({
    article,
    feeds,
    isFirst = false,
}: ArticleCardProps) {
    const feed = feeds.find((f) => f.id === article.feedId);
    const imgRef = useRef<HTMLImageElement>(null);
    const [useOriginal, setUseOriginal] = useState(false);
    const [isVisible, setIsVisible] = useState(isFirst);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Intersection Observer for lazy loading images only when needed
    useEffect(() => {
        if (!imgRef.current || isFirst) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "50px" }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, [isFirst]);

    const src =
        useOriginal && article.image
            ? article.image
            : article.image
            ? getOptimisedImage(article.image, 384, 80) // Optimize for actual display size ~350px
            : "";
    const srcSet =
        !useOriginal && article.image
            ? `${getOptimisedImage(
                  article.image,
                  384,
                  80
              )} 384w, ${getOptimisedImage(
                  article.image,
                  512,
                  80
              )} 512w, ${getOptimisedImage(article.image, 768, 80)} 768w`
            : undefined;

    // Preload the first visible image to improve LCP on mobile
    useEffect(() => {
        if (!isFirst || !src) return;
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        if (srcSet) {
            link.setAttribute("imagesrcset", srcSet);
            link.setAttribute("imagesizes", "(max-width: 640px) 92vw, 384px");
        }
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, [isFirst, src, srcSet]);

    const openArticle = () => window.open(article.url, "_blank");

    return (
        <Card
            className="group flex flex-col h-[460px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer border-border/50 hover:border-primary/20"
            style={{ contentVisibility: "auto", containIntrinsicSize: "460px" }}
            onClick={openArticle}
        >
            <AspectRatio ratio={16 / 9} className="bg-muted/30">
                <div
                    className="w-full h-full overflow-hidden relative"
                    ref={imgRef}
                >
                    {/* Always show placeholder first to prevent layout shift */}
                    <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center absolute inset-0">
                        <div className="flex flex-col items-center gap-2">
                            <Rss className="w-8 h-8 text-muted-foreground/50" />
                            <div className="w-16 h-1 bg-muted-foreground/20 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    {isVisible && (
                        <img
                            src={src}
                            srcSet={srcSet}
                            sizes="(max-width: 640px) 92vw, 384px"
                            alt={article.title}
                            className={`w-full h-full object-cover transition-all duration-500 absolute inset-0 ${
                                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                            }`}
                            loading={isFirst ? "eager" : "lazy"}
                            fetchPriority={isFirst ? "high" : "auto"}
                            decoding="async"
                            width={384}
                            height={216}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => {
                                if (!useOriginal) {
                                    setUseOriginal(true);
                                } else {
                                    setImageLoaded(true); // Show broken image state
                                }
                            }}
                        />
                    )}

                    {/* Overlay with external link indicator */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-background/80 backdrop-blur-sm rounded-full p-2 border shadow-lg">
                            <ExternalLink className="w-4 h-4 text-foreground" />
                        </div>
                    </div>
                </div>
            </AspectRatio>
            <CardHeader className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarImage
                                src={feed?.favicon}
                                alt={`${feed?.title} favicon`}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-xs">
                                {feed?.favicon || <Rss className="w-4 h-4" />}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm text-foreground">
                                {feed?.title ?? "Sursă necunoscută"}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {timeSince(new Date(article.pubDate))}
                            </div>
                        </div>
                    </div>
                    {feed?.category && (
                        <Badge variant="secondary" className="text-xs">
                            {feed.category}
                        </Badge>
                    )}
                </div>
                <h3 className="font-bold text-lg leading-tight text-card-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
                    {article.title}
                </h3>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground flex-grow">
                <p className="line-clamp-3 leading-relaxed">
                    {article.description}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 mt-auto text-primary font-semibold text-sm">
                Citește mai mult
            </CardFooter>
        </Card>
    );
}
