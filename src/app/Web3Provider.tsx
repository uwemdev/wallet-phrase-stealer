"use client";
// import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
// import { WagmiConfig } from 'wagmi'
// import { mainnet, polygon, arbitrum } from 'wagmi/chains'
import { ReactNode } from 'react'

// // 1. Get projectId at https://cloud.walletconnect.com
// const projectId = '2f05a7db73b6e7a4e0b7e8e2e8b0c2f0' // Demo project ID for testing

// // 2. Create wagmiConfig
// const metadata = {
//   name: 'Wallet Phrase App',
//   description: 'Connect your wallet',
//   url: 'https://walletconnect.com',
//   icons: ['https://walletconnect.com/walletconnect-logo.png']
// }

// const chains = [mainnet, polygon, arbitrum]
// const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// // 3. Create modal
// createWeb3Modal({ wagmiConfig, projectId, chains })

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    // <WagmiConfig config={wagmiConfig}>
      {children}
    // </WagmiConfig>
  )
}
