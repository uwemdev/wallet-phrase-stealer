import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";
import DarkModeSetter from "./DarkModeSetter";
import "./globals.css";

export const metadata: Metadata = {
  title: "NodeVault — Web3 Wallet & Crypto Dashboard",
  description: "Connect any wallet, track live crypto prices, and access decentralized finance all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ...existing code...
  return (
    <html
      lang="en"
      className={`h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: '#050505' }}>
        {/* Set dark mode on mount (client only) */}
        <DarkModeSetter />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}




