"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface CoinPrice {
  id: string;
  name: string;
  symbol: string;
  priceUsd: number;
  change24h: number;
  lastUpdated: string;
  source: string;
  alertStatus: "normal" | "alert";
}

interface ConsoleLog {
  id: string;
  timestamp: string;
  type: "info" | "warn" | "error" | "success";
  message: string;
}

interface MissionControlDashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
    id?: string | null;
  } | null;
}

export default function MissionControlDashboard({ user }: MissionControlDashboardProps) {
  const [prices, setPrices] = useState<CoinPrice[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<any>(null);

  // Console logs & Terminal
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Tutorial state
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);

  // Helper to add logs to the Sentry console
  const addLog = (type: "info" | "warn" | "error" | "success", message: string) => {
    const newLog: ConsoleLog = {
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => [...prev.slice(-49), newLog]);
  };

  // Load Watchlist from LocalStorage
  const loadWatchlist = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sentry_watchlist");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setWatchlist(parsed);
            return parsed;
          }
        } catch { }
      }
      // Initialize defaults
      const defaults = ["bitcoin", "ethereum", "solana"];
      localStorage.setItem("sentry_watchlist", JSON.stringify(defaults));
      setWatchlist(defaults);
      return defaults;
    }
    return [];
  };

  // Fetch prices from engine and filter by watchlist
  const fetchPrices = async (activeWatchlist: string[]) => {
    try {
      const res = await fetch(`http://localhost:3001/api/prices?_t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Surveillance engine offline");
      const json = await res.json();

      if (json.success) {
        const data: CoinPrice[] = json.data;
        setPrices(data);
        setError(null);

        // Check for active alerts and log them
        data.forEach(coin => {
          if (activeWatchlist.includes(coin.id)) {
            if (coin.alertStatus === "alert") {
              addLog("error", `ALERT: Sudden flash crash detected on ${coin.name}! Price dropped below threshold.`);
            }
          }
        });
      }
    } catch (err: any) {
      setError("Surveillance engine is unreachable. Running local sub-simulation.");

      // Local simulation walk for offline state
      setPrices((prev) => {
        const base: CoinPrice[] = prev.length > 0 ? prev : [
          { id: "bitcoin", name: "Bitcoin", symbol: "btc", priceUsd: 68500.00, change24h: 1.25, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
          { id: "ethereum", name: "Ethereum", symbol: "eth", priceUsd: 3850.00, change24h: -0.45, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
          { id: "solana", name: "Solana", symbol: "sol", priceUsd: 175.25, change24h: 4.82, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
          { id: "binancecoin", name: "BNB", symbol: "bnb", priceUsd: 590.15, change24h: 0.12, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
          { id: "ripple", name: "XRP", symbol: "xrp", priceUsd: 0.52, change24h: -1.15, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
          { id: "cardano", name: "Cardano", symbol: "ada", priceUsd: 0.46, change24h: -2.31, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
          { id: "dogecoin", name: "Dogecoin", symbol: "doge", priceUsd: 0.145, change24h: 3.42, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
          { id: "polygon-ecosystem-token", name: "Polygon", symbol: "pol", priceUsd: 0.42, change24h: -1.88, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" }
        ];

        return base.map(coin => {
          if (!activeWatchlist.includes(coin.id)) return coin;

          // Occasionally simulate a flash crash drop in offline mode for visual feedback
          const isCrash = Math.random() < 0.05;
          const drift = isCrash ? -0.025 : (Math.random() - 0.5) * 0.003;
          const newPrice = coin.priceUsd * (1 + drift);
          const isAlert = isCrash || (drift <= -0.02);

          if (isAlert) {
            addLog("error", `ALERT (SIMULATED): Flash crash detected on ${coin.name}! Drop: ${(drift * 100).toFixed(2)}%`);
          }

          return {
            ...coin,
            priceUsd: parseFloat(newPrice.toFixed(coin.priceUsd > 100 ? 2 : 4)),
            alertStatus: (isAlert ? "alert" : "normal") as "normal" | "alert",
            source: "mock",
            lastUpdated: new Date().toISOString()
          };
        });
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch(`http://localhost:3001/health?_t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const health = await res.json();
        setEngineStatus(health);
        addLog("success", `HEALTH CHECK: Status ${health.status} | Uptime: ${health.uptime}`);
      }
    } catch {
      setEngineStatus(null);
      addLog("warn", "SENTRY ENGINE OFFLINE: Local monitor loop activated.");
    }
  };

  // Initial load
  useEffect(() => {
    const activeWL = loadWatchlist();
    addLog("info", "CRYPTOSENTRY COMMAND HUDS INITIALIZING...");
    addLog("info", `LOADED WATCHLIST: Monitoring ${activeWL.join(", ")}`);

    fetchPrices(activeWL);
    fetchHealth();

    // Set polling timers
    const interval = setInterval(() => {
      fetchPrices(loadWatchlist());
    }, 5000);

    const healthInterval = setInterval(() => {
      fetchHealth();
    }, 15000);

    // Tutorial auto-start check
    const tutorialDone = localStorage.getItem("sentry_tutorial_completed");
    if (tutorialDone !== "true") {
      setTutorialStep(1);
    }

    return () => {
      clearInterval(interval);
      clearInterval(healthInterval);
    };
  }, []);

  // Scroll terminal to bottom
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const startTutorial = () => {
    setTutorialStep(1);
  };

  const nextTutorial = () => {
    if (tutorialStep !== null) {
      if (tutorialStep < 4) {
        setTutorialStep(tutorialStep + 1);
      } else {
        localStorage.setItem("sentry_tutorial_completed", "true");
        setTutorialStep(null);
        addLog("success", "SYSTEM TUTORIAL COMPLETED: Guard status active.");
      }
    }
  };

  const skipTutorial = () => {
    localStorage.setItem("sentry_tutorial_completed", "true");
    setTutorialStep(null);
    addLog("info", "Tutorial skipped by user.");
  };

  // Format Helper
  const formatUSD = (val: number, isHighValue: boolean) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: isHighValue ? 2 : 4,
      maximumFractionDigits: isHighValue ? 2 : 4
    }).format(val);
  };

  const watchedPrices = prices.filter((coin) => watchlist.includes(coin.id));

  return (
    <div className="relative space-y-8 min-h-screen text-slate-100 font-sans pb-12">
      {/* Cyberpunk Grid/Scanning Overlay line */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.08),rgba(255,255,255,0))] -z-10 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-pulse pointer-events-none" />

      {/* Onboarding Tutorial HUD Overlay */}
      {tutorialStep !== null && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.3)] max-w-lg w-full rounded-2xl overflow-hidden p-6 relative">
            <div className="absolute top-0 right-0 p-2 text-xs font-mono text-cyan-500/50">
              HUD GUIDE v1.0
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-500 flex items-center justify-center font-bold text-cyan-400">
                0{tutorialStep}
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
                {tutorialStep === 1 && "1. Sentry Guard Core"}
                {tutorialStep === 2 && "2. Live Surveillance Cards"}
                {tutorialStep === 3 && "3. Command Sentry Log"}
                {tutorialStep === 4 && "4. Custom Watchlist Tuning"}
              </h2>
            </div>

            <div className="text-slate-300 text-sm leading-relaxed mb-6 font-sans">
              {tutorialStep === 1 && (
                <p>
                  Welcome to <span className="text-cyan-400 font-bold">Crypto Sentry</span>. Unlike typical market apps, this system operates a 24/7 background guard loop that queries price data every <span className="text-indigo-400 font-semibold">30 seconds</span> to detect high-speed drops and crash deviations.
                </p>
              )}
              {tutorialStep === 2 && (
                <p>
                  Under <span className="text-cyan-400 font-bold">Live Surveillance Targets</span>, you'll see glowing status cards. When a crash is detected, the card flashes <span className="text-rose-500 font-semibold">Neon Red</span> and raises an alert. Otherwise, the status badge remains a healthy <span className="text-emerald-500 font-semibold">Green (Normal)</span>.
                </p>
              )}
              {tutorialStep === 3 && (
                <p>
                  The <span className="text-cyan-400 font-bold">Live Operation Command Console</span> trace-logs every background scheduler query, health diagnostic, and rate-limit warning. Any triggered alert is immediately highlighted in bright red.
                </p>
              )}
              {tutorialStep === 4 && (
                <p>
                  To optimize memory and watch specific targets, navigate to the <span className="text-cyan-400 font-bold">Watchlist Tab</span>. There, you can toggle all 8 major assets on or off. Only watchlisted assets are actively analyzed and displayed on this dashboard.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                onClick={skipTutorial}
                className="text-xs text-slate-500 hover:text-slate-300 transition uppercase font-semibold font-mono"
              >
                Skip HUD Onboarding
              </button>

              <button
                onClick={nextTutorial}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition duration-200 uppercase font-mono"
              >
                {tutorialStep < 4 ? "Next HUD Stage →" : "Authorize Guard Loop"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Command HUD Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-lg relative overflow-hidden">
        <div className="absolute -left-16 -top-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-[10px] font-semibold text-cyan-400 uppercase tracking-widest font-mono">
            🛰️ SENTRY HUB OPERATIONAL
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            MISSION CONTROL
          </h1>
          <p className="text-xs text-slate-400 max-w-md">
            Continuous threat detection: Monitoring active assets for rapid flash deviations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 font-mono text-xs">
          <button
            onClick={startTutorial}
            className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-950/30 text-slate-300 hover:text-white rounded-xl transition duration-150 flex items-center gap-1.5"
          >
            <span>📖</span> Launch Tutorial
          </button>

          <Link
            href="/watchlist"
            className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-950/30 text-slate-300 hover:text-white rounded-xl transition duration-150 flex items-center gap-1.5"
          >
            <span>⚙️</span> Tune Watchlist ({watchlist.length}/8)
          </Link>

          {engineStatus ? (
            <div className="px-4 py-2 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ONLINE</span>
            </div>
          ) : (
            <div className="px-4 py-2 bg-rose-950/30 border border-rose-500/30 text-rose-400 rounded-xl flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <span>SUB-SIM ACTIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Monitored Assets */}
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <h2 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-widest">
            Surveillance Grid
          </h2>
          <span className="text-[10px] text-slate-500 font-mono">
            Refreshes automatically (5s sync)
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : watchedPrices.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/20 border border-dashed border-slate-850 rounded-3xl space-y-4">
            <div className="text-4xl">📭</div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-300">Surveillance Watchlist Empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No favorite assets are selected for monitoring. Tune your watchlist to initialize sentry guards.
              </p>
            </div>
            <Link
              href="/watchlist"
              className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg transition"
            >
              Add Coins to Watchlist
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {watchedPrices.map((coin) => {
              const isAlert = coin.alertStatus === "alert";
              const isPositive = coin.change24h >= 0;

              // Cyberpunk color configurations
              const cardBorderClass = isAlert
                ? "border-rose-500/70 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-rose-950/10"
                : "border-slate-800 hover:border-slate-700 bg-slate-900/40";
              const glowClass = isAlert
                ? "bg-rose-500/10"
                : "bg-indigo-500/5";
              const statusBadgeClass = isAlert
                ? "bg-rose-500/20 border-rose-500/30 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)]"
                : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400";
              const statusText = isAlert ? "⚠️ ALERT ACTIVE" : "🟢 NORMAL";

              return (
                <div
                  key={coin.id}
                  className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 ${cardBorderClass}`}
                >
                  {/* Dynamic background glow */}
                  <div className={`absolute -right-12 -top-12 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-all duration-300 ${glowClass}`} />

                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-bold text-slate-100 font-sans tracking-wide">{coin.name}</h3>
                      <span className="text-xs uppercase text-slate-500 font-mono tracking-wider">
                        {coin.symbol}/USD
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border font-mono tracking-wider ${statusBadgeClass}`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider font-mono">
                      Current Price
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold font-mono tracking-tight text-white">
                        {formatUSD(coin.priceUsd, coin.priceUsd > 100)}
                      </span>
                      <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                        {isPositive ? "+" : ""}{coin.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-800/40 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span>FEED: {coin.source === 'coingecko' ? 'CoinGecko' : coin.source === 'fallback' ? 'API Fallback' : 'Sentry Sub-Sim'}</span>
                    <span>{new Date(coin.lastUpdated).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sentry Command Log Terminal */}
      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 shadow-inner space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-cyan-400 uppercase tracking-widest text-[10px]">
              Sentry Log Feed
            </span>
          </div>

          <button
            onClick={() => setLogs([])}
            className="text-[10px] text-slate-500 hover:text-slate-300 transition uppercase"
          >
            Clear Terminal
          </button>
        </div>

        <div className="h-44 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 pr-2">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">No console entries. Hud operational.</div>
          ) : (
            logs.map((log) => {
              let logColorClass = "text-slate-400";
              if (log.type === "error") logColorClass = "text-rose-400 font-bold bg-rose-500/5 px-1 rounded border border-rose-500/10";
              if (log.type === "warn") logColorClass = "text-amber-400";
              if (log.type === "success") logColorClass = "text-emerald-400";

              return (
                <div key={log.id} className={`flex items-start gap-2 ${logColorClass}`}>
                  <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                  <span>{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
}
