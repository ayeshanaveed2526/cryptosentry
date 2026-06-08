export default function WatchlistPage() {
  const watchlistItems = [
    { name: "Bitcoin", symbol: "BTC", price: "$67,230.50", change: "+4.25%", isPositive: true },
    { name: "Ethereum", symbol: "ENV", price: "$3,485.20", change: "+2.80%", isPositive: true },
    { name: "Solana", symbol: "SOL", price: "$142.15", change: "-1.45%", isPositive: false },
    { name: "Ripple", symbol: "XRP", price: "$0.52", change: "+0.15%", isPositive: true },
    { name: "Cardano", symbol: "ADA", price: "$0.48", change: "-3.12%", isPositive: false },
    { name: "Polkadot", symbol: "DOT", price: "$6.85", change: "+1.90%", isPositive: true }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Watchlist</h1>
        <p className="text-slate-400 text-sm mt-1">
          Assets you are currently tracking. Customize triggers inside the Alerts tab.
        </p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {watchlistItems.map((item) => (
          <div
            key={item.symbol}
            className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-indigo-500/30 transition group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400 group-hover:bg-indigo-650/10 group-hover:border-indigo-500/30 transition">
                  {item.symbol}
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">{item.name}</h3>
                  <span className="text-xs text-slate-500 uppercase font-semibold font-mono">{item.symbol}/USD</span>
                </div>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                  item.isPositive
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                {item.change}
              </span>
            </div>

            <div className="mt-4">
              <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider">Last Price</span>
              <div className="text-xl font-bold font-mono mt-0.5">{item.price}</div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-850 pt-4">
              <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline">
                View Charts
              </button>
              <button className="text-xs text-red-400/80 hover:text-red-400 font-semibold hover:underline">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
