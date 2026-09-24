import { Target, TrendingUp, TrendingDown } from 'lucide-react';
import { Position } from '../types';

interface PositionsProps {
  positions: Position[];
}

export default function Positions({ positions }: PositionsProps) {
  const totalUnrealized = positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);
  const totalInvested = positions.reduce((sum, p) => sum + p.averagePrice * p.quantity, 0);
  const totalCurrentValue = positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Open Positions</h2>
          <p className="text-xs text-gray-500 mt-0.5">Monitor active positions and unrealized P&L</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Open Positions</div>
          <div className="text-2xl font-bold mt-1">{positions.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Total Invested</div>
          <div className="text-2xl font-bold mt-1">₹{(totalInvested / 1000).toFixed(1)}K</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Current Value</div>
          <div className="text-2xl font-bold mt-1">₹{(totalCurrentValue / 1000).toFixed(1)}K</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Unrealized P&L</div>
          <div className={`text-2xl font-bold mt-1 ${totalUnrealized >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalUnrealized >= 0 ? '+' : ''}₹{totalUnrealized.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800">
                <th className="text-left py-3 px-4">Symbol</th>
                <th className="text-left py-3 px-4">Side</th>
                <th className="text-right py-3 px-4">Quantity</th>
                <th className="text-right py-3 px-4">Avg Price</th>
                <th className="text-right py-3 px-4">Current</th>
                <th className="text-right py-3 px-4">Invested</th>
                <th className="text-right py-3 px-4">Current Value</th>
                <th className="text-right py-3 px-4">P&L</th>
                <th className="text-right py-3 px-4">P&L %</th>
                <th className="text-right py-3 px-4">Stop Loss</th>
                <th className="text-right py-3 px-4">Target</th>
                <th className="text-left py-3 px-4">Duration</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(pos => {
                const invested = pos.averagePrice * pos.quantity;
                const currentValue = pos.currentPrice * pos.quantity;
                const pnlPercent = ((pos.currentPrice - pos.averagePrice) / pos.averagePrice) * 100 * (pos.side === 'BUY' ? 1 : -1);
                const duration = Math.floor((Date.now() - pos.entryTime) / 3600000);
                const durationStr = duration > 24 ? `${Math.floor(duration / 24)}d ${duration % 24}h` : `${duration}h`;

                return (
                  <tr key={pos.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium">{pos.symbol}</div>
                      <div className="text-[10px] text-gray-500">{pos.exchange}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded ${pos.side === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {pos.side}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{pos.quantity}</td>
                    <td className="py-3 px-4 text-right">₹{pos.averagePrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-medium">₹{pos.currentPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-gray-400">₹{invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="py-3 px-4 text-right">₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className={`py-3 px-4 text-right font-bold ${pos.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {pos.unrealizedPnL >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {pos.unrealizedPnL >= 0 ? '+' : ''}₹{pos.unrealizedPnL.toFixed(2)}
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right text-red-400 text-xs">₹{pos.stopLoss.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-green-400 text-xs">₹{pos.target.toFixed(2)}</td>
                    <td className="py-3 px-4 text-xs text-gray-400">{durationStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk per Position */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Position Risk Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {positions.map(pos => {
            const riskToStop = ((pos.averagePrice - pos.stopLoss) / pos.averagePrice) * 100;
            const rewardToTarget = ((pos.target - pos.averagePrice) / pos.averagePrice) * 100;
            const rrRatio = rewardToTarget / riskToStop;

            return (
              <div key={pos.id} className="p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{pos.symbol}</span>
                  <span className={`text-xs ${rrRatio >= 2 ? 'text-green-400' : 'text-orange-400'}`}>R:R = 1:{rrRatio.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" style={{ width: `${Math.min(100, (rrRatio / 4) * 100)}%` }} />
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-red-400">SL: ₹{pos.stopLoss.toFixed(2)} (-{riskToStop.toFixed(1)}%)</span>
                  <span className="text-[10px] text-green-400">TGT: ₹{pos.target.toFixed(2)} (+{rewardToTarget.toFixed(1)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
