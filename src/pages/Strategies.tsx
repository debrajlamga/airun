import { useState } from 'react';
import { Brain, Plus, Edit, Trash2, Copy, ToggleLeft, ToggleRight, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { Strategy } from '../types';

interface StrategiesProps {
  strategies: Strategy[];
  onToggle: (id: string) => void;
}

export default function Strategies({ strategies, onToggle }: StrategiesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    name: '', type: 'EMA_CROSSOVER' as Strategy['type'], timeframe: '15m',
    symbols: '', stopLoss: 1.5, target: 3.0, trailingStop: 1.0, maxPositions: 3, positionSize: 10,
    fastEMA: 9, slowEMA: 21, rsiPeriod: 14, oversold: 30, overbought: 70,
  });

  const getTypeLabel = (type: Strategy['type']) => {
    switch (type) {
      case 'EMA_CROSSOVER': return 'EMA Crossover';
      case 'RSI': return 'RSI';
      case 'VWAP': return 'VWAP';
      case 'COMBINED': return 'Multi-Indicator';
    }
  };

  const getTypeColor = (type: Strategy['type']) => {
    switch (type) {
      case 'EMA_CROSSOVER': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'RSI': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'VWAP': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'COMBINED': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Trading Strategies</h2>
          <p className="text-xs text-gray-500 mt-0.5">Configure and manage your algorithmic trading strategies</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Strategy
        </button>
      </div>

      {/* Create Strategy Form */}
      {showCreate && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium mb-4">Create New Strategy</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Strategy Name</label>
              <input type="text" value={newStrategy.name} onChange={e => setNewStrategy(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="My Strategy" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Strategy Type</label>
              <select value={newStrategy.type} onChange={e => setNewStrategy(p => ({ ...p, type: e.target.value as Strategy['type'] }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                <option value="EMA_CROSSOVER">EMA Crossover</option>
                <option value="RSI">RSI</option>
                <option value="VWAP">VWAP</option>
                <option value="COMBINED">Combined (EMA + RSI + VWAP)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Timeframe</label>
              <select value={newStrategy.timeframe} onChange={e => setNewStrategy(p => ({ ...p, timeframe: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="30m">30 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="1D">1 Day</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Symbols (comma-separated)</label>
              <input type="text" value={newStrategy.symbols} onChange={e => setNewStrategy(p => ({ ...p, symbols: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="RELIANCE, TCS, INFY" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Stop Loss (%)</label>
              <input type="number" step="0.1" value={newStrategy.stopLoss} onChange={e => setNewStrategy(p => ({ ...p, stopLoss: parseFloat(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Target (%)</label>
              <input type="number" step="0.1" value={newStrategy.target} onChange={e => setNewStrategy(p => ({ ...p, target: parseFloat(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Trailing Stop (%)</label>
              <input type="number" step="0.1" value={newStrategy.trailingStop} onChange={e => setNewStrategy(p => ({ ...p, trailingStop: parseFloat(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Max Positions</label>
              <input type="number" value={newStrategy.maxPositions} onChange={e => setNewStrategy(p => ({ ...p, maxPositions: parseInt(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Position Size (% of capital)</label>
              <input type="number" step="0.5" value={newStrategy.positionSize} onChange={e => setNewStrategy(p => ({ ...p, positionSize: parseFloat(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Strategy-specific parameters */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h4 className="text-xs text-gray-400 mb-3">Strategy Parameters</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(newStrategy.type === 'EMA_CROSSOVER' || newStrategy.type === 'COMBINED') && (
                <>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Fast EMA</label>
                    <input type="number" value={newStrategy.fastEMA} onChange={e => setNewStrategy(p => ({ ...p, fastEMA: parseInt(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Slow EMA</label>
                    <input type="number" value={newStrategy.slowEMA} onChange={e => setNewStrategy(p => ({ ...p, slowEMA: parseInt(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </>
              )}
              {(newStrategy.type === 'RSI' || newStrategy.type === 'COMBINED') && (
                <>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">RSI Period</label>
                    <input type="number" value={newStrategy.rsiPeriod} onChange={e => setNewStrategy(p => ({ ...p, rsiPeriod: parseInt(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Oversold</label>
                    <input type="number" value={newStrategy.oversold} onChange={e => setNewStrategy(p => ({ ...p, oversold: parseInt(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Overbought</label>
                    <input type="number" value={newStrategy.overbought} onChange={e => setNewStrategy(p => ({ ...p, overbought: parseInt(e.target.value) }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">Create Strategy</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 gap-4">
        {strategies.map(strategy => (
          <div key={strategy.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {/* Strategy Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${getTypeColor(strategy.type)}`}>
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">{strategy.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getTypeColor(strategy.type)}`}>{getTypeLabel(strategy.type)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-gray-500">{strategy.symbols.join(', ')}</span>
                    <span className="text-[10px] text-gray-500">•</span>
                    <span className="text-[10px] text-gray-500">{strategy.timeframe}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onToggle(strategy.id)} className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors" title={strategy.enabled ? 'Disable' : 'Enable'}>
                  {strategy.enabled ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5 text-gray-500" />}
                </button>
                <button className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"><Copy className="w-4 h-4 text-gray-400" /></button>
                <button className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"><Edit className="w-4 h-4 text-gray-400" /></button>
                <button className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-gray-400" /></button>
                <button onClick={() => setExpandedId(expandedId === strategy.id ? null : strategy.id)} className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors">
                  {expandedId === strategy.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Performance Summary */}
            {strategy.performance && (
              <div className="px-4 pb-3 grid grid-cols-3 md:grid-cols-6 gap-3">
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-[10px] text-gray-500">Return</div>
                  <div className={`text-xs font-bold ${strategy.performance.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>{strategy.performance.totalReturn}%</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-[10px] text-gray-500">Win Rate</div>
                  <div className="text-xs font-bold">{strategy.performance.winRate}%</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-[10px] text-gray-500">Trades</div>
                  <div className="text-xs font-bold">{strategy.performance.totalTrades}</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-[10px] text-gray-500">Profit Factor</div>
                  <div className="text-xs font-bold">{strategy.performance.profitFactor}</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-[10px] text-gray-500">Max DD</div>
                  <div className="text-xs font-bold text-orange-400">{strategy.performance.maxDrawdown}%</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-[10px] text-gray-500">Sharpe</div>
                  <div className="text-xs font-bold">{strategy.performance.sharpeRatio}</div>
                </div>
              </div>
            )}

            {/* Expanded Details */}
            {expandedId === strategy.id && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs text-gray-400 mb-2">Entry Rules</h4>
                    <p className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded">{strategy.entryRules}</p>
                    <h4 className="text-xs text-gray-400 mb-2 mt-3">Exit Rules</h4>
                    <p className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded">{strategy.exitRules}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-400 mb-2">Parameters</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(strategy.parameters).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-2 bg-gray-800/50 rounded text-xs">
                          <span className="text-gray-500">{key}</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                    <h4 className="text-xs text-gray-400 mb-2 mt-3">Risk Settings</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex justify-between p-2 bg-gray-800/50 rounded text-xs">
                        <span className="text-gray-500">Stop Loss</span>
                        <span className="text-red-400">{strategy.stopLoss}%</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-800/50 rounded text-xs">
                        <span className="text-gray-500">Target</span>
                        <span className="text-green-400">{strategy.target}%</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-800/50 rounded text-xs">
                        <span className="text-gray-500">Trailing</span>
                        <span>{strategy.trailingStop}%</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-800/50 rounded text-xs">
                        <span className="text-gray-500">Max Pos</span>
                        <span>{strategy.maxPositions}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
