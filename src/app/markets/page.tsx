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

const CATEGORIES = ["All", "Layer 1", "Layer 2", "DeFi", "AI", "Stablecoins", "Meme"];

interface Coin { id: string; symbol: string; name: string; current_price: number; price_change_percentage_24h: number; price_change_percentage_7d_in_currency?: number; market_cap: number; total_volume: number; image: string; market_cap_rank: number; }

const FALLBACK: Coin[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", current_price: 67420, price_change_percentage_24h: 2.14, market_cap: 1320000000000, total_volume: 38000000000, image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png", market_cap_rank: 1 },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", current_price: 3510, price_change_percentage_24h: 1.87, market_cap: 422000000000, total_volume: 18000000000, image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png", market_cap_rank: 2 },
  { id: "solana", symbol: "SOL", name: "Solana", current_price: 172, price_change_percentage_24h: 4.23, market_cap: 78000000000, total_volume: 4200000000, image: "https://assets.coingecko.com/coins/images/4128/small/solana.png", market_cap_rank: 5 },
  { id: "binancecoin", symbol: "BNB", name: "BNB", current_price: 594, price_change_percentage_24h: -0.81, market_cap: 87000000000, total_volume: 2100000000, image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png", market_cap_rank: 4 },
  { id: "cardano", symbol: "ADA", name: "Cardano", current_price: 0.52, price_change_percentage_24h: 1.2, market_cap: 18000000000, total_volume: 620000000, image: "https://assets.coingecko.com/coins/images/975/small/cardano.png", market_cap_rank: 9 },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", current_price: 38, price_change_percentage_24h: 3.1, market_cap: 16000000000, total_volume: 880000000, image: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png", market_cap_rank: 10 },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", current_price: 14.2, price_change_percentage_24h: 1.5, market_cap: 8500000000, total_volume: 460000000, image: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png", market_cap_rank: 13 },
  { id: "polygon", symbol: "MATIC", name: "Polygon", current_price: 0.71, price_change_percentage_24h: -1.3, market_cap: 7100000000, total_volume: 390000000, image: "https://assets.coingecko.com/coins/images/4713/small/polygon.png", market_cap_rank: 14 },
  { id: "near", symbol: "NEAR", name: "NEAR Protocol", current_price: 7.1, price_change_percentage_24h: 5.2, market_cap: 7800000000, total_volume: 560000000, image: "https://assets.coingecko.com/coins/images/10365/small/near.jpg", market_cap_rank: 16 },
  { id: "arbitrum", symbol: "ARB", name: "Arbitrum", current_price: 1.12, price_change_percentage_24h: 2.8, market_cap: 4500000000, total_volume: 310000000, image: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg", market_cap_rank: 20 },
  { id: "optimism", symbol: "OP", name: "Optimism", current_price: 2.8, price_change_percentage_24h: 3.9, market_cap: 3200000000, total_volume: 280000000, image: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png", market_cap_rank: 22 },
  { id: "sui", symbol: "SUI", name: "Sui", current_price: 1.45, price_change_percentage_24h: 6.4, market_cap: 4100000000, total_volume: 420000000, image: "https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg", market_cap_rank: 24 },
];

const fmt = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${n.toLocaleString()}`;
const fmtPrice = (n: number) => n < 1 ? `$${n.toFixed(4)}` : `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const pct = (n: number) => `${n >= 0 ? "+" : ""}${n?.toFixed(2)}%`;

export default function MarketsPage() {
  const [coins, setCoins] = useState<Coin[]>(FALLBACK);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "price" | "change" | "mcap">("rank");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [category, setCategory] = useState("All");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&price_change_percentage=7d")
      .then(r => r.json()).then(setCoins).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortBy(col); setSortDir(1); }
  };

  const filtered = coins
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const map = { rank: "market_cap_rank", price: "current_price", change: "price_change_percentage_24h", mcap: "market_cap" } as const;
      const k = map[sortBy] as keyof Coin;
      return ((a[k] as number) - (b[k] as number)) * sortDir;
    });

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
        .toolbar{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;align-items:center;}
        .search-input{flex:1;min-width:200px;padding:10px 16px;border-radius:10px;border:1px solid #1e1e1e;background:#0d0d0d;color:#fff;font-size:14px;font-family:inherit;outline:none;}
        .search-input:focus{border-color:#333;}
        .cat-btn{padding:8px 16px;border-radius:8px;border:1px solid #1e1e1e;background:transparent;color:#666;font-size:13px;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:inherit;}
        .cat-btn.active{background:#8b5cf6;border-color:#8b5cf6;color:#fff;}
        .table-wrap{background:#0a0a0a;border:1px solid #141414;border-radius:20px;overflow:hidden;}
        table{width:100%;border-collapse:collapse;}
        thead tr{background:#0d0d0d;border-bottom:1px solid #141414;}
        th{padding:14px 16px;text-align:left;font-size:12px;font-weight:600;color:#444;text-transform:uppercase;letter-spacing:.5px;cursor:pointer;user-select:none;white-space:nowrap;}
        th:hover{color:#888;}
        th.sorted{color:#8b5cf6;}
        td{padding:14px 16px;font-size:14px;border-bottom:1px solid #0f0f0f;}
        tr:last-child td{border-bottom:none;}
        tr:hover td{background:#0c0c0c;}
        .coin-cell{display:flex;align-items:center;gap:12px;}
        .coin-img{width:32px;height:32px;border-radius:50%;}
        .coin-name{font-weight:600;font-size:14px;}
        .coin-sym{font-size:12px;color:#444;text-transform:uppercase;}
        .up{color:#22c55e;} .down{color:#ef4444;}
        .connect-btn{padding:7px 14px;border-radius:8px;border:none;background:rgba(139,92,246,.15);color:#a78bfa;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .2s;}
        .connect-btn:hover{background:rgba(139,92,246,.3);}
        @media(max-width:768px){.nav-links{display:none;} .mobile-menu-btn{display:block;} th.hide-mobile,td.hide-mobile{display:none;}}
        .footer{border-top:1px solid #111;padding:48px 24px;}
        .footer-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:24px;}
        .footer-left{font-size:13px;color:#444;}
        .footer-links{display:flex;gap:24px;}
        .footer-link{font-size:13px;color:#444;transition:color .2s;} .footer-link:hover{color:#fff;}
      `}</style>

      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo"><div className="logo-icon">⬡</div>NodeVault</Link>
          <div className="nav-links">
            {NAV_LINKS.map(l => <Link key={l.label} href={l.href} className={`nav-link${l.href === "/markets" ? " active" : ""}`}>{l.label}</Link>)}
          </div>
          <Link href="/connect"><button className="btn-primary">Import Wallet →</button></Link>
          <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>☰</button>
        </div>
        {mobileMenu && <div style={{ background: "#0a0a0a", borderTop: "1px solid #111", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {NAV_LINKS.map(l => <Link key={l.label} href={l.href} style={{ fontSize: 15, color: "#888" }}>{l.label}</Link>)}
        </div>}
      </nav>

      {/* Header */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-title">Crypto Markets</div>
          <div className="page-sub">Live prices for {coins.length}+ assets · Updated every 30 seconds</div>
        </div>
      </div>

      {/* Content */}
      <div className="main">
        <div className="toolbar">
          <input className="search-input" placeholder="Search coins..." value={search} onChange={e => setSearch(e.target.value)} />
          {CATEGORIES.map(c => <button key={c} className={`cat-btn${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>{c}</button>)}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th onClick={() => sort("rank")} className={sortBy === "rank" ? "sorted" : ""}>#</th>
                <th>Name</th>
                <th onClick={() => sort("price")} className={sortBy === "price" ? "sorted" : ""}>Price ↕</th>
                <th onClick={() => sort("change")} className={`${sortBy === "change" ? "sorted" : ""} hide-mobile`}>24h ↕</th>
                <th className="hide-mobile">7d</th>
                <th onClick={() => sort("mcap")} className={`${sortBy === "mcap" ? "sorted" : ""} hide-mobile`}>Market Cap ↕</th>
                <th className="hide-mobile">Volume 24h</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ color: "#444", fontWeight: 600 }}>{c.market_cap_rank}</td>
                  <td>
                    <div className="coin-cell">
                      <img src={c.image} className="coin-img" alt={c.name} />
                      <div><div className="coin-name">{c.name}</div><div className="coin-sym">{c.symbol}</div></div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{fmtPrice(c.current_price)}</td>
                  <td className={`hide-mobile ${c.price_change_percentage_24h >= 0 ? "up" : "down"}`}>{pct(c.price_change_percentage_24h)}</td>
                  <td className={`hide-mobile ${(c.price_change_percentage_7d_in_currency ?? 0) >= 0 ? "up" : "down"}`}>{c.price_change_percentage_7d_in_currency ? pct(c.price_change_percentage_7d_in_currency) : "—"}</td>
                  <td className="hide-mobile" style={{ color: "#888" }}>{fmt(c.market_cap)}</td>
                  <td className="hide-mobile" style={{ color: "#555" }}>{fmt(c.total_volume)}</td>
                  <td><Link href="/connect"><button className="connect-btn">Connect</button></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
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
