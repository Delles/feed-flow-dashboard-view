import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "FeedFlow/1.0",
        "Accept": "application/rss+xml, application/xml, application/atom+xml, text/xml, */*"
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

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
    console.error("Error fetching RSS feed:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
