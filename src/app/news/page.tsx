"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Markets", href: "/markets" },
  { label: "News", href: "/news" },
  { label: "DeFi", href: "/defi" },
  { label: "NFTs", href: "/nfts" },
  { label: "Learn", href: "/learn" },
];

const CATEGORIES = ["All", "Bitcoin", "Ethereum", "DeFi", "NFTs", "Regulation", "Layer 2", "AI & Web3"];

const NEWS_ITEMS = [
  { title: "Bitcoin Surges Past $70K as Institutional Demand Reaches All-Time High", summary: "Institutional investors are piling into Bitcoin at record rates following the successful launch of multiple spot ETF products, driving the world's leading cryptocurrency to new heights.", source: "CoinDesk", time: "1h ago", category: "Bitcoin", tag: "🔥 Trending", color: "#f97316" },
  { title: "Ethereum's Dencun Upgrade Slashes Layer 2 Fees by 90%", summary: "The landmark Dencun upgrade has officially reduced transaction costs on Ethereum Layer 2 networks dramatically, making DeFi accessible to a much broader audience.", source: "The Block", time: "2h ago", category: "Ethereum", tag: "🔴 Live", color: "#ef4444" },
  { title: "SEC Approves Spot Ethereum ETF Options Trading on Major Exchanges", summary: "In a landmark decision, the U.S. Securities and Exchange Commission has greenlit options trading for spot Ethereum ETFs, opening new hedging strategies for crypto investors.", source: "Bloomberg Crypto", time: "3h ago", category: "Regulation", tag: "📋 Policy", color: "#6366f1" },
  { title: "Solana Ecosystem Surpasses $8B in DeFi TVL Amid Growing Developer Activity", summary: "Solana's decentralized finance ecosystem has hit a new milestone, driven by a surge in protocol launches and increased liquidity migration from competing chains.", source: "CoinTelegraph", time: "4h ago", category: "DeFi", tag: "📈 Markets", color: "#22c55e" },
  { title: "BlackRock's Bitcoin ETF Now Manages Over $20B in Assets Under Management", summary: "BlackRock's iShares Bitcoin Trust has rapidly become one of the largest ETFs ever launched, accumulating over $20 billion in AUM within months of its debut.", source: "Reuters Crypto", time: "5h ago", category: "Bitcoin", tag: "🏛 Institution", color: "#8b5cf6" },
  { title: "Chainlink Expands Cross-Chain Services to 20 New Blockchain Networks", summary: "Chainlink's Cross-Chain Interoperability Protocol is now live on 20 additional blockchain networks, significantly expanding the reach of decentralized oracle services.", source: "Decrypt", time: "6h ago", category: "Layer 2", tag: "🔗 Protocol", color: "#06b6d4" },
  { title: "Uniswap V4 Launches with Custom Liquidity Hooks and Gas Optimizations", summary: "The highly anticipated Uniswap V4 has gone live, introducing a revolutionary hooks system that allows developers to customize liquidity pool behavior at the protocol level.", source: "DeFi Pulse", time: "7h ago", category: "DeFi", tag: "🚀 Launch", color: "#f43f5e" },
  { title: "NFT Market Rebounds with $500M Monthly Volume Led by Ordinals", summary: "After months of declining activity, the NFT market is showing strong signs of recovery, with Bitcoin Ordinals inscriptions leading the resurgence in collector interest.", source: "Nifty Gateway Blog", time: "8h ago", category: "NFTs", tag: "🎨 NFTs", color: "#ec4899" },
  { title: "AI Tokens Surge 40% as Web3 Projects Integrate Large Language Models", summary: "A wave of Web3 projects integrating AI capabilities has triggered a rally in AI-focused crypto tokens, with several projects announcing partnerships with major AI labs.", source: "CryptoSlate", time: "10h ago", category: "AI & Web3", tag: "🤖 AI", color: "#14b8a6" },
  { title: "Arbitrum DAO Votes to Deploy $200M Treasury into DeFi Protocols", summary: "The Arbitrum decentralized autonomous organization has voted overwhelmingly to deploy a significant portion of its treasury into selected DeFi protocols to generate yield.", source: "Governance Watch", time: "12h ago", category: "Layer 2", tag: "🗳 DAO", color: "#28a0f0" },
  { title: "MicroStrategy Adds 12,000 BTC to Holdings, Total Now Exceeds 250,000 BTC", summary: "Business intelligence firm MicroStrategy has made its latest Bitcoin purchase, bringing its total holdings to over a quarter of a million BTC valued at approximately $17 billion.", source: "Bitcoin Magazine", time: "14h ago", category: "Bitcoin", tag: "🏦 Corporate", color: "#f59e0b" },
  { title: "Ethereum Staking Ratio Hits 30% as Validator Count Reaches 1 Million", summary: "Ethereum's staking ecosystem continues to grow at an unprecedented pace, with the number of active validators surpassing the one million mark for the first time.", source: "BeaconScan", time: "16h ago", category: "Ethereum", tag: "📊 Data", color: "#627eea" },
];

export default function NewsPage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const filtered = NEWS_ITEMS.filter(n =>
    (category === "All" || n.category === category) &&
    n.title.toLowerCase().includes(search.toLowerCase())
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
        .page-hero{background:linear-gradient(180deg,rgba(139,92,246,.08) 0%,transparent 100%);border-bottom:1px solid #111;padding:48px 24px 40px;}
        .page-hero-inner{max-width:1280px;margin:0 auto;}
        .page-title{font-size:clamp(28px,4vw,42px);font-weight:900;letter-spacing:-1.5px;margin-bottom:8px;}
        .page-sub{color:#555;font-size:15px;}
        .main{max-width:1280px;margin:0 auto;padding:32px 24px;}
        .toolbar{display:flex;gap:12px;margin-bottom:28px;flex-wrap:wrap;align-items:center;}
        .search-input{flex:1;min-width:200px;padding:10px 16px;border-radius:10px;border:1px solid #1e1e1e;background:#0d0d0d;color:#fff;font-size:14px;font-family:inherit;outline:none;}
        .search-input:focus{border-color:#333;}
        .cat-btn{padding:8px 16px;border-radius:8px;border:1px solid #1e1e1e;background:transparent;color:#555;font-size:12px;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:inherit;}
        .cat-btn.active{background:#8b5cf6;border-color:#8b5cf6;color:#fff;}
        .news-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:20px;}
        .news-card{background:#0a0a0a;border:1px solid #141414;border-radius:20px;padding:28px;transition:border-color .2s,transform .2s;cursor:pointer;display:flex;flex-direction:column;gap:14px;}
        .news-card:hover{border-color:#222;transform:translateY(-3px);}
        .news-meta{display:flex;align-items:center;justify-content:space-between;}
        .news-tag{font-size:11px;font-weight:700;padding:4px 10px;border-radius:6px;background:rgba(255,255,255,.06);}
        .news-time{font-size:11px;color:#444;}
        .news-title{font-size:16px;font-weight:700;line-height:1.5;color:#ddd;transition:color .2s;}
        .news-card:hover .news-title{color:#fff;}
        .news-summary{font-size:13px;color:#555;line-height:1.7;}
        .news-footer{display:flex;align-items:center;justify-content:space-between;margin-top:auto;}
        .news-source{font-size:12px;font-weight:600;color:#444;}
        .read-more{font-size:12px;color:#666;transition:color .2s;} .news-card:hover .read-more{color:#a78bfa;}
        @media(max-width:768px){.nav-links{display:none;} .mobile-menu-btn{display:block;} .news-grid{grid-template-columns:1fr;}}
      `}</style>

      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo"><div className="logo-icon">⬡</div>NodeVault</Link>
          <div className="nav-links">
            {NAV_LINKS.map(l => <Link key={l.label} href={l.href} className={`nav-link${l.href === "/news" ? " active" : ""}`}>{l.label}</Link>)}
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
          <div className="page-title">Crypto News</div>
          <div className="page-sub">Breaking stories from across the blockchain ecosystem</div>
        </div>
      </div>

      <div className="main">
        <div className="toolbar">
          <input className="search-input" placeholder="Search news..." value={search} onChange={e => setSearch(e.target.value)} />
          {CATEGORIES.map(c => <button key={c} className={`cat-btn${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>{c}</button>)}
        </div>
        <div className="news-grid">
          {filtered.map((n, i) => (
            <div key={i} className="news-card">
              <div className="news-meta">
                <span className="news-tag" style={{ color: n.color }}>{n.tag}</span>
                <span className="news-time">{n.time}</span>
              </div>
              <div className="news-title">{n.title}</div>
              <div className="news-summary">{n.summary}</div>
              <div className="news-footer">
                <span className="news-source">📰 {n.source}</span>
                <span className="read-more">Read more →</span>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: "80px 0", color: "#444" }}>No articles found for "{search}"</div>}
      </div>
    </div>
  );
}
