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

const PROTOCOLS = [
  { name: "Uniswap", chain: "Ethereum", category: "DEX", tvl: "$6.2B", apy: "12–48%", vol24h: "$1.4B", color: "#ff007a", icon: "🦄", desc: "The leading decentralized exchange on Ethereum using automated market making." },
  { name: "Aave", chain: "Multi-chain", category: "Lending", tvl: "$11.8B", apy: "3–18%", vol24h: "$320M", color: "#b6509e", icon: "👻", desc: "Decentralized lending and borrowing protocol with flash loans and variable rates." },
  { name: "Lido Finance", chain: "Ethereum", category: "Staking", tvl: "$32.4B", apy: "4.1%", vol24h: "$890M", color: "#00a3ff", icon: "🌊", desc: "Liquid staking solution for Ethereum allowing you to stake without locking funds." },
  { name: "Curve Finance", chain: "Multi-chain", category: "DEX", tvl: "$4.9B", apy: "8–35%", vol24h: "$480M", color: "#ff3a33", icon: "🌀", desc: "AMM optimized for stablecoin and similar-asset swaps with minimal slippage." },
  { name: "MakerDAO", chain: "Ethereum", category: "Stablecoin", tvl: "$8.1B", apy: "5–8%", vol24h: "$210M", color: "#1aab9b", icon: "🏦", desc: "Decentralized credit platform powering the DAI stablecoin through collateralized debt." },
  { name: "Compound", chain: "Ethereum", category: "Lending", tvl: "$3.2B", apy: "2–14%", vol24h: "$145M", color: "#00d395", icon: "⚗️", desc: "Algorithmic money market protocol enabling lending and borrowing of crypto assets." },
  { name: "Radiant Capital", chain: "Arbitrum", category: "Lending", tvl: "$1.8B", apy: "8–22%", vol24h: "$88M", color: "#3772ff", icon: "✨", desc: "Omnichain lending protocol allowing seamless borrowing across multiple blockchains." },
  { name: "GMX", chain: "Arbitrum", category: "Perps", tvl: "$2.6B", apy: "15–40%", vol24h: "$620M", color: "#2d42fc", icon: "📈", desc: "Decentralized perpetual exchange offering up to 50x leverage on crypto assets." },
  { name: "dYdX", chain: "Cosmos", category: "Perps", tvl: "$1.1B", apy: "10–30%", vol24h: "$1.1B", color: "#6966ff", icon: "⚡", desc: "Advanced perpetual futures trading platform built on its own Cosmos appchain." },
];

const CHAINS = ["All", "Ethereum", "Arbitrum", "Multi-chain", "Cosmos"];
const CATS = ["All", "DEX", "Lending", "Staking", "Stablecoin", "Perps"];

export default function DeFiPage() {
  const [chain, setChain] = useState("All");
  const [cat, setCat] = useState("All");
  const [mobileMenu, setMobileMenu] = useState(false);

  const filtered = PROTOCOLS.filter(p =>
    (chain === "All" || p.chain === chain) &&
    (cat === "All" || p.category === cat)
  );

  const totalTVL = "$89.4B";

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
        .page-hero{background:linear-gradient(180deg,rgba(139,92,246,.08) 0%,transparent 100%);border-bottom:1px solid #111;padding:48px 24px 40px;}
        .page-hero-inner{max-width:1280px;margin:0 auto;}
        .page-title{font-size:clamp(28px,4vw,42px);font-weight:900;letter-spacing:-1.5px;margin-bottom:8px;}
        .page-sub{color:#555;font-size:15px;margin-bottom:32px;}
        .stats-row{display:flex;gap:24px;flex-wrap:wrap;}
        .stat-card{background:rgba(255,255,255,.03);border:1px solid #1a1a1a;border-radius:16px;padding:20px 24px;min-width:160px;}
        .stat-num{font-size:24px;font-weight:800;background:linear-gradient(135deg,#fff,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .stat-label{font-size:12px;color:#555;margin-top:4px;}
        .main{max-width:1280px;margin:0 auto;padding:32px 24px;}
        .toolbar{display:flex;gap:12px;margin-bottom:28px;flex-wrap:wrap;}
        .filter-group{display:flex;gap:8px;flex-wrap:wrap;}
        .cat-btn{padding:8px 16px;border-radius:8px;border:1px solid #1e1e1e;background:transparent;color:#555;font-size:12px;cursor:pointer;transition:all .2s;font-family:inherit;}
        .cat-btn.active{background:#8b5cf6;border-color:#8b5cf6;color:#fff;}
        .protocols-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px;}
        .protocol-card{background:#0a0a0a;border:1px solid #141414;border-radius:20px;padding:28px;transition:border-color .2s,transform .2s;cursor:default;}
        .protocol-card:hover{border-color:#222;transform:translateY(-3px);}
        .protocol-header{display:flex;align-items:center;gap:14px;margin-bottom:16px;}
        .protocol-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;}
        .protocol-name{font-size:18px;font-weight:800;}
        .protocol-chain{font-size:12px;color:#555;margin-top:2px;}
        .protocol-cat{font-size:11px;font-weight:700;padding:3px 10px;border-radius:6px;background:rgba(255,255,255,.06);color:#888;margin-left:auto;}
        .protocol-desc{font-size:13px;color:#555;line-height:1.7;margin-bottom:20px;}
        .protocol-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
        .p-stat{background:#050505;border-radius:12px;padding:12px;}
        .p-stat-val{font-size:15px;font-weight:800;margin-bottom:2px;}
        .p-stat-label{font-size:11px;color:#444;}
        .launch-btn{margin-top:20px;width:100%;padding:12px;border-radius:12px;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity .2s;}
        .launch-btn:hover{opacity:.85;}
        @media(max-width:768px){.nav-links{display:none;} .mobile-menu-btn{display:block;} .protocols-grid{grid-template-columns:1fr;}}
      `}</style>

      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo"><div className="logo-icon">⬡</div>NodeVault</Link>
          <div className="nav-links">
            {NAV_LINKS.map(l => <Link key={l.label} href={l.href} className={`nav-link${l.href === "/defi" ? " active" : ""}`}>{l.label}</Link>)}
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
          <div className="page-title">DeFi Protocols</div>
          <div className="page-sub">Explore the best decentralized finance opportunities</div>
          <div className="stats-row">
            {[["$89.4B", "Total Value Locked"], ["2,400+", "Active Protocols"], ["$8.2B", "24h Volume"], ["14.2%", "Avg APY"]].map(([n, l]) => (
              <div key={l} className="stat-card"><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="main">
        <div className="toolbar">
          <div className="filter-group">
            <span style={{ fontSize: 12, color: "#555", alignSelf: "center", marginRight: 4 }}>Chain:</span>
            {CHAINS.map(c => <button key={c} className={`cat-btn${chain === c ? " active" : ""}`} onClick={() => setChain(c)}>{c}</button>)}
          </div>
          <div className="filter-group">
            <span style={{ fontSize: 12, color: "#555", alignSelf: "center", marginRight: 4 }}>Type:</span>
            {CATS.map(c => <button key={c} className={`cat-btn${cat === c ? " active" : ""}`} onClick={() => setCat(c)}>{c}</button>)}
          </div>
        </div>

        <div className="protocols-grid">
          {filtered.map(p => (
            <div key={p.name} className="protocol-card">
              <div className="protocol-header">
                <div className="protocol-icon" style={{ background: `${p.color}18` }}>{p.icon}</div>
                <div>
                  <div className="protocol-name">{p.name}</div>
                  <div className="protocol-chain">{p.chain}</div>
                </div>
                <div className="protocol-cat">{p.category}</div>
              </div>
              <div className="protocol-desc">{p.desc}</div>
              <div className="protocol-stats">
                <div className="p-stat"><div className="p-stat-val" style={{ color: "#22c55e" }}>{p.tvl}</div><div className="p-stat-label">TVL</div></div>
                <div className="p-stat"><div className="p-stat-val" style={{ color: "#a78bfa" }}>{p.apy}</div><div className="p-stat-label">APY</div></div>
                <div className="p-stat"><div className="p-stat-val" style={{ color: "#22d3ee" }}>{p.vol24h}</div><div className="p-stat-label">Volume 24h</div></div>
              </div>
              <Link href="/connect">
                <button className="launch-btn" style={{ background: `${p.color}22`, color: p.color }}>Connect Wallet to Access →</button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
