
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ArticleCard } from "@/components/ArticleCard";
import { mockArticles, mockFeeds } from "@/lib/mockData";
import { Article, RSSFeed } from "@/types/rss";

const Index = () => {
  const [feeds, setFeeds] = useState<RSSFeed[]>(mockFeeds);
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);

  const filteredArticles = selectedFeed
    ? articles.filter(article => article.feedId === selectedFeed)
    : articles;

  const addFeed = (feed: RSSFeed) => {
    setFeeds(prev => [...prev, feed]);
  };

  const removeFeed = (feedId: string) => {
    setFeeds(prev => prev.filter(feed => feed.id !== feedId));
    setArticles(prev => prev.filter(article => article.feedId !== feedId));
    if (selectedFeed === feedId) {
      setSelectedFeed(null);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AppSidebar 
          feeds={feeds}
          onAddFeed={addFeed}
          onRemoveFeed={removeFeed}
          selectedFeed={selectedFeed}
          onSelectFeed={setSelectedFeed}
        />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-8">
            <SidebarTrigger className="lg:hidden" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">RSS Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {selectedFeed 
                  ? `Showing articles from ${feeds.find(f => f.id === selectedFeed)?.title || 'Unknown Feed'}`
                  : `${filteredArticles.length} articles from all feeds`
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📰</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
              <p className="text-gray-500">Add some RSS feeds to get started!</p>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
