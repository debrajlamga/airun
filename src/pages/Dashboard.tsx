import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, BarChart3, AlertTriangle, Play, Pause, Square, Zap } from 'lucide-react';
import { BotState, Position, Trade, Strategy } from '../types';

interface DashboardProps {
  botState: BotState;
  positions: Position[];
  trades: Trade[];
  strategies: Strategy[];
  portfolioValue: number;
  cash: number;
  investedCapital: number;
  unrealizedPnL: number;
  totalPnL: number;
  winRate: number;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

export default function Dashboard({ botState, positions, trades, strategies, portfolioValue, cash, investedCapital, unrealizedPnL, totalPnL, winRate, onStart, onPause, onStop }: DashboardProps) {
  // Generate equity curve data
  const equityData = [];
  let val = 500000;
  for (let i = 30; i >= 0; i--) {
    val += (Math.random() - 0.45) * 3000;
    equityData.push({ day: `${i}d`, value: Math.round(val) });
  }

  const pnlData = trades.slice(0, 8).map((t, i) => ({
    name: t.symbol,
    pnl: t.netPnL,
    fill: t.netPnL >= 0 ? '#10b981' : '#ef4444',
  }));

  const allocationData = positions.map(p => ({
    name: p.symbol,
    value: Math.round(p.averagePrice * p.quantity),
  }));
  const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

  const todayPnL = botState.pnlToday || 0;
  const maxDrawdown = 4.2;
  const winningTrades = trades.filter(t => (t.netPnL || 0) > 0);
  const losingTrades = trades.filter(t => (t.netPnL || 0) < 0);
  const avgProfit = winningTrades.length > 0 ? winningTrades.reduce((s, t) => s + (t.netPnL || 0), 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((s, t) => s + (t.netPnL || 0), 0) / losingTrades.length : 0;

  return (
    <div className="space-y-6">
      {/* Risk Disclaimer */}
      <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
        <p className="text-xs text-yellow-400/80">
          <strong>Risk Disclaimer:</strong> Trading involves substantial risk of loss. Past performance does not guarantee future results. This platform is for educational and informational purposes. Never trade with money you cannot afford to lose.
        </p>
      </div>

      {/* Bot Controls */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${botState.status === 'RUNNING' ? 'bg-green-500 animate-pulse' : botState.status === 'PAUSED' ? 'bg-yellow-500' : botState.status === 'EMERGENCY_STOP' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-sm font-medium">{botState.status.replace('_', ' ')}</span>
            </div>
            <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">
              Mode: <span className={`font-bold ${botState.mode === 'LIVE' ? 'text-red-400' : botState.mode === 'PAPER' ? 'text-blue-400' : 'text-purple-400'}`}>{botState.mode}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onStart} disabled={botState.status === 'RUNNING' || botState.status === 'EMERGENCY_STOP'} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded-lg transition-colors">
              <Play className="w-3.5 h-3.5" /> Start
            </button>
            <button onClick={onPause} disabled={botState.status !== 'RUNNING'} className="flex items-center gap-1.5 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded-lg transition-colors">
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
            <button onClick={onStop} disabled={botState.status === 'STOPPED'} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded-lg transition-colors">
              <Square className="w-3.5 h-3.5" /> Stop
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={DollarSign} label="Portfolio Value" value={`₹${(portfolioValue / 100000).toFixed(2)}L`} color="blue" />
        <StatCard icon={TrendingUp} label="Today's P&L" value={`₹${todayPnL.toFixed(0)}`} color={todayPnL >= 0 ? 'green' : 'red'} subtext={`${((todayPnL / portfolioValue) * 100).toFixed(2)}%`} />
        <StatCard icon={BarChart3} label="Total P&L" value={`₹${(totalPnL / 1000).toFixed(1)}K`} color={totalPnL >= 0 ? 'green' : 'red'} subtext={`${((totalPnL / 500000) * 100).toFixed(1)}%`} />
        <StatCard icon={Target} label="Win Rate" value={`${winRate}%`} color="purple" subtext={`${trades.length} trades`} />
        <StatCard icon={Activity} label="Max Drawdown" value={`${maxDrawdown}%`} color="orange" />
        <StatCard icon={Zap} label="Open Positions" value={`${positions.length}`} color="cyan" subtext={`₹${(investedCapital / 1000).toFixed(0)}K invested`} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Equity Curve */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Equity Curve</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#equityGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Position Allocation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPie>
              <Pie data={allocationData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                {allocationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']} />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {allocationData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trade P&L and Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Trade P&L */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Recent Trade P&L</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pnlData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [`₹${value.toFixed(2)}`, 'P&L']} />
              <Line type="monotone" dataKey="pnl" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Key Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <MetricItem label="Available Cash" value={`₹${(cash / 1000).toFixed(1)}K`} />
            <MetricItem label="Invested Capital" value={`₹${(investedCapital / 1000).toFixed(1)}K`} />
            <MetricItem label="Unrealized P&L" value={`₹${unrealizedPnL.toFixed(2)}`} positive={unrealizedPnL >= 0} />
            <MetricItem label="Realized P&L" value={`₹${totalPnL.toFixed(2)}`} positive={totalPnL >= 0} />
            <MetricItem label="Avg Profit" value={`₹${avgProfit.toFixed(0)}`} positive />
            <MetricItem label="Avg Loss" value={`₹${avgLoss.toFixed(0)}`} />
            <MetricItem label="Total Trades" value={`${trades.length}`} />
            <MetricItem label="Active Strategies" value={`${strategies.filter(s => s.enabled).length}/${strategies.length}`} />
            <MetricItem label="Orders Today" value={`${botState.ordersToday}`} />
            <MetricItem label="Trades Today" value={`${botState.tradesToday}`} />
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Open Positions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800">
                <th className="text-left py-2 px-2">Symbol</th>
                <th className="text-right py-2 px-2">Qty</th>
                <th className="text-right py-2 px-2">Avg Price</th>
                <th className="text-right py-2 px-2">Current</th>
                <th className="text-right py-2 px-2">P&L</th>
                <th className="text-right py-2 px-2">SL</th>
                <th className="text-right py-2 px-2">Target</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(pos => (
                <tr key={pos.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2.5 px-2 font-medium">{pos.symbol}</td>
                  <td className="py-2.5 px-2 text-right">{pos.quantity}</td>
                  <td className="py-2.5 px-2 text-right">₹{pos.averagePrice.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-right">₹{pos.currentPrice.toFixed(2)}</td>
                  <td className={`py-2.5 px-2 text-right font-medium ${pos.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pos.unrealizedPnL >= 0 ? '+' : ''}₹{pos.unrealizedPnL.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-red-400">₹{pos.stopLoss.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-right text-green-400">₹{pos.target.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, subtext }: { icon: any; label: string; value: string; color: string; subtext?: string }) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/5 border-green-500/30',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/30',
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30',
  };
  const iconColor: Record<string, string> = {
    blue: 'text-blue-400', green: 'text-green-400', red: 'text-red-400',
    purple: 'text-purple-400', orange: 'text-orange-400', cyan: 'text-cyan-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-3`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-3.5 h-3.5 ${iconColor[color]}`} />
        <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-lg font-bold">{value}</div>
      {subtext && <div className="text-[10px] text-gray-500 mt-0.5">{subtext}</div>}
    </div>
  );
}

function MetricItem({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800/50">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-medium ${positive !== undefined ? (positive ? 'text-green-400' : 'text-red-400') : 'text-gray-200'}`}>{value}</span>
    </div>
  );
}
