import { Router, Request, Response } from 'express';
import { priceCache } from '../cache/priceCache.js';
import { fetchPrices, getFetcherStatus } from '../services/priceFetcher.js';

const router = Router();
const startTime = new Date();

// GET all prices
router.get('/api/prices', (req: Request, res: Response) => {
  try {
    const prices = priceCache.getAll();
    res.json({
      success: true,
      data: prices,
      timestamp: new Date()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET specific price
router.get('/api/prices/:coinId', (req: Request, res: Response) => {
  const { coinId } = req.params;
  try {
    const coin = priceCache.get(coinId as string);
    if (!coin) {
      res.status(404).json({
        success: false,
        error: `Coin with ID or alias '${coinId}' not found in surveillance list.`
      });
      return;
    }
    res.json({
      success: true,
      data: coin,
      timestamp: new Date()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST trigger refresh
router.post('/api/prices/refresh', async (req: Request, res: Response) => {
  try {
    const success = await fetchPrices(true);
    const status = getFetcherStatus();
    
    if (success) {
      res.json({
        success: true,
        message: 'Cache refreshed successfully from CoinGecko.',
        status
      });
    } else {
      res.json({
        success: false,
        message: status.error || 'Failed to fetch new prices or manual trigger rate limit active. Using cached data.',
        status
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET health & statistics (accessible via both /health and /api/health)
const getHealthHandler = (req: Request, res: Response) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
  const status = getFetcherStatus();
  
  res.json({
    status: 'UP',
    uptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
    uptimeSeconds,
    cacheSize: priceCache.getAll().length,
    fetcher: status,
    timestamp: new Date()
  });
};

router.get('/health', getHealthHandler);
router.get('/api/health', getHealthHandler);

export default router;
