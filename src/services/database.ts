/**
 * Database Service - LocalStorage based persistent storage
 * Automatically initializes on first load
 */

import { Strategy, Order, Position, Trade, RiskSettings, Notification } from '../types';

const DB_KEYS = {
  STRATEGIES: 'trading_bot_strategies',
  ORDERS: 'trading_bot_orders',
  POSITIONS: 'trading_bot_positions',
  TRADES: 'trading_bot_trades',
  RISK_SETTINGS: 'trading_bot_risk_settings',
  NOTIFICATIONS: 'trading_bot_notifications',
  INITIALIZED: 'trading_bot_initialized',
};

class Database {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize database with default data
   */
  private initialize() {
    if (this.isInitialized) return;

    const initialized = localStorage.getItem(DB_KEYS.INITIALIZED);
    
    if (!initialized) {
      console.log('🗄️ Initializing database...');
      this.seedDefaultData();
      localStorage.setItem(DB_KEYS.INITIALIZED, 'true');
      this.isInitialized = true;
      console.log('✅ Database initialized successfully');
    } else {
      this.isInitialized = true;
    }
  }

  /**
   * Seed default data for first-time setup
   */
  private seedDefaultData() {
    // Default Strategies
    const defaultStrategies: Strategy[] = [
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
        performance: {
          totalReturn: 12.4,
          winRate: 58.3,
          totalTrades: 48,
          profitFactor: 1.82,
          maxDrawdown: 4.2,
          sharpeRatio: 1.45,
        },
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
        performance: {
          totalReturn: 8.7,
          winRate: 62.1,
          totalTrades: 35,
          profitFactor: 2.1,
          maxDrawdown: 3.1,
          sharpeRatio: 1.68,
        },
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
        performance: {
          totalReturn: 5.2,
          winRate: 54.8,
          totalTrades: 22,
          profitFactor: 1.45,
          maxDrawdown: 2.8,
          sharpeRatio: 1.12,
        },
      },
      {
        id: 'strat-4',
        name: 'Multi-Indicator Combined',
        type: 'COMBINED',
        enabled: true,
        symbols: ['RELIANCE', 'INFY', 'TCS', 'HDFCBANK'],
        timeframe: '15m',
        parameters: {
          fastEMA: 9,
          slowEMA: 21,
          rsiPeriod: 14,
          rsiBullishMin: 45,
          rsiBullishMax: 70,
        },
        entryRules: 'BUY when Fast EMA > Slow EMA AND RSI in bullish range AND Price > VWAP',
        exitRules: 'SELL when any condition reverses or stop-loss/target hit',
        stopLoss: 1.5,
        target: 3.5,
        trailingStop: 1.2,
        maxPositions: 4,
        positionSize: 8,
        createdAt: Date.now() - 86400000 * 5,
        performance: {
          totalReturn: 15.8,
          winRate: 64.2,
          totalTrades: 56,
          profitFactor: 2.35,
          maxDrawdown: 3.8,
          sharpeRatio: 1.89,
        },
      },
    ];

    // Default Risk Settings
    const defaultRiskSettings: RiskSettings = {
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

    // Save to localStorage
    this.set(DB_KEYS.STRATEGIES, defaultStrategies);
    this.set(DB_KEYS.RISK_SETTINGS, defaultRiskSettings);
    this.set(DB_KEYS.ORDERS, []);
    this.set(DB_KEYS.POSITIONS, []);
    this.set(DB_KEYS.TRADES, []);
    this.set(DB_KEYS.NOTIFICATIONS, []);
  }

  /**
   * Generic get method
   */
  private get<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Database get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Generic set method
   */
  private set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Database set error for key ${key}:`, error);
    }
  }

  // ─── Strategies ──────────────────────────────────────────────────────────

  getStrategies(): Strategy[] {
    return this.get<Strategy[]>(DB_KEYS.STRATEGIES) || [];
  }

  saveStrategies(strategies: Strategy[]): void {
    this.set(DB_KEYS.STRATEGIES, strategies);
  }

  addStrategy(strategy: Strategy): void {
    const strategies = this.getStrategies();
    strategies.push(strategy);
    this.saveStrategies(strategies);
  }

  updateStrategy(id: string, updates: Partial<Strategy>): void {
    const strategies = this.getStrategies();
    const index = strategies.findIndex(s => s.id === id);
    if (index !== -1) {
      strategies[index] = { ...strategies[index], ...updates };
      this.saveStrategies(strategies);
    }
  }

  deleteStrategy(id: string): void {
    const strategies = this.getStrategies().filter(s => s.id !== id);
    this.saveStrategies(strategies);
  }

  toggleStrategy(id: string): void {
    const strategies = this.getStrategies();
    const strategy = strategies.find(s => s.id === id);
    if (strategy) {
      strategy.enabled = !strategy.enabled;
      this.saveStrategies(strategies);
    }
  }

  // ─── Orders ──────────────────────────────────────────────────────────────

  getOrders(): Order[] {
    return this.get<Order[]>(DB_KEYS.ORDERS) || [];
  }

  saveOrders(orders: Order[]): void {
    this.set(DB_KEYS.ORDERS, orders);
  }

  addOrder(order: Order): void {
    const orders = this.getOrders();
    orders.push(order);
    this.saveOrders(orders);
  }

  updateOrder(id: string, updates: Partial<Order>): void {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      this.saveOrders(orders);
    }
  }

  // ─── Positions ───────────────────────────────────────────────────────────

  getPositions(): Position[] {
    return this.get<Position[]>(DB_KEYS.POSITIONS) || [];
  }

  savePositions(positions: Position[]): void {
    this.set(DB_KEYS.POSITIONS, positions);
  }

  addPosition(position: Position): void {
    const positions = this.getPositions();
    positions.push(position);
    this.savePositions(positions);
  }

  updatePosition(id: string, updates: Partial<Position>): void {
    const positions = this.getPositions();
    const index = positions.findIndex(p => p.id === id);
    if (index !== -1) {
      positions[index] = { ...positions[index], ...updates };
      this.savePositions(positions);
    }
  }

  // ─── Trades ──────────────────────────────────────────────────────────────

  getTrades(): Trade[] {
    return this.get<Trade[]>(DB_KEYS.TRADES) || [];
  }

  saveTrades(trades: Trade[]): void {
    this.set(DB_KEYS.TRADES, trades);
  }

  addTrade(trade: Trade): void {
    const trades = this.getTrades();
    trades.push(trade);
    this.saveTrades(trades);
  }

  // ─── Risk Settings ───────────────────────────────────────────────────────

  getRiskSettings(): RiskSettings {
    return this.get<RiskSettings>(DB_KEYS.RISK_SETTINGS) || {
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
  }

  saveRiskSettings(settings: RiskSettings): void {
    this.set(DB_KEYS.RISK_SETTINGS, settings);
  }

  updateRiskSettings(updates: Partial<RiskSettings>): void {
    const settings = this.getRiskSettings();
    this.saveRiskSettings({ ...settings, ...updates });
  }

  // ─── Notifications ───────────────────────────────────────────────────────

  getNotifications(): Notification[] {
    return this.get<Notification[]>(DB_KEYS.NOTIFICATIONS) || [];
  }

  saveNotifications(notifications: Notification[]): void {
    this.set(DB_KEYS.NOTIFICATIONS, notifications);
  }

  addNotification(notification: Notification): void {
    const notifications = this.getNotifications();
    notifications.unshift(notification);
    this.saveNotifications(notifications);
  }

  markNotificationRead(id: string): void {
    const notifications = this.getNotifications();
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications(notifications);
    }
  }

  // ─── Utility Methods ─────────────────────────────────────────────────────

  /**
   * Clear all data (for testing)
   */
  clearAll(): void {
    Object.values(DB_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.isInitialized = false;
    this.initialize();
  }

  /**
   * Export all data
   */
  exportData(): string {
    const data: Record<string, any> = {};
    Object.entries(DB_KEYS).forEach(([name, key]) => {
      data[name] = this.get(key);
    });
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data
   */
  importData(jsonString: string): void {
    try {
      const data = JSON.parse(jsonString);
      Object.entries(DB_KEYS).forEach(([name, key]) => {
        if (data[name]) {
          this.set(key, data[name]);
        }
      });
    } catch (error) {
      console.error('Import error:', error);
    }
  }
}

// Export singleton instance
export const db = new Database();
