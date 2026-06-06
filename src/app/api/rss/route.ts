import { NextRequest, NextResponse } from "next/server";
import dns from "dns/promises";

function isPrivateIP(ip: string): boolean {
  return (
    ip === "0.0.0.0" ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("169.254.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
    /^fc00:/i.test(ip) ||
    /^fe80:/i.test(ip)
  );
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return NextResponse.json({ error: "Disallowed protocol" }, { status: 400 });
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Quick host-based string check
  if (hostname === "localhost" || isPrivateIP(hostname)) {
    return NextResponse.json({ error: "Private or internal URLs are not allowed" }, { status: 403 });
  }

  // Deep DNS resolution check to prevent DNS rebinding to private IPs
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const record of addresses) {
      if (isPrivateIP(record.address)) {
        return NextResponse.json({ error: "Resolved to private or internal IP address" }, { status: 403 });
      }
    }
  } catch (error) {
    // If DNS fails, we can either reject or let the fetch fail naturally.
    // Given SSRF concerns, rejecting is safer if it truly doesn't resolve.
    return NextResponse.json({ error: "DNS resolution failed for hostname" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "FeedFlow/1.0",
        "Accept": "application/rss+xml, application/xml, application/atom+xml, text/xml, */*"
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const text = await response.text();
    const contentType = response.headers.get("content-type") || "text/xml";

    return new NextResponse(text, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "s-maxage=300, stale-while-revalidate",
      },
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error("Fetch timeout for RSS feed:", url);
      return NextResponse.json(
        { error: "Gateway Timeout", message: "Request timed out" },
        { status: 504 }
      );
    }

    console.error("Error fetching RSS feed:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
