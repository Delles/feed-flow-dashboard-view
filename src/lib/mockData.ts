
import { RSSFeed, Article } from "@/types/rss";

export const mockFeeds: RSSFeed[] = [
  {
    id: "1",
    title: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    description: "Latest technology news",
    favicon: "🚀",
    lastUpdated: new Date()
  },
  {
    id: "2", 
    title: "BBC News",
    url: "https://feeds.bbci.co.uk/news/rss.xml",
    description: "Breaking news and world updates",
    favicon: "📺",
    lastUpdated: new Date()
  },
  {
    id: "3",
    title: "Hacker News",
    url: "https://hnrss.org/frontpage",
    description: "Tech community discussions",
    favicon: "💻",
    lastUpdated: new Date()
  }
];

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "Revolutionary AI Technology Changes Everything",
    description: "Scientists have developed a groundbreaking AI system that promises to transform how we interact with technology. This innovation could reshape multiple industries...",
    url: "https://example.com/article1",
    pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    feedId: "1",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
    author: "Sarah Johnson"
  },
  {
    id: "2",
    title: "Global Climate Summit Reaches Historic Agreement",
    description: "World leaders unite on unprecedented climate action plan. The agreement includes commitments from over 190 countries to reduce carbon emissions...",
    url: "https://example.com/article2",
    pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    feedId: "2",
    image: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e9?w=400&h=200&fit=crop",
    author: "Michael Chen"
  },
  {
    id: "3",
    title: "New Programming Language Gains Massive Adoption",
    description: "A revolutionary programming language designed for quantum computing has gained significant traction among developers worldwide...",
    url: "https://example.com/article3",
    pubDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    feedId: "3",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop",
    author: "Alex Rodriguez"
  },
  {
    id: "4",
    title: "Breakthrough in Renewable Energy Storage",
    description: "Engineers develop new battery technology that could store renewable energy for months, solving one of the biggest challenges in clean energy...",
    url: "https://example.com/article4",
    pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    feedId: "1",
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=200&fit=crop",
    author: "Emma Thompson"
  },
  {
    id: "5",
    title: "Space Mission Discovers New Earth-Like Planet",
    description: "NASA's latest space telescope has identified a potentially habitable planet just 20 light-years away from Earth...",
    url: "https://example.com/article5",
    pubDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    feedId: "2",
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=200&fit=crop",
    author: "David Park"
  },
  {
    id: "6",
    title: "Cybersecurity Alert: New Threat Detected",
    description: "Security researchers have identified a sophisticated malware campaign targeting financial institutions worldwide...",
    url: "https://example.com/article6",
    pubDate: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
    feedId: "3",
    image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=200&fit=crop",
    author: "Lisa Wang"
  }
];
