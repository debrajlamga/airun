import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
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
import Login from './pages/Login';
import { useTrading } from './hooks/useTrading';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuthContext();
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const trading = useTrading();
  const auth = useAuthContext();

  if (!auth.isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Layout
        botStatus={trading.botState.status}
        tradingMode={trading.botState.mode}
        notifications={trading.notifications}
        onEmergencyStop={trading.emergencyStop}
        user={auth.user}
        onLogout={auth.logout}
      >
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
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
            </ProtectedRoute>
          } />
          <Route path="/market" element={<ProtectedRoute><Market instruments={trading.marketData} /></ProtectedRoute>} />
          <Route path="/strategies" element={<ProtectedRoute><Strategies strategies={trading.strategies} onToggle={trading.toggleStrategy} /></ProtectedRoute>} />
          <Route path="/backtest" element={<ProtectedRoute><Backtest strategies={trading.strategies} /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders orders={trading.orders} /></ProtectedRoute>} />
          <Route path="/positions" element={<ProtectedRoute><Positions positions={trading.positions} /></ProtectedRoute>} />
          <Route path="/portfolio" element={
            <ProtectedRoute>
              <Portfolio
                positions={trading.positions}
                portfolioValue={trading.portfolioValue}
                cash={trading.cash}
                investedCapital={trading.investedCapital}
                unrealizedPnL={trading.unrealizedPnL}
                totalPnL={trading.totalPnL}
              />
            </ProtectedRoute>
          } />
          <Route path="/risk" element={
            <ProtectedRoute>
              <Risk
                settings={trading.riskSettings}
                onUpdate={trading.updateRiskSettings}
                emergencyStop={trading.emergencyStop}
                resumeFromEmergency={trading.resumeFromEmergency}
              />
            </ProtectedRoute>
          } />
          <Route path="/trades" element={<ProtectedRoute><TradeJournal trades={trading.trades} /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications notifications={trading.notifications} onMarkRead={trading.markNotificationRead} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings tradingMode={trading.botState.mode} onModeChange={trading.setTradingMode} /></ProtectedRoute>} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
