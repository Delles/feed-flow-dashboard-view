import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Article, RSSFeed } from "@/types/rss";
import { Rss, Clock } from "lucide-react";
import { getOptimisedImage } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface ArticleCardProps {
    article: Article;
    feeds: RSSFeed[];
    /**
     * When the card is the very first visible item on the page we mark its image
     * as high-priority so that the browser schedules the request earlier. */
    isFirst?: boolean;
}

function timeSince(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval >= 1) {
        return `acum ${Math.floor(interval)} ${
            Math.floor(interval) === 1 ? "an" : "ani"
        }`;
    }
    interval = seconds / 2592000;
    if (interval >= 1) {
        return `acum ${Math.floor(interval)} luni`;
    }
    interval = seconds / 86400;
    if (interval >= 1) {
        return `acum ${Math.floor(interval)} ${
            Math.floor(interval) === 1 ? "zi" : "zile"
        }`;
    }
    interval = seconds / 3600;
    if (interval >= 1) {
        return `acum ${Math.floor(interval)} ${
            Math.floor(interval) === 1 ? "oră" : "ore"
        }`;
    }
    interval = seconds / 60;
    if (interval >= 1) {
        return `acum ${Math.floor(interval)} ${
            Math.floor(interval) === 1 ? "minut" : "minute"
        }`;
    }
    return "chiar acum";
}

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

    const openArticle = () => window.open(article.url, "_blank");

    return (
        <Card
            aria-label={`${feed?.title ?? "Articol"}: ${article.title}`}
            role="link"
            tabIndex={0}
            onClick={openArticle}
            onKeyDown={(e) => {
                if (e.key === "Enter") openArticle();
            }}
            className="flex flex-col h-[460px] overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
            {article.image ? (
                <div
                    className="aspect-video overflow-hidden relative"
                    ref={imgRef}
                >
                    {/* Always show placeholder first to prevent layout shift */}
                    <div className="w-full h-full bg-muted/30 flex items-center justify-center absolute inset-0">
                        <Rss className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    {isVisible && (
                        <img
                            src={src}
                            srcSet={srcSet}
                            sizes="(max-width: 768px) 100vw, 384px"
                            alt={article.title}
                            className={`w-full h-full object-cover transition-opacity duration-300 absolute inset-0 ${
                                imageLoaded ? "opacity-100" : "opacity-0"
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
                </div>
            ) : (
                <div className="aspect-video bg-muted/50 flex items-center justify-center">
                    <Rss className="w-12 h-12 text-muted-foreground" />
                </div>
            )}
            <CardHeader className="p-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        {feed?.favicon &&
                            (feed.favicon.startsWith("http") ? (
                                <img
                                    src={feed.favicon}
                                    alt={`${feed.title} favicon`}
                                    className="w-4 h-4 flex-shrink-0"
                                    width={16}
                                    height={16}
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                <span className="text-base leading-none w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                    {feed.favicon}
                                </span>
                            ))}
                        <span className="font-medium text-foreground/90">
                            {feed?.title ?? "Sursă necunoscută"}
                        </span>
                    </div>
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {timeSince(new Date(article.pubDate))}
                    </span>
                </div>
                <h3 className="font-bold text-lg leading-tight mt-2 text-card-foreground line-clamp-2">
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
