import { useState, useCallback, useEffect, useRef } from 'react';
import { BotState, TradingMode, BotStatus, Strategy, Order, Position, Trade, RiskSettings, Notification, Instrument, Signal } from '../types';
import { defaultStrategies, defaultOrders, defaultPositions, defaultTrades, defaultRiskSettings, defaultNotifications, instruments as defaultInstruments } from '../data/mockData';

export function useTrading() {
  const [botState, setBotState] = useState<BotState>({
    status: 'STOPPED',
    mode: 'PAPER',
    ordersToday: 5,
    tradesToday: 3,
    pnlToday: 927.50,
  });

  const [strategies, setStrategies] = useState<Strategy[]>(defaultStrategies);
  const [orders, setOrders] = useState<Order[]>(defaultOrders);
  const [positions, setPositions] = useState<Position[]>(defaultPositions);
  const [trades] = useState<Trade[]>(defaultTrades);
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(defaultRiskSettings);
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [marketData, setMarketData] = useState<Instrument[]>(defaultInstruments);
  const [portfolioValue] = useState(587432.80);
  const [cash] = useState(342156.40);
  const intervalRef = useRef<number | null>(null);

  // Simulate real-time market data updates
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setMarketData(prev => prev.map(inst => {
        const change = (Math.random() - 0.48) * inst.ltp * 0.002;
        const newPrice = Math.round((inst.ltp + change) * 100) / 100;
        const newChange = Math.round((newPrice - inst.close) * 100) / 100;
        const newChangePercent = Math.round((newChange / inst.close) * 10000) / 100;
        return {
          ...inst,
          ltp: newPrice,
          change: newChange,
          changePercent: newChangePercent,
          volume: inst.volume + Math.floor(Math.random() * 1000),
        };
      }));

      // Update positions with new prices
      setPositions(prev => prev.map(pos => {
        const inst = marketData.find(i => i.symbol === pos.symbol);
        if (!inst) return pos;
        const currentPrice = inst.ltp;
        const unrealizedPnL = pos.side === 'BUY'
          ? (currentPrice - pos.averagePrice) * pos.quantity
          : (pos.averagePrice - currentPrice) * pos.quantity;
        return { ...pos, currentPrice, unrealizedPnL: Math.round(unrealizedPnL * 100) / 100 };
      }));
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [marketData]);

  const startBot = useCallback(() => {
    if (riskSettings.emergencyKillSwitch) return;
    setBotState(prev => ({ ...prev, status: 'STARTING' }));
    setTimeout(() => {
      setBotState(prev => ({ ...prev, status: 'RUNNING', startTime: Date.now() }));
      addNotification('system', 'Bot Started', `Trading bot started in ${botState.mode} mode`, 'info');
    }, 1500);
  }, [riskSettings.emergencyKillSwitch, botState.mode]);

  const pauseBot = useCallback(() => {
    setBotState(prev => ({ ...prev, status: 'PAUSED' }));
    addNotification('system', 'Bot Paused', 'Trading bot paused by user', 'warning');
  }, []);

  const stopBot = useCallback(() => {
    setBotState(prev => ({ ...prev, status: 'STOPPED' }));
    addNotification('system', 'Bot Stopped', 'Trading bot stopped', 'info');
  }, []);

  const emergencyStop = useCallback(() => {
    setBotState(prev => ({ ...prev, status: 'EMERGENCY_STOP' }));
    setRiskSettings(prev => ({ ...prev, emergencyKillSwitch: true }));
    addNotification('risk', '🚨 EMERGENCY STOP', 'All trading halted. Kill switch activated.', 'error');
  }, []);

  const resumeFromEmergency = useCallback(() => {
    setRiskSettings(prev => ({ ...prev, emergencyKillSwitch: false }));
    setBotState(prev => ({ ...prev, status: 'STOPPED' }));
    addNotification('system', 'Emergency Stop Cleared', 'Kill switch deactivated. Bot can be restarted.', 'success');
  }, []);

  const setTradingMode = useCallback((mode: TradingMode) => {
    setBotState(prev => ({ ...prev, mode }));
    addNotification('system', 'Trading Mode Changed', `Mode changed to ${mode}`, 'warning');
  }, []);

  const toggleStrategy = useCallback((id: string) => {
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  }, []);

  const updateRiskSettings = useCallback((settings: Partial<RiskSettings>) => {
    setRiskSettings(prev => ({ ...prev, ...settings }));
    addNotification('system', 'Risk Settings Updated', 'Risk management parameters changed', 'info');
  }, []);

  const addNotification = useCallback((type: Notification['type'], title: string, message: string, severity: Notification['severity']) => {
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      severity,
    };
    setNotifications(prev => [notif, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const generateSignal = useCallback((symbol: string, strategyId: string): Signal => {
    const strategy = strategies.find(s => s.id === strategyId);
    const inst = marketData.find(i => i.symbol === symbol);
    if (!strategy || !inst) throw new Error('Invalid strategy or symbol');

    const signals: Signal['signal'][] = ['BUY', 'SELL', 'HOLD'];
    const signal = signals[Math.floor(Math.random() * 3)];

    return {
      id: `sig-${Date.now()}`,
      symbol,
      timestamp: Date.now(),
      strategy: strategy.name,
      signal,
      price: inst.ltp,
      confidence: Math.round(Math.random() * 40 + 60),
      reason: `${strategy.name}: ${signal === 'BUY' ? 'Bullish conditions met' : signal === 'SELL' ? 'Bearish conditions met' : 'No clear signal'}`,
      stopLoss: signal !== 'HOLD' ? Math.round(inst.ltp * (signal === 'BUY' ? 0.985 : 1.015) * 100) / 100 : 0,
      target: signal !== 'HOLD' ? Math.round(inst.ltp * (signal === 'BUY' ? 1.035 : 0.965) * 100) / 100 : 0,
    };
  }, [strategies, marketData]);

  const totalPnL = trades.reduce((sum, t) => sum + t.netPnL, 0);
  const investedCapital = positions.reduce((sum, p) => sum + p.averagePrice * p.quantity, 0);
  const unrealizedPnL = positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);
  const winRate = trades.length > 0 ? Math.round((trades.filter(t => t.netPnL > 0).length / trades.length) * 10000) / 100 : 0;

  return {
    botState,
    strategies,
    orders,
    positions,
    trades,
    riskSettings,
    notifications,
    marketData,
    portfolioValue,
    cash,
    investedCapital,
    unrealizedPnL,
    totalPnL,
    winRate,
    startBot,
    pauseBot,
    stopBot,
    emergencyStop,
    resumeFromEmergency,
    setTradingMode,
    toggleStrategy,
    updateRiskSettings,
    markNotificationRead,
    generateSignal,
    addNotification,
  };
}
