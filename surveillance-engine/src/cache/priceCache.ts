import { CoinPrice } from '../types/index.js';

export class PriceCache {
  private cache: Map<string, CoinPrice> = new Map();

  constructor() {
    // Initialize cache with realistic default values in case API fetch fails on start
    const now = new Date();
    const initialCoins: Omit<CoinPrice, 'lastUpdated' | 'source'>[] = [
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', priceUsd: 68500.0, change24h: 1.25 },
      { id: 'ethereum', name: 'Ethereum', symbol: 'eth', priceUsd: 3850.0, change24h: -0.45 },
      { id: 'solana', name: 'Solana', symbol: 'sol', priceUsd: 175.25, change24h: 4.82 },
      { id: 'binancecoin', name: 'BNB', symbol: 'bnb', priceUsd: 590.15, change24h: 0.12 },
      { id: 'ripple', name: 'XRP', symbol: 'xrp', priceUsd: 0.52, change24h: -1.15 },
      { id: 'cardano', name: 'Cardano', symbol: 'ada', priceUsd: 0.46, change24h: -2.31 },
      { id: 'dogecoin', name: 'Dogecoin', symbol: 'doge', priceUsd: 0.145, change24h: 3.42 },
      { id: 'polygon-ecosystem-token', name: 'Polygon', symbol: 'pol', priceUsd: 0.42, change24h: -1.88 },
    ];

    for (const coin of initialCoins) {
      this.cache.set(coin.id, {
        ...coin,
        lastUpdated: now,
        source: 'mock',
      });
    }
  }

  public get(id: string): CoinPrice | undefined {
    const normalizedId = this.normalizeId(id);
    return this.cache.get(normalizedId);
  }

  public getAll(): CoinPrice[] {
    return Array.from(this.cache.values());
  }

  public set(id: string, priceData: Partial<CoinPrice> & { priceUsd: number }): void {
    const normalizedId = this.normalizeId(id);
    const existing = this.cache.get(normalizedId);
    
    if (existing) {
      this.cache.set(normalizedId, {
        ...existing,
        ...priceData,
        lastUpdated: new Date(),
      });
    } else {
      this.cache.set(normalizedId, {
        id: normalizedId,
        name: priceData.name || this.capitalize(normalizedId),
        symbol: priceData.symbol || normalizedId.substring(0, 4).toLowerCase(),
        priceUsd: priceData.priceUsd,
        change24h: priceData.change24h ?? 0,
        lastUpdated: new Date(),
        source: priceData.source || 'coingecko',
      });
    }
  }

  private normalizeId(id: string): string {
    const lower = id.toLowerCase().trim();
    if (lower === 'polygon' || lower === 'matic' || lower === 'matic-network' || lower === 'pol') return 'polygon-ecosystem-token';
    if (lower === 'bnb' || lower === 'binance-coin') return 'binancecoin';
    if (lower === 'xrp') return 'ripple';
    if (lower === 'cardano') return 'cardano';
    if (lower === 'doge') return 'dogecoin';
    return lower;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export const priceCache = new PriceCache();
