// Trading Bot Types

export type TradingMode = 'BACKTEST' | 'PAPER' | 'LIVE';
export type BotStatus = 'STOPPED' | 'STARTING' | 'RUNNING' | 'PAUSED' | 'ERROR' | 'EMERGENCY_STOP';
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
export type OrderStatus = 'CREATED' | 'VALIDATING' | 'SUBMITTED' | 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED' | 'REJECTED' | 'FAILED';
export type SignalType = 'BUY' | 'SELL' | 'HOLD' | 'EXIT';
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '1D';

export interface Instrument {
  symbol: string;
  exchange: 'NSE' | 'BSE';
  token: number;
  segment: string;
  tickSize: number;
  lotSize: number;
  ltp: number;
  change: number;
  changePercent: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Signal {
  id: string;
  symbol: string;
  timestamp: number;
  strategy: string;
  signal: SignalType;
  price: number;
  confidence: number;
  reason: string;
  stopLoss: number;
  target: number;
  metadata?: Record<string, any>;
}

export interface Order {
  id: string;
  brokerOrderId?: string;
  userId: string;
  symbol: string;
  exchange: string;
  side: OrderSide;
  quantity: number;
  orderType: OrderType;
  price: number;
  stopPrice?: number;
  status: OrderStatus;
  timestamp: number;
  strategyId: string;
  mode: TradingMode;
  filledQuantity: number;
  averagePrice: number;
  error?: string;
}

export interface Position {
  id: string;
  symbol: string;
  exchange: string;
  side: OrderSide;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
  stopLoss: number;
  target: number;
  entryTime: number;
  strategyId: string;
}

export interface Trade {
  id: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  grossPnL: number;
  netPnL: number;
  fees: number;
  strategy: string;
  entryTime: number;
  exitTime: number;
  entryReason: string;
  exitReason: string;
  stopLoss: number;
  target: number;
  holdingDuration: string;
  notes?: string;
  tags?: string[];
}

export interface Strategy {
  id: string;
  name: string;
  type: 'EMA_CROSSOVER' | 'RSI' | 'VWAP' | 'COMBINED';
  enabled: boolean;
  symbols: string[];
  timeframe: Timeframe;
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

export interface BacktestResult {
  totalReturn: number;
  netPnL: number;
  grossProfit: number;
  grossLoss: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  averageTrade: number;
  maxDrawdown: number;
  sharpeRatio: number;
  sortinoRatio: number;
  cagr: number;
  equityCurve: { timestamp: number; value: number }[];
  drawdownCurve: { timestamp: number; value: number }[];
  trades: Trade[];
  monthlyReturns: { month: string; return: number }[];
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

export interface PortfolioSnapshot {
  timestamp: number;
  totalValue: number;
  cash: number;
  invested: number;
  unrealizedPnL: number;
  realizedPnL: number;
}

export interface Notification {
  id: string;
  type: 'signal' | 'order' | 'risk' | 'system' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export interface BotState {
  status: BotStatus;
  mode: TradingMode;
  startTime?: number;
  lastSignal?: Signal;
  ordersToday: number;
  tradesToday: number;
  pnlToday: number;
}
