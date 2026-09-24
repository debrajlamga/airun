import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Brain, FlaskConical, FileText, ShoppingCart, Target, PieChart, ShieldAlert, BookOpen, Bell, Settings, Menu, X, AlertTriangle, Activity } from 'lucide-react';
import { BotStatus, TradingMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  botStatus: BotStatus;
  tradingMode: TradingMode;
  notifications: { id: string; read: boolean }[];
  onEmergencyStop: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/market', icon: TrendingUp, label: 'Market' },
  { path: '/strategies', icon: Brain, label: 'Strategies' },
  { path: '/backtest', icon: FlaskConical, label: 'Backtest' },
  { path: '/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/positions', icon: Target, label: 'Positions' },
  { path: '/portfolio', icon: PieChart, label: 'Portfolio' },
  { path: '/risk', icon: ShieldAlert, label: 'Risk Management' },
  { path: '/trades', icon: BookOpen, label: 'Trade Journal' },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children, botStatus, tradingMode, notifications, onEmergencyStop }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const unreadCount = notifications.filter(n => !n.read).length;

  const getStatusColor = () => {
    switch (botStatus) {
      case 'RUNNING': return 'bg-green-500';
      case 'PAUSED': return 'bg-yellow-500';
      case 'STOPPED': return 'bg-gray-500';
      case 'STARTING': return 'bg-blue-500 animate-pulse';
      case 'ERROR': return 'bg-red-500 animate-pulse';
      case 'EMERGENCY_STOP': return 'bg-red-600 animate-pulse';
      default: return 'bg-gray-500';
    }
  };

  const getModeColor = () => {
    switch (tradingMode) {
      case 'LIVE': return 'bg-red-600 text-white';
      case 'PAPER': return 'bg-blue-600 text-white';
      case 'BACKTEST': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">AI Trading Bot</h1>
              <p className="text-[10px] text-gray-500">Algorithmic Trading Platform</p>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="p-3 border-b border-gray-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Bot Status</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span className="text-xs font-medium">{botStatus.replace('_', ' ')}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Mode</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getModeColor()}`}>
              {tradingMode === 'LIVE' && '⚠️ '}
              {tradingMode}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.path === '/notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Emergency Stop */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={onEmergencyStop}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            EMERGENCY STOP
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between px-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 hover:bg-gray-800 rounded-lg">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-sm font-medium text-gray-300 capitalize">
              {location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1)}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {tradingMode === 'LIVE' && (
              <div className="flex items-center gap-1.5 bg-red-600/20 border border-red-600/40 px-3 py-1 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-400 font-bold">LIVE TRADING</span>
              </div>
            )}
            {botStatus === 'EMERGENCY_STOP' && (
              <div className="flex items-center gap-1.5 bg-red-600 px-3 py-1 rounded-lg animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs text-white font-bold">EMERGENCY STOP ACTIVE</span>
              </div>
            )}
            <div className="text-xs text-gray-500">
              {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
