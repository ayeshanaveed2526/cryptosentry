"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/register";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(register, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
            <span className="text-xl font-bold">C</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-slate-400 mt-1">Get started with CryptoSentry</p>
        </div>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="p-3 text-sm rounded-lg bg-red-950/50 border border-red-800/50 text-red-400">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="p-3 text-sm rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-emerald-400">
              {state.success}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 transition"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 transition"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition duration-200 mt-2 flex justify-center items-center"
          >
            {isPending ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline hover:text-indigo-300 font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
