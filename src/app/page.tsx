"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CoinData { id: string; symbol: string; name: string; current_price: number; price_change_percentage_24h: number; market_cap: number; image: string; }
interface NewsItem { title: string; url: string; source: string; time: string; }

// ─── Static news (fallback / demo) ────────────────────────────────────────────
const DEMO_NEWS: NewsItem[] = [
  { title: "Bitcoin breaks $70K resistance amid institutional buying surge", url: "#", source: "CoinDesk", time: "2h ago" },
  { title: "Ethereum ETF inflows hit record $1.2B in single week", url: "#", source: "CoinTelegraph", time: "3h ago" },
  { title: "Solana DeFi TVL surpasses $8B as ecosystem expands", url: "#", source: "The Block", time: "5h ago" },
  { title: "SEC approves spot Bitcoin ETF options trading on major exchanges", url: "#", source: "Bloomberg Crypto", time: "6h ago" },
  { title: "Binance Smart Chain records 5M daily transactions milestone", url: "#", source: "CryptoSlate", time: "8h ago" },
  { title: "Chainlink CCIP adoption grows with 50 new protocol integrations", url: "#", source: "Decrypt", time: "10h ago" },
];

const PARTNERS = [
  { name: "Ethereum", color: "#627EEA" },
  { name: "Solana", color: "#9945FF" },
  { name: "BNB Chain", color: "#F0B90B" },
  { name: "Polygon", color: "#8247E5" },
  { name: "Avalanche", color: "#E84142" },
  { name: "Arbitrum", color: "#28A0F0" },
];

const NAV_LINKS = [
  { label: "Markets", href: "/markets" },
  { label: "News", href: "/news" },
  { label: "DeFi", href: "/defi" },
  { label: "NFTs", href: "/nfts" },
  { label: "Learn", href: "/learn" },
];

export default function LandingPage() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [tickerCoins, setTickerCoins] = useState<CoinData[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Fetch live prices from CoinGecko
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,cardano,avalanche-2,chainlink,polygon&order=market_cap_desc&sparkline=false"
        );
        if (res.ok) {
          const data = await res.json();
          setCoins(data);
          setTickerCoins([...data, ...data]);
        }
      } catch { /* use static */ }
    };
    fetchPrices();
    const id = setInterval(fetchPrices, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fmt = (n: number) =>
    n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(0)}M` : `$${n.toLocaleString()}`;
  const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

  // Fallback coin cards
  const FALLBACK_COINS = [
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin", current_price: 67420, price_change_percentage_24h: 2.14, market_cap: 1320000000000, image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
    { id: "ethereum", symbol: "ETH", name: "Ethereum", current_price: 3510, price_change_percentage_24h: 1.87, market_cap: 422000000000, image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
    { id: "solana", symbol: "SOL", name: "Solana", current_price: 172, price_change_percentage_24h: 4.23, market_cap: 78000000000, image: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
    { id: "binancecoin", symbol: "BNB", name: "BNB", current_price: 594, price_change_percentage_24h: -0.81, market_cap: 87000000000, image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
    { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", current_price: 38, price_change_percentage_24h: 3.1, market_cap: 16000000000, image: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png" },
    { id: "chainlink", symbol: "LINK", name: "Chainlink", current_price: 14.2, price_change_percentage_24h: 1.5, market_cap: 8500000000, image: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png" },
  ];

  const displayCoins = coins.length > 0 ? coins : FALLBACK_COINS;
  const displayTicker = tickerCoins.length > 0 ? tickerCoins : [...FALLBACK_COINS, ...FALLBACK_COINS];

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        a{text-decoration:none;color:inherit;}

        /* ── Ticker ── */
        .ticker-wrap{overflow:hidden;background:#0a0a0a;border-bottom:1px solid #1a1a1a;height:36px;display:flex;align-items:center;}
        .ticker-track{display:flex;gap:48px;animation:tickerScroll 40s linear infinite;white-space:nowrap;padding-left:100%;}
        @keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .ticker-item{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500;}
        .ticker-up{color:#22c55e;} .ticker-down{color:#ef4444;}

        /* ── Nav ── */
        .nav{position:fixed;top:36px;left:0;right:0;z-index:100;transition:all .3s;}
        .nav.scrolled{background:rgba(5,5,5,0.95);backdrop-filter:blur(16px);border-bottom:1px solid #111;top:0;}
        .nav-inner{max-width:1200px;margin:0 auto;padding:0 24px;height:68px;display:flex;align-items:center;justify-content:space-between;}
        .nav-logo{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:800;letter-spacing:-0.5px;}
        .logo-icon{width:32px;height:32px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;}
        .nav-links{display:flex;gap:32px;} 
        .nav-link{font-size:14px;font-weight:500;color:#888;transition:color .2s;}
        .nav-link:hover{color:#fff;}
        .nav-actions{display:flex;gap:12px;align-items:center;}
        .btn-ghost{padding:8px 16px;border-radius:10px;border:1px solid #222;background:none;color:#ccc;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit;}
        .btn-ghost:hover{border-color:#444;color:#fff;}
        .btn-primary{padding:10px 20px;border-radius:12px;border:none;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity .2s;white-space:nowrap;}
        .btn-primary:hover{opacity:.9;}
        .mobile-menu-btn{display:none;background:none;border:1px solid #222;color:#fff;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:16px;}

        /* ── Hero ── */
        .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:120px 24px 80px;text-align:center;position:relative;overflow:hidden;}
        .hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 20%,rgba(139,92,246,.15) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 70%,rgba(6,182,212,.08) 0%,transparent 60%);pointer-events:none;}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:99px;background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.25);font-size:12px;font-weight:600;color:#a78bfa;margin-bottom:32px;letter-spacing:.5px;}
        .badge-dot{width:6px;height:6px;border-radius:50%;background:#8b5cf6;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}
        .hero-h1{font-size:clamp(40px,7vw,88px);font-weight:900;letter-spacing:-3px;line-height:1.0;margin-bottom:24px;background:linear-gradient(135deg,#fff 0%,#a78bfa 50%,#22d3ee 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .hero-sub{font-size:clamp(16px,2vw,20px);color:#666;max-width:560px;line-height:1.6;margin-bottom:48px;}
        .hero-ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}
        .btn-hero-primary{padding:16px 32px;border-radius:14px;border:none;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;transition:transform .2s,opacity .2s;}
        .btn-hero-primary:hover{transform:translateY(-2px);opacity:.9;}
        .btn-hero-secondary{padding:16px 32px;border-radius:14px;border:1px solid #333;background:rgba(255,255,255,.03);color:#ccc;font-size:16px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;}
        .btn-hero-secondary:hover{border-color:#555;color:#fff;background:rgba(255,255,255,.06);}
        .hero-stats{display:flex;gap:48px;justify-content:center;margin-top:64px;flex-wrap:wrap;}
        .stat{text-align:center;}
        .stat-num{font-size:28px;font-weight:800;background:linear-gradient(135deg,#fff,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .stat-label{font-size:13px;color:#555;margin-top:4px;}

        /* ── Section ── */
        .section{max-width:1200px;margin:0 auto;padding:80px 24px;}
        .section-title{font-size:clamp(24px,3vw,36px);font-weight:800;letter-spacing:-1px;margin-bottom:8px;}
        .section-sub{color:#555;font-size:15px;margin-bottom:40px;}
        .section-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:40px;}
        .see-all{font-size:13px;color:#555;transition:color .2s;cursor:pointer;} .see-all:hover{color:#a78bfa;}

        /* ── Coin Cards ── */
        .coins-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;}
        .coin-card{background:#0d0d0d;border:1px solid #1a1a1a;border-radius:20px;padding:24px;transition:border-color .2s,transform .2s;cursor:pointer;position:relative;overflow:hidden;}
        .coin-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(139,92,246,.04),transparent);opacity:0;transition:opacity .3s;}
        .coin-card:hover{border-color:#333;transform:translateY(-4px);}
        .coin-card:hover::before{opacity:1;}
        .coin-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
        .coin-info{display:flex;align-items:center;gap:12px;}
        .coin-img{width:40px;height:40px;border-radius:50%;background:#111;}
        .coin-name{font-size:15px;font-weight:700;}
        .coin-symbol{font-size:12px;color:#555;text-transform:uppercase;margin-top:2px;}
        .coin-badge-up{background:rgba(34,197,94,.1);color:#22c55e;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:700;}
        .coin-badge-down{background:rgba(239,68,68,.1);color:#ef4444;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:700;}
        .coin-price{font-size:26px;font-weight:800;letter-spacing:-1px;margin-bottom:4px;}
        .coin-mcap{font-size:12px;color:#444;}

        /* ── News ── */
        .news-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px;}
        .news-card{background:#0d0d0d;border:1px solid #1a1a1a;border-radius:20px;padding:28px;transition:border-color .2s,transform .2s;}
        .news-card:hover{border-color:#2a2a2a;transform:translateY(-3px);}
        .news-source{display:flex;align-items:center;gap:8px;margin-bottom:16px;}
        .news-dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#06b6d4);}
        .news-source-name{font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;}
        .news-time{font-size:11px;color:#444;margin-left:auto;}
        .news-title{font-size:15px;font-weight:600;line-height:1.5;color:#ccc;transition:color .2s;}
        .news-card:hover .news-title{color:#fff;}
        .news-arrow{margin-top:16px;font-size:12px;color:#444;transition:color .2s;} .news-card:hover .news-arrow{color:#a78bfa;}

        /* ── Partners ── */
        .partners-section{border-top:1px solid #111;border-bottom:1px solid #111;padding:60px 24px;}
        .partners-label{text-align:center;font-size:12px;color:#444;letter-spacing:2px;text-transform:uppercase;margin-bottom:40px;}
        .partners-row{display:flex;justify-content:center;align-items:center;gap:48px;flex-wrap:wrap;}
        .partner-item{display:flex;align-items:center;gap:10px;opacity:.4;transition:opacity .2s;cursor:default;}
        .partner-item:hover{opacity:.8;}
        .partner-dot{width:10px;height:10px;border-radius:50%;}
        .partner-name{font-size:15px;font-weight:700;color:#fff;}

        /* ── CTA Banner ── */
        .cta-banner{background:linear-gradient(135deg,rgba(139,92,246,.12),rgba(6,182,212,.08));border:1px solid rgba(139,92,246,.2);border-radius:32px;padding:64px;text-align:center;position:relative;overflow:hidden;}
        .cta-banner::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 50% 50%,rgba(139,92,246,.08),transparent);pointer-events:none;}
        .cta-h2{font-size:clamp(28px,4vw,48px);font-weight:900;letter-spacing:-2px;margin-bottom:16px;}
        .cta-sub{font-size:16px;color:#666;max-width:480px;margin:0 auto 40px;line-height:1.6;}

        /* ── Footer ── */
        .footer{border-top:1px solid #111;padding:48px 24px;}
        .footer-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:24px;}
        .footer-left{font-size:13px;color:#444;}
        .footer-links{display:flex;gap:24px;}
        .footer-link{font-size:13px;color:#444;transition:color .2s;} .footer-link:hover{color:#fff;}

        /* ── Mobile ── */
        @media(max-width:768px){
          .nav-links,.nav-actions .btn-ghost{display:none;}
          .mobile-menu-btn{display:block;}
          .hero-stats{gap:24px;}
          .cta-banner{padding:40px 24px;}
          .partners-row{gap:24px;}
          .section-header{flex-direction:column;align-items:flex-start;gap:8px;}
        }
      `}</style>

      {/* ── LIVE TICKER ──────────────────────────────────────────── */}
      <div className="ticker-wrap">
        <div className="ticker-track" ref={tickerRef}>
          {displayTicker.map((c, i) => (
            <span key={`${c.id}-${i}`} className="ticker-item">
              <img src={c.image} width={16} height={16} style={{ borderRadius: "50%" }} alt="" />
              <span style={{ color: "#888" }}>{c.symbol?.toUpperCase()}</span>
              <span style={{ color: "#fff", fontWeight: 600 }}>${c.current_price?.toLocaleString()}</span>
              <span className={c.price_change_percentage_24h >= 0 ? "ticker-up" : "ticker-down"}>
                {pct(c.price_change_percentage_24h)}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ── NAVIGATION ───────────────────────────────────────────── */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="logo-icon">⬡</div>
            NodeVault
          </Link>

          <div className="nav-links">
            {NAV_LINKS.map(l => (
              <Link key={l.label} href={l.href} className="nav-link">{l.label}</Link>
            ))}
          </div>

          <div className="nav-actions">
            <Link href="/connect">
              <button className="btn-primary">Import Wallet →</button>
            </Link>
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>☰</button>
        </div>
        {mobileMenu && (
          <div style={{ background: "#0a0a0a", borderTop: "1px solid #111", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {NAV_LINKS.map(l => <Link key={l.label} href={l.href} style={{ fontSize: 15, color: "#888" }}>{l.label}</Link>)}
            <Link href="/connect"><button className="btn-primary" style={{ width: "100%", padding: "14px" }}>Import Wallet →</button></Link>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-badge">
          <span className="badge-dot" />
          Multi-chain · Non-custodial · Decentralized
        </div>
        <h1 className="hero-h1">Your Gateway to<br />Web3 Finance</h1>
        <p className="hero-sub">
          Connect any wallet, track your portfolio in real-time, and access the full spectrum of decentralized finance — all in one place.
        </p>
        <div className="hero-ctas">
          <Link href="/connect">
            <button className="btn-hero-primary">Import Wallet</button>
          </Link>
          <button className="btn-hero-secondary">Explore Markets</button>
        </div>
        <div className="hero-stats">
          {[["$2.4T", "Total Market Cap"], ["12M+", "Active Wallets"], ["500+", "Supported Tokens"], ["99.9%", "Uptime SLA"]].map(([n, l]) => (
            <div key={l} className="stat">
              <div className="stat-num">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE PRICES ──────────────────────────────────────────── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <div>
            <div className="section-title">Live Markets</div>
            <div className="section-sub">Real-time prices from global exchanges</div>
          </div>
          <span className="see-all">View all markets →</span>
        </div>
        <div className="coins-grid">
          {displayCoins.slice(0, 6).map(c => (
            <div key={c.id} className="coin-card" onClick={() => window.location.href = "/connect"}>
              <div className="coin-top">
                <div className="coin-info">
                  <img src={c.image} className="coin-img" alt={c.name} />
                  <div>
                    <div className="coin-name">{c.name}</div>
                    <div className="coin-symbol">{c.symbol}</div>
                  </div>
                </div>
                <span className={c.price_change_percentage_24h >= 0 ? "coin-badge-up" : "coin-badge-down"}>
                  {pct(c.price_change_percentage_24h)}
                </span>
              </div>
              <div className="coin-price">{fmt(c.current_price)}</div>
              <div className="coin-mcap">Market Cap: {fmt(c.market_cap)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PARTNERS / ECOSYSTEMS ────────────────────────────────── */}
      <div className="partners-section">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="partners-label">Supported Ecosystems</div>
          <div className="partners-row">
            {PARTNERS.map(p => (
              <div key={p.name} className="partner-item">
                <div className="partner-dot" style={{ background: p.color }} />
                <span className="partner-name">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CRYPTO NEWS ──────────────────────────────────────────── */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Crypto News</div>
            <div className="section-sub">Latest from the blockchain ecosystem</div>
          </div>
          <span className="see-all">All news →</span>
        </div>
        <div className="news-grid">
          {DEMO_NEWS.map((n, i) => (
            <a key={i} href={n.url} className="news-card" style={{ display: "block" }}>
              <div className="news-source">
                <div className="news-dot" />
                <span className="news-source-name">{n.source}</span>
                <span className="news-time">{n.time}</span>
              </div>
              <div className="news-title">{n.title}</div>
              <div className="news-arrow">Read more →</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── IMPORT WALLET CTA ────────────────────────────────────── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="cta-banner">
          <h2 className="cta-h2">Ready to connect?</h2>
          <p className="cta-sub">
            Import your existing wallet in seconds. Support for MetaMask, Trust Wallet, Coinbase, Ledger and 50+ more.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
            <Link href="/connect">
              <button className="btn-hero-primary">Import Wallet →</button>
            </Link>
            <button className="btn-hero-secondary">Learn More</button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
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
