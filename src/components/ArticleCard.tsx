import { Article, RSSFeed } from "@/types/rss";
import { Rss, Clock, ChevronRight, Newspaper } from "lucide-react";
import { getOptimisedImage } from "@/lib/utils";
import { useState, useRef, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ArticleCardProps {
    article: Article;
    feedsMap: Map<string, RSSFeed>;
    isFirst?: boolean;
    index?: number;
}

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

// Extracted outside to prevent re-creation on each render
const ImagePlaceholder = () => (
    <div className="w-full h-full bg-secondary/20 flex flex-col items-center justify-center p-8 relative overflow-hidden group-hover:scale-105 transition-transform duration-700">
        {/* Stylized background lines mimicking a newspaper layout */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M10 20 H90 M10 30 H90 M10 40 H90 M10 60 H90 M10 70 H90 M10 80 H90" stroke="currentColor" strokeWidth="0.5" fill="none" />
                <rect x="10" y="45" width="20" height="10" fill="currentColor" />
                <rect x="35" y="45" width="55" height="2" fill="currentColor" />
                <rect x="35" y="50" width="55" height="2" fill="currentColor" />
            </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 text-muted-foreground/30 group-hover:text-primary/40 transition-all duration-500">
            <div className="relative">
                <Newspaper className="w-16 h-16 stroke-[0.75px]" />
                <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-6 bg-primary/5 rounded-full blur-2xl -z-10"
                />
            </div>
        </div>

        {/* Subtle corner accents */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-current opacity-10" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-current opacity-10" />
    </div>
);

function ArticleCardComponent({
    article,
    feedsMap,
    isFirst = false,
    index = 0,
}: ArticleCardProps) {
    const feed = feedsMap.get(article.feedId);
    const imgRef = useRef<HTMLImageElement>(null);
    const [useOriginal, setUseOriginal] = useState(false);
    const [isVisible, setIsVisible] = useState(isFirst);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

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
            { rootMargin: "200px" }
        );
        observer.observe(imgRef.current);
        return () => observer.disconnect();
    }, [isFirst]);

    // Simplified ternary for readability
    const src = article.image
        ? (useOriginal ? article.image : getOptimisedImage(article.image, 600, 85))
        : "";

    const openArticle = () => window.open(article.url, "_blank", "noopener,noreferrer");

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openArticle();
        }
    };

    const handleImageError = () => {
        if (!useOriginal) {
            setUseOriginal(true);
            setImageLoaded(false);
        } else {
            setImageFailed(true);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.4), ease: [0.21, 0.47, 0.32, 0.98] }}
            className="group flex flex-col h-full bg-card rounded-xl overflow-hidden premium-shadow hover-lift cursor-pointer border border-border/50"
            onClick={openArticle}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Citește: ${article.title}`}
        >
            <div className="relative overflow-hidden">
                <AspectRatio ratio={16 / 9} className="bg-muted/50">
                    <div className="w-full h-full" ref={imgRef}>
                        {isVisible && article.image && !imageFailed ? (
                            <img
                                src={src}
                                alt={article.title}
                                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                                loading={isFirst ? "eager" : "lazy"}
                                onLoad={() => setImageLoaded(true)}
                                onError={handleImageError}
                            />
                        ) : (
                            <ImagePlaceholder />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                </AspectRatio>

                {feed?.category && (
                    <Badge className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-md text-foreground border-none font-semibold text-[10px] uppercase tracking-wider shadow-sm">
                        {feed.category}
                    </Badge>
                )}
            </div>

            <div className="p-6 flex flex-col flex-grow gap-4">
                <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5 ring-1 ring-border">
                        <AvatarImage src={feed?.favicon} alt={feed?.title} />
                        <AvatarFallback className="text-[10px] bg-primary/5">
                            {feed?.title?.charAt(0) || <Rss className="w-3 h-3" />}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                        {feed?.title ?? "Sursă Necunoscută"}
                    </span>
                    <div className="ml-auto flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70">
                        <Clock className="w-3 h-3" />
                        {timeSince(new Date(article.pubDate))}
                    </div>
                </div>

                <h3 className="font-serif font-bold text-xl leading-[1.3] text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {article.title}
                </h3>

                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 font-normal">
                    {article.description}
                </p>
            </div>

            <div className="px-6 pb-6 mt-auto">
                <div className="flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                    Citește articolul <ChevronRight className="w-3.5 h-3.5" />
                </div>
            </div>
        </motion.div>
    );
}

export const ArticleCard = memo(ArticleCardComponent);