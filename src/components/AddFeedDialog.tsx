
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RSSFeed } from "@/types/rss";
import { Rss, Plus } from "lucide-react";

interface AddFeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFeed: (feed: RSSFeed) => void;
}

export function AddFeedDialog({ open, onOpenChange, onAddFeed }: AddFeedDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    favicon: "📰"
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newFeed: RSSFeed = {
      id: Date.now().toString(),
      title: formData.title,
      url: formData.url,
      description: formData.description,
      favicon: formData.favicon,
      lastUpdated: new Date()
    };

    onAddFeed(newFeed);
    setFormData({ title: "", url: "", description: "", favicon: "📰" });
    setIsLoading(false);
    onOpenChange(false);
  };

  const popularFeeds = [
    { title: "TechCrunch", url: "https://techcrunch.com/feed/", favicon: "🚀" },
    { title: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", favicon: "📺" },
    { title: "The Verge", url: "https://www.theverge.com/rss/index.xml", favicon: "📱" },
    { title: "Hacker News", url: "https://hnrss.org/frontpage", favicon: "💻" }
  ];

  const handleQuickAdd = (feed: typeof popularFeeds[0]) => {
    setFormData({
      title: feed.title,
      url: feed.url,
      description: `Latest news from ${feed.title}`,
      favicon: feed.favicon
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5 text-blue-600" />
            Add RSS Feed
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Feed Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., TechCrunch"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">RSS URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com/rss.xml"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this feed..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="favicon">Icon</Label>
            <Input
              id="favicon"
              value={formData.favicon}
              onChange={(e) => setFormData(prev => ({ ...prev, favicon: e.target.value }))}
              placeholder="📰"
              maxLength={2}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Add Popular Feeds</Label>
            <div className="grid grid-cols-2 gap-2">
              {popularFeeds.map((feed) => (
                <Button
                  key={feed.title}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(feed)}
                  className="justify-start text-left h-auto p-2"
                >
                  <span className="mr-2">{feed.favicon}</span>
                  <span className="text-xs">{feed.title}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                "Adding..."
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feed
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
