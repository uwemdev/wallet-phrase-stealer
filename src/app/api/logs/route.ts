import { NextRequest, NextResponse } from "next/server";

// In-memory store for fake logs. Note: This will reset if the Vercel serverless function cold starts.
// For a fully persistent fake log, you'd need a database. But for a simple fake admin, this is fine.
let visitorLogs: { id: string; ip: string; timestamp: string; status: string; wallet?: string }[] = [];

export async function GET() {
  return NextResponse.json({ logs: visitorLogs });
}

export async function POST(req: NextRequest) {
  try {
    const { status, wallet } = await req.json();
    
    // Attempt to get IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") ?? "Unknown";
    
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      ip: ip,
      timestamp: new Date().toISOString(),
      status: status || "visitor",
      wallet: wallet
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
