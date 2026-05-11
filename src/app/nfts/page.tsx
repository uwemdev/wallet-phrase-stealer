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

const COLLECTIONS = [
  { name: "CryptoPunks", chain: "Ethereum", floor: "54.2 ETH", vol7d: "1,240 ETH", items: "10,000", owners: "3,400", img: "🎭", category: "PFP", color: "#a855f7", desc: "The original 10,000 pixel-art punks that launched the PFP NFT movement." },
  { name: "Bored Ape Yacht Club", chain: "Ethereum", floor: "12.8 ETH", vol7d: "4,820 ETH", items: "10,000", owners: "5,600", img: "🦍", category: "PFP", color: "#f59e0b", desc: "Iconic ape avatars granting access to an exclusive digital club and real-world events." },
  { name: "Azuki", chain: "Ethereum", floor: "8.1 ETH", vol7d: "2,100 ETH", items: "10,000", owners: "4,200", img: "🌸", category: "PFP", color: "#ef4444", desc: "Anime-inspired characters at the forefront of brand-meets-Web3 experiences." },
  { name: "DeGods", chain: "Solana", floor: "12.5 SOL", vol7d: "8,900 SOL", items: "10,000", owners: "3,900", img: "⚡", category: "PFP", color: "#fff", desc: "A deflationary collection on Solana with strong community and cross-chain expansion." },
  { name: "Pudgy Penguins", chain: "Ethereum", floor: "9.4 ETH", vol7d: "3,800 ETH", items: "8,888", owners: "4,800", img: "🐧", category: "PFP", color: "#38bdf8", desc: "Adorable penguin NFTs with a massive community and real-world toy licensing deals." },
  { name: "Ordinal Punks", chain: "Bitcoin", floor: "1.2 BTC", vol7d: "4.8 BTC", items: "100", owners: "87", img: "₿", category: "Ordinals", color: "#f97316", desc: "First 100 Bitcoin Ordinal inscriptions in the Punks style, scarce and highly coveted." },
  { name: "Mad Lads", chain: "Solana", floor: "210 SOL", vol7d: "18,400 SOL", items: "10,000", owners: "7,200", img: "😤", category: "PFP", color: "#7c3aed", desc: "Built by Backpack, Mad Lads is the flagship PFP of the xNFT ecosystem on Solana." },
  { name: "Art Blocks Curated", chain: "Ethereum", floor: "0.8 ETH", vol7d: "620 ETH", items: "145,000", owners: "29,000", img: "🎨", category: "Generative", color: "#06b6d4", desc: "On-chain generative art from the world's top algorithmic artists." },
  { name: "Mutant Ape Yacht Club", chain: "Ethereum", floor: "3.2 ETH", vol7d: "1,900 ETH", items: "20,000", owners: "11,200", img: "🧬", category: "PFP", color: "#22c55e", desc: "BAYC mutations — a larger supply derivative with strong brand alignment." },
];

const CHAINS = ["All", "Ethereum", "Solana", "Bitcoin"];
const CATS = ["All", "PFP", "Generative", "Ordinals"];

export default function NFTsPage() {
  const [chain, setChain] = useState("All");
  const [cat, setCat] = useState("All");
  const [mobileMenu, setMobileMenu] = useState(false);

  const filtered = COLLECTIONS.filter(c =>
    (chain === "All" || c.chain === chain) &&
    (cat === "All" || c.category === cat)
  );

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
        .page-hero{background:linear-gradient(180deg,rgba(236,72,153,.08) 0%,transparent 100%);border-bottom:1px solid #111;padding:48px 24px 40px;}
        .page-hero-inner{max-width:1280px;margin:0 auto;}
        .page-title{font-size:clamp(28px,4vw,42px);font-weight:900;letter-spacing:-1.5px;margin-bottom:8px;}
        .page-sub{color:#555;font-size:15px;margin-bottom:32px;}
        .stats-row{display:flex;gap:24px;flex-wrap:wrap;}
        .stat-card{background:rgba(255,255,255,.03);border:1px solid #1a1a1a;border-radius:16px;padding:20px 24px;min-width:140px;}
        .stat-num{font-size:24px;font-weight:800;background:linear-gradient(135deg,#fff,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .stat-label{font-size:12px;color:#555;margin-top:4px;}
        .main{max-width:1280px;margin:0 auto;padding:32px 24px;}
        .toolbar{display:flex;gap:12px;margin-bottom:28px;flex-wrap:wrap;}
        .filter-group{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
        .cat-btn{padding:8px 16px;border-radius:8px;border:1px solid #1e1e1e;background:transparent;color:#555;font-size:12px;cursor:pointer;transition:all .2s;font-family:inherit;}
        .cat-btn.active{background:#ec4899;border-color:#ec4899;color:#fff;}
        .nft-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;}
        .nft-card{background:#0a0a0a;border:1px solid #141414;border-radius:24px;overflow:hidden;transition:border-color .2s,transform .2s;}
        .nft-card:hover{border-color:#222;transform:translateY(-4px);}
        .nft-banner{height:140px;display:flex;align-items:center;justify-content:center;font-size:72px;}
        .nft-body{padding:24px;}
        .nft-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;}
        .nft-name{font-size:17px;font-weight:800;}
        .nft-chain{font-size:11px;font-weight:600;padding:3px 10px;border-radius:6px;background:rgba(255,255,255,.06);color:#666;}
        .nft-desc{font-size:12px;color:#555;line-height:1.6;margin-bottom:16px;}
        .nft-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
        .nft-stat-val{font-size:14px;font-weight:700;}
        .nft-stat-label{font-size:10px;color:#444;margin-top:2px;}
        .view-btn{width:100%;padding:11px;border-radius:12px;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;}
        @media(max-width:768px){.nav-links{display:none;} .mobile-menu-btn{display:block;} .nft-grid{grid-template-columns:1fr;}}
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
            {NAV_LINKS.map(l => <Link key={l.label} href={l.href} className={`nav-link${l.href === "/nfts" ? " active" : ""}`}>{l.label}</Link>)}
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
          <div className="page-title">NFT Collections</div>
          <div className="page-sub">Top collections across Ethereum, Solana and Bitcoin</div>
          <div className="stats-row">
            {[["$2.1B", "Monthly Volume"], ["84M+", "Total NFTs"], ["12M+", "Unique Holders"], ["$48.2M", "Today's Sales"]].map(([n, l]) => (
              <div key={l} className="stat-card"><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="main">
        <div className="toolbar">
          <div className="filter-group">
            <span style={{ fontSize: 12, color: "#555" }}>Chain:</span>
            {CHAINS.map(c => <button key={c} className={`cat-btn${chain === c ? " active" : ""}`} onClick={() => setChain(c)}>{c}</button>)}
          </div>
          <div className="filter-group">
            <span style={{ fontSize: 12, color: "#555" }}>Type:</span>
            {CATS.map(c => <button key={c} className={`cat-btn${cat === c ? " active" : ""}`} onClick={() => setCat(c)}>{c}</button>)}
          </div>
        </div>

        <div className="nft-grid">
          {filtered.map(col => (
            <div key={col.name} className="nft-card">
              <div className="nft-banner" style={{ background: `${col.color}12` }}>{col.img}</div>
              <div className="nft-body">
                <div className="nft-top">
                  <div className="nft-name">{col.name}</div>
                  <span className="nft-chain">{col.chain}</span>
                </div>
                <div className="nft-desc">{col.desc}</div>
                <div className="nft-stats">
                  <div><div className="nft-stat-val" style={{ color: "#22c55e" }}>{col.floor}</div><div className="nft-stat-label">Floor</div></div>
                  <div><div className="nft-stat-val" style={{ color: "#a78bfa" }}>{col.vol7d}</div><div className="nft-stat-label">Vol 7d</div></div>
                  <div><div className="nft-stat-val" style={{ color: "#f59e0b" }}>{col.items}</div><div className="nft-stat-label">Items</div></div>
                </div>
                <Link href="/connect">
                  <button className="view-btn" style={{ background: `${col.color}18`, color: col.color }}>Connect to View →</button>
                </Link>
              </div>
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
