import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-[family-name:var(--font-geist-sans)] flex flex-col justify-between">
      {/* Header / Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-base font-bold text-white">C</span>
            </div>
            <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              CRYPTOSENTRY
            </span>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400 hidden sm:inline">
                  Welcome, <span className="font-semibold text-slate-200">{session.user?.name || session.user?.email}</span>
                </span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"
                >
                  Dashboard
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/20 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 py-12">
        {session ? (
          /* Authenticated State - Premium Dashboard */
          <div className="w-full max-w-5xl space-y-8 animate-fadeIn">
            {/* Greeting / Dashboard Intro */}
            <div className="bg-gradient-to-r from-indigo-900/30 to-violet-900/30 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Welcome back, {session.user?.name}!</h2>
                <p className="text-slate-400 text-sm mt-1">Here is the latest data for your crypto portfolio.</p>
                <div className="mt-4">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md transition duration-200"
                  >
                    🚀 Enter Mission Control Dashboard
                  </Link>
                </div>
              </div>
              <div className="bg-slate-900/80 px-4 py-2 border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="text-slate-500 font-semibold uppercase tracking-wider">Session Profile</div>
                <div className="text-slate-300 font-mono text-[10px] sm:text-xs">{session.user?.email}</div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/30 transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bitcoin</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    +4.25%
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono">$67,230.50</div>
                <div className="text-xs text-slate-500 mt-2">24h volume: $32.4B</div>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/30 transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ethereum</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    +2.80%
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono">$3,485.20</div>
                <div className="text-xs text-slate-500 mt-2">24h volume: $15.1B</div>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/30 transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Solana</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                    -1.45%
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono">$142.15</div>
                <div className="text-xs text-slate-500 mt-2">24h volume: $4.8B</div>
              </div>
            </div>

            {/* Mock Portfolio Detail Section */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Portfolio Overview</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                      <th className="pb-3">Asset</th>
                      <th className="pb-3">Holdings</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-4 font-semibold">Bitcoin (BTC)</td>
                      <td className="py-4 font-mono">0.45 BTC</td>
                      <td className="py-4 font-mono">$67,230.50</td>
                      <td className="py-4 font-mono text-right font-semibold text-indigo-400">$30,253.73</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-semibold">Ethereum (ETH)</td>
                      <td className="py-4 font-mono">2.50 ETH</td>
                      <td className="py-4 font-mono">$3,485.20</td>
                      <td className="py-4 font-mono text-right font-semibold text-indigo-400">$8,713.00</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-semibold">Solana (SOL)</td>
                      <td className="py-4 font-mono">15.0 SOL</td>
                      <td className="py-4 font-mono">$142.15</td>
                      <td className="py-4 font-mono text-right font-semibold text-indigo-400">$2,132.25</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Unauthenticated State - Beautiful Landing Page */
          <div className="max-w-4xl text-center space-y-8 animate-fadeIn px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
              ✨ Modern Database & Authentication Active
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Secure Cryptocurrency Monitoring with{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">
                CryptoSentry
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Track token valuations, secure your session with custom auth adapters, and monitor mock cryptocurrency portfolios natively in one secure dashboard.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition duration-200"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-xl transition duration-200"
              >
                Sign In
              </Link>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-slate-900 mt-12">
              <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-6 text-left space-y-2">
                <div className="w-10 h-10 rounded-lg bg-indigo-900/50 flex items-center justify-center text-indigo-400 font-bold">
                  🔒
                </div>
                <h3 className="font-bold text-slate-200">Auth.js v5</h3>
                <p className="text-slate-400 text-sm">
                  Utilizes secure credentials provider with encrypted passwords and JWT strategy.
                </p>
              </div>

              <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-6 text-left space-y-2">
                <div className="w-10 h-10 rounded-lg bg-indigo-900/50 flex items-center justify-center text-indigo-400 font-bold">
                  ⚡
                </div>
                <h3 className="font-bold text-slate-200">Prisma & Postgres</h3>
                <p className="text-slate-400 text-sm">
                  Leverages the new Prisma 7 driver adapter architecture to connect securely.
                </p>
              </div>

              <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-6 text-left space-y-2">
                <div className="w-10 h-10 rounded-lg bg-indigo-900/50 flex items-center justify-center text-indigo-400 font-bold">
                  🚀
                </div>
                <h3 className="font-bold text-slate-200">Turbopack Speed</h3>
                <p className="text-slate-400 text-sm">
                  Fully compiled with Next.js App Router and dynamic server components.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4">
          &copy; {new Date().getFullYear()} CryptoSentry Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
