
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/types/rss";
import { mockFeeds } from "@/lib/mockData";
import { Clock, ExternalLink, User } from "lucide-react";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const feed = mockFeeds.find(f => f.id === article.feedId);
  const timeAgo = getTimeAgo(article.pubDate);

  return (
    <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-slate-200 bg-white">
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
            <Badge variant="secondary" className="text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">
              {feed?.favicon} {feed?.title}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
            {article.title}
          </h3>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 line-clamp-3 mb-3 leading-relaxed">
            {article.description}
          </p>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gray-500">
              {article.author && (
                <>
                  <User className="h-3 w-3" />
                  <span>{article.author}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-blue-600 group-hover:text-blue-700">
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
