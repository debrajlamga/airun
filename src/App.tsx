import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import Strategies from './pages/Strategies';
import Backtest from './pages/Backtest';
import Orders from './pages/Orders';
import Positions from './pages/Positions';
import Portfolio from './pages/Portfolio';
import Risk from './pages/Risk';
import TradeJournal from './pages/TradeJournal';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { useTrading } from './hooks/useTrading';

function App() {
  const trading = useTrading();

  return (
    <BrowserRouter>
      <Layout
        botStatus={trading.botState.status}
        tradingMode={trading.botState.mode}
        notifications={trading.notifications}
        onEmergencyStop={trading.emergencyStop}
      >
        <Routes>
          <Route path="/" element={
            <Dashboard
              botState={trading.botState}
              positions={trading.positions}
              trades={trading.trades}
              strategies={trading.strategies}
              portfolioValue={trading.portfolioValue}
              cash={trading.cash}
              investedCapital={trading.investedCapital}
              unrealizedPnL={trading.unrealizedPnL}
              totalPnL={trading.totalPnL}
              winRate={trading.winRate}
              onStart={trading.startBot}
              onPause={trading.pauseBot}
              onStop={trading.stopBot}
            />
          } />
          <Route path="/market" element={<Market instruments={trading.marketData} />} />
          <Route path="/strategies" element={<Strategies strategies={trading.strategies} onToggle={trading.toggleStrategy} />} />
          <Route path="/backtest" element={<Backtest strategies={trading.strategies} />} />
          <Route path="/orders" element={<Orders orders={trading.orders} />} />
          <Route path="/positions" element={<Positions positions={trading.positions} />} />
          <Route path="/portfolio" element={
            <Portfolio
              positions={trading.positions}
              portfolioValue={trading.portfolioValue}
              cash={trading.cash}
              investedCapital={trading.investedCapital}
              unrealizedPnL={trading.unrealizedPnL}
              totalPnL={trading.totalPnL}
            />
          } />
          <Route path="/risk" element={
            <Risk
              settings={trading.riskSettings}
              onUpdate={trading.updateRiskSettings}
              emergencyStop={trading.emergencyStop}
              resumeFromEmergency={trading.resumeFromEmergency}
            />
          } />
          <Route path="/trades" element={<TradeJournal trades={trading.trades} />} />
          <Route path="/notifications" element={<Notifications notifications={trading.notifications} onMarkRead={trading.markNotificationRead} />} />
          <Route path="/settings" element={<Settings tradingMode={trading.botState.mode} onModeChange={trading.setTradingMode} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
