import { BookOpen, Tag, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Trade } from '../types';

interface TradeJournalProps {
  trades: Trade[];
}

export default function TradeJournal({ trades }: TradeJournalProps) {
  const totalPnL = trades.reduce((sum, t) => sum + t.netPnL, 0);
  const totalFees = trades.reduce((sum, t) => sum + t.fees, 0);
  const avgHoldingTime = '1d 4h';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          Trade Journal
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Complete record of all executed trades with analysis</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500">Total Trades</div>
          <div className="text-lg font-bold">{trades.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500">Net P&L</div>
          <div className={`text-lg font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{totalPnL.toFixed(0)}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500">Total Fees</div>
          <div className="text-lg font-bold text-orange-400">₹{totalFees.toFixed(0)}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500">Win Rate</div>
          <div className="text-lg font-bold">{Math.round((trades.filter(t => t.netPnL > 0).length / trades.length) * 100)}%</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500">Avg Duration</div>
          <div className="text-lg font-bold">{avgHoldingTime}</div>
        </div>
      </div>

      {/* Trade Cards */}
      <div className="space-y-3">
        {trades.map(trade => (
          <div key={trade.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${trade.netPnL >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {trade.netPnL >= 0 ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{trade.symbol}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${trade.side === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{trade.side}</span>
                    <span className="text-xs text-gray-500">×{trade.quantity}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{trade.strategy}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${trade.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.netPnL >= 0 ? '+' : ''}₹{trade.netPnL.toFixed(2)}
                </div>
                <div className="text-[10px] text-gray-500">Gross: ₹{trade.grossPnL.toFixed(2)} | Fees: ₹{trade.fees.toFixed(2)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-800">
              <div>
                <div className="text-[10px] text-gray-500">Entry</div>
                <div className="text-xs">₹{trade.entryPrice.toFixed(2)}</div>
                <div className="text-[10px] text-gray-600">{new Date(trade.entryTime).toLocaleDateString('en-IN')}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500">Exit</div>
                <div className="text-xs">₹{trade.exitPrice.toFixed(2)}</div>
                <div className="text-[10px] text-gray-600">{new Date(trade.exitTime).toLocaleDateString('en-IN')}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500">Entry Reason</div>
                <div className="text-xs text-gray-300">{trade.entryReason}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500">Exit Reason</div>
                <div className="text-xs text-gray-300">{trade.exitReason}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Clock className="w-3 h-3" /> {trade.holdingDuration}
                </div>
                <div className="text-[10px] text-red-400">SL: ₹{trade.stopLoss.toFixed(2)}</div>
                <div className="text-[10px] text-green-400">TGT: ₹{trade.target.toFixed(2)}</div>
              </div>
              {trade.tags && (
                <div className="flex items-center gap-1">
                  {trade.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
