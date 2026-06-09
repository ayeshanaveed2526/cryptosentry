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

// Memory structures for crash detection
export const baselinePriceMap = new Map<string, number>();
export const lastAlertMap = new Map<string, number>();
export const activeAlertSet = new Set<string>();

let alertCounter = 0;
export function getNextAlertId(): string {
  alertCounter++;
  return String(alertCounter).padStart(3, '0');
}

function getFormattedCoinSymbol(id: string): string {
  if (id === 'bitcoin') return 'BTC';
  if (id === 'ethereum') return 'ETH';
  if (id === 'solana') return 'SOL';
  if (id === 'binancecoin') return 'BNB';
  if (id === 'ripple') return 'XRP';
  if (id === 'cardano') return 'ADA';
  if (id === 'dogecoin') return 'DOGE';
  if (id === 'polygon-ecosystem-token') return 'POL';
  return id.substring(0, 3).toUpperCase();
}

// Initialize baseline prices from cache
for (const coin of priceCache.getAll()) {
  baselinePriceMap.set(coin.id, coin.priceUsd);
}

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

    // Update cache and perform flash crash detection
    for (const coinId of COIN_IDS) {
      const coinData = data[coinId];
      if (coinData) {
        const currentPrice = coinData.usd;
        let alertStatus: 'normal' | 'alert' = 'normal';
        
        const baselinePrice = baselinePriceMap.get(coinId);
        if (baselinePrice !== undefined) {
          const percentageDrop = ((currentPrice - baselinePrice) / baselinePrice) * 100;
          if (percentageDrop <= -2) {
            const now = Date.now();
            const lastAlertTime = lastAlertMap.get(coinId) || 0;
            if (now - lastAlertTime >= 60000) {
              const alertId = getNextAlertId();
              const formattedDate = new Date().toISOString().split('T')[0];
              const symbol = getFormattedCoinSymbol(coinId);
              console.log(`[${formattedDate}] ${symbol} dropped ${Math.abs(percentageDrop).toFixed(1)}% Price = $${currentPrice.toLocaleString()} AlertID = ${alertId}`);
              lastAlertMap.set(coinId, now);
            } else {
              console.log(`ℹ️ [Fetcher] Flash crash detected for ${coinId} (${percentageDrop.toFixed(2)}%), but alert deduplicated.`);
            }
            activeAlertSet.add(coinId);
            alertStatus = 'alert';
          } else {
            activeAlertSet.delete(coinId);
            alertStatus = 'normal';
          }
        }
        
        // Update baseline price for the next cycle
        baselinePriceMap.set(coinId, currentPrice);

        priceCache.set(coinId, {
          priceUsd: currentPrice,
          change24h: coinData.usd_24h_change || 0,
          source: 'coingecko',
          alertStatus
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
    // 5% chance of simulating a flash crash (drops between 2.0% and 3.5%)
    const isCrash = Math.random() < 0.05;
    const driftPercent = isCrash
      ? -(0.02 + Math.random() * 0.015) // drop between -2.0% and -3.5%
      : (Math.random() - 0.5) * 0.006; // random walk of ±0.3%
      
    const newPrice = coin.priceUsd * (1 + driftPercent);
    const changeDrift = (Math.random() - 0.5) * 0.15;
    const newChange = coin.change24h + changeDrift;
    
    let alertStatus: 'normal' | 'alert' = 'normal';
    
    const baselinePrice = baselinePriceMap.get(coin.id);
    if (baselinePrice !== undefined) {
      const percentageDrop = ((newPrice - baselinePrice) / baselinePrice) * 100;
      if (percentageDrop <= -2) {
        const currentTime = Date.now();
        const lastAlertTime = lastAlertMap.get(coin.id) || 0;
        if (currentTime - lastAlertTime >= 60000) {
          const alertId = getNextAlertId();
          const formattedDate = new Date().toISOString().split('T')[0];
          const symbol = getFormattedCoinSymbol(coin.id);
          console.log(`[${formattedDate}] ${symbol} dropped ${Math.abs(percentageDrop).toFixed(1)}% Price = $${parseFloat(newPrice.toFixed(coin.priceUsd > 100 ? 2 : 4)).toLocaleString()} AlertID = ${alertId}`);
          lastAlertMap.set(coin.id, currentTime);
        } else {
          console.log(`ℹ️ [Fetcher] Flash crash detected (simulated) for ${coin.name} (${percentageDrop.toFixed(2)}%), but alert deduplicated.`);
        }
        activeAlertSet.add(coin.id);
        alertStatus = 'alert';
      } else {
        activeAlertSet.delete(coin.id);
        alertStatus = 'normal';
      }
    }
    
    // Update baseline price for next cycle
    baselinePriceMap.set(coin.id, newPrice);
    
    // Set in cache
    priceCache.set(coin.id, {
      priceUsd: parseFloat(newPrice.toFixed(coin.priceUsd > 100 ? 2 : 4)),
      change24h: parseFloat(Math.max(-99.9, Math.min(999.9, newChange)).toFixed(2)),
      source: coin.source === 'coingecko' ? 'fallback' : 'mock',
      lastUpdated: now,
      alertStatus
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
