
import { Article, RSSFeed } from "@/types/rss";

export interface ParsedRSSFeed {
  feed: RSSFeed;
  articles: Article[];
}

export async function parseRSSFeed(url: string): Promise<ParsedRSSFeed> {
  try {
    // For now, we'll use a CORS proxy to fetch RSS feeds
    // In production, you'd want to use your own backend or a proper RSS service
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    const xmlText = data.contents;
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Extract feed information
    const channel = xmlDoc.querySelector("channel");
    if (!channel) {
      throw new Error("Invalid RSS feed format");
    }
    
    const feedTitle = channel.querySelector("title")?.textContent || "Unknown Feed";
    const feedDescription = channel.querySelector("description")?.textContent || "";
    const feedImage = channel.querySelector("image url")?.textContent || "";
    const feedFavicon = feedImage ? "🌐" : "📰";
    
    const feed: RSSFeed = {
      id: Date.now().toString(),
      title: feedTitle,
      url: url,
      description: feedDescription,
      favicon: feedFavicon,
      lastUpdated: new Date()
    };
    
    // Extract articles
    const items = xmlDoc.querySelectorAll("item");
    const articles: Article[] = Array.from(items).map((item, index) => {
      const title = item.querySelector("title")?.textContent || "No title";
      const description = item.querySelector("description")?.textContent || "";
      const link = item.querySelector("link")?.textContent || "";
      const pubDateText = item.querySelector("pubDate")?.textContent || "";
      const enclosureUrl = item.querySelector("enclosure")?.getAttribute("url");
      
      // Clean up description by removing HTML tags and truncating
      const cleanDescription = description
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/&quot;/g, '"')
        .replace(/&#537;/g, 'ș')
        .replace(/&[^;]+;/g, '') // Remove other HTML entities
        .substring(0, 200);
      
      let pubDate: Date;
      try {
        pubDate = pubDateText ? new Date(pubDateText) : new Date();
      } catch {
        pubDate = new Date();
      }
      
      return {
        id: `${feed.id}-${index}`,
        title: title.trim(),
        description: cleanDescription.trim(),
        url: link,
        pubDate: pubDate,
        feedId: feed.id,
        image: enclosureUrl || undefined,
        author: undefined
      };
    });
    
    return { feed, articles };
  } catch (error) {
    console.error("Error parsing RSS feed:", error);
    throw new Error("Failed to parse RSS feed. Please check the URL and try again.");
  }
}
