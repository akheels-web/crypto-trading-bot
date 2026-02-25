import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3001;

// ─── Data persistence directory ────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJson<T>(file: string, defaultValue: T): T {
  const filePath = path.join(DATA_DIR, file);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
    }
  } catch (e) {
    console.warn(`[Data] Could not read ${file}:`, e);
  }
  return defaultValue;
}

function writeJson(file: string, data: any) {
  const filePath = path.join(DATA_DIR, file);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.warn(`[Data] Could not write ${file}:`, e);
  }
}

// ─── Default strategy list ──────────────────────────────────────────────────
const DEFAULT_STRATEGIES = [
  { id: 'scalping-btc', name: 'BTC Micro Scalper', type: 'scalping', symbol: 'BTCUSDT', active: true, minProfit: 0.15, maxLoss: 0.08, amount: 100, positionSize: 100, description: 'High-frequency scalping on BTC/USDT with tight stops' },
  { id: 'swing-eth', name: 'ETH Swing Trader', type: 'swing', symbol: 'ETHUSDT', active: true, minProfit: 2.5, maxLoss: 1.2, amount: 200, positionSize: 200, description: 'Medium-term swing trading on ETH momentum' },
  { id: 'scalping-sol', name: 'SOL Scalper', type: 'scalping', symbol: 'SOLUSDT', active: false, minProfit: 0.2, maxLoss: 0.1, amount: 150, positionSize: 150, description: 'Fast scalping on SOL volatility' },
  { id: 'dca-bnb', name: 'BNB DCA Bot', type: 'dca', symbol: 'BNBUSDT', active: false, minProfit: 5.0, maxLoss: 3.0, amount: 300, positionSize: 300, description: 'Dollar-cost averaging into BNB on dips' },
];

// ─── Default settings ───────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  paperTrading: true,
  notifications: false,
  tradingPairs: 'BTCUSDT,ETHUSDT,SOLUSDT',
  botRunning: false,   // ← persisted so bot state survives server restart
};


// ─── Load persisted state from disk ────────────────────────────────────────
let strategies: any[] = readJson('strategies.json', DEFAULT_STRATEGIES);
let botSettings = readJson('settings.json', DEFAULT_SETTINGS);

// ─── Trading state ─────────────────────────────────────────────────────────
let botRunning: boolean = botSettings.botRunning ?? false;  // ← loaded from disk
let dailyProfit = 0;
let totalProfit = 0;
let activeTrades: any[] = [];
let tradeHistory: any[] = [];

// ─── Global error handlers — prevent PM2 from crashing on unhandled errors ──
process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught exception:', err.message);
});


// ─── Mock price cache (updated from Binance) ────────────────────────────────
const prices: Record<string, number> = {
  'BTCUSDT': 67908.63, 'ETHUSDT': 1972.18, 'BNBUSDT': 620.28, 'SOLUSDT': 84.98,
  'XRPUSDT': 0.5891, 'ADAUSDT': 0.2759, 'AVAXUSDT': 9.01, 'DOTUSDT': 1.344,
  'LINKUSDT': 8.82, 'MATICUSDT': 0.198, 'INJUSDT': 14.21, 'ARBUSDT': 0.312,
  'OPUSDT': 0.758, 'SUIUSDT': 2.14, 'APTUSDT': 5.83, 'SEIUSDT': 0.198,
  'TIAUSDT': 3.21, 'BLURUSDT': 0.089, 'STRKUSDT': 0.312, 'JTOUSDT': 1.87
};

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Disable ETag caching on all API routes so the browser always fetches fresh data
// (without this, Express returns 304 Not Modified when response body hasn't changed,
//  causing the browser to display stale zeros for status/balance endpoints)
app.disable('etag');
app.use('/api', (_req: any, res: any, next: any) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  next();
});

// ─── Binance PUBLIC API helper (no auth needed) ─────────────────────────────
function fetchFromBinance(apiPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.binance.com',
      path: apiPath,
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      timeout: 8000
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

// ─── Binance SIGNED API helper (requires API key + secret) ─────────────────
function fetchFromBinanceSigned(apiPath: string, queryParams: Record<string, string> = {}): Promise<any> {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;

  if (!apiKey || !apiSecret || apiKey === 'your_api_key_here' || apiSecret === 'your_api_secret_here') {
    return Promise.reject(new Error('KEYS_NOT_CONFIGURED'));
  }

  const timestamp = Date.now().toString();
  const params = { ...queryParams, timestamp };
  const queryString = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  const signature = crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
  const fullQuery = `${queryString}&signature=${signature}`;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.binance.com',
      path: `${apiPath}?${fullQuery}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-MBX-APIKEY': apiKey
      },
      timeout: 8000
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════
//  API ROUTES
// ═══════════════════════════════════════════════════════════════

// ── Status ──────────────────────────────────────────────────────
app.get('/api/status', (req: any, res: any) => {
  const winningTrades = tradeHistory.filter(t => t.profit && t.profit > 0).length;
  const winRate = tradeHistory.length > 0
    ? Math.round((winningTrades / tradeHistory.length) * 100)
    : 0; // Default to 0 before trades exist

  // Calculate unrealized profit for active trades based on live prices
  let activeTradesProfitable = 0;
  activeTrades.forEach(trade => {
    const currentPrice = prices[trade.symbol] || trade.price;
    const profit = trade.type === 'buy'
      ? (currentPrice - trade.price) * trade.amount
      : (trade.price - currentPrice) * trade.amount;

    if (profit > 0) activeTradesProfitable++;
  });

  res.json({
    botRunning,
    dailyProfit,
    totalProfit,
    activeTrades: activeTrades.length,
    activeTradesProfitable,
    totalTrades: tradeHistory.length,
    winRate,
    paperTrading: botSettings.paperTrading,
  });
});

// ── Prices ──────────────────────────────────────────────────────
app.get('/api/prices', (req: any, res: any) => {
  res.json(prices);
});

// ── Bot Settings — persisted to data/settings.json ─────────────
app.get('/api/bot/settings', (req: any, res: any) => {
  res.json(botSettings);
});

app.post('/api/bot/settings', (req: any, res: any) => {
  const { paperTrading, notifications, tradingPairs } = req.body;
  if (typeof paperTrading === 'boolean') botSettings.paperTrading = paperTrading;
  if (typeof notifications === 'boolean') botSettings.notifications = notifications;
  if (typeof tradingPairs === 'string') botSettings.tradingPairs = tradingPairs;
  writeJson('settings.json', botSettings);  // ← PERSISTED TO DISK
  console.log('[Settings] Saved to disk:', botSettings);
  res.json({ success: true, settings: botSettings });
});

// ── Strategies — persisted to data/strategies.json ─────────────
app.get('/api/strategies', (req: any, res: any) => {
  // Dynamically calculate strategy performance and win rate
  const enrichedStrategies = strategies.map((s: any) => {
    const strategyTrades = tradeHistory.filter(t => t.strategyId === s.id);
    const profitTrades = strategyTrades.filter(t => t.profit && t.profit > 0);

    const winRate = strategyTrades.length > 0
      ? Math.round((profitTrades.length / strategyTrades.length) * 100)
      : 0;

    const totalProfit = strategyTrades.reduce((sum, t) => sum + (t.profit || 0), 0);

    return {
      ...s,
      trades: strategyTrades.length,
      winRate,
      performance: parseFloat(totalProfit.toFixed(2)) // Display raw P&L as performance score
    };
  });

  res.json(enrichedStrategies);
});

// PATCH: update any field on a strategy (active, minProfit, maxLoss, positionSize)
app.patch('/api/strategies/:id', (req: any, res: any) => {
  const strategy = strategies.find((s: any) => s.id === req.params.id);
  if (!strategy) {
    return res.status(404).json({ error: 'Strategy not found' });
  }
  const { active, minProfit, maxLoss, positionSize } = req.body;
  if (typeof active === 'boolean') strategy.active = active;
  if (typeof minProfit === 'number') strategy.minProfit = minProfit;
  if (typeof maxLoss === 'number') strategy.maxLoss = maxLoss;
  if (typeof positionSize === 'number') strategy.positionSize = positionSize;
  writeJson('strategies.json', strategies);  // ← PERSISTED TO DISK
  console.log(`[Strategies] Updated ${strategy.id}: active=${strategy.active}`);
  res.json(strategy);
});

// ── Account Balance (requires API keys in .env) ─────────────────
app.get('/api/account/balance', async (req: any, res: any) => {
  try {
    const account = await fetchFromBinanceSigned('/api/v3/account');

    if (account.code) {
      // Binance returned an error (code like -2014, -1022)
      return res.json({
        configured: true,
        error: account.msg || 'Binance API error',
        balances: [],
        totalUSDT: 0,
        dailyChange: 0,
      });
    }

    // Filter to assets with non-zero balance
    const nonZeroBalances = (account.balances || []).filter(
      (b: any) => parseFloat(b.free) + parseFloat(b.locked) > 0
    );

    // Calculate total portfolio value in USDT
    let totalUSDT = 0;
    const balances = nonZeroBalances.map((b: any) => {
      const total = parseFloat(b.free) + parseFloat(b.locked);
      let usdtValue = 0;
      if (b.asset === 'USDT' || b.asset === 'BUSD' || b.asset === 'USDC') {
        usdtValue = total;
      } else {
        const priceKey = `${b.asset}USDT`;
        const priceVal = prices[priceKey];
        usdtValue = priceVal ? total * priceVal : 0;
      }
      totalUSDT += usdtValue;
      return { asset: b.asset, free: parseFloat(b.free), locked: parseFloat(b.locked), usdtValue };
    });

    console.log(`[Account] Portfolio value: $${totalUSDT.toFixed(2)} USDT`);
    res.json({ configured: true, balances, totalUSDT, dailyChange: dailyProfit });

  } catch (err: any) {
    if (err.message === 'KEYS_NOT_CONFIGURED') {
      return res.json({
        configured: false,
        message: 'Add BINANCE_API_KEY and BINANCE_API_SECRET to backend/.env to see your real portfolio value.',
        totalUSDT: 0,
        dailyChange: 0,
        balances: [],
      });
    }
    console.error('[Account] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Binance live price proxy (public — no key needed) ───────────
app.get('/api/binance/prices', async (req: any, res: any) => {
  const symbols = Object.keys(prices);
  try {
    const symbolsJson = JSON.stringify(symbols);
    const apiPath = `/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsJson)}`;
    const data: any[] = await fetchFromBinance(apiPath);

    if (!Array.isArray(data)) {
      throw new Error(`Unexpected Binance response: ${JSON.stringify(data).slice(0, 200)}`);
    }

    const result = data.map((t: any) => ({
      symbol: t.symbol,
      price: parseFloat(t.lastPrice),
      change24h: parseFloat(t.priceChange),
      changePercent24h: parseFloat(t.priceChangePercent),
      volume: parseFloat(t.volume),
      high24h: parseFloat(t.highPrice),
      low24h: parseFloat(t.lowPrice),
      live: true
    }));

    // Update internal prices cache with live values
    result.forEach((t: any) => { prices[t.symbol] = t.price; });

    console.log(`[Binance] ✅ Live prices fetched for ${result.length} symbols`);
    res.json({ live: true, data: result });

  } catch (err) {
    const msg = (err as Error).message;
    console.warn(`[Binance] ⚠️  Falling back to mock prices — reason: ${msg}`);
    const fallback = Object.keys(prices).map(symbol => ({
      symbol,
      price: prices[symbol],
      change24h: 0,
      changePercent24h: 0,
      volume: 0,
      high24h: prices[symbol] * 1.02,
      low24h: prices[symbol] * 0.98,
      live: false
    }));
    res.json({ live: false, data: fallback });
  }
});

// ── Trade history ───────────────────────────────────────────────
app.get('/api/trades', (req: any, res: any) => {
  res.json(tradeHistory.slice(-50));
});

// ── Bot Start/Stop ──────────────────────────────────────────────
app.post('/api/bot/start', async (req: any, res: any) => {
  // ← Set botRunning FIRST so any concurrent /api/status poll sees the correct value
  botRunning = true;
  botSettings.botRunning = true;
  writeJson('settings.json', botSettings);
  const mode = botSettings.paperTrading ? 'paper trading' : 'live trading';
  console.log(`[Bot] Started in ${mode} mode`);
  // Optional connectivity check (non-blocking — doesn't gate the start)
  fetchFromBinance('/api/v3/ping')
    .then(() => console.log('[Bot] Binance ping OK'))
    .catch(() => console.warn('[Bot] Binance unreachable — running in offline mode'));
  res.json({ status: 'started', message: `Trading bot is now active (${mode})`, paperTrading: botSettings.paperTrading });
});


app.post('/api/bot/stop', (req: any, res: any) => {
  botRunning = false;
  botSettings.botRunning = false;
  writeJson('settings.json', botSettings);  // ← persist bot state
  console.log('[Bot] Stopped');
  res.json({ status: 'stopped', message: 'Trading bot has been stopped' });
});


// ── Holdings recommendations ────────────────────────────────────
app.get('/api/holdings/recommendations', (req: any, res: any) => {
  res.json([
    { symbol: 'BTC', name: 'Bitcoin', allocation: 45, targetPrice: 95000, currentPrice: prices.BTCUSDT, upside: parseFloat(((95000 - prices.BTCUSDT) / prices.BTCUSDT * 100).toFixed(1)), thesis: 'Digital gold narrative strengthening. Institutional adoption accelerating.', riskLevel: 'Low', timeHorizon: '2-5 years' },
    { symbol: 'ETH', name: 'Ethereum', allocation: 30, targetPrice: 3500, currentPrice: prices.ETHUSDT, upside: parseFloat(((3500 - prices.ETHUSDT) / prices.ETHUSDT * 100).toFixed(1)), thesis: 'Dominant smart contract platform. Staking yields 4-5%.', riskLevel: 'Medium', timeHorizon: '2-4 years' },
    { symbol: 'SOL', name: 'Solana', allocation: 15, targetPrice: 150, currentPrice: prices.SOLUSDT, upside: parseFloat(((150 - prices.SOLUSDT) / prices.SOLUSDT * 100).toFixed(1)), thesis: 'High-performance blockchain. Growing DeFi ecosystem.', riskLevel: 'High', timeHorizon: '2-3 years' },
    { symbol: 'LINK', name: 'Chainlink', allocation: 10, targetPrice: 15, currentPrice: prices.LINKUSDT, upside: parseFloat(((15 - prices.LINKUSDT) / prices.LINKUSDT * 100).toFixed(1)), thesis: 'Oracle market leader. Enterprise partnerships expanding.', riskLevel: 'Medium', timeHorizon: '2-3 years' },
  ]);
});

// ── Health check ────────────────────────────────────────────────
app.get('/health', (req: any, res: any) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════
//  TRADING ENGINE
// ═══════════════════════════════════════════════════════════════

async function executeScalpingTrade(strategy: any) {
  const currentPrice = prices[strategy.symbol] || 1;
  const tradeAmount = strategy.amount / currentPrice;
  const trade: any = {
    id: Date.now().toString(),
    strategyId: strategy.id,
    symbol: strategy.symbol,
    type: 'buy',
    amount: tradeAmount,
    price: currentPrice,
    timestamp: new Date(),
    profit: null,
    status: 'open'
  };
  activeTrades.push(trade);
  console.log(`[SCALPING] Bought ${tradeAmount.toFixed(6)} ${strategy.symbol} at $${currentPrice}`);
  setTimeout(() => {
    const closePrice = currentPrice * (1 + (Math.random() * 0.003 - 0.001)); // Slight random fluctuation
    const profit = (closePrice - currentPrice) * tradeAmount;
    trade.status = 'closed';
    trade.profit = profit;
    trade.exitPrice = closePrice;

    dailyProfit += profit; totalProfit += profit;
    tradeHistory.push({ ...trade });
    activeTrades = activeTrades.filter(t => t.id !== trade.id);
    console.log(`[SCALPING] Sold ${strategy.symbol} at $${closePrice.toFixed(2)}, Profit: $${profit.toFixed(2)}`);
  }, 30000 + Math.random() * 60000);
}

async function executeSwingTrade(strategy: any) {
  const currentPrice = prices[strategy.symbol] || 1;
  const tradeAmount = strategy.amount / currentPrice;
  const trade: any = {
    id: Date.now().toString(),
    strategyId: strategy.id,
    symbol: strategy.symbol,
    type: Math.random() > 0.5 ? 'buy' : 'sell',
    amount: tradeAmount,
    price: currentPrice,
    timestamp: new Date(),
    profit: null,
    status: 'open'
  };
  activeTrades.push(trade);
  console.log(`[SWING] ${trade.type.toUpperCase()} ${tradeAmount.toFixed(6)} ${strategy.symbol} at $${currentPrice}`);
  setTimeout(() => {
    // Determine realistic swing trade exit
    const profitPercent = (Math.random() - 0.3) * 0.05;
    const closePrice = currentPrice * (1 + profitPercent);
    const profit = trade.type === 'buy'
      ? (closePrice - currentPrice) * tradeAmount
      : (currentPrice - closePrice) * tradeAmount;

    trade.status = 'closed';
    trade.profit = profit;
    trade.exitPrice = closePrice;

    dailyProfit += profit; totalProfit += profit;
    tradeHistory.push({ ...trade });
    activeTrades = activeTrades.filter(t => t.id !== trade.id);
    console.log(`[SWING] Closed ${strategy.symbol} at $${closePrice.toFixed(2)}, Profit: $${profit.toFixed(2)}`);
  }, 300000 + Math.random() * 600000);
}

// Main trading loop - fires every 10s when bot is running
setInterval(async () => {
  if (!botRunning) return;
  for (const strategy of strategies.filter((s: any) => s.active)) {
    try {
      if (strategy.type === 'scalping' && Math.random() > 0.7) await executeScalpingTrade(strategy);
      else if (strategy.type === 'swing' && Math.random() > 0.9) await executeSwingTrade(strategy);
    } catch (error) {
      console.error('Trading error:', error);
    }
  }
}, 10000);

// ─── WebSocket for real-time updates ────────────────────────────
wss.on('connection', (ws) => {
  console.log('[WS] Client connected');
  const interval = setInterval(() => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'price_update', prices, botRunning, dailyProfit, activeTrades: activeTrades.length }));
    }
  }, 5000);
  ws.on('close', () => { clearInterval(interval); console.log('[WS] Client disconnected'); });
});

// ─── Server start ────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║        CryptoTrading Pro — Server Running          ║
╠════════════════════════════════════════════════════╣
║  Port: ${PORT}                                        ║
║  Strategies loaded: ${strategies.length} (from disk if exists)    ║
║  Paper trading: ${botSettings.paperTrading}                        ║
╚════════════════════════════════════════════════════╝
  `);
});

export default app;
