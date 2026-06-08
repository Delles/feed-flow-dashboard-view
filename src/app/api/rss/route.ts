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
    /^f[cd][0-9a-f:]*$/i.test(ip) ||
    /^fe[89ab][0-9a-f:]*$/i.test(ip)
  );
}

async function validateHostname(hostname: string): Promise<boolean> {
  // Quick host-based string check
  if (hostname === "localhost" || isPrivateIP(hostname)) {
    return false;
  }

  // Deep DNS resolution check to prevent DNS rebinding to private IPs
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const record of addresses) {
      if (isPrivateIP(record.address)) {
        return false;
      }
    }
  } catch (error) {
    // If DNS fails, we reject it
    return false;
  }
  return true;
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

  const isValid = await validateHostname(parsedUrl.hostname.toLowerCase());
  if (!isValid) {
    return NextResponse.json({ error: "Private or internal URLs are not allowed or DNS resolution failed" }, { status: 403 });
  }

  let currentUrl = url;
  let response: Response;
  let redirects = 0;
  const MAX_REDIRECTS = 5;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    while (true) {
      response = await fetch(currentUrl, {
        headers: {
          "User-Agent": "FeedFlow/1.0",
          "Accept": "application/rss+xml, application/xml, application/atom+xml, text/xml, */*"
        },
        redirect: 'manual',
        next: { revalidate: 300 }, // Cache for 5 minutes
        signal: controller.signal
      });

      if (response.status >= 300 && response.status < 400) {
        if (redirects >= MAX_REDIRECTS) {
          clearTimeout(timeoutId);
          return NextResponse.json({ error: "Too many redirects" }, { status: 502 });
        }
        redirects++;

        const location = response.headers.get('location');
        if (!location) {
          clearTimeout(timeoutId);
          return NextResponse.json({ error: "Redirect location missing" }, { status: 502 });
        }

        let nextUrlObj: URL;
        try {
          nextUrlObj = new URL(location, currentUrl);
        } catch (e) {
          clearTimeout(timeoutId);
          return NextResponse.json({ error: "Invalid redirect URL format" }, { status: 502 });
        }

        if (nextUrlObj.protocol !== "http:" && nextUrlObj.protocol !== "https:") {
          clearTimeout(timeoutId);
          return NextResponse.json({ error: "Disallowed protocol in redirect" }, { status: 400 });
        }

        const isNextValid = await validateHostname(nextUrlObj.hostname.toLowerCase());
        if (!isNextValid) {
          clearTimeout(timeoutId);
          return NextResponse.json({ error: "Redirected to private or internal URL" }, { status: 403 });
        }

        currentUrl = nextUrlObj.toString();
        continue;
      }

      break;
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const text = await response.text();

    return new NextResponse(text, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=300, stale-while-revalidate",
      },
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
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
