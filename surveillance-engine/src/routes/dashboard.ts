import { Router, Request, Response } from 'express';
import { priceCache } from '../cache/priceCache.js';
import { getFetcherStatus } from '../services/priceFetcher.js';

const router = Router();

// Coin branding info (colors, SVGs)
const coinMeta: Record<string, { color: string; borderGlow: string; icon: string }> = {
  bitcoin: {
    color: '#F7931A',
    borderGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
    icon: `<svg class="w-8 h-8 text-[#F7931A]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.667 22.035-1.244 15.525.362 9.103 1.96 2.67 8.471-1.24 14.9-1.637c6.43 1.602 10.34 8.114 8.736 14.541zm-4.113-6.223c.317-2.113-1.29-3.248-3.488-4.006l.713-2.857-1.74-.435-.693 2.783c-.457-.114-.926-.22-1.393-.326l.7-2.812-1.74-.435-.714 2.857c-.378-.086-.746-.17-1.104-.26l.002-.009-2.4-.6-.462 1.854s1.292.296 1.265.314c.706.176.834.643.813 1.014l-.814 3.263c.049.012.112.03.18.057l-.183-.046-.14 4.57c-.086.212-.303.53-.79.41l-1.268-.316-.763 1.75 2.266.565c.42.106.832.215 1.238.32l-.72 2.903 1.738.434.715-2.866c.475.13.935.25 1.38.366l-.715 2.867 1.74.435.72-2.894c2.973.562 5.21.336 6.15-2.354.76-2.164-.038-3.41-1.6-4.223 1.137-.263 1.993-1.012 2.222-2.56zm-3.957 5.592c-.54 2.165-4.185.996-5.366.7l.957-3.837c1.18.293 4.962.87 4.409 3.137zm.54-5.632c-.49 1.96-3.528.966-4.512.72l.868-3.48c.983.244 4.143.7 3.644 2.76z"/></svg>`
  },
  ethereum: {
    color: '#627EEA',
    borderGlow: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
    icon: `<svg class="w-8 h-8 text-[#627EEA]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22.562l-7.5-4.438 7.5-10.749 7.5 10.749-7.5 4.438zm0-16.14l-7.5 3.326 7.5-10.748 7.5 10.748-7.5-3.326zm-7.07 9.873l7.07 4.184v-7.391l-7.07 3.207zm7.07-3.207v7.391l7.07-4.184-7.07-3.207z"/></svg>`
  },
  solana: {
    color: '#14F195',
    borderGlow: 'hover:border-teal-500/50 hover:shadow-teal-500/10',
    icon: `<svg class="w-8 h-8 text-[#14F195]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 16.5h15M6.5 19.5h15M2.5 13.5h15M6.5 7.5h15M4.5 10.5h15M2.5 4.5h15"/></svg>`
  },
  binancecoin: {
    color: '#F3BA2F',
    borderGlow: 'hover:border-yellow-500/50 hover:shadow-yellow-500/10',
    icon: `<svg class="w-8 h-8 text-[#F3BA2F]" fill="currentColor" viewBox="0 0 24 24"><path d="M12.001 0l-3.332 3.332L12 6.666l3.331-3.334L12.001 0zm0 17.334L8.669 20.66 12 24l3.331-3.34-3.33-3.326zm8.665-8.665l-3.33-3.331-3.332 3.332 3.332 3.332 3.33-3.333zm-17.33 0l3.33-3.331L9.998 8.67l-3.332 3.332 3.332 3.333zm4.5 4.5l-3.33 3.331h6.66l-3.33-3.331zm8.33 0l-3.33 3.331h6.661l-3.331-3.331z"/></svg>`
  },
  ripple: {
    color: '#23292F',
    borderGlow: 'hover:border-blue-400/50 hover:shadow-blue-400/10',
    icon: `<svg class="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>`
  },
  cardano: {
    color: '#0033AD',
    borderGlow: 'hover:border-blue-600/50 hover:shadow-blue-600/10',
    icon: `<svg class="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-3.32 19.43c.09.07.2-.04.14-.14a7.99 7.99 0 0 1 .43-8.8 8 8 0 0 1 8.8-.43c.1.06.21-.05.14-.14A10 10 0 0 0 12 2zm3.5 13.5a1 1 0 1 1-1.42 1.42A4 4 0 0 0 12 16a4 4 0 0 0-2.08.58 1 1 0 1 1-1.42-1.42A6 6 0 0 1 12 14c1.35 0 2.59.57 3.5 1.5zm-7-7a1 1 0 1 1 1.42-1.42A4 4 0 0 1 12 8c.78 0 1.5.23 2.08.58a1 1 0 1 1-1.42 1.42c-.2-.12-.42-.2-.66-.2s-.46.08-.66.2z"/></svg>`
  },
  dogecoin: {
    color: '#BA9F33',
    borderGlow: 'hover:border-amber-600/50 hover:shadow-amber-600/10',
    icon: `<svg class="w-8 h-8 text-[#BA9F33]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.3 12.8c-.5.5-1.2.7-2.1.7H10.1v-6h3.1c.9 0 1.6.2 2.1.7.5.5.7 1.2.7 2.3s-.2 1.8-.7 2.3zm-1.8-3.4c-.2-.2-.6-.3-1.1-.3h-1.2v2.5h1.2c.5 0 .9-.1 1.1-.3.2-.2.3-.6.3-1s-.1-.7-.3-.9z"/></svg>`
  },
  'polygon-ecosystem-token': {
    color: '#8247E5',
    borderGlow: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
    icon: `<svg class="w-8 h-8 text-[#8247E5]" fill="currentColor" viewBox="0 0 24 24"><path d="M16.657 4.286L12 1.571 7.343 4.286v5.428L12 12.43l4.657-2.715V4.286zm0 10L12 11.571l-4.657 2.715v5.428L12 22.43l4.657-2.715v-5.43zM12 6.429a1.143 1.143 0 1 1 0-2.286 1.143 1.143 0 0 1 0 2.286zm0 10a1.143 1.143 0 1 1 0-2.286 1.143 1.143 0 0 1 0 2.286z"/></svg>`
  }
};

router.get(['/', '/dashboard'], (req: Request, res: Response) => {
  const prices = priceCache.getAll();
  const status = getFetcherStatus();

  // Pre-generate cards server-side for initial render fast load, client-side JS updates it dynamically
  const coinCardsHtml = prices.map(coin => {
    const meta = coinMeta[coin.id] || { color: '#ffffff', borderGlow: 'hover:border-white/20', icon: '❓' };
    const priceFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: coin.priceUsd > 100 ? 2 : 4,
      maximumFractionDigits: coin.priceUsd > 100 ? 2 : 4
    }).format(coin.priceUsd);

    const isPositive = coin.change24h >= 0;
    const changeSign = isPositive ? '+' : '';
    const changeClass = isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10';
    
    // Status source badge styling
    let sourceBadgeClass = 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    let sourceLabel = 'Unknown';
    if (coin.source === 'coingecko') {
      sourceBadgeClass = 'text-green-400 bg-green-500/10 border-green-500/20';
      sourceLabel = 'CoinGecko API';
    } else if (coin.source === 'fallback') {
      sourceBadgeClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      sourceLabel = 'API Fallback';
    } else if (coin.source === 'mock') {
      sourceBadgeClass = 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      sourceLabel = 'Mock Data';
    }

    const isAlert = coin.alertStatus === 'alert';
    const alertBadgeClass = isAlert 
      ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    const alertLabel = isAlert ? 'Alert Active' : 'Normal';
    
    const cardBorderClass = isAlert 
      ? 'border-rose-500/50 shadow-lg shadow-rose-500/10' 
      : 'border-zinc-800/80';
    const cardBgClass = isAlert 
      ? 'bg-rose-950/20' 
      : 'bg-zinc-900/60';
    const glowColor = isAlert ? '#ef4444' : meta.color;

    return `
      <div id="card-${coin.id}" class="relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300 ${cardBorderClass} ${cardBgClass} ${isAlert ? '' : meta.borderGlow}">
        <!-- Dynamic Gradient Glow -->
        <div id="glow-${coin.id}" class="absolute -right-16 -top-16 -z-10 h-32 w-32 rounded-full opacity-10 blur-3xl transition-opacity duration-300" style="background-color: ${glowColor}"></div>
        
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center p-2 rounded-xl bg-zinc-800/50">
              ${meta.icon}
            </div>
            <div>
              <h3 class="font-semibold text-zinc-100">${coin.name}</h3>
              <div class="flex items-center gap-2">
                <span class="text-xs uppercase text-zinc-400 font-mono tracking-wider">${coin.symbol}</span>
                <span id="alert-badge-${coin.id}" class="px-1.5 py-0.2 rounded text-[10px] font-bold border ${alertBadgeClass}">
                  ${alertLabel}
                </span>
              </div>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-medium border ${sourceBadgeClass}">
            ${sourceLabel}
          </span>
        </div>

        <div class="mt-4 flex flex-col gap-1">
          <div class="text-xs text-zinc-400">Current Price (USD)</div>
          <div class="flex items-baseline justify-between">
            <span id="price-${coin.id}" class="text-2xl font-bold font-mono tracking-tight text-white">${priceFormatted}</span>
            <span id="change-${coin.id}" class="px-2.5 py-0.5 rounded-lg text-xs font-semibold font-mono ${changeClass}">
              ${changeSign}${coin.change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-zinc-800/40 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span>Last Updated</span>
          <span id="updated-${coin.id}">${new Date(coin.lastUpdated).toLocaleTimeString()}</span>
        </div>
      </div>
    `;
  }).join('');

  const serverStatusBadge = status.status === 'success'
    ? '<span class="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span><span class="text-emerald-400 font-medium">Active (API Online)</span>'
    : status.status === 'failed'
      ? '<span class="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span><span class="text-amber-400 font-medium">Degraded (API Offline / Fallback)</span>'
      : '<span class="flex h-2.5 w-2.5 rounded-full bg-gray-500"></span><span class="text-gray-400 font-medium">Idle</span>';

  res.send(`<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Express Surveillance Engine Dashboard</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts: Inter & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #09090b;
      background-image: 
        radial-gradient(at 0% 0%, rgba(39, 39, 42, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(20, 241, 149, 0.03) 0px, transparent 50%);
    }
  </style>
</head>
<body class="h-full text-zinc-300 font-sans antialiased flex flex-col justify-between">
  <div>
    <!-- Navigation Header -->
    <header class="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21L14.907 18L21 9.104l-2.22-2.219l-8.967 9.019zm-3.6-3.6L9 21m-6-6l3.6 3.6"/></svg>
          </div>
          <div>
            <h1 class="text-md font-bold text-white tracking-tight">SURVEILLANCE ENGINE</h1>
            <p class="text-[10px] text-zinc-500 font-mono">STANDALONE PRICE AGGREGATOR</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            ${serverStatusBadge}
          </div>
          <button id="btn-refresh" onclick="triggerManualRefresh()" class="relative group overflow-hidden px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-all shadow-md active:scale-95 flex items-center gap-2">
            <span id="spinner" class="hidden animate-spin h-3.5 w-3.5 border-2 border-zinc-950 border-t-transparent rounded-full"></span>
            <span>Force Refresh Cache</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Top Engine Stats Info -->
      <section class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 backdrop-blur-sm">
          <div class="text-xs text-zinc-500 font-mono uppercase">API Target</div>
          <div class="text-sm font-semibold text-zinc-200 mt-1">CoinGecko Demo v3</div>
        </div>
        <div class="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 backdrop-blur-sm">
          <div class="text-xs text-zinc-500 font-mono uppercase">Refresh Schedule</div>
          <div class="text-sm font-semibold text-zinc-200 mt-1 flex items-center justify-between">
            <span>Every 30 seconds</span>
            <span id="countdown" class="text-emerald-400 font-mono text-xs bg-emerald-500/10 px-1.5 py-0.5 rounded">30s</span>
          </div>
        </div>
        <div class="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 backdrop-blur-sm">
          <div class="text-xs text-zinc-500 font-mono uppercase">Total API Hits</div>
          <div id="stats-fetches" class="text-lg font-bold text-white font-mono mt-1">${status.totalFetches}</div>
        </div>
        <div class="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 backdrop-blur-sm">
          <div class="text-xs text-zinc-500 font-mono uppercase">Engine Uptime</div>
          <div id="stats-uptime" class="text-sm font-semibold font-mono text-zinc-200 mt-1.5">-</div>
        </div>
      </section>

      <!-- Alert Panel for Rate Limiting/Errors -->
      <div id="error-panel" class="${status.error ? '' : 'hidden'} mb-6 border border-amber-500/20 bg-amber-500/5 rounded-2xl p-4 flex gap-3 text-amber-300 text-xs">
        <svg class="w-5 h-5 shrink-0 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        <div>
          <span class="font-bold">Rate Limit Notification:</span> <span id="error-message">${status.error}</span>
        </div>
      </div>

      <!-- Live Prices Grid -->
      <section class="mb-12">
        <h2 class="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-widest mb-4">Surveillance Target Feed</h2>
        <div id="prices-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${coinCardsHtml}
        </div>
      </section>

      <!-- REST API Playground -->
      <section class="border-t border-zinc-800/40 pt-10">
        <h2 class="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-widest mb-4">JSON Feed Endpoint Integrations</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <a href="/api/prices" target="_blank" class="block border border-zinc-800/80 bg-zinc-950/40 rounded-xl p-4 hover:border-zinc-700 transition group">
            <div class="flex items-center justify-between mb-2">
              <span class="text-emerald-400 font-bold">GET /api/prices</span>
              <span class="text-[10px] text-zinc-600 group-hover:text-zinc-400">Open API &rarr;</span>
            </div>
            <p class="text-[11px] text-zinc-500">Returns all tracked coins, standard cache values, and timestamp.</p>
          </a>

          <a href="/api/prices/bitcoin" target="_blank" class="block border border-zinc-800/80 bg-zinc-950/40 rounded-xl p-4 hover:border-zinc-700 transition group">
            <div class="flex items-center justify-between mb-2">
              <span class="text-emerald-400 font-bold">GET /api/prices/:coinId</span>
              <span class="text-[10px] text-zinc-600 group-hover:text-zinc-400">Open API &rarr;</span>
            </div>
            <p class="text-[11px] text-zinc-500">Query individual coins (e.g. bitcoin, ethereum, solana, polygon).</p>
          </a>

          <a href="/health" target="_blank" class="block border border-zinc-800/80 bg-zinc-950/40 rounded-xl p-4 hover:border-zinc-700 transition group">
            <div class="flex items-center justify-between mb-2">
              <span class="text-emerald-400 font-bold">GET /health</span>
              <span class="text-[10px] text-zinc-600 group-hover:text-zinc-400">Open API &rarr;</span>
            </div>
            <p class="text-[11px] text-zinc-500">Server status, engine uptime stats, and API rate limits info.</p>
          </a>
        </div>
      </section>

    </main>
  </div>

  <!-- Sticky Footer -->
  <footer class="border-t border-zinc-900 bg-zinc-950/20 py-4 text-center text-[10px] text-zinc-600 font-mono max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
    EXPRESS SURVEILLANCE ENGINE &bull; POWERED BY COINGECKO &bull; MEMORY CACHE ACTIVE
  </footer>

  <script>
    // Time tracking & interval
    const countdownElement = document.getElementById('countdown');
    const uptimeElement = document.getElementById('stats-uptime');
    const errorPanel = document.getElementById('error-panel');
    const errorMessage = document.getElementById('error-message');
    const fetchesCount = document.getElementById('stats-fetches');
    const btnRefresh = document.getElementById('btn-refresh');
    const spinner = document.getElementById('spinner');

    let nextFetchTime = Date.now() + 30000;
    
    // Format helper
    function formatUSD(num, digits) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
      }).format(num);
    }

    const coinMetaBranding = {
      bitcoin: { color: '#F7931A', borderGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/10' },
      ethereum: { color: '#627EEA', borderGlow: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10' },
      solana: { color: '#14F195', borderGlow: 'hover:border-teal-500/50 hover:shadow-teal-500/10' },
      binancecoin: { color: '#F3BA2F', borderGlow: 'hover:border-yellow-500/50 hover:shadow-yellow-500/10' },
      ripple: { color: '#23292F', borderGlow: 'hover:border-blue-400/50 hover:shadow-blue-400/10' },
      cardano: { color: '#0033AD', borderGlow: 'hover:border-blue-600/50 hover:shadow-blue-600/10' },
      dogecoin: { color: '#BA9F33', borderGlow: 'hover:border-amber-600/50 hover:shadow-amber-600/10' },
      'polygon-ecosystem-token': { color: '#8247E5', borderGlow: 'hover:border-purple-500/50 hover:shadow-purple-500/10' }
    };

    // Refresh UI with new price data
    function updatePricesUI(prices) {
      prices.forEach(coin => {
        const priceEl = document.getElementById('price-' + coin.id);
        const changeEl = document.getElementById('change-' + coin.id);
        const updatedEl = document.getElementById('updated-' + coin.id);
        const alertBadgeEl = document.getElementById('alert-badge-' + coin.id);
        const glowEl = document.getElementById('glow-' + coin.id);
        const cardEl = document.getElementById('card-' + coin.id);
        
        if (priceEl) {
          const digits = coin.priceUsd > 100 ? 2 : 4;
          priceEl.textContent = formatUSD(coin.priceUsd, digits);
        }
        
        if (changeEl) {
          const isPositive = coin.change24h >= 0;
          changeEl.textContent = (isPositive ? '+' : '') + coin.change24h.toFixed(2) + '%';
          changeEl.className = 'px-2.5 py-0.5 rounded-lg text-xs font-semibold font-mono ' + 
            (isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10');
        }

        if (updatedEl) {
          updatedEl.textContent = new Date(coin.lastUpdated).toLocaleTimeString();
        }

        // Update Alert Status elements
        const isAlert = coin.alertStatus === 'alert';
        if (alertBadgeEl) {
          alertBadgeEl.textContent = isAlert ? 'Alert Active' : 'Normal';
          alertBadgeEl.className = 'px-1.5 py-0.2 rounded text-[10px] font-bold border ' + 
            (isAlert ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20');
        }

        if (cardEl) {
          const baseClasses = 'relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300 ';
          const metaColor = coinMetaBranding[coin.id] || { borderGlow: 'hover:border-white/20', color: '#ffffff' };
          
          if (isAlert) {
            cardEl.className = baseClasses + 'border-rose-500/50 shadow-lg shadow-rose-500/10 bg-rose-950/20';
          } else {
            cardEl.className = baseClasses + 'border-zinc-800/80 bg-zinc-900/60 ' + metaColor.borderGlow;
          }
        }

        if (glowEl) {
          const metaColor = coinMetaBranding[coin.id] || { color: '#ffffff' };
          glowEl.style.backgroundColor = isAlert ? '#ef4444' : metaColor.color;
        }

        // Color branding mapping
        const sourceBadges = {
          coingecko: 'text-green-400 bg-green-500/10 border-green-500/20',
          fallback: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          mock: 'text-violet-400 bg-violet-500/10 border-violet-500/20'
        };
        const sourceLabels = {
          coingecko: 'CoinGecko API',
          fallback: 'API Fallback',
          mock: 'Mock Data'
        };
        
        const card = document.getElementById('card-' + coin.id);
        if (card) {
          const badge = card.querySelector('span.border:not([id^="alert-badge-"])');
          if (badge) {
            badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-medium border ' + (sourceBadges[coin.source] || '');
            badge.textContent = sourceLabels[coin.source] || 'Unknown';
          }
        }
      });
    }

    // Load data from Express API
    async function loadData() {
      try {
        const res = await fetch('/api/prices?_t=' + Date.now());
        const json = await res.json();
        if (json.success) {
          updatePricesUI(json.data);
        }
        
        // Fetch health
        const healthRes = await fetch('/health?_t=' + Date.now());
        const health = await healthRes.json();
        uptimeElement.textContent = health.uptime;
        fetchesCount.textContent = health.fetcher ? health.fetcher.totalFetches : (health.totalFetches || 0);
        
        if (health.fetcher.error) {
          errorPanel.classList.remove('hidden');
          errorMessage.textContent = health.fetcher.error;
        } else {
          errorPanel.classList.add('hidden');
        }
      } catch (err) {
        console.error('Error fetching dashboard updates:', err);
      }
    }

    // Manual Refresh Trigger
    async function triggerManualRefresh() {
      btnRefresh.disabled = true;
      spinner.classList.remove('hidden');
      
      try {
        const res = await fetch('/api/prices/refresh', { method: 'POST' });
        const data = await res.json();
        
        await loadData();
        nextFetchTime = Date.now() + 30000;
        
        if (!data.success) {
          // If unsuccessful manual refresh (e.g. rate limited), alert the user
          console.warn('Manual refresh request rejected:', data.message);
        }
      } catch (err) {
        console.error('Failed to trigger manual refresh:', err);
      } finally {
        setTimeout(() => {
          btnRefresh.disabled = false;
          spinner.classList.add('hidden');
        }, 1000); // 1s cool off for animation
      }
    }

    // Update countdown and poll engine status
    setInterval(() => {
      const remaining = Math.max(0, Math.ceil((nextFetchTime - Date.now()) / 1000));
      countdownElement.textContent = remaining + 's';
      
      if (remaining === 0) {
        nextFetchTime = Date.now() + 30000;
        // Schedule next load slightly after background fetch
        setTimeout(loadData, 500);
      }
    }, 1000);

    // Initial stats fetch
    loadData();
    setInterval(loadData, 5000); // regular sync every 5s
  </script>
</body>
</html>
  `);
});

export default router;
