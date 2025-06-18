import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Article, RSSFeed } from "@/types/rss";
import { Clock, ExternalLink, User } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  feeds: RSSFeed[];
}

export function ArticleCard({ article, feeds }: ArticleCardProps) {
  const feed = feeds.find(f => f.id === article.feedId);
  const timeAgo = getTimeAgo(article.pubDate);

  return (
    <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-border bg-card">
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="block h-full">
        {article.image && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {feed?.favicon} {feed?.title}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </div>
          </div>
          
          <h3 className="font-semibold text-card-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3 leading-relaxed">
            {article.description}
          </p>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              {article.author && (
                <>
                  <User className="h-3 w-3" />
                  <span>{article.author}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-primary group-hover:text-primary/80">
              <ExternalLink className="h-3 w-3" />
              <span>Read more</span>
            </div>
          </div>
        </CardContent>
      </a>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
}
