"use client";

import { ReactNode } from 'react'

// Web3Modal will be loaded via script tag in the browser
// No npm dependencies needed - simpler, more reliable approach

export function Web3Provider({ children }: { children: ReactNode }) {
  return <>{children}</>
}