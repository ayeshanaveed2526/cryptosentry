"use client";

export default function AlertsPage() {
  const activeAlerts = [
    { id: 1, token: "Bitcoin (BTC)", condition: "Goes Above", value: "$70,000.00", status: "Active", isPassed: false },
    { id: 2, token: "Ethereum (ETH)", condition: "Goes Below", value: "$3,000.00", status: "Active", isPassed: false },
    { id: 3, token: "Solana (SOL)", condition: "Goes Above", value: "$160.00", status: "Paused", isPassed: false },
    { id: 4, token: "Ripple (XRP)", condition: "Goes Below", value: "$0.45", status: "Triggered", isPassed: true }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Price Alerts</h1>
        <p className="text-slate-400 text-sm mt-1">
          Set price triggers and get notified in real-time when valuations change.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts List */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-bold">Your Active Triggers</h3>
          <div className="space-y-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{alert.token}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        alert.status === "Active"
                          ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                          : alert.status === "Paused"
                          ? "bg-slate-800 border-slate-700 text-slate-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Notify when price <span className="font-medium text-slate-300">{alert.condition.toLowerCase()}</span>{" "}
                    <span className="font-mono text-slate-200">{alert.value}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button className="text-xs font-semibold px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-300 transition">
                    Edit
                  </button>
                  <button className="text-xs font-semibold px-3 py-1.5 text-red-400/80 hover:text-red-400 hover:underline transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Form Mock */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 h-fit space-y-6">
          <h3 className="text-lg font-bold">Create New Alert</h3>
          <form className="space-y-4 text-sm">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Asset</label>
              <select className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-300">
                <option>Bitcoin (BTC)</option>
                <option>Ethereum (ETH)</option>
                <option>Solana (SOL)</option>
                <option>Ripple (XRP)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Condition</label>
              <select className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-300">
                <option>Goes Above</option>
                <option>Goes Below</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trigger Value (USD)</label>
              <input
                type="text"
                placeholder="$0.00"
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition"
              />
            </div>

            <button
              type="button"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition duration-200 mt-2"
            >
              Create Price Alert
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
