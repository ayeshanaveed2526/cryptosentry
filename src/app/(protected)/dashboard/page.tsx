import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Welcome back, <span className="font-semibold text-slate-200">{session?.user?.name || session?.user?.email}</span>. Here is your portfolio summary.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/30 transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Worth</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Live
            </span>
          </div>
          <div className="text-3xl font-bold font-mono">$41,098.98</div>
          <div className="text-xs text-slate-500 mt-2">+3.4% overall increase this week</div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/30 transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Alerts</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
              Enabled
            </span>
          </div>
          <div className="text-3xl font-bold font-mono">4 Alerts</div>
          <div className="text-xs text-slate-500 mt-2">Monitoring BTC, ETH, and SOL</div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/30 transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Tier</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              Pro Member
            </span>
          </div>
          <div className="text-3xl font-bold font-mono">Premium</div>
          <div className="text-xs text-slate-500 mt-2">Full access to AI price forecasting</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table holdings */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Your Assets</h3>
            <span className="text-xs text-slate-500 font-mono">Updated just now</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Token</th>
                  <th className="pb-3">Balance</th>
                  <th className="pb-3">Market Price</th>
                  <th className="pb-3 text-right">Holdings Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <tr>
                  <td className="py-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="font-semibold">Bitcoin (BTC)</span>
                  </td>
                  <td className="py-4 font-mono">0.45 BTC</td>
                  <td className="py-4 font-mono">$67,230.50</td>
                  <td className="py-4 font-mono text-right font-semibold text-slate-100">$30,253.73</td>
                </tr>
                <tr>
                  <td className="py-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                    <span className="font-semibold">Ethereum (ETH)</span>
                  </td>
                  <td className="py-4 font-mono">2.50 ETH</td>
                  <td className="py-4 font-mono">$3,485.20</td>
                  <td className="py-4 font-mono text-right font-semibold text-slate-100">$8,713.00</td>
                </tr>
                <tr>
                  <td className="py-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <span className="font-semibold">Solana (SOL)</span>
                  </td>
                  <td className="py-4 font-mono">15.0 SOL</td>
                  <td className="py-4 font-mono">$142.15</td>
                  <td className="py-4 font-mono text-right font-semibold text-slate-100">$2,132.25</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel Info */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-bold">Session Profile</h3>
          <div className="space-y-4 text-sm">
            <div className="space-y-1">
              <span className="text-slate-500 text-xs uppercase font-semibold">User ID</span>
              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-850 font-mono text-xs break-all">
                {session?.user?.id || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 text-xs uppercase font-semibold">Name</span>
              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-850 font-mono text-xs">
                {session?.user?.name || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 text-xs uppercase font-semibold">Email</span>
              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-850 font-mono text-xs">
                {session?.user?.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
