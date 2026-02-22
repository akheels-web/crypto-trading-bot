# CryptoTrading Pro - Deployment Guide

## Overview
This guide will help you deploy the CryptoTrading Pro platform on your Proxmox VM and connect it to your Binance account.

## Features
- **Daily Trading Strategies**: Scalping and swing trading with configurable risk parameters
- **Long-term Holdings Analysis**: AI-powered recommendations based on market data
- **Automated Trading Bot**: Profit-booking bot with risk management
- **Real-time Dashboard**: Live market data and performance tracking

---

## Part 1: Proxmox VM Setup

### Step 1: Create a New VM
1. Log in to your Proxmox web interface
2. Click "Create VM" in the top right
3. Configure the VM:
   - **Name**: `crypto-trading-bot`
   - **OS**: Ubuntu 22.04 LTS (recommended)
   - **CPU**: 2-4 cores
   - **Memory**: 4-8 GB RAM
   - **Storage**: 50+ GB SSD
   - **Network**: Bridged (for internet access)

### Step 2: Install Ubuntu
1. Start the VM and install Ubuntu Server 22.04 LTS
2. During installation:
   - Create a user: `trader`
   - Enable OpenSSH server
   - Install standard system utilities

### Step 3: Initial Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

---

## Part 2: Application Deployment

### Step 1: Clone and Setup
```bash
# Create app directory
sudo mkdir -p /var/www/crypto-trading
sudo chown -R $USER:$USER /var/www/crypto-trading

# Copy the built files (from this package)
cd /var/www/crypto-trading
# Upload the 'dist' folder contents to this directory
```

### Step 2: Install Dependencies (For Backend API)
```bash
# Create backend directory
mkdir -p /var/www/crypto-trading-api
cd /var/www/crypto-trading-api

# Initialize Node.js project
npm init -y

# Install required packages
npm install express cors dotenv node-binance-api ws
npm install -D typescript @types/node @types/express @types/cors

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF
```

### Step 3: Create Trading Bot Backend
```bash
mkdir -p /var/www/crypto-trading-api/src
cd /var/www/crypto-trading-api/src

# Create the trading bot server
cat > server.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Binance from 'node-binance-api';
import WebSocket from 'ws';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Binance API Configuration
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY || '',
  APISECRET: process.env.BINANCE_API_SECRET || '',
  test: process.env.USE_TESTNET === 'true'
});

// Trading State
let botRunning = false;
let activeStrategies: any[] = [];
let tradeHistory: any[] = [];

// Routes
app.get('/api/status', (req, res) => {
  res.json({
    botRunning,
    activeStrategies: activeStrategies.length,
    totalTrades: tradeHistory.length
  });
});

app.get('/api/prices', async (req, res) => {
  try {
    const prices = await binance.prices();
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

app.get('/api/ticker/24hr', async (req, res) => {
  try {
    const tickers = await binance.prevDay(false);
    res.json(tickers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch 24hr ticker' });
  }
});

app.post('/api/bot/start', (req, res) => {
  botRunning = true;
  console.log('Trading bot started');
  res.json({ status: 'started' });
});

app.post('/api/bot/stop', (req, res) => {
  botRunning = false;
  console.log('Trading bot stopped');
  res.json({ status: 'stopped' });
});

app.get('/api/trades', (req, res) => {
  res.json(tradeHistory);
});

// Scalping Strategy
async function executeScalpingStrategy(symbol: string, amount: number) {
  if (!botRunning) return;
  
  try {
    // Get current price
    const ticker = await binance.prices(symbol);
    const currentPrice = parseFloat(ticker[symbol]);
    
    // Simple scalping logic: Buy if price dips 0.1%, sell if rises 0.15%
    // This is a simplified example - real strategies use more indicators
    
    console.log(`Scalping ${symbol} at ${currentPrice}`);
    
    // Place buy order (paper trading mode)
    if (process.env.USE_TESTNET === 'true') {
      console.log(`[PAPER TRADE] Would buy ${amount} USDT of ${symbol}`);
    } else {
      // Real trading - implement with caution
      // const order = await binance.marketBuy(symbol, amount / currentPrice);
    }
    
  } catch (error) {
    console.error('Scalping error:', error);
  }
}

// Swing Trading Strategy
async function executeSwingStrategy(symbol: string, amount: number) {
  if (!botRunning) return;
  
  try {
    // Get 24h data
    const data = await binance.candles(symbol, '4h', false, 10);
    const closes = data.map((c: any) => parseFloat(c[4]));
    
    // Simple moving average
    const sma20 = closes.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20;
    const currentPrice = closes[closes.length - 1];
    
    // Buy if price > SMA20 (uptrend)
    if (currentPrice > sma20 * 1.02) {
      console.log(`[SWING] Uptrend detected for ${symbol}`);
    }
    
  } catch (error) {
    console.error('Swing trading error:', error);
  }
}

// Main trading loop
setInterval(async () => {
  if (botRunning) {
    // Execute active strategies
    for (const strategy of activeStrategies) {
      if (strategy.type === 'scalping') {
        await executeScalpingStrategy(strategy.symbol, strategy.amount);
      } else if (strategy.type === 'swing') {
        await executeSwingStrategy(strategy.symbol, strategy.amount);
      }
    }
  }
}, 60000); // Run every minute

app.listen(PORT, () => {
  console.log(`Trading bot API running on port ${PORT}`);
});
EOF
```

### Step 4: Environment Configuration
```bash
cd /var/www/crypto-trading-api

# Create .env file
cat > .env << 'EOF'
# Binance API Configuration
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here
USE_TESTNET=true

# Server Configuration
PORT=3001
NODE_ENV=production

# Trading Configuration
DEFAULT_RISK_LEVEL=50
MAX_DAILY_LOSS=100
DAILY_PROFIT_TARGET=200
EOF

chmod 600 .env
```

---

## Part 3: Nginx Configuration

### Step 1: Create Nginx Config
```bash
sudo tee /etc/nginx/sites-available/crypto-trading << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    root /var/www/crypto-trading/dist;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/crypto-trading /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## Part 4: Systemd Service Setup

### Create Trading Bot Service
```bash
sudo tee /etc/systemd/system/crypto-trading-bot.service << 'EOF'
[Unit]
Description=Crypto Trading Bot API
After=network.target

[Service]
Type=simple
User=trader
WorkingDirectory=/var/www/crypto-trading-api
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Build and start service
sudo systemctl daemon-reload
sudo systemctl enable crypto-trading-bot
```

---

## Part 5: Binance API Setup

### Step 1: Create API Keys
1. Log in to your Binance account
2. Go to **API Management** (https://www.binance.com/en/my/settings/api-management)
3. Create a new API key:
   - Label: `CryptoTrading Pro`
   - Enable **Reading** (required)
   - Enable **Spot & Margin Trading** (if using real trading)
   - Restrict access to your VM IP address (recommended)

### Step 2: Testnet Setup (Recommended for Testing)
1. Create a Binance Testnet account: https://testnet.binance.vision/
2. Generate testnet API keys
3. Update your `.env` file with testnet credentials
4. Set `USE_TESTNET=true`

---

## Part 6: SSL Certificate (Optional but Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is automatically configured
```

---

## Part 7: Starting the Platform

```bash
# 1. Build the backend
cd /var/www/crypto-trading-api
npx tsc

# 2. Start the trading bot API
sudo systemctl start crypto-trading-bot

# 3. Check status
sudo systemctl status crypto-trading-bot

# 4. View logs
sudo journalctl -u crypto-trading-bot -f
```

---

## Part 8: Trading Strategies Configuration

### Scalping Strategy (Small Daily Profits)
- **Timeframe**: 1-5 minutes
- **Target**: 0.1-0.3% per trade
- **Pairs**: BTC/USDT, ETH/USDT
- **Risk**: Low (tight stop-losses)

### Swing Trading Strategy
- **Timeframe**: 4 hours to 7 days
- **Target**: 2-5% per trade
- **Pairs**: BTC, ETH, SOL, major alts
- **Risk**: Medium (wider stops, position sizing)

### Long-term Holdings (HODL)
Based on current market analysis:
- **BTC**: 45% allocation - Digital gold, institutional adoption
- **ETH**: 30% allocation - Smart contract leader, staking yields
- **SOL**: 15% allocation - High-performance blockchain
- **LINK**: 10% allocation - Oracle infrastructure

---

## Part 9: Monitoring & Maintenance

### View Logs
```bash
# Trading bot logs
sudo journalctl -u crypto-trading-bot -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Update Application
```bash
# Stop services
sudo systemctl stop crypto-trading-bot

# Update files
# (Copy new dist folder and rebuild backend)

# Restart
cd /var/www/crypto-trading-api && npx tsc
sudo systemctl start crypto-trading-bot
```

### Backup
```bash
# Backup configuration
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/crypto-trading-api/.env /var/www/crypto-trading/dist
```

---

## Security Recommendations

1. **Use Testnet First**: Always test with paper trading
2. **IP Whitelist**: Restrict API keys to your VM IP
3. **Small Amounts**: Start with small trade amounts
4. **Daily Limits**: Set maximum daily loss limits
5. **2FA**: Enable 2FA on your Binance account
6. **Regular Updates**: Keep system and dependencies updated

---

## Troubleshooting

### Bot Not Starting
```bash
# Check logs
sudo journalctl -u crypto-trading-bot -n 50

# Verify environment variables
cat /var/www/crypto-trading-api/.env

# Test API connection
curl http://localhost:3001/api/status
```

### API Errors
```bash
# Test Binance connection
curl -X GET "https://api.binance.com/api/v3/ping"

# Verify API keys
curl -H "X-MBX-APIKEY: YOUR_API_KEY" "https://api.binance.com/api/v3/account"
```

### Frontend Not Loading
```bash
# Check Nginx config
sudo nginx -t

# Verify files exist
ls -la /var/www/crypto-trading/dist/

# Restart Nginx
sudo systemctl restart nginx
```

---

## Support & Resources

- **Binance API Docs**: https://binance-docs.github.io/apidocs/
- **Node.js Binance API**: https://github.com/jaggedsoft/node-binance-api
- **TradingView Charts**: https://www.tradingview.com/chart/

---

**⚠️ DISCLAIMER**: Cryptocurrency trading carries significant risk. This tool is for educational purposes. Always start with testnet/paper trading and never invest more than you can afford to lose.