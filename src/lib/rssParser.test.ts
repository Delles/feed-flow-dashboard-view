import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseRSSFeed } from './rssParser';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('parseRSSFeed', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const validXML = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
      <channel>
        <title>Test Feed</title>
        <description>Test Description</description>
        <logo>https://example.com/logo.png</logo>
        <item>
          <title><![CDATA[Test Article]]></title>
          <description><![CDATA[Article Description with HTML <p>Content</p> and &#537; &quot;quotes&quot;]]></description>
          <link>https://example.com/article1</link>
          <pubDate>Wed, 02 Oct 2024 08:00:00 GMT</pubDate>
          <enclosure url="https://example.com/image.jpg" type="image/jpeg" />
        </item>
        <item>
          <title>Article 2</title>
          <summary>Content encoded description</summary>
          <link>https://example.com/article2</link>
          <enclosure url="https://example.com/media.jpg" type="image/png" />
        </item>
      </channel>
    </rss>`;

  it('successfully parses a valid RSS feed', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => validXML,
    });

    const result = await parseRSSFeed('https://example.com/feed.xml');

    // Check feed information
    expect(result.feed.title).toBe('Test Feed');
    expect(result.feed.description).toBe('Test Description');
    expect(result.feed.favicon).toBe('🌐');
    expect(result.feed.url).toBe('https://example.com/feed.xml');

    // Check articles
    expect(result.articles).toHaveLength(2);

    // First article checks
    const article1 = result.articles[0];
    expect(article1.title).toBe('Test Article');
    expect(article1.description).toBe('Article Description with HTML Content and ș "quotes"');
    expect(article1.url).toBe('https://example.com/article1');
    expect(article1.image).toBe('https://example.com/image.jpg');
    expect(article1.pubDate.getTime()).toBe(new Date('Wed, 02 Oct 2024 08:00:00 GMT').getTime());

    // Second article checks
    const article2 = result.articles[1];
    expect(article2.title).toBe('Article 2');
    expect(article2.description).toBe('Content encoded description');
    expect(article2.url).toBe('https://example.com/article2');
    expect(article2.image).toBe('https://example.com/media.jpg');
  });

  it('throws an error when XML is invalid', async () => {
    // JSDOM's DOMParser creates a <parsererror> element when parsing invalid XML
    const invalidXML = `<invalid><parsererror>Error</parsererror></invalid>`;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => invalidXML,
    });

    await expect(parseRSSFeed('https://example.com/feed.xml')).rejects.toThrow(
      'Failed to parse RSS feed. Invalid XML format'
    );
  });

  it('throws an error when channel is missing', async () => {
    const missingChannelXML = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0">
      </rss>`;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => missingChannelXML,
    });

    await expect(parseRSSFeed('https://example.com/feed.xml')).rejects.toThrow(
      'Failed to parse RSS feed. Invalid RSS feed format - no channel element found'
    );
  });

  it('throws an error when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    });

    await expect(parseRSSFeed('https://example.com/feed.xml')).rejects.toThrow(
      /Failed to parse RSS feed\. Failed to fetch RSS feed: HTTP 500: Internal Server Error/
    );
  });

  it('throws an error when fetch throws an exception', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(parseRSSFeed('https://example.com/feed.xml')).rejects.toThrow(
      /Failed to parse RSS feed\. Failed to fetch RSS feed: Network error/
    );
  });
});