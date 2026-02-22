import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Trading State
let botRunning = false;
let dailyProfit = 0;
let totalProfit = 4200;
let activeTrades: any[] = [];
let tradeHistory: any[] = [];

// Mock prices (in production, fetch from Binance)
const prices: Record<string, number> = {
  'BTCUSDT': 67908.63,
  'ETHUSDT': 1972.18,
  'BNBUSDT': 620.28,
  'SOLUSDT': 84.98,
  'ADAUSDT': 0.2759,
  'DOTUSDT': 1.344,
  'LINKUSDT': 8.82,
  'AVAXUSDT': 9.01
};

// Active strategies
const strategies = [
  {
    id: 'scalping-btc',
    name: 'BTC Micro Scalper',
    type: 'scalping',
    symbol: 'BTCUSDT',
    active: true,
    minProfit: 0.15,
    maxLoss: 0.08,
    amount: 100
  },
  {
    id: 'swing-eth',
    name: 'ETH Swing Trader',
    type: 'swing',
    symbol: 'ETHUSDT',
    active: true,
    minProfit: 2.5,
    maxLoss: 1.2,
    amount: 200
  }
];

// Routes
app.get('/api/status', (req, res) => {
  res.json({
    botRunning,
    dailyProfit,
    totalProfit,
    activeTrades: activeTrades.length,
    totalTrades: tradeHistory.length
  });
});

app.get('/api/prices', (req, res) => {
  res.json(prices);
});

app.get('/api/ticker/24hr', (req, res) => {
  const tickers = Object.entries(prices).map(([symbol, price]) => ({
    symbol,
    price,
    priceChange: (Math.random() - 0.5) * price * 0.02,
    priceChangePercent: (Math.random() - 0.5) * 2,
    volume: Math.random() * 1000000,
    high24h: price * 1.02,
    low24h: price * 0.98
  }));
  res.json(tickers);
});

app.post('/api/bot/start', (req, res) => {
  botRunning = true;
  console.log('Trading bot started');
  res.json({ status: 'started', message: 'Trading bot is now active' });
});

app.post('/api/bot/stop', (req, res) => {
  botRunning = false;
  console.log('Trading bot stopped');
  res.json({ status: 'stopped', message: 'Trading bot has been stopped' });
});

app.get('/api/strategies', (req, res) => {
  res.json(strategies);
});

app.post('/api/strategies/:id/toggle', (req, res) => {
  const strategy = strategies.find(s => s.id === req.params.id);
  if (strategy) {
    strategy.active = !strategy.active;
    res.json({ id: strategy.id, active: strategy.active });
  } else {
    res.status(404).json({ error: 'Strategy not found' });
  }
});

app.get('/api/trades', (req, res) => {
  res.json(tradeHistory.slice(-50)); // Last 50 trades
});

app.get('/api/holdings/recommendations', (req, res) => {
  res.json([
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      allocation: 45,
      targetPrice: 95000,
      currentPrice: prices.BTCUSDT,
      upside: 39.9,
      thesis: 'Digital gold narrative strengthening. Institutional adoption accelerating.',
      riskLevel: 'Low',
      timeHorizon: '2-5 years'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      allocation: 30,
      targetPrice: 3500,
      currentPrice: prices.ETHUSDT,
      upside: 77.5,
      thesis: 'Dominant smart contract platform. Staking yields 4-5%.',
      riskLevel: 'Medium',
      timeHorizon: '2-4 years'
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      allocation: 15,
      targetPrice: 150,
      currentPrice: prices.SOLUSDT,
      upside: 76.5,
      thesis: 'High-performance blockchain. Growing DeFi ecosystem.',
      riskLevel: 'High',
      timeHorizon: '2-3 years'
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      allocation: 10,
      targetPrice: 15,
      currentPrice: prices.LINKUSDT,
      upside: 70.1,
      thesis: 'Oracle market leader. Enterprise partnerships expanding.',
      riskLevel: 'Medium',
      timeHorizon: '2-3 years'
    }
  ]);
});

// Scalping Strategy Implementation
async function executeScalpingTrade(strategy: any) {
  const currentPrice = prices[strategy.symbol];
  const tradeAmount = strategy.amount / currentPrice;
  
  // Simulate trade execution
  const trade = {
    id: Date.now().toString(),
    symbol: strategy.symbol,
    type: 'buy',
    amount: tradeAmount,
    price: currentPrice,
    timestamp: new Date(),
    profit: null,
    status: 'open'
  };
  
  activeTrades.push(trade);
  console.log(`[SCALPING] Bought ${tradeAmount} ${strategy.symbol} at $${currentPrice}`);
  
  // Simulate closing trade after random time
  setTimeout(() => {
    const closePrice = currentPrice * (1 + (Math.random() * 0.003 - 0.001));
    const profit = (closePrice - currentPrice) * tradeAmount;
    trade.status = 'closed';
    trade.profit = profit;
    dailyProfit += profit;
    totalProfit += profit;
    tradeHistory.push(trade);
    activeTrades = activeTrades.filter(t => t.id !== trade.id);
    console.log(`[SCALPING] Sold ${strategy.symbol} at $${closePrice}, Profit: $${profit.toFixed(2)}`);
  }, 30000 + Math.random() * 60000); // 30-90 seconds
}

// Swing Trading Strategy
async function executeSwingTrade(strategy: any) {
  const currentPrice = prices[strategy.symbol];
  const tradeAmount = strategy.amount / currentPrice;
  
  const trade = {
    id: Date.now().toString(),
    symbol: strategy.symbol,
    type: Math.random() > 0.5 ? 'buy' : 'sell',
    amount: tradeAmount,
    price: currentPrice,
    timestamp: new Date(),
    profit: null,
    status: 'open'
  };
  
  activeTrades.push(trade);
  console.log(`[SWING] ${trade.type.toUpperCase()} ${tradeAmount} ${strategy.symbol} at $${currentPrice}`);
  
  // Simulate closing after longer period
  setTimeout(() => {
    const profitPercent = (Math.random() - 0.3) * 0.05; // -1.5% to +3.5%
    const closePrice = currentPrice * (1 + profitPercent);
    const profit = trade.type === 'buy' 
      ? (closePrice - currentPrice) * tradeAmount
      : (currentPrice - closePrice) * tradeAmount;
    trade.status = 'closed';
    trade.profit = profit;
    dailyProfit += profit;
    totalProfit += profit;
    tradeHistory.push(trade);
    activeTrades = activeTrades.filter(t => t.id !== trade.id);
    console.log(`[SWING] Closed ${strategy.symbol}, Profit: $${profit.toFixed(2)}`);
  }, 300000 + Math.random() * 600000); // 5-15 minutes
}

// Main trading loop
setInterval(async () => {
  if (botRunning) {
    for (const strategy of strategies.filter(s => s.active)) {
      try {
        if (strategy.type === 'scalping' && Math.random() > 0.7) {
          await executeScalpingTrade(strategy);
        } else if (strategy.type === 'swing' && Math.random() > 0.9) {
          await executeSwingTrade(strategy);
        }
      } catch (error) {
        console.error('Trading error:', error);
      }
    }
  }
}, 10000); // Check every 10 seconds

// Simulate price updates
setInterval(() => {
  Object.keys(prices).forEach(symbol => {
    const change = (Math.random() - 0.5) * 0.002;
    prices[symbol] *= (1 + change);
  });
}, 5000);

// WebSocket for real-time updates
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  const interval = setInterval(() => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: 'price_update',
        prices,
        botRunning,
        dailyProfit,
        activeTrades: activeTrades.length
      }));
    }
  }, 5000);
  
  ws.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           CryptoTrading Pro - Server Running               ║
╠════════════════════════════════════════════════════════════╣
║  API Endpoint: http://localhost:${PORT}                     ║
║  WebSocket: ws://localhost:${PORT}                          ║
║  Status: ${botRunning ? 'ACTIVE' : 'IDLE'}                                          ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
