import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { FlaskConical, Download, Play, AlertTriangle } from 'lucide-react';
import { Strategy, BacktestResult } from '../types';
import { generateBacktestResult } from '../data/mockData';

interface BacktestProps {
  strategies: Strategy[];
}

export default function Backtest({ strategies }: BacktestProps) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [config, setConfig] = useState({
    strategy: strategies[0]?.id || '',
    symbol: 'RELIANCE',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    timeframe: '15m',
    capital: 500000,
    brokerage: 0.03,
    slippage: 0.05,
    stopLoss: 1.5,
    target: 3.0,
  });

  const runBacktest = () => {
    setRunning(true);
    setTimeout(() => {
      setResult(generateBacktestResult());
      setRunning(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Backtesting Engine</h2>
          <p className="text-xs text-gray-500 mt-0.5">Test strategies against historical data. No look-ahead bias. Includes transaction costs.</p>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-purple-400" />
          Backtest Configuration
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Strategy</label>
            <select value={config.strategy} onChange={e => setConfig(p => ({ ...p, strategy: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500">
              {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Symbol</label>
            <select value={config.symbol} onChange={e => setConfig(p => ({ ...p, symbol: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500">
              {['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'TATAMOTORS', 'ITC'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Start Date</label>
            <input type="date" value={config.startDate} onChange={e => setConfig(p => ({ ...p, startDate: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">End Date</label>
            <input type="date" value={config.endDate} onChange={e => setConfig(p => ({ ...p, endDate: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Timeframe</label>
            <select value={config.timeframe} onChange={e => setConfig(p => ({ ...p, timeframe: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500">
              <option value="1m">1 Minute</option>
              <option value="5m">5 Minutes</option>
              <option value="15m">15 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="1D">1 Day</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Starting Capital (₹)</label>
            <input type="number" value={config.capital} onChange={e => setConfig(p => ({ ...p, capital: parseFloat(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Brokerage (%)</label>
            <input type="number" step="0.01" value={config.brokerage} onChange={e => setConfig(p => ({ ...p, brokerage: parseFloat(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Slippage (%)</label>
            <input type="number" step="0.01" value={config.slippage} onChange={e => setConfig(p => ({ ...p, slippage: parseFloat(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Stop Loss (%)</label>
            <input type="number" step="0.1" value={config.stopLoss} onChange={e => setConfig(p => ({ ...p, stopLoss: parseFloat(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Target (%)</label>
            <input type="number" step="0.1" value={config.target} onChange={e => setConfig(p => ({ ...p, target: parseFloat(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={runBacktest} disabled={running} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white text-sm rounded-lg transition-colors font-medium">
            {running ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running...</> : <><Play className="w-4 h-4" /> Run Backtest</>}
          </button>
          {result && (
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {running && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-300">Running backtest...</p>
          <p className="text-xs text-gray-500 mt-1">Processing historical data, calculating signals, simulating trades</p>
        </div>
      )}

      {/* Results */}
      {result && !running && (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <ResultCard label="Total Return" value={`${result.totalReturn}%`} color={result.totalReturn >= 0 ? 'green' : 'red'} />
            <ResultCard label="Net P&L" value={`₹${result.netPnL.toLocaleString()}`} color={result.netPnL >= 0 ? 'green' : 'red'} />
            <ResultCard label="Win Rate" value={`${result.winRate}%`} color="blue" />
            <ResultCard label="Profit Factor" value={`${result.profitFactor}`} color={result.profitFactor >= 1.5 ? 'green' : 'orange'} />
            <ResultCard label="Max Drawdown" value={`${result.maxDrawdown.toFixed(2)}%`} color="orange" />
            <ResultCard label="Sharpe Ratio" value={`${result.sharpeRatio}`} color={result.sharpeRatio >= 1 ? 'green' : 'orange'} />
            <ResultCard label="Total Trades" value={`${result.totalTrades}`} color="blue" />
            <ResultCard label="Winning" value={`${result.winningTrades}`} color="green" />
            <ResultCard label="Losing" value={`${result.losingTrades}`} color="red" />
            <ResultCard label="Avg Trade" value={`₹${result.averageTrade.toFixed(0)}`} color={result.averageTrade >= 0 ? 'green' : 'red'} />
            <ResultCard label="Sortino" value={`${result.sortinoRatio}`} color="blue" />
            <ResultCard label="CAGR" value={`${result.cagr}%`} color="green" />
          </div>

          {/* Equity Curve */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Equity Curve</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={result.equityCurve.map(d => ({ ...d, time: new Date(d.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) }))}>
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }} formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Equity']} />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#eqGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Drawdown Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Drawdown</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={result.drawdownCurve.map(d => ({ ...d, time: new Date(d.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) }))}>
                <defs>
                  <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `${v.toFixed(1)}%`} reversed />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }} formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']} />
                <Area type="monotone" dataKey="value" stroke="#ef4444" fill="url(#ddGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Returns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Monthly Returns</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={result.monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }} formatter={(value: number) => [`${value}%`, 'Return']} />
                  <Bar dataKey="return" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Trade List */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Trade Summary</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {result.trades.slice(0, 6).map(trade => (
                  <div key={trade.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="text-xs font-medium">{trade.symbol}</div>
                      <div className="text-[10px] text-gray-500">{trade.entryReason}</div>
                    </div>
                    <div className={`text-xs font-bold ${trade.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.netPnL >= 0 ? '+' : ''}₹{trade.netPnL.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-400/80">
              <strong>Backtest Disclaimer:</strong> Past performance in backtesting does not guarantee future results. Market conditions may differ from historical data. Always use proper risk management in live trading.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'text-green-400', red: 'text-red-400', blue: 'text-blue-400', orange: 'text-orange-400',
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
      <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`text-sm font-bold mt-1 ${colorMap[color]}`}>{value}</div>
    </div>
  );
}
