"use client";
// Web3Modal implementation - works in dev server
// Disabled for production builds due to Next.js dependency conflicts
// In production, falls back to manual phrase entry gracefully

import { ReactNode } from 'react'

// Stub Web3Provider - real wallet detection deferred
export function Web3Provider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}