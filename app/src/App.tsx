import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Wallet,
  Bot,
  BarChart3,
  PieChart,
  Settings,
  Activity,
  DollarSign,
  Target,
  Shield,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import './App.css';

// Types
interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  analysis: string;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'scalping' | 'swing' | 'hodl';
  minProfit: number;
  maxLoss: number;
  positionSize: number;
  timeFrame: string;
  active: boolean;
  performance: number;
  trades: number;
  winRate: number;
}

// Mock Data - Real market data from Binance
const cryptoAssets: CryptoAsset[] = [
  {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    price: 67908.63,
    change24h: 62.04,
    changePercent24h: 0.091,
    volume24h: 7581.65,
    high24h: 68698.70,
    low24h: 67749.59,
    recommendation: 'buy',
    confidence: 78,
    analysis: 'Strong support at $67K. Institutional buying continues. ETF inflows positive.'
  },
  {
    symbol: 'ETHUSDT',
    name: 'Ethereum',
    price: 1972.18,
    change24h: 10.70,
    changePercent24h: 0.546,
    volume24h: 183100.50,
    high24h: 1995.56,
    low24h: 1960.00,
    recommendation: 'strong_buy',
    confidence: 85,
    analysis: 'Layer 2 adoption accelerating. Staking yields attractive. Upgrade roadmap solid.'
  },
  {
    symbol: 'SOLUSDT',
    name: 'Solana',
    price: 84.98,
    change24h: 0.49,
    changePercent24h: 0.580,
    volume24h: 1879663,
    high24h: 86.72,
    low24h: 83.97,
    recommendation: 'buy',
    confidence: 72,
    analysis: 'DeFi ecosystem growing. High throughput advantage. Network stability improved.'
  },
  {
    symbol: 'BNBUSDT',
    name: 'BNB',
    price: 620.28,
    change24h: -6.91,
    changePercent24h: -1.102,
    volume24h: 79699.64,
    high24h: 634.80,
    low24h: 620.00,
    recommendation: 'hold',
    confidence: 65,
    analysis: 'Exchange token with utility. Burn mechanism active. Regulatory concerns persist.'
  },
  {
    symbol: 'ADAUSDT',
    name: 'Cardano',
    price: 0.2759,
    change24h: -0.0078,
    changePercent24h: -2.749,
    volume24h: 52816160,
    high24h: 0.2865,
    low24h: 0.2754,
    recommendation: 'hold',
    confidence: 58,
    analysis: 'Governance model maturing. Slow development pace. Academic approach valid.'
  },
  {
    symbol: 'LINKUSDT',
    name: 'Chainlink',
    price: 8.82,
    change24h: -0.07,
    changePercent24h: -0.787,
    volume24h: 1730913,
    high24h: 9.05,
    low24h: 8.79,
    recommendation: 'buy',
    confidence: 74,
    analysis: 'Oracle dominance continues. CCIP gaining traction. Enterprise partnerships growing.'
  },
  {
    symbol: 'DOTUSDT',
    name: 'Polkadot',
    price: 1.344,
    change24h: -0.011,
    changePercent24h: -0.812,
    volume24h: 4507902,
    high24h: 1.398,
    low24h: 1.342,
    recommendation: 'hold',
    confidence: 62,
    analysis: 'Parachain ecosystem expanding. Interoperability focus. Competition increasing.'
  },
  {
    symbol: 'AVAXUSDT',
    name: 'Avalanche',
    price: 9.01,
    change24h: -0.18,
    changePercent24h: -1.959,
    volume24h: 1764277,
    high24h: 9.45,
    low24h: 8.99,
    recommendation: 'buy',
    confidence: 68,
    analysis: 'Subnet technology advancing. Enterprise adoption. Strong developer community.'
  }
];

// Trading Strategies
const tradingStrategies: Strategy[] = [
  {
    id: 'scalping-btc',
    name: 'BTC Micro Scalper',
    description: 'High-frequency trades capturing 0.1-0.3% moves on BTC with tight stop-losses',
    type: 'scalping',
    minProfit: 0.15,
    maxLoss: 0.08,
    positionSize: 100,
    timeFrame: '1-5 minutes',
    active: true,
    performance: 12.4,
    trades: 156,
    winRate: 68
  },
  {
    id: 'swing-eth',
    name: 'ETH Swing Trader',
    description: 'Medium-term positions holding 2-7 days based on momentum indicators',
    type: 'swing',
    minProfit: 2.5,
    maxLoss: 1.2,
    positionSize: 250,
    timeFrame: '2-7 days',
    active: true,
    performance: 18.7,
    trades: 42,
    winRate: 71
  },
  {
    id: 'sol-momentum',
    name: 'SOL Momentum Catch',
    description: 'Captures SOL breakouts with volume confirmation and trailing stops',
    type: 'swing',
    minProfit: 3.0,
    maxLoss: 1.5,
    positionSize: 150,
    timeFrame: '4-12 hours',
    active: false,
    performance: 8.3,
    trades: 28,
    winRate: 64
  },
  {
    id: 'alt-scalper',
    name: 'Alt Coin Scalper',
    description: 'Quick trades on high-volume altcoins with tight risk management',
    type: 'scalping',
    minProfit: 0.5,
    maxLoss: 0.25,
    positionSize: 50,
    timeFrame: '5-15 minutes',
    active: false,
    performance: 6.2,
    trades: 89,
    winRate: 58
  }
];

// Portfolio Data
const portfolioData = [
  { name: 'Bitcoin', value: 45000, color: '#F7931A' },
  { name: 'Ethereum', value: 28000, color: '#627EEA' },
  { name: 'Solana', value: 12000, color: '#00FFA3' },
  { name: 'Others', value: 8000, color: '#8B5CF6' }
];

// Performance Chart Data
const performanceData = [
  { date: 'Jan 1', value: 10000, btc: 10000 },
  { date: 'Jan 5', value: 10250, btc: 10100 },
  { date: 'Jan 10', value: 10100, btc: 9800 },
  { date: 'Jan 15', value: 10800, btc: 10200 },
  { date: 'Jan 20', value: 11200, btc: 10500 },
  { date: 'Jan 25', value: 11500, btc: 10300 },
  { date: 'Feb 1', value: 12100, btc: 10800 },
  { date: 'Feb 5', value: 11800, btc: 10600 },
  { date: 'Feb 10', value: 12500, btc: 11000 },
  { date: 'Feb 15', value: 13200, btc: 11400 },
  { date: 'Feb 20', value: 13800, btc: 11200 },
  { date: 'Feb 22', value: 14200, btc: 11500 }
];

// Long-term Holdings Recommendations
const longTermHoldings = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    allocation: 45,
    targetPrice: 95000,
    currentPrice: 67908,
    upside: 39.9,
    thesis: 'Digital gold narrative strengthening. Institutional adoption accelerating. Halving cycle bullish.',
    riskLevel: 'Low',
    timeHorizon: '2-5 years'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    allocation: 30,
    targetPrice: 3500,
    currentPrice: 1972,
    upside: 77.5,
    thesis: 'Dominant smart contract platform. Staking yields 4-5%. Layer 2 scaling solutions maturing.',
    riskLevel: 'Medium',
    timeHorizon: '2-4 years'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    allocation: 15,
    targetPrice: 150,
    currentPrice: 84.98,
    upside: 76.5,
    thesis: 'High-performance blockchain. Growing DeFi ecosystem. Strong developer activity.',
    riskLevel: 'High',
    timeHorizon: '2-3 years'
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    allocation: 10,
    targetPrice: 15,
    currentPrice: 8.82,
    upside: 70.1,
    thesis: 'Oracle market leader. CCIP cross-chain protocol. Enterprise partnerships expanding.',
    riskLevel: 'Medium',
    timeHorizon: '2-3 years'
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [botRunning, setBotRunning] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>(tradingStrategies);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [configEdit, setConfigEdit] = useState({ minProfit: 0, maxLoss: 0, positionSize: 100 });
  const [saveMessage, setSaveMessage] = useState('');
  const [riskLevel, setRiskLevel] = useState(50);
  const [tradeAmount, setTradeAmount] = useState(100);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [dailyProfit, setDailyProfit] = useState(124.50);
  const [totalProfit] = useState(4200.00);
  const [activeTrades] = useState(3);
  const [darkMode, setDarkMode] = useState(true);

  const openStrategyConfig = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    // Read saved values from the strategy, not hardcoded defaults
    setConfigEdit({ minProfit: strategy.minProfit, maxLoss: strategy.maxLoss, positionSize: strategy.positionSize });
  };

  const saveStrategyConfig = () => {
    if (!selectedStrategy) return;
    setStrategies(prev => prev.map(s =>
      s.id === selectedStrategy.id
        ? { ...s, minProfit: configEdit.minProfit, maxLoss: configEdit.maxLoss, positionSize: configEdit.positionSize }
        : s
    ));
    setSaveMessage(`✓ ${selectedStrategy.name} saved!`);
    setTimeout(() => setSaveMessage(''), 3000);
    setSelectedStrategy(null);
  };

  const toggleStrategy = (id: string) => {
    setStrategies(prev => prev.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  // Apply dark class to <html> so shadcn CSS variables work correctly
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Simulate bot activity
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (botRunning) {
      interval = setInterval(() => {
        setDailyProfit(prev => prev + (Math.random() - 0.3) * 5);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [botRunning]);

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'strong_buy': return 'bg-green-500';
      case 'buy': return 'bg-green-400';
      case 'hold': return 'bg-yellow-400';
      case 'sell': return 'bg-orange-400';
      case 'strong_sell': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getRecommendationText = (rec: string) => {
    switch (rec) {
      case 'strong_buy': return 'Strong Buy';
      case 'buy': return 'Buy';
      case 'hold': return 'Hold';
      case 'sell': return 'Sell';
      case 'strong_sell': return 'Strong Sell';
      default: return 'Neutral';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-slate-900'}`}>
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  CryptoTrading Pro
                </h1>
                <p className="text-xs text-slate-400">AI-Powered Trading Bot</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${botRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {botRunning ? 'Bot Active' : 'Bot Idle'}
                </span>
              </div>
              <div className="text-right">
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Daily P&L</p>
                <p className={`font-mono font-bold ${dailyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {dailyProfit >= 0 ? '+' : ''}${dailyProfit.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total P&L</p>
                <p className="font-mono font-bold text-emerald-400">
                  +${totalProfit.toLocaleString()}
                </p>
              </div>
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 ${darkMode
                  ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                  : 'bg-white text-slate-700 hover:bg-gray-100 shadow-sm border border-gray-200'
                  }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className={`grid grid-cols-4 gap-1 p-1 rounded-xl w-full ${darkMode ? 'bg-slate-900/80' : 'bg-slate-200'
            }`}>
            <TabsTrigger
              value="dashboard"
              className={`data-[state=active]:text-white ${darkMode
                ? 'text-slate-400 data-[state=active]:bg-slate-700 hover:text-slate-200'
                : 'text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 hover:text-slate-800'
                }`}
            >
              <Activity className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="strategies"
              className={`data-[state=active]:text-white ${darkMode
                ? 'text-slate-400 data-[state=active]:bg-slate-700 hover:text-slate-200'
                : 'text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 hover:text-slate-800'
                }`}
            >
              <Zap className="w-4 h-4 mr-2" />
              Strategies
            </TabsTrigger>
            <TabsTrigger
              value="holdings"
              className={`data-[state=active]:text-white ${darkMode
                ? 'text-slate-400 data-[state=active]:bg-slate-700 hover:text-slate-200'
                : 'text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 hover:text-slate-800'
                }`}
            >
              <PieChart className="w-4 h-4 mr-2" />
              Long-term Holdings
            </TabsTrigger>
            <TabsTrigger
              value="bot"
              className={`data-[state=active]:text-white ${darkMode
                ? 'text-slate-400 data-[state=active]:bg-slate-700 hover:text-slate-200'
                : 'text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 hover:text-slate-800'
                }`}
            >
              <Bot className="w-4 h-4 mr-2" />
              Trading Bot
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Portfolio Value</p>
                      <p className="text-2xl font-bold text-white">$93,000</p>
                    </div>
                    <Wallet className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">+15.3%</span>
                    <span className="text-sm text-slate-500">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Active Trades</p>
                      <p className="text-2xl font-bold text-white">{activeTrades}</p>
                    </div>
                    <Target className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-slate-400">2 profitable</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-sm text-slate-400">1 pending</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Win Rate</p>
                      <p className="text-2xl font-bold text-white">67.8%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="mt-4">
                    <Progress value={67.8} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Bot Status</p>
                      <p className="text-2xl font-bold text-white">{botRunning ? 'Running' : 'Stopped'}</p>
                    </div>
                    <Bot className={`w-8 h-8 ${botRunning ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <div className="mt-4">
                    <Button
                      size="sm"
                      className={`w-full ${botRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                      onClick={() => setBotRunning(!botRunning)}
                    >
                      {botRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {botRunning ? 'Stop Bot' : 'Start Bot'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Performance vs BTC</CardTitle>
                  <CardDescription>Your trading performance compared to Bitcoin</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        name="Your Performance"
                      />
                      <Line
                        type="monotone"
                        dataKey="btc"
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        name="BTC"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Portfolio Allocation</CardTitle>
                  <CardDescription>Current asset distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RePieChart>
                      <Pie
                        data={portfolioData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {portfolioData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {portfolioData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-300">{item.name}</span>
                        </div>
                        <span className="text-slate-400">${item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Overview */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Live Market Analysis</CardTitle>
                <CardDescription>Real-time signals and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Asset</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Price</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">24h Change</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Signal</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Confidence</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Analysis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cryptoAssets.map((asset) => (
                        <tr key={asset.symbol} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
                                {asset.symbol.slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-medium text-white">{asset.name}</p>
                                <p className="text-xs text-slate-500">{asset.symbol}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4">
                            <p className="font-mono text-white">${asset.price.toLocaleString()}</p>
                          </td>
                          <td className="text-right py-4 px-4">
                            <div className={`flex items-center justify-end gap-1 ${asset.changePercent24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {asset.changePercent24h >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                              <span className="font-mono">{asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%</span>
                            </div>
                          </td>
                          <td className="text-center py-4 px-4">
                            <Badge className={`${getRecommendationColor(asset.recommendation)} text-white`}>
                              {getRecommendationText(asset.recommendation)}
                            </Badge>
                          </td>
                          <td className="text-center py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Progress value={asset.confidence} className="w-16 h-2" />
                              <span className="text-xs text-slate-400">{asset.confidence}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-slate-400 max-w-xs truncate">{asset.analysis}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategies Tab */}
          <TabsContent value="strategies" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Trading Strategies</h2>
                <p className="text-slate-400">Configure and monitor your automated trading strategies</p>
              </div>
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <Zap className="w-4 h-4 mr-2" />
                Create New Strategy
              </Button>
            </div>

            {saveMessage && (
              <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
                <span className="text-sm font-medium">{saveMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {strategies.map((strategy) => (
                <Card key={strategy.id} className={`border-2 transition-all duration-200 ${strategy.active ? 'bg-slate-900 border-emerald-500/40' : 'bg-slate-900 border-slate-800 opacity-75'
                  }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-white">{strategy.name}</CardTitle>
                          <Badge className={strategy.active ? 'bg-emerald-500 text-white text-xs' : 'bg-slate-700 text-slate-400 text-xs'}>
                            {strategy.active ? 'ON' : 'OFF'}
                          </Badge>
                        </div>
                        <CardDescription className="mt-2">{strategy.description}</CardDescription>
                      </div>
                      <Switch
                        checked={strategy.active}
                        onCheckedChange={() => toggleStrategy(strategy.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Performance</p>
                        <p className={`text-lg font-bold ${strategy.performance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {strategy.performance >= 0 ? '+' : ''}{strategy.performance}%
                        </p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Trades</p>
                        <p className="text-lg font-bold text-white">{strategy.trades}</p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Win Rate</p>
                        <p className="text-lg font-bold text-cyan-400">{strategy.winRate}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Target Profit</span>
                        <span className="text-emerald-400">+{strategy.minProfit}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Stop Loss</span>
                        <span className="text-red-400">-{strategy.maxLoss}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Time Frame</span>
                        <span className="text-slate-300">{strategy.timeFrame}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full border-slate-700 hover:border-emerald-500"
                      onClick={() => openStrategyConfig(strategy)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Strategy
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Strategy Performance Chart */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Strategy Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={strategies.map(s => ({ name: s.name.split(' ')[0], performance: s.performance, winRate: s.winRate, active: s.active }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                    />
                    <Bar dataKey="performance" fill="#10b981" name="Performance (%)" />
                    <Bar dataKey="winRate" fill="#06b6d4" name="Win Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Long-term Holdings Tab */}
          <TabsContent value="holdings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Long-term Holdings</h2>
                <p className="text-slate-400">AI-recommended portfolio for 2-5 year horizon</p>
              </div>
              <Badge className="bg-emerald-500 text-white text-sm px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Conservative Strategy
              </Badge>
            </div>

            <Alert className="bg-slate-800 border-slate-700">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
              <AlertDescription className="text-slate-300">
                Based on current market analysis, macro trends, and on-chain data.
                Recommendations updated daily. Always DYOR (Do Your Own Research).
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {longTermHoldings.map((holding) => (
                <Card key={holding.symbol} className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-lg font-bold text-white">
                          {holding.symbol[0]}
                        </div>
                        <div>
                          <CardTitle className="text-white">{holding.name}</CardTitle>
                          <p className="text-sm text-slate-400">{holding.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{holding.allocation}%</p>
                        <p className="text-xs text-slate-400">Allocation</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Current Price</p>
                        <p className="text-lg font-mono text-white">${holding.currentPrice.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Target Price</p>
                        <p className="text-lg font-mono text-emerald-400">${holding.targetPrice.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Potential Upside</span>
                      <span className="text-lg font-bold text-emerald-400">+{holding.upside}%</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline" className="border-slate-700 text-slate-300">
                        <Clock className="w-3 h-3 mr-1" />
                        {holding.timeHorizon}
                      </Badge>
                      <Badge variant="outline" className={`${holding.riskLevel === 'Low' ? 'border-emerald-500 text-emerald-400' : holding.riskLevel === 'Medium' ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-400'}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {holding.riskLevel} Risk
                      </Badge>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-sm font-medium text-slate-300 mb-2">Investment Thesis</p>
                      <p className="text-sm text-slate-400">{holding.thesis}</p>
                    </div>

                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Add to Portfolio
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Allocation Chart */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Recommended Allocation</CardTitle>
                <CardDescription>Optimal portfolio distribution based on risk-adjusted returns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={longTermHoldings}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="allocation"
                        label={({ symbol, allocation }) => `${symbol} ${allocation}%`}
                      >
                        {longTermHoldings.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#F7931A', '#627EEA', '#00FFA3', '#375BD2'][index]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Portfolio Summary</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                        <span className="text-slate-300">Expected Annual Return</span>
                        <span className="text-emerald-400 font-bold">35-50%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                        <span className="text-slate-300">Risk Level</span>
                        <span className="text-yellow-400 font-bold">Medium</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                        <span className="text-slate-300">Rebalancing Frequency</span>
                        <span className="text-cyan-400 font-bold">Quarterly</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                        <span className="text-slate-300">Minimum Investment</span>
                        <span className="text-white font-bold">$1,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Bot Tab */}
          <TabsContent value="bot" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Trading Bot Configuration</h2>
                <p className="text-slate-400">Set up your automated trading parameters</p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="border-slate-700"
                  onClick={() => setShowConfigDialog(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced Settings
                </Button>
                <Button
                  className={`${botRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                  onClick={() => setBotRunning(!botRunning)}
                >
                  {botRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {botRunning ? 'Stop Bot' : 'Start Bot'}
                </Button>
              </div>
            </div>

            {/* Bot Status Card */}
            <Card className={`border-2 ${botRunning ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-800 bg-slate-900'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${botRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}>
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Trading Bot {botRunning ? 'Active' : 'Idle'}</h3>
                      <p className="text-slate-400">
                        {botRunning
                          ? 'Monitoring markets and executing trades...'
                          : 'Configure settings and start to begin trading'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Today's Profit</p>
                    <p className={`text-3xl font-bold ${dailyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {dailyProfit >= 0 ? '+' : ''}${dailyProfit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Risk Management</CardTitle>
                  <CardDescription>Configure your risk tolerance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-slate-300">Risk Level</label>
                      <span className="text-sm font-medium text-cyan-400">{riskLevel}%</span>
                    </div>
                    <Slider
                      value={[riskLevel]}
                      onValueChange={(v) => setRiskLevel(v[0])}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Conservative</span>
                      <span>Aggressive</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-slate-300">Max Trade Amount</label>
                      <span className="text-sm font-medium text-cyan-400">${tradeAmount}</span>
                    </div>
                    <Slider
                      value={[tradeAmount]}
                      onValueChange={(v) => setTradeAmount(v[0])}
                      min={10}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>$10 min</span>
                      <span>$1,000 max</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 rounded-lg p-3">
                      <p className="text-xs text-slate-400">Daily Loss Limit</p>
                      <p className="text-lg font-mono text-red-400">-${(tradeAmount * 0.05).toFixed(0)}</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3">
                      <p className="text-xs text-slate-400">Daily Profit Target</p>
                      <p className="text-lg font-mono text-emerald-400">+${(tradeAmount * 0.1).toFixed(0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Active Strategies</CardTitle>
                  <CardDescription>Currently running strategies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {strategies.filter(s => s.active).map((strategy) => (
                    <div key={strategy.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-emerald-500/20">
                      <div>
                        <p className="font-medium text-white">{strategy.name}</p>
                        <p className="text-xs text-slate-400">{strategy.type} · {strategy.timeFrame}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${strategy.performance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {strategy.performance >= 0 ? '+' : ''}{strategy.performance}%
                        </p>
                        <p className="text-xs text-slate-400">{strategy.trades} trades · {strategy.winRate}% win</p>
                      </div>
                    </div>
                  ))}
                  {strategies.filter(s => s.active).length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-slate-500 text-sm">No active strategies</p>
                      <p className="text-slate-600 text-xs mt-1">Enable strategies in the Strategies tab</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Trade History */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Time</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Pair</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Type</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Amount</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Price</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800/50">
                        <td className="py-3 px-4 text-sm text-slate-300">2 min ago</td>
                        <td className="py-3 px-4 text-sm text-white font-medium">BTC/USDT</td>
                        <td className="py-3 px-4"><Badge className="bg-emerald-500">BUY</Badge></td>
                        <td className="py-3 px-4 text-sm text-right text-slate-300">0.015 BTC</td>
                        <td className="py-3 px-4 text-sm text-right text-slate-300">$67,908</td>
                        <td className="py-3 px-4 text-sm text-right text-slate-500">-</td>
                      </tr>
                      <tr className="border-b border-slate-800/50">
                        <td className="py-3 px-4 text-sm text-slate-300">15 min ago</td>
                        <td className="py-3 px-4 text-sm text-white font-medium">ETH/USDT</td>
                        <td className="py-3 px-4"><Badge className="bg-red-500">SELL</Badge></td>
                        <td className="py-3 px-4 text-sm text-right text-slate-300">1.2 ETH</td>
                        <td className="py-3 px-4 text-sm text-right text-slate-300">$1,972</td>
                        <td className="py-3 px-4 text-sm text-right text-emerald-400">+$12.40</td>
                      </tr>
                      <tr className="border-b border-slate-800/50">
                        <td className="py-3 px-4 text-sm text-slate-300">1 hour ago</td>
                        <td className="py-3 px-4 text-sm text-white font-medium">SOL/USDT</td>
                        <td className="py-3 px-4"><Badge className="bg-emerald-500">BUY</Badge></td>
                        <td className="py-3 px-4 text-sm text-right text-slate-300">15 SOL</td>
                        <td className="py-3 px-4 text-sm text-right text-slate-300">$84.98</td>
                        <td className="py-3 px-4 text-sm text-right text-slate-500">-</td>
                      </tr>
                      <tr className="border-b border-slate-800/50">
                        <td className="py-3 px-4 text-sm text-slate-300">2 hours ago</td>
                        <td className="py-3 px-4 text-sm text-white font-medium">BTC/USDT</td>
                        <td className="py-3 px-4"><Badge className="bg-red-500">SELL</Badge></td>
                        <td className="py-3 px-4 text-sm text-right text-slate-300">0.008 BTC</td>
                        <td className="py-3 px-4 text-sm text-right text-slate-300">$68,200</td>
                        <td className="py-3 px-4 text-sm text-right text-emerald-400">+$8.20</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Strategy Configuration Dialog */}
      <Dialog open={!!selectedStrategy} onOpenChange={() => setSelectedStrategy(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-400" />
              Configure: {selectedStrategy?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedStrategy?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-300">Target Profit (%)</label>
                <span className="text-xs text-emerald-400 font-mono">+{configEdit.minProfit}%</span>
              </div>
              <input
                type="number"
                value={configEdit.minProfit}
                step={0.05}
                min={0.05}
                max={20}
                onChange={(e) => setConfigEdit(prev => ({ ...prev, minProfit: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none transition-colors"
              />
              <p className="text-xs text-slate-500">Bot will take profit when this % gain is reached</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-300">Stop Loss (%)</label>
                <span className="text-xs text-red-400 font-mono">-{configEdit.maxLoss}%</span>
              </div>
              <input
                type="number"
                value={configEdit.maxLoss}
                step={0.05}
                min={0.05}
                max={10}
                onChange={(e) => setConfigEdit(prev => ({ ...prev, maxLoss: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-red-500 outline-none transition-colors"
              />
              <p className="text-xs text-slate-500">Bot will cut losses when this % drop is reached</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-300">Max Position Size (USDT)</label>
                <span className="text-xs text-cyan-400 font-mono">${configEdit.positionSize}</span>
              </div>
              <input
                type="number"
                value={configEdit.positionSize}
                step={10}
                min={10}
                max={1000}
                onChange={(e) => setConfigEdit(prev => ({ ...prev, positionSize: parseInt(e.target.value) || 10 }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none transition-colors"
              />
              <p className="text-xs text-slate-500">Maximum amount per trade (min $10, max $1,000)</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between text-sm">
              <span className="text-slate-400">Risk/Reward Ratio</span>
              <span className="font-mono text-white">
                1 : {configEdit.maxLoss > 0 ? (configEdit.minProfit / configEdit.maxLoss).toFixed(1) : '∞'}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-slate-700" onClick={() => setSelectedStrategy(null)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600" onClick={saveStrategyConfig}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Advanced Settings Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Advanced Bot Settings</DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure API connections and advanced parameters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Binance API</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="API Key"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                />
                <input
                  type="password"
                  placeholder="API Secret"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Trading Pairs (comma separated)</label>
              <input
                type="text"
                defaultValue="BTCUSDT,ETHUSDT,SOLUSDT"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Paper Trading Mode</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Enable Notifications</span>
              <Switch defaultChecked />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-slate-700" onClick={() => setShowConfigDialog(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600" onClick={() => setShowConfigDialog(false)}>
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
