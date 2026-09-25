// Trading Bot Types

export interface Strategy {
  id: string;
  name: string;
  type: 'EMA_CROSSOVER' | 'RSI' | 'VWAP' | 'COMBINED';
  enabled: boolean;
  symbols: string[];
  timeframe: string;
  parameters: Record<string, any>;
  entryRules: string;
  exitRules: string;
  stopLoss: number;
  target: number;
  trailingStop: number;
  maxPositions: number;
  positionSize: number;
  createdAt: number;
  performance?: StrategyPerformance;
}

export interface StrategyPerformance {
  totalReturn: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  type: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  timestamp: number;
  strategyId?: string;
}

export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: number;
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  timestamp: number;
  strategyId?: string;
}

export interface RiskSettings {
  maxRiskPerTrade: number;
  maxDailyLoss: number;
  maxTotalExposure: number;
  maxPositionSize: number;
  maxOpenPositions: number;
  maxOrdersPerMinute: number;
  maxConsecutiveLosses: number;
  requireStopLoss: boolean;
  dailyTradingLock: boolean;
  emergencyKillSwitch: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface BotState {
  status: 'STOPPED' | 'RUNNING' | 'PAUSED';
  mode: 'PAPER' | 'LIVE';
  startTime?: number;
  pnl: number;
  trades: number;
}
