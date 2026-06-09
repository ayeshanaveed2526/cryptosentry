"use client";

import { useEffect, useState } from "react";

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

interface MissionControlDashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
    id?: string | null;
  } | null;
}

export default function MissionControlDashboard({ user }: MissionControlDashboardProps) {
  const [prices, setPrices] = useState<CoinPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<any>(null);
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  const fetchPrices = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/prices?_t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Surveillance engine offline");
      const json = await res.json();
      if (json.success) {
        setPrices(json.data);
        setError(null);
      }
    } catch (err: any) {
      console.warn("Failed to fetch prices from surveillance-engine:", err.message);
      setError("Surveillance engine is unreachable. Displaying simulated offline updates.");
      // Fallback/Mock prices if backend is offline, update them dynamically
      setPrices((prevPrices) => {
        if (prevPrices.length === 0) {
          return [
            { id: "bitcoin", name: "Bitcoin", symbol: "btc", priceUsd: 68500.00, change24h: 1.25, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
            { id: "ethereum", name: "Ethereum", symbol: "eth", priceUsd: 3850.00, change24h: -0.45, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
            { id: "solana", name: "Solana", symbol: "sol", priceUsd: 175.25, change24h: 4.82, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
            { id: "binancecoin", name: "BNB", symbol: "bnb", priceUsd: 590.15, change24h: 0.12, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
            { id: "ripple", name: "XRP", symbol: "xrp", priceUsd: 0.52, change24h: -1.15, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
            { id: "cardano", name: "Cardano", symbol: "ada", priceUsd: 0.46, change24h: -2.31, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
            { id: "dogecoin", name: "Dogecoin", symbol: "doge", priceUsd: 0.145, change24h: 3.42, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" },
            { id: "polygon-ecosystem-token", name: "Polygon", symbol: "pol", priceUsd: 0.42, change24h: -1.88, lastUpdated: new Date().toISOString(), source: "mock", alertStatus: "normal" }
          ];
        }
        return prevPrices.map((coin) => {
          const drift = (Math.random() - 0.5) * 0.005;
          const newPrice = coin.priceUsd * (1 + drift);
          return {
            ...coin,
            priceUsd: parseFloat(newPrice.toFixed(coin.priceUsd > 100 ? 2 : 4)),
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
      }
    } catch {
      setEngineStatus(null);
    }
  };

  // Poll prices and health
  useEffect(() => {
    fetchPrices();
    fetchHealth();
    const interval = setInterval(() => {
      fetchPrices();
      fetchHealth();
    }, 5000); // Poll every 5s for real-time dashboard

    return () => clearInterval(interval);
  }, []);

  // Countdown timer for API refetch
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUSD = (val: number, isHighValue: boolean) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: isHighValue ? 2 : 4,
      maximumFractionDigits: isHighValue ? 2 : 4
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Mission Control Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time Surveillance Monitor & Flash Crash Detector.
          </p>
        </div>
        
        {engineStatus && (
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium font-mono">
              Engine: <span className="text-emerald-400">Healthy</span> | Uptime: {engineStatus.uptime}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Grid of Price Cards */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-widest mb-4">
          Live Surveillance Targets
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {prices.map((coin) => {
              const isAlert = coin.alertStatus === "alert";
              
              // Color styling mapping
              const cardBorderClass = isAlert 
                ? "border-red-500/50 shadow-lg shadow-red-500/5 bg-red-950/10" 
                : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700/50";
              const alertBadgeClass = isAlert
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
              const alertText = isAlert ? "Alert Active" : "Normal";

              const isPositive = coin.change24h >= 0;
              const priceFormatted = formatUSD(coin.priceUsd, coin.priceUsd > 100);

              return (
                <div
                  key={coin.id}
                  className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-md transition-all duration-300 ${cardBorderClass}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-100">{coin.name}</h3>
                      <span className="text-xs uppercase text-slate-500 font-mono tracking-wider">
                        {coin.symbol}
                      </span>
                    </div>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono tracking-wide ${alertBadgeClass}`}>
                      {alertText}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1">
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Current Price</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold font-mono tracking-tight text-white">
                        {priceFormatted}
                      </span>
                      <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                        {isPositive ? "+" : ""}{coin.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span>Source: {coin.source === 'coingecko' ? 'CoinGecko' : coin.source === 'fallback' ? 'API Fallback' : 'Mock'}</span>
                    <span>{new Date(coin.lastUpdated).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Portfolio & User Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Watchlist Portfolios</h3>
            <span className="text-xs text-slate-500 font-mono">Simulated Assets</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Asset</th>
                  <th className="pb-3">Balance</th>
                  <th className="pb-3">Market Price</th>
                  <th className="pb-3 text-right">Holdings Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {prices.slice(0, 3).map((coin) => {
                  const balance = coin.id === 'bitcoin' ? 0.45 : coin.id === 'ethereum' ? 2.50 : 15.0;
                  const holdingsVal = balance * coin.priceUsd;
                  return (
                    <tr key={coin.id}>
                      <td className="py-4 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${coin.id === 'bitcoin' ? 'bg-amber-500' : coin.id === 'ethereum' ? 'bg-indigo-400' : 'bg-teal-400'}`}></span>
                        <span className="font-semibold text-slate-200">{coin.name}</span>
                      </td>
                      <td className="py-4 font-mono text-slate-300">{balance.toFixed(2)} {coin.symbol.toUpperCase()}</td>
                      <td className="py-4 font-mono text-slate-300">{formatUSD(coin.priceUsd, true)}</td>
                      <td className="py-4 font-mono text-right font-semibold text-slate-100">{formatUSD(holdingsVal, true)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold">Session Profile</h3>
          <div className="space-y-4 text-sm">
            <div className="space-y-1">
              <span className="text-slate-500 text-xs uppercase font-semibold">Name</span>
              <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-850 font-mono text-xs text-slate-300">
                {user?.name || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 text-xs uppercase font-semibold">Email</span>
              <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-850 font-mono text-xs text-slate-300">
                {user?.email}
              </div>
            </div>
            {user?.id && (
              <div className="space-y-1">
                <span className="text-slate-500 text-xs uppercase font-semibold">User ID</span>
                <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-850 font-mono text-[10px] text-slate-400 break-all">
                  {user.id}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
