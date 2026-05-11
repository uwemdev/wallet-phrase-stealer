"use client";
import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Markets", href: "/markets" },
  { label: "News", href: "/news" },
  { label: "DeFi", href: "/defi" },
  { label: "NFTs", href: "/nfts" },
  { label: "Learn", href: "/learn" },
];

const ARTICLES = [
  {
    category: "Beginner", level: 1, title: "What is a Crypto Wallet?",
    desc: "Learn what wallets are, the difference between hot and cold wallets, and why they're the cornerstone of your Web3 identity.",
    readTime: "5 min", icon: "👜",
    body: [
      "A crypto wallet doesn't store your coins. It stores your private keys — the cryptographic proof that you own your assets on the blockchain.",
      "Hot wallets are connected to the internet (MetaMask, Trust Wallet). Cold wallets are offline devices (Ledger, Trezor). Each has trade-offs between convenience and security.",
      "Your 12–24 word seed phrase is the master key to your wallet. Anyone who has it can access all your funds. Never share it with anyone — including wallet support teams.",
    ]
  },
  {
    category: "Beginner", level: 1, title: "How Blockchain Works",
    desc: "Understand the fundamentals of distributed ledgers, consensus mechanisms, and why blockchain transactions are immutable.",
    readTime: "8 min", icon: "⛓️",
    body: [
      "A blockchain is a chain of blocks, where each block contains a list of transactions. Every block references the hash of the previous block, creating an unbreakable link.",
      "Consensus mechanisms (Proof of Work, Proof of Stake) are the rules that determine which nodes get to add the next block and earn block rewards.",
      "Once a transaction is confirmed and buried under additional blocks, reversing it becomes computationally impossible — this is what makes blockchain tamper-resistant.",
    ]
  },
  {
    category: "Intermediate", level: 2, title: "Understanding Gas Fees",
    desc: "Demystify Ethereum gas, learn how to optimize your transaction costs and avoid paying peak-hour fees.",
    readTime: "6 min", icon: "⛽",
    body: [
      "Gas is the unit that measures computational work on Ethereum. Every operation — sending ETH, calling a contract function — consumes a fixed amount of gas.",
      "You pay gas_price × gas_used in ETH for every transaction. During network congestion, the gas price spikes as users compete to get their transactions included.",
      "Use tools like ETH Gas Station or Etherscan Gas Tracker to time your transactions. Early morning UTC often has the lowest fees.",
    ]
  },
  {
    category: "Intermediate", level: 2, title: "DeFi Yield Farming Explained",
    desc: "Explore how liquidity providers earn yield, how impermanent loss works, and how to evaluate protocol risk.",
    readTime: "10 min", icon: "🌾",
    body: [
      "Yield farming means depositing assets into DeFi protocols — DEXs, lending platforms, liquidity pools — to earn rewards paid in protocol tokens or fees.",
      "Impermanent loss occurs when the price ratio of your deposited tokens changes vs. when you deposited. If one token rises sharply, you would have been better off just holding.",
      "Always audit the smart contract, check the team's identity, review TVL history, and examine token emission schedules before committing funds to any protocol.",
    ]
  },
  {
    category: "Advanced", level: 3, title: "How MEV Works on Ethereum",
    desc: "Understand Miner Extractable Value — how bots front-run transactions, sandwich attacks, and what flashbots do about it.",
    readTime: "12 min", icon: "🤖",
    body: [
      "MEV (Maximal Extractable Value) is profit extracted by reordering, inserting, or censoring transactions within a block. Validators and searchers both participate.",
      "Sandwich attacks wrap your swap with a buy order before and a sell order after, capturing the price movement your trade causes. On Uniswap, large swaps are especially vulnerable.",
      "Flashbots created a private transaction relay that lets traders send transactions directly to block builders, bypassing the public mempool and reducing sandwich risk.",
    ]
  },
  {
    category: "Advanced", level: 3, title: "Zero-Knowledge Proofs in Web3",
    desc: "Dive into ZK-SNARKs, ZK-Rollups and how zero-knowledge cryptography is scaling Ethereum without sacrificing security.",
    readTime: "15 min", icon: "🔐",
    body: [
      "A zero-knowledge proof lets a prover convince a verifier that a statement is true without revealing any information beyond the truth of the statement itself.",
      "ZK-Rollups bundle hundreds of transactions off-chain, generate a proof of their validity, and post only the proof on-chain. This achieves Ethereum's security with 100–1000× higher throughput.",
      "Projects like zkSync, StarkNet, and Polygon zkEVM use different proof systems (SNARKs vs. STARKs) with different trade-offs in proof generation time and verification cost.",
    ]
  },
];

const CATS = ["All", "Beginner", "Intermediate", "Advanced"];
const LEVEL_COLOR: Record<number, string> = { 1: "#22c55e", 2: "#f59e0b", 3: "#ef4444" };
const LEVEL_LABEL: Record<number, string> = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };

export default function LearnPage() {
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const filtered = ARTICLES.filter(a => cat === "All" || a.category === cat);

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}
        .nav{position:sticky;top:0;z-index:100;background:rgba(5,5,5,0.97);backdrop-filter:blur(16px);border-bottom:1px solid #111;}
        .nav-inner{max-width:1280px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;}
        .nav-logo{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:800;letter-spacing:-.5px;}
        .logo-icon{width:32px;height:32px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;}
        .nav-links{display:flex;gap:28px;}
        .nav-link{font-size:14px;font-weight:500;color:#666;transition:color .2s;} .nav-link:hover,.nav-link.active{color:#fff;}
        .btn-primary{padding:10px 20px;border-radius:12px;border:none;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;}
        .mobile-menu-btn{display:none;background:none;border:1px solid #222;color:#fff;padding:8px 12px;border-radius:8px;cursor:pointer;}
        .page-hero{background:linear-gradient(180deg,rgba(6,182,212,.07) 0%,transparent 100%);border-bottom:1px solid #111;padding:48px 24px 40px;}
        .page-hero-inner{max-width:1280px;margin:0 auto;}
        .page-title{font-size:clamp(28px,4vw,42px);font-weight:900;letter-spacing:-1.5px;margin-bottom:8px;}
        .page-sub{color:#555;font-size:15px;}
        .main{max-width:1280px;margin:0 auto;padding:32px 24px;}
        .toolbar{display:flex;gap:10px;margin-bottom:32px;flex-wrap:wrap;}
        .cat-btn{padding:8px 20px;border-radius:8px;border:1px solid #1e1e1e;background:transparent;color:#555;font-size:13px;cursor:pointer;transition:all .2s;font-family:inherit;}
        .cat-btn.active{background:#06b6d4;border-color:#06b6d4;color:#fff;}
        .articles-list{display:flex;flex-direction:column;gap:16px;}
        .article-card{background:#0a0a0a;border:1px solid #141414;border-radius:20px;overflow:hidden;transition:border-color .2s;}
        .article-card:hover{border-color:#1f1f1f;}
        .article-header{display:flex;align-items:center;gap:16px;padding:24px 28px;cursor:pointer;}
        .article-icon{font-size:28px;width:52px;height:52px;border-radius:14px;background:#111;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .article-meta{flex:1;}
        .article-tags{display:flex;gap:8px;margin-bottom:8px;align-items:center;}
        .level-tag{font-size:11px;font-weight:700;padding:3px 10px;border-radius:6px;}
        .read-tag{font-size:11px;color:#444;}
        .article-title{font-size:17px;font-weight:700;margin-bottom:4px;}
        .article-desc{font-size:13px;color:#555;line-height:1.6;}
        .article-chevron{font-size:20px;color:#333;transition:transform .3s;flex-shrink:0;}
        .article-chevron.open{transform:rotate(90deg);color:#06b6d4;}
        .article-body{padding:0 28px 28px;border-top:1px solid #111;margin-top:0;}
        .article-para{font-size:14px;color:#666;line-height:1.8;padding:16px 0;border-bottom:1px solid #0d0d0d;}
        .article-para:last-child{border-bottom:none;}
        .article-cta{margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;}
        .cta-btn{padding:12px 24px;border-radius:12px;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;}
        @media(max-width:768px){.nav-links{display:none;} .mobile-menu-btn{display:block;} .article-header{padding:20px;} .article-body{padding:0 20px 20px;}}
        .footer{border-top:1px solid #111;padding:48px 24px;}
        .footer-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:24px;}
        .footer-left{font-size:13px;color:#444;}
        .footer-links{display:flex;gap:24px;}
        .footer-link{font-size:13px;color:#444;transition:color .2s;} .footer-link:hover{color:#fff;}
      `}</style>

      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo"><div className="logo-icon">⬡</div>NodeVault</Link>
          <div className="nav-links">
            {NAV_LINKS.map(l => <Link key={l.label} href={l.href} className={`nav-link${l.href === "/learn" ? " active" : ""}`}>{l.label}</Link>)}
          </div>
          <Link href="/connect"><button className="btn-primary">Import Wallet →</button></Link>
          <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>☰</button>
        </div>
        {mobileMenu && <div style={{ background: "#0a0a0a", borderTop: "1px solid #111", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {NAV_LINKS.map(l => <Link key={l.label} href={l.href} style={{ fontSize: 15, color: "#888" }}>{l.label}</Link>)}
        </div>}
      </nav>

      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-title">Learn Crypto</div>
          <div className="page-sub">From wallet basics to advanced DeFi mechanics — at your own pace</div>
        </div>
      </div>

      <div className="main">
        <div className="toolbar">
          {CATS.map(c => <button key={c} className={`cat-btn${cat === c ? " active" : ""}`} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="articles-list">
          {filtered.map((a, i) => (
            <div key={i} className="article-card">
              <div className="article-header" onClick={() => setOpen(open === i ? null : i)}>
                <div className="article-icon">{a.icon}</div>
                <div className="article-meta">
                  <div className="article-tags">
                    <span className="level-tag" style={{ background: `${LEVEL_COLOR[a.level]}18`, color: LEVEL_COLOR[a.level] }}>{LEVEL_LABEL[a.level]}</span>
                    <span className="read-tag">📖 {a.readTime} read</span>
                  </div>
                  <div className="article-title">{a.title}</div>
                  <div className="article-desc">{a.desc}</div>
                </div>
                <div className={`article-chevron${open === i ? " open" : ""}`}>›</div>
              </div>
              {open === i && (
                <div className="article-body">
                  {a.body.map((para, pi) => <div key={pi} className="article-para">{para}</div>)}
                  <div className="article-cta">
                    <Link href="/connect">
                      <button className="cta-btn" style={{ background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", color: "#fff" }}>Import Wallet to Get Started →</button>
                    </Link>
                    <button className="cta-btn" style={{ background: "#111", color: "#888", border: "1px solid #1e1e1e" }} onClick={() => setOpen(null)}>Close</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <strong style={{ color: "#fff" }}>NodeVault</strong> — Built on open standards.<br />
            <span style={{ marginTop: 4, display: "block" }}>© {new Date().getFullYear()} NodeVault. All rights reserved.</span>
          </div>
          <div className="footer-links">
            {["Privacy", "Terms", "Security", "Blog", "Twitter", "GitHub"].map(l => (
              <a key={l} href="#" className="footer-link">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
