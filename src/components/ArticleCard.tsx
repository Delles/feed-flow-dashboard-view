import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Article, RSSFeed } from "@/types/rss";
import { Rss, Clock } from "lucide-react";
import { getOptimisedImage } from "@/lib/utils";
import { useState } from "react";

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

    const [useOriginal, setUseOriginal] = useState(false);

    const src =
        useOriginal && article.image
            ? article.image
            : article.image
            ? getOptimisedImage(article.image, 640)
            : "";
    const srcSet =
        !useOriginal && article.image
            ? `${getOptimisedImage(
                  article.image,
                  320
              )} 320w, ${getOptimisedImage(
                  article.image,
                  640
              )} 640w, ${getOptimisedImage(article.image, 960)} 960w`
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
                <div className="aspect-video overflow-hidden">
                    <img
                        src={src}
                        srcSet={srcSet}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        alt={article.title}
                        className="w-full h-full object-cover"
                        loading={isFirst ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={isFirst ? "high" : undefined}
                        width={640}
                        height={360}
                        onError={() => {
                            if (!useOriginal) {
                                setUseOriginal(true);
                            }
                        }}
                    />
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
                                    className="w-4 h-4"
                                />
                            ) : (
                                <span className="text-base leading-none">
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
