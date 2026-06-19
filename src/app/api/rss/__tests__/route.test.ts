import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';
import dns from 'dns/promises';

vi.mock('dns/promises', () => ({
  default: {
    lookup: vi.fn()
  }
}));

// Helper to create NextRequest with specific search params
function createNextRequest(urlParam: string | null): NextRequest {
  const url = new URL('http://localhost');
  if (urlParam !== null) {
    url.searchParams.set('url', urlParam);
  }
  return new NextRequest(url);
}

describe('RSS API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();

    // Default DNS mock behavior (valid IP)
    vi.mocked(dns.lookup).mockResolvedValue([{ address: '93.184.216.34', family: 4 }] as unknown as Promise<dns.LookupAddress[]>);
  });

  describe('URL Validation', () => {
    it('returns 400 if url parameter is missing', async () => {
      const request = createNextRequest(null);
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Missing 'url' parameter");
    });

    it('returns 400 for invalid URL format', async () => {
      const request = createNextRequest('not-a-valid-url');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid URL format");
    });

    it('returns 400 for disallowed protocol', async () => {
      const request = createNextRequest('ftp://example.com/feed.xml');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Disallowed protocol");
    });
  });

  describe('Hostname Validation (SSRF Prevention)', () => {
    it('returns 403 for localhost', async () => {
      const request = createNextRequest('http://localhost:3000/feed.xml');
      const response = await GET(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe("Private or internal URLs are not allowed or DNS resolution failed");
    });

    it('returns 403 for direct private IP', async () => {
      const request = createNextRequest('http://192.168.1.1/feed.xml');
      const response = await GET(request);

      expect(response.status).toBe(403);
    });

    it('returns 403 if DNS resolves to a private IP (DNS rebinding attack)', async () => {
      // Mock DNS to resolve to a private IP
      vi.mocked(dns.lookup).mockResolvedValue([{ address: '10.0.0.1', family: 4 }] as unknown as Promise<dns.LookupAddress[]>);

      const request = createNextRequest('http://malicious.example.com/feed.xml');
      const response = await GET(request);

      expect(response.status).toBe(403);
      expect(dns.lookup).toHaveBeenCalledWith('malicious.example.com', { all: true });
    });

    it('returns 403 if DNS resolution fails', async () => {
      vi.mocked(dns.lookup).mockRejectedValue(new Error('DNS lookup failed'));

      const request = createNextRequest('http://nonexistent.example.com/feed.xml');
      const response = await GET(request);

      expect(response.status).toBe(403);
    });
  });

  describe('Fetching Feeds', () => {
    it('successfully fetches and returns a feed', async () => {
      const mockXml = '<?xml version="1.0"?><rss><channel><title>Test</title></channel></rss>';
      vi.mocked(global.fetch).mockResolvedValue({
        status: 200,
        ok: true,
        text: () => Promise.resolve(mockXml),
        headers: new Headers({ 'Content-Type': 'application/xml; charset=utf-8' })
      } as unknown as Response);

      const request = createNextRequest('https://example.com/feed.xml');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/xml; charset=utf-8');

      const text = await response.text();
      expect(text).toBe(mockXml);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/feed.xml',
        expect.objectContaining({ redirect: 'manual' })
      );
    });

    it('handles non-200 responses from the target server', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        status: 404,
        ok: false,
        statusText: 'Not Found'
      } as unknown as Response);

      const request = createNextRequest('https://example.com/feed.xml');
      const response = await GET(request);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch: 404 Not Found');
    });

    it('returns 500 if fetch throws an internal error', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const request = createNextRequest('https://example.com/feed.xml');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Internal Server Error');
    });

    it('returns 504 on fetch timeout (AbortError)', async () => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      vi.mocked(global.fetch).mockRejectedValue(error);

      const request = createNextRequest('https://example.com/feed.xml');
      const response = await GET(request);

      expect(response.status).toBe(504);
      const data = await response.json();
      expect(data.error).toBe('Gateway Timeout');
    });
  });

  describe('Redirect Handling', () => {
    it('follows valid redirects successfully', async () => {
      const mockXml = '<rss></rss>';

      // First fetch returns a 301
      vi.mocked(global.fetch).mockResolvedValueOnce({
        status: 301,
        headers: new Headers({ location: 'https://example.com/new-feed.xml' })
      } as unknown as Response);

      // Second fetch returns 200
      vi.mocked(global.fetch).mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: () => Promise.resolve(mockXml)
      } as unknown as Response);

      const request = createNextRequest('https://example.com/old-feed.xml');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://example.com/old-feed.xml',
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://example.com/new-feed.xml',
        expect.any(Object)
      );
    });

    it('blocks redirects to private IPs', async () => {
      // First fetch returns a 301 to a private IP
      vi.mocked(global.fetch).mockResolvedValueOnce({
        status: 301,
        headers: new Headers({ location: 'http://192.168.1.5/feed.xml' })
      } as unknown as Response);

      const request = createNextRequest('https://example.com/old-feed.xml');
      const response = await GET(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe("Redirected to private or internal URL");
    });

    it('returns 502 for missing location header in redirect', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        status: 301,
        headers: new Headers() // No location header
      } as unknown as Response);

      const request = createNextRequest('https://example.com/feed.xml');
      const response = await GET(request);

      expect(response.status).toBe(502);
      const data = await response.json();
      expect(data.error).toBe("Redirect location missing");
    });

    it('returns 502 for too many redirects', async () => {
      // Setup fetch to continuously return 301s
      vi.mocked(global.fetch).mockImplementation(() => Promise.resolve({
        status: 301,
        headers: new Headers({ location: 'https://example.com/another-feed.xml' })
      } as unknown as Response));

      const request = createNextRequest('https://example.com/feed.xml');
      const response = await GET(request);

      expect(response.status).toBe(502);
      const data = await response.json();
      expect(data.error).toBe("Too many redirects");

      // Should have stopped after 5 redirects
      expect(global.fetch).toHaveBeenCalledTimes(6);
    });

    it('blocks redirects with disallowed protocol', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        status: 301,
        headers: new Headers({ location: 'javascript:alert(1)' })
      } as unknown as Response);

      const request = createNextRequest('https://example.com/feed.xml');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Disallowed protocol in redirect");
    });
  });
});
