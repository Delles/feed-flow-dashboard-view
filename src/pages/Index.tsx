
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ArticleCard } from "@/components/ArticleCard";
import { SearchInput } from "@/components/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { mockArticles, mockFeeds } from "@/lib/mockData";
import { Article, RSSFeed } from "@/types/rss";

const Index = () => {
  const [feeds, setFeeds] = useState<RSSFeed[]>(mockFeeds);
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter(article => {
    // Filter by selected feed
    const feedMatch = selectedFeed ? article.feedId === selectedFeed : true;
    
    // Filter by search query
    const searchMatch = searchQuery
      ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return feedMatch && searchMatch;
  });

  const addFeed = (feed: RSSFeed, newArticles: Article[]) => {
    console.log("Adding feed:", feed.title, "with", newArticles.length, "articles");
    setFeeds(prev => [...prev, feed]);
    setArticles(prev => [...prev, ...newArticles]);
  };

  const removeFeed = (feedId: string) => {
    setFeeds(prev => prev.filter(feed => feed.id !== feedId));
    setArticles(prev => prev.filter(article => article.feedId !== feedId));
    if (selectedFeed === feedId) {
      setSelectedFeed(null);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
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
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground">RSS Dashboard</h1>
                <ThemeToggle />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <SearchInput onSearch={handleSearch} />
                <div className="text-sm text-muted-foreground">
                  {searchQuery && (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md mr-2">
                      "{searchQuery}"
                    </span>
                  )}
                  {filteredArticles.length} of {articles.length} articles
                  {selectedFeed && ` from ${feeds.find(f => f.id === selectedFeed)?.title}`}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} feeds={feeds} />
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-6xl mb-4">
                {searchQuery ? "🔍" : "📰"}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery ? "No articles found" : "No articles found"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `Try searching for different keywords or clear your search.`
                  : "Add some RSS feeds to get started!"
                }
              </p>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
