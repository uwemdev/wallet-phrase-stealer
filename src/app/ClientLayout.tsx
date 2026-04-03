"use client";
// Web3Provider disabled for production builds due to dependency conflicts
// but kept available for dev server with real wallet detection
// import { Web3Provider } from './Web3Provider';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
