# AI Trading Bot - Database System

## 🗄️ Database Overview

The application uses **LocalStorage** as a persistent database that automatically initializes when the app first loads. All trading strategies, settings, and data are stored locally in the browser.

## ✅ Automatic Initialization

The database automatically initializes on first load with:
- **4 Pre-configured Trading Strategies**
- **Default Risk Management Settings**
- **Empty Orders, Positions, and Trades**

No manual setup required! Just open the application and everything is ready.

## 📊 Pre-configured Strategies

### 1. EMA Crossover (9/21)
- **Type**: EMA_CROSSOVER
- **Symbols**: RELIANCE, TCS, INFY
- **Timeframe**: 15m
- **Entry Rule**: BUY when Fast EMA (9) crosses above Slow EMA (21)
- **Exit Rule**: SELL when Fast EMA crosses below Slow EMA
- **Stop Loss**: 1.5%
- **Target**: 3.0%
- **Status**: ✅ Enabled by default

### 2. RSI Mean Reversion
- **Type**: RSI
- **Symbols**: HDFCBANK, ICICIBANK, SBIN
- **Timeframe**: 1h
- **Entry Rule**: BUY when RSI crosses above 30 (oversold recovery)
- **Exit Rule**: SELL when RSI crosses below 70 (overbought reversal)
- **Stop Loss**: 2.0%
- **Target**: 4.0%
- **Status**: ✅ Enabled by default

### 3. VWAP Trend
- **Type**: VWAP
- **Symbols**: TATAMOTORS, ITC
- **Timeframe**: 5m
- **Entry Rule**: BUY when price crosses above VWAP with volume confirmation
- **Exit Rule**: SELL when price crosses below VWAP
- **Stop Loss**: 1.0%
- **Target**: 2.5%
- **Status**: ❌ Disabled by default

### 4. Multi-Indicator Combined
- **Type**: COMBINED
- **Symbols**: RELIANCE, INFY, TCS, HDFCBANK
- **Timeframe**: 15m
- **Entry Rule**: BUY when Fast EMA > Slow EMA AND RSI in bullish range (45-70) AND Price > VWAP
- **Exit Rule**: SELL when any condition reverses or stop-loss/target hit
- **Stop Loss**: 1.5%
- **Target**: 3.5%
- **Status**: ✅ Enabled by default

## 🎯 How to Use

### View Strategies
All strategies are displayed on the main dashboard with:
- Strategy name and type
- Active/Inactive status
- Symbols and timeframe
- Performance metrics (if available)
- Entry and exit rules

### Enable/Disable Strategies
Click the **Enable** or **Disable** button next to any strategy to toggle it on/off.

### Database Persistence
All changes are automatically saved to LocalStorage and persist across page reloads.

## 🗃️ Database Structure

### Storage Keys
- `trading_bot_strategies` - All trading strategies
- `trading_bot_orders` - Order history
- `trading_bot_positions` - Current positions
- `trading_bot_trades` - Trade history
- `trading_bot_risk_settings` - Risk management settings
- `trading_bot_notifications` - Notification history
- `trading_bot_initialized` - Initialization flag

### Strategy Object Structure
```typescript
{
  id: string;                    // Unique identifier
  name: string;                  // Strategy name
  type: 'EMA_CROSSOVER' | 'RSI' | 'VWAP' | 'COMBINED';
  enabled: boolean;              // Active status
  symbols: string[];             // Trading symbols
  timeframe: string;             // Chart timeframe
  parameters: Record<string, any>; // Strategy-specific parameters
  entryRules: string;            // Entry conditions
  exitRules: string;             // Exit conditions
  stopLoss: number;              // Stop loss percentage
  target: number;                // Target percentage
  trailingStop: number;          // Trailing stop percentage
  maxPositions: number;          // Maximum concurrent positions
  positionSize: number;          // Position size percentage
  createdAt: number;             // Creation timestamp
  performance?: {                // Performance metrics
    totalReturn: number;
    winRate: number;
    totalTrades: number;
    profitFactor: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
}
```

## 🔧 Database API

The database service (`src/services/database.ts`) provides these methods:

### Strategies
```typescript
db.getStrategies()                    // Get all strategies
db.addStrategy(strategy)              // Add new strategy
db.updateStrategy(id, updates)        // Update strategy
db.deleteStrategy(id)                 // Delete strategy
db.toggleStrategy(id)                 // Enable/disable strategy
```

### Orders
```typescript
db.getOrders()                        // Get all orders
db.addOrder(order)                    // Add new order
db.updateOrder(id, updates)           // Update order
```

### Positions
```typescript
db.getPositions()                     // Get all positions
db.addPosition(position)              // Add new position
db.updatePosition(id, updates)        // Update position
```

### Trades
```typescript
db.getTrades()                        // Get all trades
db.addTrade(trade)                    // Add new trade
```

### Risk Settings
```typescript
db.getRiskSettings()                  // Get risk settings
db.updateRiskSettings(updates)        // Update risk settings
```

### Notifications
```typescript
db.getNotifications()                 // Get all notifications
db.addNotification(notification)      // Add new notification
db.markNotificationRead(id)           // Mark as read
```

### Utility Methods
```typescript
db.clearAll()                         // Reset database
db.exportData()                       // Export all data as JSON
db.importData(jsonString)             // Import data from JSON
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Opens at http://localhost:5173

### Production Build
```bash
npm run build
npm run preview
```

## 📝 Adding Custom Strategies

To add a new strategy, use the database API:

```typescript
import { db } from './services/database';

const newStrategy = {
  id: 'strat-custom-1',
  name: 'My Custom Strategy',
  type: 'EMA_CROSSOVER',
  enabled: true,
  symbols: ['RELIANCE', 'TCS'],
  timeframe: '1h',
  parameters: { fastEMA: 12, slowEMA: 26 },
  entryRules: 'Custom entry rules here',
  exitRules: 'Custom exit rules here',
  stopLoss: 2.0,
  target: 4.0,
  trailingStop: 1.5,
  maxPositions: 2,
  positionSize: 10,
  createdAt: Date.now(),
};

db.addStrategy(newStrategy);
```

## 🔄 Resetting the Database

To reset all data and reinitialize with default strategies:

```typescript
import { db } from './services/database';
db.clearAll();
```

Or clear browser LocalStorage manually:
1. Open Developer Tools (F12)
2. Go to Application tab
3. Clear LocalStorage for the domain
4. Reload the page

## 💾 Backup and Restore

### Export Data
```typescript
const backup = db.exportData();
// Save backup to file or send to server
```

### Import Data
```typescript
const backup = '...'; // JSON string from export
db.importData(backup);
```

## 🎯 Next Steps

1. **View Dashboard**: See all strategies and their status
2. **Toggle Strategies**: Enable/disable strategies as needed
3. **Monitor Performance**: Check strategy performance metrics
4. **Customize**: Add your own strategies using the database API
5. **Backup**: Regularly export your data for safety

## 📞 Support

For issues or questions:
- Check browser console for errors
- Verify LocalStorage is enabled
- Try clearing and reinitializing the database
- Check the database service logs

---

**Database Status**: ✅ Fully Operational  
**Auto-Initialization**: ✅ Enabled  
**Persistence**: ✅ LocalStorage  
**Strategies Loaded**: 4 pre-configured strategies
