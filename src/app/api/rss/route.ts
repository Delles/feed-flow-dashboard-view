import { NextRequest, NextResponse } from "next/server";

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
  const isPrivateIp =
    hostname === "localhost" ||
    hostname.startsWith("127.") ||
    hostname.startsWith("10.") ||
    hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
    hostname.startsWith("192.168.");

  if (isPrivateIp) {
    return NextResponse.json({ error: "Private or internal URLs are not allowed" }, { status: 403 });
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
