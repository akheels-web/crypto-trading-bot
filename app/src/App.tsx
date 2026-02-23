import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Wallet,
  Bot,
  BarChart3,
  PieChart,
  Settings,
  Activity,
  Target,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  AlertCircle,
  RefreshCw,
  ChevronDown,
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

// ─── Long-term Holdings — Professional Trader Database ────────────────────
interface HoldingAsset {
  symbol: string;        // Binance pair e.g. 'BTCUSDT'
  ticker: string;        // Display e.g. 'BTC'
  name: string;
  category: 'large' | 'mid' | 'small';
  sector: string;
  basePrice: number;     // Fallback price when offline
  athPrice: number;
  athDate: string;
  entryZoneLow: number;
  entryZoneHigh: number;
  target1: number;       // Conservative 6–12 month
  target2: number;       // Base case 1–2 year
  target3: number;       // Bull case 2–4 year
  stopLoss: number;
  holdDuration: string;
  riskRating: 1 | 2 | 3 | 4 | 5;
  signal: 'strong_buy' | 'buy' | 'accumulate' | 'hold' | 'wait';
  thesis: string;
  catalysts: string[];
  risks: string[];
  color: string;
}

const holdingAssets: HoldingAsset[] = [
  // ─── LARGE CAP ──────────────────────────────────────────────────────────
  {
    symbol: 'BTCUSDT', ticker: 'BTC', name: 'Bitcoin',
    category: 'large', sector: 'Layer 1 / Store of Value',
    basePrice: 67908, athPrice: 108000, athDate: 'Nov 2024',
    entryZoneLow: 55000, entryZoneHigh: 75000,
    target1: 85000, target2: 120000, target3: 180000,
    stopLoss: 48000, holdDuration: '2–4 years', riskRating: 1,
    signal: 'buy',
    thesis: 'Digital gold with fixed supply. ETF inflows sustain institutional demand. Halving cycles historically drive 3–5× bull runs. Central bank reserve discussions ongoing.',
    catalysts: ['US Bitcoin Reserve bill', 'ETF inflows (>$50B AUM)', 'Bitcoin halving cycle (Apr 2024)'],
    risks: ['Macro rate hike shock', 'Regulatory crackdown'],
    color: '#F7931A'
  },
  {
    symbol: 'ETHUSDT', ticker: 'ETH', name: 'Ethereum',
    category: 'large', sector: 'Smart Contract Platform',
    basePrice: 1972, athPrice: 4878, athDate: 'Nov 2021',
    entryZoneLow: 1600, entryZoneHigh: 2400,
    target1: 3200, target2: 5500, target3: 8000,
    stopLoss: 1300, holdDuration: '2–3 years', riskRating: 2,
    signal: 'buy',
    thesis: 'Dominant smart contract platform. Staking yield 4–5% APR. L2 ecosystem (Arbitrum, Optimism) scaling rapidly. Ethereum ETF approved, institutional access widening.',
    catalysts: ['Spot ETH ETF inflows', 'EIP-4844 blob fee reduction', 'Pectra upgrade'],
    risks: ['Solana competition', 'L2 fee cannibalization'],
    color: '#627EEA'
  },
  {
    symbol: 'BNBUSDT', ticker: 'BNB', name: 'BNB',
    category: 'large', sector: 'Exchange Token / L1',
    basePrice: 620, athPrice: 686, athDate: 'Jun 2024',
    entryZoneLow: 520, entryZoneHigh: 650,
    target1: 750, target2: 1000, target3: 1400,
    stopLoss: 420, holdDuration: '1–2 years', riskRating: 2,
    signal: 'accumulate',
    thesis: 'Binance ecosystem token with quarterly burn. BNB Chain DeFi TVL >$4B. Binance dominates 40%+ global spot volume. Burn mechanism reduces supply aggressively.',
    catalysts: ['Quarterly BNB auto-burn', 'BNB Chain ecosystem growth', 'Binance regulatory clarity'],
    risks: ['Binance regulatory risk', 'Centralization concerns'],
    color: '#F3BA2F'
  },
  {
    symbol: 'SOLUSDT', ticker: 'SOL', name: 'Solana',
    category: 'large', sector: 'High-Performance L1',
    basePrice: 84.98, athPrice: 260, athDate: 'Nov 2021',
    entryZoneLow: 70, entryZoneHigh: 120,
    target1: 150, target2: 220, target3: 350,
    stopLoss: 55, holdDuration: '1.5–3 years', riskRating: 3,
    signal: 'buy',
    thesis: 'Fastest L1 with 65K TPS. Dominant NFT & meme coin chain. Firedancer upgrade will 10× throughput. Solana ETF filing in progress.',
    catalysts: ['Solana ETF approval', 'Firedancer upgrade launch', 'DeFi TVL growth'],
    risks: ['Network outage history', 'BTC/ETH dominance in ETF era'],
    color: '#00FFA3'
  },
  {
    symbol: 'XRPUSDT', ticker: 'XRP', name: 'XRP',
    category: 'large', sector: 'Cross-Border Payments',
    basePrice: 0.5891, athPrice: 3.40, athDate: 'Jan 2018',
    entryZoneLow: 0.45, entryZoneHigh: 0.75,
    target1: 1.20, target2: 2.50, target3: 4.00,
    stopLoss: 0.32, holdDuration: '1–3 years', riskRating: 3,
    signal: 'accumulate',
    thesis: 'SEC case largely resolved. RLUSD stablecoin launched. Ripple payments corridors growing. XRP ETF filings submitted by multiple issuers.',
    catalysts: ['XRP Spot ETF approval', 'RLUSD adoption', 'Bank of America / SBI partnerships'],
    risks: ['Remaining SEC uncertainty', 'SWIFT competition'],
    color: '#00AAE4'
  },
  {
    symbol: 'ADAUSDT', ticker: 'ADA', name: 'Cardano',
    category: 'large', sector: 'Smart Contract Platform',
    basePrice: 0.2759, athPrice: 3.10, athDate: 'Sep 2021',
    entryZoneLow: 0.22, entryZoneHigh: 0.38,
    target1: 0.65, target2: 1.10, target3: 2.00,
    stopLoss: 0.16, holdDuration: '2–4 years', riskRating: 3,
    signal: 'accumulate',
    thesis: 'Peer-reviewed blockchain with Voltaire governance live. Hydra L2 scaling. Africa/government blockchain identity projects. Deep discount to ATH (~91%).',
    catalysts: ['Voltaire era full governance', 'Hydra L2 mainnet', 'African government contracts'],
    risks: ['Slow development pace', 'Competition from faster L1s'],
    color: '#0D47A1'
  },
  {
    symbol: 'AVAXUSDT', ticker: 'AVAX', name: 'Avalanche',
    category: 'large', sector: 'L1 / Subnet Platform',
    basePrice: 9.01, athPrice: 146, athDate: 'Nov 2021',
    entryZoneLow: 8, entryZoneHigh: 18,
    target1: 28, target2: 55, target3: 90,
    stopLoss: 6, holdDuration: '1.5–3 years', riskRating: 3,
    signal: 'buy',
    thesis: 'Subnet architecture enabling enterprise chains. $J.P. Morgan & Citi institutional DeFi pilots. Teleporter cross-chain messaging. Massive ATH discount (94%).',
    catalysts: ['Avalanche9000 upgrade', 'Institutional subnet deployments', 'GameFi subnet growth'],
    risks: ['VC unlock pressure', 'Subnet complexity barrier'],
    color: '#E84142'
  },
  {
    symbol: 'DOTUSDT', ticker: 'DOT', name: 'Polkadot',
    category: 'large', sector: 'Interoperability / Parachain',
    basePrice: 1.344, athPrice: 55, athDate: 'Nov 2021',
    entryZoneLow: 1.10, entryZoneHigh: 2.20,
    target1: 4.50, target2: 8.00, target3: 15,
    stopLoss: 0.80, holdDuration: '2–4 years', riskRating: 3,
    signal: 'accumulate',
    thesis: 'Parachain ecosystem maturing. Polkadot 2.0 (Agile Coretime) makes block space flexible. JAM upgrade is most significant protocol change ever. 97.6% below ATH = extreme undervaluation.',
    catalysts: ['JAM upgrade rollout', 'Agile Coretime adoption', 'Parachain ecosystem DeFi growth'],
    risks: ['Very complex tech narrative', 'Long development timelines'],
    color: '#E6007A'
  },
  // ─── MID CAP ────────────────────────────────────────────────────────────
  {
    symbol: 'LINKUSDT', ticker: 'LINK', name: 'Chainlink',
    category: 'mid', sector: 'Oracle Network',
    basePrice: 8.82, athPrice: 52.7, athDate: 'May 2021',
    entryZoneLow: 7, entryZoneHigh: 12,
    target1: 18, target2: 35, target3: 55,
    stopLoss: 5.5, holdDuration: '2–3 years', riskRating: 2,
    signal: 'buy',
    thesis: 'Oracle market leader with 80%+ market share. CCIP cross-chain protocol enables tokenized asset transfers. Swift, DTCC partnerships. Staking v0.2 increasing token lockup.',
    catalysts: ['CCIP institutional adoption', 'Swift/DTCC integration launch', 'Staking emissions reduction'],
    risks: ['Competing oracles (Pyth, UMA)', 'Revenue model evolution'],
    color: '#375BD2'
  },
  {
    symbol: 'MATICUSDT', ticker: 'POL', name: 'Polygon (POL)',
    category: 'mid', sector: 'L2 / zkEVM',
    basePrice: 0.198, athPrice: 2.92, athDate: 'Dec 2021',
    entryZoneLow: 0.15, entryZoneHigh: 0.30,
    target1: 0.55, target2: 1.00, target3: 1.80,
    stopLoss: 0.10, holdDuration: '1.5–3 years', riskRating: 3,
    signal: 'buy',
    thesis: 'Migration to POL (Polygon 2.0) complete. AggLayer connecting all L2s. zkEVM leading ZK adoption. Enterprise clients: Disney, Reddit, Starbucks building on Polygon.',
    catalysts: ['AggLayer v1 launch', 'Enterprise Web3 partnerships', 'zkEVM transaction growth'],
    risks: ['L2 competition extremely intense', 'MATIC→POL migration confusion'],
    color: '#8247E5'
  },
  {
    symbol: 'INJUSDT', ticker: 'INJ', name: 'Injective',
    category: 'mid', sector: 'DeFi / Derivatives L1',
    basePrice: 14.21, athPrice: 52.3, athDate: 'Mar 2024',
    entryZoneLow: 10, entryZoneHigh: 20,
    target1: 30, target2: 55, target3: 90,
    stopLoss: 7, holdDuration: '1–2 years', riskRating: 3,
    signal: 'accumulate',
    thesis: 'Layer 1 built for DeFi: on-chain orderbook, derivatives, RWAs. Weekly token burn. Cosmos IBC interoperability. Fastest-growing DeFi L1 by TVL growth rate.',
    catalysts: ['INJ burn rate acceleration', 'RWA integration (BlackRock funds)', 'Cosmos IBC expansion'],
    risks: ['Derivative DEX competition', 'Small ecosystem compared to ETH'],
    color: '#00C5FF'
  },
  {
    symbol: 'ARBUSDT', ticker: 'ARB', name: 'Arbitrum',
    category: 'mid', sector: 'Ethereum L2 (Optimistic)',
    basePrice: 0.312, athPrice: 2.39, athDate: 'Jan 2024',
    entryZoneLow: 0.25, entryZoneHigh: 0.50,
    target1: 0.80, target2: 1.50, target3: 2.80,
    stopLoss: 0.18, holdDuration: '1.5–2.5 years', riskRating: 4,
    signal: 'buy',
    thesis: 'Largest Ethereum L2 by TVL ($3B+). Stylus upgrade enables Rust/C++ smart contracts. DAO treasury of $3B+ in ARB. Deep DeFi ecosystem led by GMX, Uniswap.',
    catalysts: ['Stylus mainnet adoption', 'BOLD decentralized validation', 'Orbit chains expansion'],
    risks: ['ZK-rollup threat long-term', 'OP-stack fragmentation'],
    color: '#28A0F0'
  },
  {
    symbol: 'OPUSDT', ticker: 'OP', name: 'Optimism',
    category: 'mid', sector: 'Ethereum L2 (Optimistic)',
    basePrice: 0.758, athPrice: 4.84, athDate: 'Apr 2023',
    entryZoneLow: 0.60, entryZoneHigh: 1.10,
    target1: 1.80, target2: 3.50, target3: 6.00,
    stopLoss: 0.40, holdDuration: '1.5–2.5 years', riskRating: 4,
    signal: 'accumulate',
    thesis: 'OP Stack is the dominant L2 framework. Coinbase (Base), Worldcoin, Uniswap L2 all built on OP Stack. Superchain vision unifying 20+ chains with shared sequencing.',
    catalysts: ['Superchain interoperability launch', 'RetroPGF round 5 ecosystem funding', 'Base chain fee sharing'],
    risks: ['Shared security model complexity', 'ARB competition for TVL'],
    color: '#FF0420'
  },
  {
    symbol: 'SUIUSDT', ticker: 'SUI', name: 'Sui',
    category: 'mid', sector: 'Move Language L1',
    basePrice: 2.14, athPrice: 5.35, athDate: 'May 2024',
    entryZoneLow: 1.50, entryZoneHigh: 3.00,
    target1: 5.00, target2: 9.00, target3: 15,
    stopLoss: 0.90, holdDuration: '1–2 years', riskRating: 4,
    signal: 'buy',
    thesis: 'Move language prevents reentrancy attacks inherently. Sub-second finality. zkLogin enables Web2-like onboarding. Gaming & SocialFi adoption accelerating.',
    catalysts: ['zkLogin mass adoption', 'Mysticeti consensus upgrade', 'Gaming ecosystem growth (Sui x Prime)'],
    risks: ['VC unlock schedule pressure', 'Still early ecosystem maturity'],
    color: '#6FBCF0'
  },
  {
    symbol: 'APTUSDT', ticker: 'APT', name: 'Aptos',
    category: 'mid', sector: 'Move Language L1',
    basePrice: 5.83, athPrice: 19.92, athDate: 'Jan 2023',
    entryZoneLow: 4.50, entryZoneHigh: 8.00,
    target1: 12, target2: 20, target3: 30,
    stopLoss: 3.00, holdDuration: '1–2 years', riskRating: 4,
    signal: 'accumulate',
    thesis: 'Built by ex-Meta Diem team. Block-STM parallel execution gives 160K TPS theoretical. Microsoft, Google, Alibaba Cloud partnerships. Keyless accounts simplify UX.',
    catalysts: ['Keyless account mass adoption', 'Microsoft Azure integration', 'DeFi TVL milestone $1B'],
    risks: ['Sui competition in Move space', 'Large VC token unlocks'],
    color: '#00D4AA'
  },
  // ─── SMALL CAP (High Risk / High Reward) ────────────────────────────────
  {
    symbol: 'SEIUSDT', ticker: 'SEI', name: 'Sei',
    category: 'small', sector: 'Trading-Optimized L1',
    basePrice: 0.198, athPrice: 0.84, athDate: 'Apr 2024',
    entryZoneLow: 0.12, entryZoneHigh: 0.28,
    target1: 0.50, target2: 0.90, target3: 1.50,
    stopLoss: 0.08, holdDuration: '6–18 months', riskRating: 5,
    signal: 'accumulate',
    thesis: 'EVM + Cosmos hybrid with twin-turbo consensus (400ms finality). Built-in on-chain orderbook at protocol level. V2 brings parallelized EVM execution.',
    catalysts: ['Sei V2 EVM parallelization', 'DeFi protocols migrating from Cosmos', 'Exchange listings expansion'],
    risks: ['Competitive L1 space', 'Small developer community'],
    color: '#9B2335'
  },
  {
    symbol: 'TIAUSDT', ticker: 'TIA', name: 'Celestia',
    category: 'small', sector: 'Modular Blockchain / DA Layer',
    basePrice: 3.21, athPrice: 20.0, athDate: 'Feb 2024',
    entryZoneLow: 2.50, entryZoneHigh: 5.00,
    target1: 8.00, target2: 15, target3: 25,
    stopLoss: 1.60, holdDuration: '1–2 years', riskRating: 5,
    signal: 'accumulate',
    thesis: 'Pioneering modular blockchain stack — decouples data availability from execution. Ethereum blobs + Celestia = cheapest DA. Hundreds of rollups choose Celestia as DA layer.',
    catalysts: ['Mainnet DA adoption milestone', 'Ethereum interop via Blobstream', 'Rollup ecosystem explosion'],
    risks: ['Ethereum Danksharding competes directly', 'High unlock inflation rate'],
    color: '#7B2FBE'
  },
  {
    symbol: 'BLURUSDT', ticker: 'BLUR', name: 'Blur',
    category: 'small', sector: 'NFT Marketplace',
    basePrice: 0.089, athPrice: 1.19, athDate: 'Feb 2023',
    entryZoneLow: 0.06, entryZoneHigh: 0.14,
    target1: 0.25, target2: 0.55, target3: 1.00,
    stopLoss: 0.04, holdDuration: '6–12 months', riskRating: 5,
    signal: 'wait',
    thesis: 'Dominant NFT trading platform (60%+ volume). Blend P2P NFT lending protocol. NFT bull cycle recovery play. Currently at 93% ATH discount — speculative entry only.',
    catalysts: ['NFT bull cycle return', 'Blend v2 launch', 'Blast L2 ecosystem synergy'],
    risks: ['NFT market in prolonged bear', 'OpenSea competition + royalty war'],
    color: '#FF6B35'
  },
  {
    symbol: 'STRKUSDT', ticker: 'STRK', name: 'Starknet',
    category: 'small', sector: 'ZK Rollup L2',
    basePrice: 0.312, athPrice: 4.40, athDate: 'Feb 2024',
    entryZoneLow: 0.20, entryZoneHigh: 0.50,
    target1: 1.00, target2: 2.00, target3: 4.00,
    stopLoss: 0.12, holdDuration: '1–2 years', riskRating: 5,
    signal: 'accumulate',
    thesis: 'ZK-STARK proof system offers quantum-resistant security. Cairo language enables provable computation. DeFi Spring incentive program bootstrapping liquidity. Starknet v0.13 improves throughput 10×.',
    catalysts: ['Starknet v0.14 performance upgrade', 'STRK staking launch', 'DeFi TVL growth past $500M'],
    risks: ['93% below ATH with large unlock schedule', 'Developer learning curve'],
    color: '#28A745'
  },
  {
    symbol: 'JTOUSDT', ticker: 'JTO', name: 'Jito',
    category: 'small', sector: 'Solana Liquid Staking / MEV',
    basePrice: 1.87, athPrice: 6.07, athDate: 'Dec 2023',
    entryZoneLow: 1.30, entryZoneHigh: 2.80,
    target1: 4.50, target2: 7.50, target3: 12,
    stopLoss: 0.85, holdDuration: '1–2 years', riskRating: 5,
    signal: 'accumulate',
    thesis: 'Jito controls 95%+ of Solana MEV. JitoSOL (liquid staking) accrues MEV tips on top of base staking yield (6–8% APR). JTO DAO governs $3B+ in staked SOL.',
    catalysts: ['Solana ETF driving SOL staking demand', 'MEV revenue growth with network activity', 'JTO buyback program'],
    risks: ['SOL price dependency', 'MEV regulation risk'],
    color: '#00856F'
  }
];

const VALID_TABS = ['dashboard', 'strategies', 'holdings', 'bot'];

function getTabFromHash(): string {
  const hash = window.location.hash.replace('#', '');
  return VALID_TABS.includes(hash) ? hash : 'dashboard';
}

function App() {
  const [activeTab, setActiveTab] = useState(getTabFromHash);

  // Keep URL hash in sync when tab changes
  const switchTab = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Handle browser back/forward
  useEffect(() => {
    const onHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const [botRunning, setBotRunning] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>(tradingStrategies);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [configEdit, setConfigEdit] = useState({ minProfit: 0, maxLoss: 0, positionSize: 100 });
  const [saveMessage, setSaveMessage] = useState('');
  const [riskLevel, setRiskLevel] = useState(50);
  const [tradeAmount, setTradeAmount] = useState(100);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  // Live dashboard stats from backend
  const [dailyProfit, setDailyProfit] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [activeTrades, setActiveTrades] = useState(0);
  const [activeTradesProfitable, setActiveTradesProfitable] = useState(0);
  const [winRate, setWinRate] = useState(67);
  // Portfolio balance from Binance account API
  const [portfolioBalance, setPortfolioBalance] = useState(0);
  const [portfolioConfigured, setPortfolioConfigured] = useState(false);
  // Bot settings
  const [paperTrading, setPaperTrading] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [tradingPairs, setTradingPairs] = useState('BTCUSDT,ETHUSDT,SOLUSDT');
  // Live trade history from backend
  const [liveTradeHistory, setLiveTradeHistory] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  // Holdings live price state
  const [livePrices, setLivePrices] = useState<Record<string, { price: number; change24h: number; changePercent24h: number; high24h: number; low24h: number }>>({});
  // Live market data for Dashboard table (merges cryptoAssets + real prices)
  const [liveMarketData, setLiveMarketData] = useState<CryptoAsset[]>(cryptoAssets);
  const [pricesLive, setPricesLive] = useState(false);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [holdingCategory, setHoldingCategory] = useState<'all' | 'large' | 'mid' | 'small'>('all');
  const [expandedHolding, setExpandedHolding] = useState<string | null>(null);

  const fetchLivePrices = async () => {
    setPricesLoading(true);
    try {
      const res = await fetch('/api/binance/prices');
      if (!res.ok) throw new Error('Backend not available');
      const json = await res.json();
      const map: Record<string, any> = {};
      (json.data || []).forEach((t: any) => { map[t.symbol] = t; });
      setLivePrices(map);
      setPricesLive(json.live === true);
      setLastRefreshed(new Date());
      // Merge live prices into the Dashboard Market Analysis table
      setLiveMarketData(cryptoAssets.map(asset => {
        const live = map[asset.symbol];
        if (!live) return asset;
        return { ...asset, price: live.price, change24h: live.change24h, changePercent24h: live.changePercent24h, high24h: live.high24h, low24h: live.low24h };
      }));
    } catch {
      setPricesLive(false);
    } finally {
      setPricesLoading(false);
    }
  };

  const fetchPortfolioBalance = async () => {
    try {
      const res = await fetch('/api/account/balance');
      if (!res.ok) return;
      const data = await res.json();
      setPortfolioConfigured(data.configured === true);
      if (data.configured && data.totalUSDT > 0) {
        setPortfolioBalance(data.totalUSDT);
      }
    } catch { /* backend offline */ }
  };

  const fetchStrategies = async () => {
    try {
      const res = await fetch('/api/strategies');
      if (!res.ok) return;
      const data = await res.json();
      // Merge backend active state into frontend strategies (keeps UI fields like performance, winRate)
      setStrategies(prev => prev.map(s => {
        const backend = data.find((b: any) => b.id === s.id);
        return backend ? { ...s, active: backend.active, minProfit: backend.minProfit, maxLoss: backend.maxLoss, positionSize: backend.positionSize } : s;
      }));
    } catch { /* backend offline — keep default state */ }
  };

  const fetchBotStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) return;
      const data = await res.json();
      setBotRunning(data.botRunning);
      setDailyProfit(data.dailyProfit ?? 0);
      setTotalProfit(data.totalProfit ?? 0);
      setActiveTrades(data.activeTrades ?? 0);
      setActiveTradesProfitable(data.activeTradesProfitable ?? 0);
      setWinRate(data.winRate ?? 67);
      setPaperTrading(data.paperTrading ?? true);
    } catch { /* backend offline, keep defaults */ }
  };

  const fetchBotSettings = async () => {
    try {
      const res = await fetch('/api/bot/settings');
      if (!res.ok) return;
      const data = await res.json();
      setPaperTrading(data.paperTrading ?? true);
      setNotifications(data.notifications ?? false);
      setTradingPairs(data.tradingPairs ?? 'BTCUSDT,ETHUSDT,SOLUSDT');
    } catch { /* backend offline */ }
  };

  const saveBotSettings = async () => {
    try {
      await fetch('/api/bot/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperTrading, notifications, tradingPairs }),
      });
    } catch { /* backend offline */ }
    setShowConfigDialog(false);
  };

  const fetchTradeHistory = async () => {
    try {
      const res = await fetch('/api/trades');
      if (!res.ok) return;
      const data = await res.json();
      setLiveTradeHistory(data);
    } catch { /* backend offline */ }
  };

  const startBot = async () => {
    try {
      const res = await fetch('/api/bot/start', { method: 'POST' });
      const data = await res.json();
      setBotRunning(true);
      console.log('[Bot]', data.message);
    } catch { setBotRunning(true); }
  };

  const stopBot = async () => {
    try {
      await fetch('/api/bot/stop', { method: 'POST' });
      setBotRunning(false);
    } catch { setBotRunning(false); }
  };

  const getPrice = (asset: HoldingAsset) => {
    const live = livePrices[asset.symbol];
    return live ? live.price : asset.basePrice;
  };

  const getChange = (asset: HoldingAsset) => {
    const live = livePrices[asset.symbol];
    return live ? live.changePercent24h : 0;
  };

  const inEntryZone = (asset: HoldingAsset) => {
    const p = getPrice(asset);
    return p >= asset.entryZoneLow && p <= asset.entryZoneHigh;
  };

  const formatPrice = (p: number) => {
    if (p >= 1000) return '$' + p.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (p >= 1) return '$' + p.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return '$' + p.toFixed(4);
  };

  const pctUp = (from: number, to: number) => (((to - from) / from) * 100).toFixed(0);

  const signalConfig = (signal: HoldingAsset['signal']) => {
    switch (signal) {
      case 'strong_buy': return { label: 'STRONG BUY', cls: 'bg-emerald-500 text-white' };
      case 'buy': return { label: 'BUY', cls: 'bg-green-500 text-white' };
      case 'accumulate': return { label: 'ACCUMULATE', cls: 'bg-cyan-500 text-white' };
      case 'hold': return { label: 'HOLD', cls: 'bg-yellow-500 text-black' };
      case 'wait': return { label: 'WAIT', cls: 'bg-slate-600 text-slate-300' };
    }
  };

  // Auto-fetch all live data on mount
  useEffect(() => {
    fetchLivePrices();       // prices for Holdings tab + Dashboard market table
    fetchBotStatus();        // bot running state, P&L, win rate
    fetchBotSettings();      // paper trading, notifications, trading pairs
    fetchTradeHistory();     // trade history table
    fetchPortfolioBalance(); // real Binance account balance (requires API keys)
    fetchStrategies();       // strategy active/inactive state from disk
    // Poll every 30s
    const statusInterval = setInterval(fetchBotStatus, 30_000);
    const tradesInterval = setInterval(fetchTradeHistory, 30_000);
    const pricesInterval = setInterval(fetchLivePrices, 60_000);   // refresh prices every 60s
    const balanceInterval = setInterval(fetchPortfolioBalance, 120_000); // balance every 2 min
    return () => {
      clearInterval(statusInterval);
      clearInterval(tradesInterval);
      clearInterval(pricesInterval);
      clearInterval(balanceInterval);
    };
  }, []); // run once on app load

  useEffect(() => {
    if (activeTab === 'bot') fetchTradeHistory();
    if (activeTab === 'strategies') fetchStrategies();
  }, [activeTab]);

  const openStrategyConfig = (strategy: Strategy) => {

    setSelectedStrategy(strategy);
    // Read saved values from the strategy, not hardcoded defaults
    setConfigEdit({ minProfit: strategy.minProfit, maxLoss: strategy.maxLoss, positionSize: strategy.positionSize });
  };

  const saveStrategyConfig = async () => {
    if (!selectedStrategy) return;
    const updated = { ...configEdit };
    // Update local state immediately
    setStrategies(prev => prev.map(s =>
      s.id === selectedStrategy.id
        ? { ...s, minProfit: updated.minProfit, maxLoss: updated.maxLoss, positionSize: updated.positionSize }
        : s
    ));
    // Persist to backend → saved to data/strategies.json
    try {
      await fetch(`/api/strategies/${selectedStrategy.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minProfit: updated.minProfit, maxLoss: updated.maxLoss, positionSize: updated.positionSize }),
      });
    } catch { /* backend offline – local update still applied */ }
    setSaveMessage(`✓ ${selectedStrategy.name} saved!`);
    setTimeout(() => setSaveMessage(''), 3000);
    setSelectedStrategy(null);
  };


  const toggleStrategy = async (id: string) => {
    // Optimistic update in UI
    const currentActive = strategies.find(s => s.id === id)?.active ?? false;
    setStrategies(prev => prev.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    ));
    // Persist to backend (saves to data/strategies.json on server)
    try {
      await fetch(`/api/strategies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });
    } catch {
      // If backend fails, revert optimistic update
      setStrategies(prev => prev.map(s =>
        s.id === id ? { ...s, active: currentActive } : s
      ));
    }
  };

  // Apply dark class to <html> so shadcn CSS variables work correctly
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

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
        <Tabs value={activeTab} onValueChange={switchTab} className="space-y-8">
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
                      <p className="text-2xl font-bold text-white">
                        {portfolioConfigured && portfolioBalance > 0
                          ? `$${portfolioBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                          : `$${(totalProfit + 88800).toLocaleString()}`}
                      </p>
                    </div>
                    <Wallet className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {portfolioConfigured && portfolioBalance > 0 ? (
                      <>
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-emerald-400">Live Binance balance</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-500">
                          Add API keys to see real balance
                        </span>
                      </>
                    )}
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
                    <span className="text-sm text-slate-400">{activeTradesProfitable} profitable</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-sm text-slate-400">{activeTrades - activeTradesProfitable} pending</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Win Rate</p>
                      <p className="text-2xl font-bold text-white">{winRate}%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="mt-4">
                    <Progress value={winRate} className="h-2" />
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
                  <div className="mt-4 space-y-2">
                    {paperTrading && (
                      <p className="text-xs text-yellow-400 font-medium">📄 Paper Trading Mode</p>
                    )}
                    <Button
                      size="sm"
                      className={`w-full ${botRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                      onClick={() => botRunning ? stopBot() : startBot()}
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
                      {liveMarketData.map((asset) => (
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Long-term Holdings</h2>
                <p className="text-slate-400 text-sm">Professional research across Large, Mid & Small cap — {holdingAssets.length} assets tracked</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Live/Offline badge */}
                <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${pricesLive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${pricesLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  {pricesLive ? 'Binance Live' : 'Offline / Base Prices'}
                  {lastRefreshed && pricesLive && <span className="opacity-60 ml-1">· {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 h-8 px-3 text-xs"
                  onClick={() => fetchLivePrices()}
                  disabled={pricesLoading}
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${pricesLoading ? 'animate-spin' : ''}`} />
                  {pricesLoading ? 'Fetching…' : 'Refresh'}
                </Button>
              </div>
            </div>

            {/* Disclaimer */}
            <Alert className="bg-slate-800/50 border-slate-700">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <AlertDescription className="text-slate-300 text-xs">
                <strong className="text-white">Senior Trader Analysis</strong> — Prices are live from Binance when backend is running. Targets based on macro cycles, on-chain data, and sector analysis. <strong className="text-amber-400">Always DYOR.</strong>
              </AlertDescription>
            </Alert>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Assets Tracked', val: holdingAssets.length, color: 'text-white' },
                { label: 'In Entry Zone', val: holdingAssets.filter(a => inEntryZone(a)).length, color: 'text-emerald-400' },
                { label: 'Strong Buy / Buy', val: holdingAssets.filter(a => a.signal === 'strong_buy' || a.signal === 'buy').length, color: 'text-green-400' },
                { label: 'Avg Bull Upside', val: Math.round(holdingAssets.reduce((acc, a) => acc + ((a.target3 - getPrice(a)) / getPrice(a) * 100), 0) / holdingAssets.length) + '%', color: 'text-cyan-400' }
              ].map(s => (
                <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'large', 'mid', 'small'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setHoldingCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${holdingCategory === cat
                    ? cat === 'all' ? 'bg-white text-slate-900'
                      : cat === 'large' ? 'bg-blue-500 text-white'
                        : cat === 'mid' ? 'bg-yellow-500 text-black'
                          : 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                  {cat === 'all' ? 'All (20)' : cat === 'large' ? '🔵 Large Cap (8)' : cat === 'mid' ? '🟡 Mid Cap (7)' : '🔴 Small Cap (5)'}
                </button>
              ))}
            </div>

            {/* Asset cards */}
            <div className="space-y-3">
              {holdingAssets
                .filter(a => holdingCategory === 'all' || a.category === holdingCategory)
                .map(asset => {
                  const price = getPrice(asset);
                  const change = getChange(asset);
                  const isExpanded = expandedHolding === asset.symbol;
                  const zone = inEntryZone(asset);
                  const sig = signalConfig(asset.signal);
                  const rr = ((asset.target2 - price) / (price - asset.stopLoss)).toFixed(1);
                  const athPct = ((price - asset.athPrice) / asset.athPrice * 100).toFixed(0);
                  // Entry zone bar: 0% = stopLoss, 100% = target1
                  const barRange = asset.target1 - asset.stopLoss;
                  const barPct = Math.min(100, Math.max(0, ((price - asset.stopLoss) / barRange) * 100));
                  const entryLowPct = ((asset.entryZoneLow - asset.stopLoss) / barRange) * 100;
                  const entryWidthPct = ((asset.entryZoneHigh - asset.entryZoneLow) / barRange) * 100;

                  return (
                    <Card
                      key={asset.symbol}
                      className={`border transition-all cursor-pointer ${isExpanded ? 'border-slate-600 bg-slate-900' : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                        }`}
                      onClick={() => setExpandedHolding(isExpanded ? null : asset.symbol)}
                    >
                      {/* Card header — always visible */}
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Color dot + ticker */}
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: asset.color }}>
                            {asset.ticker.slice(0, 3)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-white">{asset.name}</span>
                              <span className="text-slate-400 text-xs">{asset.ticker}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${asset.category === 'large' ? 'bg-blue-500/20 text-blue-300' :
                                asset.category === 'mid' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-rose-500/20 text-rose-300'
                                }`}>
                                {asset.category === 'large' ? 'Large Cap' : asset.category === 'mid' ? 'Mid Cap' : 'Small Cap'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{asset.sector}</p>
                          </div>
                          {/* Price + change */}
                          <div className="text-right flex-shrink-0">
                            <p className="font-mono font-bold text-white">{formatPrice(price)}</p>
                            <p className={`text-xs font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {change >= 0 ? '+' : ''}{change.toFixed(2)}% 24h
                            </p>
                          </div>
                          {/* Signal badge */}
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0 hidden sm:block ${sig?.cls}`}>
                            {sig?.label}
                          </span>
                          {/* Entry zone badge */}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${zone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                            {zone ? '✓ In Zone' : 'Watch'}
                          </span>
                          {/* Expand chevron */}
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-4 border-t border-slate-800 pt-4">
                          {/* Price bar: stop loss → entry zone → target1 */}
                          <div>
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                              <span>Stop {formatPrice(asset.stopLoss)}</span>
                              <span className="text-emerald-400">Entry {formatPrice(asset.entryZoneLow)}–{formatPrice(asset.entryZoneHigh)}</span>
                              <span>T1 {formatPrice(asset.target1)}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full relative overflow-hidden">
                              {/* entry zone highlight */}
                              <div className="absolute h-full bg-emerald-500/30 rounded-full" style={{ left: `${entryLowPct}%`, width: `${entryWidthPct}%` }} />
                              {/* current price dot */}
                              <div className="absolute top-0 h-full w-1 bg-white rounded-full" style={{ left: `${Math.min(98, barPct)}%` }} />
                            </div>
                          </div>

                          {/* Price Targets grid */}
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { label: 'Target 1 (6–12m)', price: asset.target1, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                              { label: 'Target 2 (1–2y)', price: asset.target2, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
                              { label: 'Bull Case (2–4y)', price: asset.target3, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' }
                            ].map(t => (
                              <div key={t.label} className={`rounded-lg p-3 border ${t.bg}`}>
                                <p className="text-xs text-slate-400 mb-1">{t.label}</p>
                                <p className={`font-mono font-bold text-sm ${t.color}`}>{formatPrice(t.price)}</p>
                                <p className={`text-xs ${t.color}`}>+{pctUp(price, t.price)}%</p>
                              </div>
                            ))}
                          </div>

                          {/* Stats row */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="bg-slate-800 rounded-lg p-2.5">
                              <p className="text-slate-400">Stop Loss</p>
                              <p className="font-mono text-red-400 font-bold">{formatPrice(asset.stopLoss)} <span className="font-normal">({pctUp(price, asset.stopLoss)}%)</span></p>
                            </div>
                            <div className="bg-slate-800 rounded-lg p-2.5">
                              <p className="text-slate-400">ATH</p>
                              <p className="font-mono text-slate-300 font-bold">{formatPrice(asset.athPrice)} <span className="text-slate-500">({asset.athDate})</span></p>
                              <p className="text-red-400">{athPct}% from ATH</p>
                            </div>
                            <div className="bg-slate-800 rounded-lg p-2.5">
                              <p className="text-slate-400">Risk / Reward</p>
                              <p className="font-bold text-white">1 : {Number(rr) > 0 ? rr : '—'}</p>
                              <p className="text-slate-500">vs Target 2</p>
                            </div>
                            <div className="bg-slate-800 rounded-lg p-2.5">
                              <p className="text-slate-400">Risk Rating</p>
                              <div className="flex gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                  <div key={i} className={`w-3 h-3 rounded-sm ${i <= asset.riskRating ? 'bg-red-500' : 'bg-slate-700'}`} />
                                ))}
                              </div>
                              <p className="text-slate-500">{['', 'Very Low', 'Low', 'Medium', 'High', 'Very High'][asset.riskRating]}</p>
                            </div>
                          </div>

                          {/* Hold + Signal */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Hold: {asset.holdDuration}
                            </Badge>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold ${sig?.cls}`}>
                              {sig?.label}
                            </span>
                          </div>

                          {/* Thesis */}
                          <div className="bg-slate-800/60 rounded-lg p-3">
                            <p className="text-xs font-semibold text-slate-300 mb-1.5">📋 Investment Thesis</p>
                            <p className="text-xs text-slate-400 leading-relaxed">{asset.thesis}</p>
                          </div>

                          {/* Catalysts + Risks */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                              <p className="text-xs font-semibold text-emerald-400 mb-2">🚀 Key Catalysts</p>
                              <ul className="space-y-1">
                                {asset.catalysts.map((c, i) => (
                                  <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                                    <span className="text-emerald-500 flex-shrink-0">✦</span>{c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                              <p className="text-xs font-semibold text-red-400 mb-2">⚠️ Key Risks</p>
                              <ul className="space-y-1">
                                {asset.risks.map((r, i) => (
                                  <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                                    <span className="text-red-500 flex-shrink-0">▸</span>{r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
            </div>
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
                      {liveTradeHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                            {botRunning
                              ? 'Bot is running — trades will appear here as they execute'
                              : 'No trades yet — start the bot to begin trading'}
                          </td>
                        </tr>
                      ) : (
                        liveTradeHistory.slice(-20).reverse().map((trade: any) => {
                          const ts = new Date(trade.timestamp);
                          const minutesAgo = Math.round((Date.now() - ts.getTime()) / 60000);
                          const timeLabel = minutesAgo < 60
                            ? `${minutesAgo} min ago`
                            : `${Math.round(minutesAgo / 60)} hr ago`;
                          return (
                            <tr key={trade.id} className="border-b border-slate-800/50">
                              <td className="py-3 px-4 text-sm text-slate-300">{timeLabel}</td>
                              <td className="py-3 px-4 text-sm text-white font-medium">
                                {trade.symbol.replace('USDT', '/USDT')}
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={trade.type === 'buy' ? 'bg-emerald-500' : 'bg-red-500'}>
                                  {trade.type.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-slate-300">
                                {trade.amount.toFixed(4)}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-slate-300">
                                ${trade.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </td>
                              <td className={`py-3 px-4 text-sm text-right font-medium ${trade.profit == null ? 'text-slate-500'
                                : trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                {trade.profit == null ? '—'
                                  : (trade.profit >= 0 ? '+' : '') + '$' + Math.abs(trade.profit).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })
                      )}
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
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) setConfigEdit(c => ({ ...c, minProfit: val }));
                }}
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
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) setConfigEdit(c => ({ ...c, maxLoss: val }));
                }}
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
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setConfigEdit(c => ({ ...c, positionSize: val }));
                }}
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
              Configure bot behaviour and trading parameters. API keys are set securely in the server <code>.env</code> file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Paper Trading */}
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Paper Trading Mode</p>
                  <p className="text-xs text-slate-400 mt-0.5">Simulate trades without real money</p>
                </div>
                <Switch
                  checked={paperTrading}
                  onCheckedChange={(val) => setPaperTrading(val)}
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Enable Notifications</p>
                  <p className="text-xs text-slate-400 mt-0.5">Alert on trade execution and errors</p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={(val) => setNotifications(val)}
                />
              </div>
            </div>

            {/* Trading Pairs */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">Trading Pairs</label>
              <p className="text-xs text-slate-500">Comma-separated, e.g. BTCUSDT,ETHUSDT,SOLUSDT</p>
              <input
                type="text"
                value={tradingPairs}
                onChange={(e) => setTradingPairs(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {paperTrading && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
                <p className="text-yellow-400 text-sm">📄 Paper trading is <strong>ON</strong> — no real funds will be used.</p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-slate-700" onClick={() => setShowConfigDialog(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600" onClick={saveBotSettings}>
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default App;
