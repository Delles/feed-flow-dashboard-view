import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Article, RSSFeed } from "@/types/rss";
import { Rss, Clock } from "lucide-react";

interface ArticleCardProps {
    article: Article;
    feeds: RSSFeed[];
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

export function ArticleCard({ article, feeds }: ArticleCardProps) {
    const feed = feeds.find((f) => f.id === article.feedId);

    return (
        <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
            {article.image ? (
                <div className="aspect-video overflow-hidden">
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
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
                <h3 className="font-bold text-lg leading-tight mt-2 text-card-foreground">
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                    >
                        {article.title}
                    </a>
                </h3>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground flex-grow">
                <p>{article.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 mt-auto">
                <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold text-sm hover:underline"
                >
                    Citește mai mult
                </a>
            </CardFooter>
        </Card>
    );
}
