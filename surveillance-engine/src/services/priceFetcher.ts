import dotenv from 'dotenv';
import { priceCache } from '../cache/priceCache.js';
import { CoinGeckoSimplePriceResponse } from '../types/index.js';

dotenv.config();

const COINGECKO_API_URL = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';
const FETCH_INTERVAL_MS = parseInt(process.env.FETCH_INTERVAL_MS || '30000', 10);

const COIN_IDS = [
  'bitcoin',
  'ethereum',
  'solana',
  'binancecoin',
  'ripple',
  'cardano',
  'dogecoin',
  'polygon-ecosystem-token'
];

let intervalId: NodeJS.Timeout | null = null;
let lastFetchStatus: 'success' | 'failed' | 'idle' = 'idle';
let lastFetchError: string | null = null;
let totalFetches = 0;
let lastSuccessfulFetchTime: Date | null = null;
let lastManualFetchTime = 0;

export async function fetchPrices(isManual = false): Promise<boolean> {
  // Prevent manual fetch spam (min 5 seconds interval)
  if (isManual) {
    const now = Date.now();
    if (now - lastManualFetchTime < 5000) {
      console.warn('[Fetcher] Manual fetch requested too soon. Rate limiting manual trigger.');
      return false;
    }
    lastManualFetchTime = now;
  }

  console.log(`[Fetcher] Starting price fetch at ${new Date().toISOString()} (Type: ${isManual ? 'Manual' : 'Scheduled'})...`);
  
  const coinIdsQuery = COIN_IDS.join(',');
  const url = `${COINGECKO_API_URL}/simple/price?ids=${coinIdsQuery}&vs_currencies=usd&include_24hr_change=true`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('CoinGecko API Rate Limit exceeded (429 Too Many Requests). Using cached/mock prices.');
      }
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as CoinGeckoSimplePriceResponse;
    
    if (!data || Object.keys(data).length === 0) {
      throw new Error('Received empty response from CoinGecko API.');
    }

    // Update cache
    for (const coinId of COIN_IDS) {
      const coinData = data[coinId];
      if (coinData) {
        priceCache.set(coinId, {
          priceUsd: coinData.usd,
          change24h: coinData.usd_24h_change || 0,
          source: 'coingecko'
        });
      } else {
        console.warn(`[Fetcher] No data returned for ${coinId}`);
      }
    }

    lastFetchStatus = 'success';
    lastFetchError = null;
    lastSuccessfulFetchTime = new Date();
    totalFetches++;
    console.log(`[Fetcher] Successfully updated prices from CoinGecko API.`);
    return true;
  } catch (error: any) {
    lastFetchStatus = 'failed';
    lastFetchError = error.message || String(error);
    console.error(`[Fetcher] Fetch failed: ${lastFetchError}`);

    // Gracefully update cache objects with fallback/mock source and mock fluctuation
    simulatePriceFluctuations();

    return false;
  }
}

function simulatePriceFluctuations() {
  console.log('[Fetcher] Simulating slight price fluctuations (fallback mode).');
  const cachedCoins = priceCache.getAll();
  const now = new Date();
  
  for (const coin of cachedCoins) {
    // Random walk of ±0.15% to ±0.35%
    const driftPercent = (Math.random() - 0.5) * 0.006; 
    const newPrice = coin.priceUsd * (1 + driftPercent);
    // Slowly drift change24h
    const changeDrift = (Math.random() - 0.5) * 0.15;
    const newChange = coin.change24h + changeDrift;
    
    // Set in cache
    priceCache.set(coin.id, {
      priceUsd: parseFloat(newPrice.toFixed(coin.priceUsd > 100 ? 2 : 4)),
      change24h: parseFloat(Math.max(-99.9, Math.min(999.9, newChange)).toFixed(2)),
      source: coin.source === 'coingecko' ? 'fallback' : 'mock',
      lastUpdated: now
    });
  }
}

export function startPriceFetcher() {
  if (intervalId) {
    console.warn('[Fetcher] Price fetcher is already running.');
    return;
  }

  // Initial fetch
  fetchPrices();

  // Schedule interval
  intervalId = setInterval(async () => {
    await fetchPrices();
  }, FETCH_INTERVAL_MS);

  console.log(`[Fetcher] Price fetcher scheduled to run every ${FETCH_INTERVAL_MS / 1000} seconds.`);
}

export function stopPriceFetcher() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[Fetcher] Price fetcher stopped.');
  }
}

export function getFetcherStatus() {
  return {
    status: lastFetchStatus,
    error: lastFetchError,
    totalFetches,
    lastSuccessfulFetchTime,
    intervalMs: FETCH_INTERVAL_MS,
    isSchedulerRunning: intervalId !== null
  };
}
