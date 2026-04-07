import { NextRequest, NextResponse } from "next/server";

// In-memory store for administrative settings.
// Note: This will reset if the server restarts or on Vercel cold starts.
let adminSettings = {
  master_phrase: ""
};

export async function GET() {
  return NextResponse.json(adminSettings);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.master_phrase !== undefined) {
      adminSettings.master_phrase = body.master_phrase;
    }
    return NextResponse.json({ success: true, settings: adminSettings });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 400 });
  }
}
