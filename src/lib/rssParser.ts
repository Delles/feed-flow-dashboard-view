
import { Article, RSSFeed } from "@/types/rss";

export interface ParsedRSSFeed {
  feed: RSSFeed;
  articles: Article[];
}

function extractTextContent(element: Element | null): string {
  if (!element) return "";

  // Handle CDATA sections
  const textContent = element.textContent || "";

  // Clean up the text content and decode HTML entities properly
  return textContent
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1') // Remove CDATA wrapper
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&quot;/g, '"')
    .replace(/&#537;/g, 'ș')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .trim();
}

async function fetchThroughApi(url: string): Promise<string> {
  console.log("Attempting to fetch RSS feed through API route:", url);

  try {
    const apiUrl = `/api/rss?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const bodyText = await response.text();
    return bodyText;

  } catch (error) {
    console.error(`API fetch failed:`, error);
    throw new Error(`Failed to fetch RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function parseRSSFeed(url: string): Promise<ParsedRSSFeed> {
  try {
    const xmlText = await fetchThroughApi(url);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Check for parser errors
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("Invalid XML format");
    }

    // Extract feed information
    const channel = xmlDoc.querySelector("channel");
    if (!channel) {
      throw new Error("Invalid RSS feed format - no channel element found");
    }

    const feedTitle = extractTextContent(channel.querySelector("title")) || "Unknown Feed";
    const feedDescription = extractTextContent(channel.querySelector("description")) || "";


    // Try to get feed image from different possible locations
    let feedImage = "";
    const imageElement = channel.querySelector("image url");
    if (imageElement) {
      feedImage = extractTextContent(imageElement);
    } else {
      // Try other common image elements
      const logoElement = channel.querySelector("logo") || channel.querySelector("image");
      if (logoElement) {
        feedImage = extractTextContent(logoElement);
      }
    }

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
    console.log(`Found ${items.length} articles in RSS feed`);

    const articles: Article[] = Array.from(items).map((item, index) => {
      const title = extractTextContent(item.querySelector("title")) || "No title";

      // Try multiple description sources
      let description = extractTextContent(item.querySelector("description"));
      if (!description) {
        description = extractTextContent(item.querySelector("content\\:encoded")) ||
          extractTextContent(item.querySelector("summary")) || "";
      }

      const link = extractTextContent(item.querySelector("link")) || "";
      const pubDateText = extractTextContent(item.querySelector("pubDate")) || "";

      // Try to get image from enclosure or other sources
      let imageUrl = "";
      const enclosureElement = item.querySelector("enclosure");
      if (enclosureElement) {
        const enclosureUrl = enclosureElement.getAttribute("url");
        const enclosureType = enclosureElement.getAttribute("type");
        if (enclosureUrl && enclosureType && enclosureType.startsWith("image")) {
          imageUrl = enclosureUrl;
        }
      }

      // If no enclosure image, try other image elements
      if (!imageUrl) {
        const mediaContent = item.querySelector("media\\:content");
        if (mediaContent) {
          imageUrl = mediaContent.getAttribute("url") || "";
        }
      }

      // Clean up description and truncate
      const cleanDescription = description
        .substring(0, 300) // Increase limit slightly
        .trim();

      let pubDate = pubDateText ? new Date(pubDateText) : new Date();
      // new Date() never throws, so validate with isNaN
      if (isNaN(pubDate.getTime())) {
        pubDate = new Date();
      }

      return {
        id: link || `${feed.id}-${index}`,
        title: title.trim(),
        description: cleanDescription,
        url: link,
        pubDate: pubDate,
        feedId: feed.id,
        image: imageUrl || undefined,
        author: undefined
      };
    });

    console.log(`Successfully parsed ${articles.length} articles from feed: ${feed.title}`);
    return { feed, articles };

  } catch (error) {
    console.error("Error parsing RSS feed:", error);
    throw new Error(`Failed to parse RSS feed. ${error instanceof Error ? error.message : 'Please check the URL and try again.'}`);
  }
}
