export interface CoinPrice {
  id: string;
  name: string;
  symbol: string;
  priceUsd: number;
  change24h: number;
  lastUpdated: Date;
  source: 'coingecko' | 'fallback' | 'mock';
  alertStatus: 'normal' | 'alert';
}

export interface CoinGeckoSimplePriceResponse {
  [coinId: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}
