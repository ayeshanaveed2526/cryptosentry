"use client";

import { useEffect, useState } from "react";
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

export default function WatchlistPage() {
  const [prices, setPrices] = useState<CoinPrice[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Simulated Chart overlay
  const [chartCoin, setChartCoin] = useState<CoinPrice | null>(null);

  // Load Watchlist from LocalStorage
  const loadWatchlist = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sentry_watchlist");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setWatchlist(parsed);
            return;
          }
        } catch {}
      }
      // Set default
      const defaults = ["bitcoin", "ethereum", "solana"];
      localStorage.setItem("sentry_watchlist", JSON.stringify(defaults));
      setWatchlist(defaults);
    }
  };

  const fetchPrices = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/prices?_t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Offline");
      const json = await res.json();
      if (json.success) {
        setPrices(json.data);
      }
    } catch {
      // Mock Fallbacks if backend is offline
      const mockDefaults: CoinPrice[] = [
        { id: "bitcoin", name: "Bitcoin", symbol: "btc", priceUsd: 68500.00, change24h: 1.25, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
        { id: "ethereum", name: "Ethereum", symbol: "eth", priceUsd: 3850.00, change24h: -0.45, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
        { id: "solana", name: "Solana", symbol: "sol", priceUsd: 175.25, change24h: 4.82, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
        { id: "binancecoin", name: "BNB", symbol: "bnb", priceUsd: 590.15, change24h: 0.12, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
        { id: "ripple", name: "XRP", symbol: "xrp", priceUsd: 0.52, change24h: -1.15, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
        { id: "cardano", name: "Cardano", symbol: "ada", priceUsd: 0.46, change24h: -2.31, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
        { id: "dogecoin", name: "Dogecoin", symbol: "doge", priceUsd: 0.145, change24h: 3.42, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
        { id: "polygon-ecosystem-token", name: "Polygon", symbol: "pol", priceUsd: 0.42, change24h: -1.88, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" }
      ];
      setPrices(mockDefaults);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  // Toggle watchlist logic
  const toggleWatchlist = (coinId: string) => {
    const updated = watchlist.includes(coinId)
      ? watchlist.filter(id => id !== coinId)
      : [...watchlist, coinId];
    
    setWatchlist(updated);
    localStorage.setItem("sentry_watchlist", JSON.stringify(updated));
  };

  const formatUSD = (val: number, isHighValue: boolean) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: isHighValue ? 2 : 4,
      maximumFractionDigits: isHighValue ? 2 : 4
    }).format(val);
  };

  return (
    <div className="relative space-y-8 min-h-screen text-slate-100 font-sans pb-12">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(129,140,248,0.06),rgba(0,0,0,0))] -z-10 pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Watchlist Tuning
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Toggle guards to allocate monitoring resources. Only active coins are monitored closely.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-650 text-white text-xs font-semibold rounded-xl shadow-md transition font-mono uppercase"
        >
          ← Return to HUD
        </Link>
      </div>

      {/* Grid List of All Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse" />
          ))
        ) : (
          prices.map((coin) => {
            const isActive = watchlist.includes(coin.id);
            const isPositive = coin.change24h >= 0;
            
            // Theme mapping
            const borderStyle = isActive
              ? "border-indigo-500/50 shadow-md shadow-indigo-500/5 bg-slate-900/60"
              : "border-slate-850/60 bg-slate-950/20 opacity-60";
            const sentryBadgeClass = isActive
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-slate-800/40 border-slate-800 text-slate-500";
            const toggleColor = isActive ? "bg-indigo-500" : "bg-slate-800";
            const toggleCircleTranslate = isActive ? "translate-x-5" : "translate-x-0";

            return (
              <div
                key={coin.id}
                className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-md transition-all duration-300 ${borderStyle}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-100">{coin.name}</h3>
                    <span className="text-xs uppercase text-slate-500 font-mono tracking-wider">
                      {coin.symbol}/USD
                    </span>
                  </div>

                  {/* Cyberpunk Switch Toggle */}
                  <button
                    onClick={() => toggleWatchlist(coin.id)}
                    className="flex items-center gap-2 group focus:outline-none"
                    title={isActive ? "Disable Sentry" : "Enable Sentry"}
                  >
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold border font-mono ${sentryBadgeClass}`}>
                      {isActive ? "ACTIVE SENTRY" : "OFFLINE"}
                    </span>
                    <div className="w-10 h-5 bg-slate-950 rounded-full p-0.5 border border-slate-800 transition-colors duration-200">
                      <div className={`w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${toggleColor} ${toggleCircleTranslate}`} />
                    </div>
                  </button>
                </div>

                <div className="mt-4 space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider font-mono">
                    Last Price
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono text-white">
                      {formatUSD(coin.priceUsd, coin.priceUsd > 100)}
                    </span>
                    <span className={`text-xs font-bold font-mono px-1 rounded ${isPositive ? 'text-emerald-400 bg-emerald-500/5' : 'text-rose-400 bg-rose-500/5'}`}>
                      {isPositive ? "+" : ""}{coin.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-850 pt-4 font-mono text-xs">
                  <button
                    onClick={() => setChartCoin(coin)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
                  >
                    📈 View Chart
                  </button>
                  <span className="text-[10px] text-slate-600">
                    Guard: {isActive ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Simulated Candlestick Chart Modal Overlay */}
      {chartCoin && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-indigo-500/50 shadow-2xl max-w-2xl w-full rounded-2xl p-6 relative">
            <button
              onClick={() => setChartCoin(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 text-sm font-mono"
            >
              [CLOSE]
            </button>

            <div className="mb-4">
              <h2 className="text-xl font-bold font-sans text-white">{chartCoin.name} Price Scan</h2>
              <p className="text-xs text-slate-400 font-mono">Simulating 12-hour candlestick deviations</p>
            </div>

            {/* Simple mock chart visualization with SVG */}
            <div className="h-60 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
              {/* Horizontal gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 p-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full h-[1px] bg-slate-400" />
                ))}
              </div>
              
              <div className="flex-1 flex items-end justify-between gap-1 z-10 pt-4 px-2">
                {/* 12 mock candlesticks */}
                {[...Array(12)].map((_, i) => {
                  const candleHeight = 60 + Math.random() * 120;
                  const isUp = Math.random() > 0.45;
                  const wickHeight = candleHeight + 20 + Math.random() * 20;
                  const color = isUp ? "fill-emerald-500 stroke-emerald-500" : "fill-rose-500 stroke-rose-500";
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                      {/* Wick */}
                      <div className={`w-[2px]`} style={{ height: `${wickHeight / 4}px`, backgroundColor: isUp ? '#10b981' : '#f43f5e' }} />
                      {/* Body */}
                      <div
                        className={`w-full rounded-sm`}
                        style={{
                          height: `${candleHeight / 4}px`,
                          backgroundColor: isUp ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                          border: `1.5px solid ${isUp ? '#10b981' : '#f43f5e'}`
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center text-xs font-mono text-slate-500 border-t border-slate-800 pt-4">
              <div>
                VALUATION: <span className="text-slate-200 font-bold">{formatUSD(chartCoin.priceUsd, chartCoin.priceUsd > 100)}</span>
              </div>
              <div>
                SURVEILLANCE SOURCE: <span className="text-indigo-400 uppercase">{chartCoin.source}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
