"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  signOutAction: () => Promise<void>;
}

export default function Navbar({ user, signOutAction }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Watchlist", href: "/watchlist" },
    { label: "Alerts", href: "/alerts" }
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-sm font-bold text-white">C</span>
            </div>
            <span className="font-bold text-sm tracking-wider bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              CRYPTOSENTRY
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition duration-150 ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-semibold text-slate-200">{user.name || "User"}</span>
              <span className="text-[10px] text-slate-500 font-mono">{user.email}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
              {(user.name || user.email || "?").charAt(0).toUpperCase()}
            </div>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 rounded-lg transition"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Mobile nav subbar */}
      <div className="md:hidden border-t border-slate-800/50 bg-slate-950 flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
