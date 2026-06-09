import { Router, Request, Response } from 'express';
import { priceCache } from '../cache/priceCache.js';
import { fetchPrices, getFetcherStatus, baselinePriceMap, lastAlertMap, activeAlertSet } from '../services/priceFetcher.js';

const router = Router();
const startTime = new Date();

// Set no-cache headers for API routes
router.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

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
    status: 'healthy',
    uptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
    memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
    lastPriceFetch: status.lastSuccessfulFetchTime ? status.lastSuccessfulFetchTime.toISOString() : 'never',
    engineRunning: status.isSchedulerRunning
  });
};

router.get('/health', getHealthHandler);
router.get('/api/health', getHealthHandler);

// POST manual trigger flash crash for testing
router.post('/api/test/crash', (req: Request, res: Response) => {
  const { coinId } = req.body;
  if (!coinId) {
    res.status(400).json({ success: false, error: 'coinId is required in request body.' });
    return;
  }
  
  const coin = priceCache.get(coinId);
  if (!coin) {
    res.status(404).json({ success: false, error: `Coin with ID '${coinId}' not found in cache.` });
    return;
  }
  
  let baseline = baselinePriceMap.get(coin.id);
  if (baseline === undefined) {
    baseline = coin.priceUsd;
    baselinePriceMap.set(coin.id, baseline);
  }
  
  // Force price to drop 3% below baseline
  const crashedPrice = baseline * 0.97;
  const percentageDrop = ((crashedPrice - baseline) / baseline) * 100;
  
  const now = Date.now();
  const lastAlertTime = lastAlertMap.get(coin.id) || 0;
  let alertTriggered = false;
  
  if (now - lastAlertTime >= 60000) {
    console.log(`⚠️ [ALERT] FLASH CRASH DETECTED (MANUAL TEST): ${coin.name} dropped ${percentageDrop.toFixed(2)}%! (Current: $${crashedPrice.toFixed(4)}, Baseline: $${baseline.toFixed(4)})`);
    lastAlertMap.set(coin.id, now);
    alertTriggered = true;
  } else {
    console.log(`ℹ️ [Fetcher] Flash crash detected (manual test) for ${coin.name} (${percentageDrop.toFixed(2)}%), but alert deduplicated.`);
  }
  
  activeAlertSet.add(coin.id);
  
  // Update cache with alert status
  priceCache.set(coin.id, {
    priceUsd: parseFloat(crashedPrice.toFixed(coin.priceUsd > 100 ? 2 : 4)),
    alertStatus: 'alert'
  });
  
  res.json({
    success: true,
    message: `Manually triggered flash crash drop of 3.00% for ${coin.name}.`,
    details: {
      coinId: coin.id,
      baselinePrice: baseline,
      newPrice: crashedPrice,
      percentageDrop,
      alertTriggered,
      alertStatus: 'alert'
    }
  });
});

export default router;
