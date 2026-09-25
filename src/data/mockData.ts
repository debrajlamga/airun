import { Instrument, OHLCV, Strategy, Order, Position, Trade, RiskSettings, Notification, BacktestResult } from '../types';

// Generate realistic OHLCV data
export function generateOHLCV(basePrice: number, days: number = 90, interval: string = '1D'): OHLCV[] {
  const data: OHLCV[] = [];
  let price = basePrice;
  const now = Date.now();
  const intervalMs = interval === '1D' ? 86400000 : interval === '1h' ? 3600000 : interval === '15m' ? 900000 : 300000;
  const count = interval === '1D' ? days : interval === '1h' ? days * 6 : days * 24;

  for (let i = count; i >= 0; i--) {
    const volatility = price * 0.02;
    const change = (Math.random() - 0.48) * volatility;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 5000000) + 500000;

    data.push({
      timestamp: now - i * intervalMs,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });
    price = close;
  }
  return data;
}

export const instruments: Instrument[] = [
  { symbol: 'RELIANCE', exchange: 'NSE', token: 256265, segment: 'EQ', tickSize: 0.05, lotSize: 1, ltp: 2487.55, change: 32.40, changePercent: 1.32, volume: 8234567, open: 2455.15, high: 2498.90, low: 2448.30, close: 2455.15 },
  { symbol: 'TCS', exchange: 'NSE', token: 2964257, segment: 'EQ', tickSize: 0.05, lotSize: 1, ltp: 3654.20, change: -18.75, changePercent: -0.51, volume: 3456789, open: 3672.95, high: 3685.40, low: 3645.10, close: 3672.95 },
  { symbol: 'INFY', exchange: 'NSE', token: 1594, segment: 'EQ', tickSize: 0.05, lotSize: 1, ltp: 1478.30, change: 12.85, changePercent: 0.88, volume: 5678234, open: 1465.45, high: 1485.60, low: 1462.20, close: 1465.45 },
  { symbol: 'HDFCBANK', exchange: 'NSE', token: 1333, segment: 'EQ', tickSize: 0.05, lotSize: 1, ltp: 1642.80, change: -8.45, changePercent: -0.51, volume: 6789012, open: 1651.25, high: 1658.90, low: 1638.50, close: 1651.25 },
  { symbol: 'ICICIBANK', exchange: 'NSE', token: 4963, segment: 'EQ', tickSize: 0.05, lotSize: 1, ltp: 1024.55, change: 15.30, changePercent: 1.52, volume: 12345678, open: 1009.25, high: 1028.70, low: 1007.80, close: 1009.25 },
  { symbol: 'HINDUNILVR', exchange: 'NSE', token: 1394, segment: 'EQ', tickSize: 0.05, lotSize: 1, ltp: 2876.40, change: 22.15, changePercent: 0.78, volume: 1234567, open: 2854.25, high: 2882.90, low: 2851.30, close: 2854.25 },
  { symbol: 'SBIN', exchange: 'NSE', token: 779521, segment: 'EQ', tickSize: 0.05, lotSize: 1, ltp: 628.75, change: 8.90, changePercent: 1.44, volume: 15678901, open: 619.85, high: 632.40, low: 618.20, close: 619.85 },
  { symbol: 'BHARTIARTL', exchange: 'NSE', token: 10603, segment: 'EQ', tickSize: 0.05, lotSize: 1, ltp: 1245.60, change: -5.20, changePercent: -0.42, volume: 4567890, open: 1250.80, high: 1258.30, low: 1242.10, close: 1250.80 },
  { symbol: 'ITC', exchange: 'NSE', token: 16000, segment: 'EQ', tickSize: 0.05, lotSize: 1, ltp: 438.25, change: 3.45, changePercent: 0.79, volume: 18901234, open: 434.80, high: 440.50, low: 433.60, close: 434.80 },
  { symbol: 'WIPRO', exchange: 'NSE', token: 3787, segment: 'EQ', tickSize: 0.05, lotSize: 1, ltp: 462.30, change: -2.15, changePercent: -0.46, volume: 7890123, open: 464.45, high: 466.80, low: 460.20, close: 464.45 },
  { symbol: 'TATAMOTORS', exchange: 'NSE', token: 3456, segment: 'EQ', tickSize: 0.05, lotSize: 1, ltp: 712.80, change: 18.60, changePercent: 2.68, volume: 22345678, open: 694.20, high: 718.50, low: 692.40, close: 694.20 },
  { symbol: 'NIFTY 50', exchange: 'NSE', token: 256265, segment: 'INDEX', tickSize: 0.05, lotSize: 25, ltp: 22456.80, change: 145.30, changePercent: 0.65, volume: 0, open: 22311.50, high: 22498.20, low: 22298.40, close: 22311.50 },
];

export const defaultStrategies: Strategy[] = [
  {
    id: 'strat-1',
    name: 'EMA Crossover (9/21)',
    type: 'EMA_CROSSOVER',
    enabled: true,
    symbols: ['RELIANCE', 'TCS', 'INFY'],
    timeframe: '15m',
    parameters: { fastEMA: 9, slowEMA: 21 },
    entryRules: 'BUY when Fast EMA crosses above Slow EMA',
    exitRules: 'SELL when Fast EMA crosses below Slow EMA',
    stopLoss: 1.5,
    target: 3.0,
    trailingStop: 1.0,
    maxPositions: 3,
    positionSize: 10,
    createdAt: Date.now() - 86400000 * 30,
    performance: { totalReturn: 12.4, winRate: 58.3, totalTrades: 48, profitFactor: 1.82, maxDrawdown: 4.2, sharpeRatio: 1.45 },
  },
  {
    id: 'strat-2',
    name: 'RSI Mean Reversion',
    type: 'RSI',
    enabled: true,
    symbols: ['HDFCBANK', 'ICICIBANK', 'SBIN'],
    timeframe: '1h',
    parameters: { period: 14, oversold: 30, overbought: 70 },
    entryRules: 'BUY when RSI crosses above 30 (oversold recovery)',
    exitRules: 'SELL when RSI crosses below 70 (overbought reversal)',
    stopLoss: 2.0,
    target: 4.0,
    trailingStop: 1.5,
    maxPositions: 2,
    positionSize: 15,
    createdAt: Date.now() - 86400000 * 20,
    performance: { totalReturn: 8.7, winRate: 62.1, totalTrades: 35, profitFactor: 2.1, maxDrawdown: 3.1, sharpeRatio: 1.68 },
  },
  {
    id: 'strat-3',
    name: 'VWAP Trend',
    type: 'VWAP',
    enabled: false,
    symbols: ['TATAMOTORS', 'ITC'],
    timeframe: '5m',
    parameters: { deviation: 1.5 },
    entryRules: 'BUY when price crosses above VWAP with volume confirmation',
    exitRules: 'SELL when price crosses below VWAP',
    stopLoss: 1.0,
    target: 2.5,
    trailingStop: 0.8,
    maxPositions: 2,
    positionSize: 12,
    createdAt: Date.now() - 86400000 * 10,
    performance: { totalReturn: 5.2, winRate: 54.8, totalTrades: 22, profitFactor: 1.45, maxDrawdown: 2.8, sharpeRatio: 1.12 },
  },
  {
    id: 'strat-4',
    name: 'Multi-Indicator Combined',
    type: 'COMBINED',
    enabled: true,
    symbols: ['RELIANCE', 'INFY', 'TCS', 'HDFCBANK'],
    timeframe: '15m',
    parameters: { fastEMA: 9, slowEMA: 21, rsiPeriod: 14, rsiBullishMin: 45, rsiBullishMax: 70 },
    entryRules: 'BUY when Fast EMA > Slow EMA AND RSI in bullish range AND Price > VWAP',
    exitRules: 'SELL when any condition reverses or stop-loss/target hit',
    stopLoss: 1.5,
    target: 3.5,
    trailingStop: 1.2,
    maxPositions: 4,
    positionSize: 8,
    createdAt: Date.now() - 86400000 * 5,
    performance: { totalReturn: 15.8, winRate: 64.2, totalTrades: 56, profitFactor: 2.35, maxDrawdown: 3.8, sharpeRatio: 1.89 },
  },
];

export const defaultOrders: Order[] = [
  { id: 'ORD-001', brokerOrderId: 'BRO-10001', userId: 'user-1', symbol: 'RELIANCE', exchange: 'NSE', side: 'BUY', quantity: 10, orderType: 'MARKET', price: 2487.55, status: 'FILLED', timestamp: Date.now() - 3600000, strategyId: 'strat-1', mode: 'PAPER', filledQuantity: 10, averagePrice: 2487.80 },
  { id: 'ORD-002', brokerOrderId: 'BRO-10002', userId: 'user-1', symbol: 'TCS', exchange: 'NSE', side: 'BUY', quantity: 5, orderType: 'LIMIT', price: 3650.00, status: 'FILLED', timestamp: Date.now() - 7200000, strategyId: 'strat-2', mode: 'PAPER', filledQuantity: 5, averagePrice: 3649.50 },
  { id: 'ORD-003', brokerOrderId: 'BRO-10003', userId: 'user-1', symbol: 'INFY', exchange: 'NSE', side: 'SELL', quantity: 15, orderType: 'MARKET', price: 1478.30, status: 'OPEN', timestamp: Date.now() - 1800000, strategyId: 'strat-1', mode: 'PAPER', filledQuantity: 0, averagePrice: 0 },
  { id: 'ORD-004', brokerOrderId: 'BRO-10004', userId: 'user-1', symbol: 'HDFCBANK', exchange: 'NSE', side: 'BUY', quantity: 20, orderType: 'SL', price: 1640.00, stopPrice: 1638.00, status: 'SUBMITTED', timestamp: Date.now() - 900000, strategyId: 'strat-4', mode: 'PAPER', filledQuantity: 0, averagePrice: 0 },
  { id: 'ORD-005', userId: 'user-1', symbol: 'SBIN', exchange: 'NSE', side: 'BUY', quantity: 50, orderType: 'MARKET', price: 628.75, status: 'REJECTED', timestamp: Date.now() - 600000, strategyId: 'strat-2', mode: 'PAPER', filledQuantity: 0, averagePrice: 0, error: 'Insufficient margin' },
];

export const defaultPositions: Position[] = [
  { id: 'POS-001', symbol: 'RELIANCE', exchange: 'NSE', side: 'BUY', quantity: 10, averagePrice: 2487.80, currentPrice: 2487.55, unrealizedPnL: -2.50, realizedPnL: 0, stopLoss: 2450.00, target: 2540.00, entryTime: Date.now() - 3600000, strategyId: 'strat-1' },
  { id: 'POS-002', symbol: 'TCS', exchange: 'NSE', side: 'BUY', quantity: 5, averagePrice: 3649.50, currentPrice: 3654.20, unrealizedPnL: 23.50, realizedPnL: 0, stopLoss: 3600.00, target: 3720.00, entryTime: Date.now() - 7200000, strategyId: 'strat-2' },
  { id: 'POS-003', symbol: 'ICICIBANK', exchange: 'NSE', side: 'BUY', quantity: 30, averagePrice: 1015.40, currentPrice: 1024.55, unrealizedPnL: 274.50, realizedPnL: 0, stopLoss: 1000.00, target: 1050.00, entryTime: Date.now() - 86400000, strategyId: 'strat-4' },
  { id: 'POS-004', symbol: 'TATAMOTORS', exchange: 'NSE', side: 'BUY', quantity: 25, averagePrice: 698.20, currentPrice: 712.80, unrealizedPnL: 365.00, realizedPnL: 0, stopLoss: 685.00, target: 735.00, entryTime: Date.now() - 172800000, strategyId: 'strat-4' },
];

export const defaultTrades: Trade[] = [
  { id: 'TRD-001', symbol: 'RELIANCE', side: 'BUY', quantity: 10, entryPrice: 2420.50, exitPrice: 2478.30, grossPnL: 578.00, netPnL: 548.50, fees: 29.50, strategy: 'EMA Crossover (9/21)', entryTime: Date.now() - 86400000 * 3, exitTime: Date.now() - 86400000 * 2, entryReason: 'EMA crossover bullish', exitReason: 'Target reached', stopLoss: 2400.00, target: 2475.00, holdingDuration: '1d 4h 22m', tags: ['momentum'] },
  { id: 'TRD-002', symbol: 'INFY', side: 'BUY', quantity: 20, entryPrice: 1445.20, exitPrice: 1432.80, grossPnL: -248.00, netPnL: -268.40, fees: 20.40, strategy: 'RSI Mean Reversion', entryTime: Date.now() - 86400000 * 5, exitTime: Date.now() - 86400000 * 4, entryReason: 'RSI oversold bounce', exitReason: 'Stop-loss hit', stopLoss: 1432.00, target: 1490.00, holdingDuration: '1d 2h 15m', tags: ['mean-reversion'] },
  { id: 'TRD-003', symbol: 'HDFCBANK', side: 'BUY', quantity: 15, entryPrice: 1620.00, exitPrice: 1658.40, grossPnL: 576.00, netPnL: 551.20, fees: 24.80, strategy: 'Multi-Indicator Combined', entryTime: Date.now() - 86400000 * 7, exitTime: Date.now() - 86400000 * 6, entryReason: 'All indicators aligned bullish', exitReason: 'Target reached', stopLoss: 1600.00, target: 1658.00, holdingDuration: '1d 6h 45m', tags: ['combined', 'trend'] },
  { id: 'TRD-004', symbol: 'TCS', side: 'SELL', quantity: 8, entryPrice: 3710.50, exitPrice: 3685.20, grossPnL: 202.40, netPnL: 188.60, fees: 13.80, strategy: 'EMA Crossover (9/21)', entryTime: Date.now() - 86400000 * 10, exitTime: Date.now() - 86400000 * 9, entryReason: 'EMA bearish crossover', exitReason: 'Target reached', stopLoss: 3740.00, target: 3685.00, holdingDuration: '1d 3h 10m', tags: ['momentum'] },
  { id: 'TRD-005', symbol: 'SBIN', side: 'BUY', quantity: 40, entryPrice: 605.30, exitPrice: 618.90, grossPnL: 544.00, netPnL: 522.80, fees: 21.20, strategy: 'Multi-Indicator Combined', entryTime: Date.now() - 86400000 * 12, exitTime: Date.now() - 86400000 * 11, entryReason: 'Combined signal confirmed', exitReason: 'Trailing stop hit', stopLoss: 595.00, target: 635.00, holdingDuration: '1d 5h 30m', tags: ['combined'] },
  { id: 'TRD-006', symbol: 'WIPRO', side: 'BUY', quantity: 30, entryPrice: 458.60, exitPrice: 452.40, grossPnL: -186.00, netPnL: -201.50, fees: 15.50, strategy: 'RSI Mean Reversion', entryTime: Date.now() - 86400000 * 14, exitTime: Date.now() - 86400000 * 13, entryReason: 'RSI oversold', exitReason: 'Stop-loss hit', stopLoss: 452.00, target: 475.00, holdingDuration: '0d 18h 45m', tags: ['mean-reversion'] },
  { id: 'TRD-007', symbol: 'ITC', side: 'BUY', quantity: 50, entryPrice: 428.50, exitPrice: 445.80, grossPnL: 865.00, netPnL: 838.20, fees: 26.80, strategy: 'VWAP Trend', entryTime: Date.now() - 86400000 * 16, exitTime: Date.now() - 86400000 * 15, entryReason: 'Price above VWAP with volume', exitReason: 'Target reached', stopLoss: 422.00, target: 445.00, holdingDuration: '1d 2h 50m', tags: ['vwap', 'trend'] },
  { id: 'TRD-008', symbol: 'BHARTIARTL', side: 'BUY', quantity: 12, entryPrice: 1228.40, exitPrice: 1252.60, grossPnL: 290.40, netPnL: 275.80, fees: 14.60, strategy: 'EMA Crossover (9/21)', entryTime: Date.now() - 86400000 * 18, exitTime: Date.now() - 86400000 * 17, entryReason: 'EMA bullish crossover', exitReason: 'Target reached', stopLoss: 1210.00, target: 1252.00, holdingDuration: '1d 1h 20m', tags: ['momentum'] },
];

export const defaultRiskSettings: RiskSettings = {
  maxRiskPerTrade: 2.0,
  maxDailyLoss: 5.0,
  maxTotalExposure: 80.0,
  maxPositionSize: 20.0,
  maxOpenPositions: 5,
  maxOrdersPerMinute: 3,
  maxConsecutiveLosses: 3,
  requireStopLoss: true,
  dailyTradingLock: false,
  emergencyKillSwitch: false,
};

export const defaultNotifications: Notification[] = [
  { id: 'notif-1', type: 'signal', title: 'BUY Signal', message: 'RELIANCE: EMA crossover detected. Price: ₹2,487.55', timestamp: Date.now() - 300000, read: false, severity: 'success' },
  { id: 'notif-2', type: 'order', title: 'Order Filled', message: 'BUY 10 RELIANCE @ ₹2,487.80', timestamp: Date.now() - 280000, read: false, severity: 'info' },
  { id: 'notif-3', type: 'risk', title: 'Risk Warning', message: 'Daily loss approaching limit: ₹4,200 / ₹5,000', timestamp: Date.now() - 600000, read: false, severity: 'warning' },
  { id: 'notif-4', type: 'system', title: 'Bot Started', message: 'Trading bot started in PAPER mode', timestamp: Date.now() - 3600000, read: true, severity: 'info' },
  { id: 'notif-5', type: 'order', title: 'Order Rejected', message: 'SELL SBIN rejected: Insufficient margin', timestamp: Date.now() - 600000, read: true, severity: 'error' },
  { id: 'notif-6', type: 'signal', title: 'SELL Signal', message: 'INFY: RSI overbought. Price: ₹1,478.30', timestamp: Date.now() - 1800000, read: true, severity: 'warning' },
];

export function generateBacktestResult(): BacktestResult {
  const equityCurve: { timestamp: number; value: number }[] = [];
  const drawdownCurve: { timestamp: number; value: number }[] = [];
  let equity = 500000;
  let peak = equity;
  const now = Date.now();

  for (let i = 90; i >= 0; i--) {
    const change = (Math.random() - 0.45) * equity * 0.015;
    equity += change;
    if (equity > peak) peak = equity;
    const drawdown = ((peak - equity) / peak) * 100;

    equityCurve.push({ timestamp: now - i * 86400000, value: Math.round(equity * 100) / 100 });
    drawdownCurve.push({ timestamp: now - i * 86400000, value: Math.round(drawdown * 100) / 100 });
  }

  const monthlyReturns = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < 6; i++) {
    monthlyReturns.push({ month: months[(new Date().getMonth() - 5 + i + 12) % 12], return: Math.round((Math.random() * 8 - 2) * 100) / 100 });
  }

  return {
    totalReturn: Math.round(((equity - 500000) / 500000) * 10000) / 100,
    netPnL: Math.round((equity - 500000) * 100) / 100,
    grossProfit: Math.round(Math.abs(equity - 500000) * 1.8 * 100) / 100,
    grossLoss: Math.round(Math.abs(equity - 500000) * 0.8 * 100) / 100,
    totalTrades: 48,
    winningTrades: 28,
    losingTrades: 20,
    winRate: 58.3,
    profitFactor: 1.82,
    averageTrade: Math.round((equity - 500000) / 48 * 100) / 100,
    maxDrawdown: Math.max(...drawdownCurve.map(d => d.value)),
    sharpeRatio: 1.45,
    sortinoRatio: 1.82,
    cagr: 18.5,
    equityCurve,
    drawdownCurve,
    trades: defaultTrades,
    monthlyReturns,
  };
}
