import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { Position } from '../types';

interface PortfolioProps {
  positions: Position[];
  portfolioValue: number;
  cash: number;
  investedCapital: number;
  unrealizedPnL: number;
  totalPnL: number;
}

export default function Portfolio({ positions, portfolioValue, cash, investedCapital, unrealizedPnL, totalPnL }: PortfolioProps) {
  const allocationData = positions.map(p => ({
    name: p.symbol,
    value: Math.round(p.averagePrice * p.quantity),
    pnl: p.unrealizedPnL,
  }));
  allocationData.push({ name: 'Cash', value: Math.round(cash), pnl: 0 });

  const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#6b7280'];

  // Portfolio history
  const historyData = [];
  let val = 500000;
  for (let i = 90; i >= 0; i--) {
    val += (Math.random() - 0.45) * 2500;
    historyData.push({
      date: new Date(Date.now() - i * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      value: Math.round(val),
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Portfolio</h2>
        <p className="text-xs text-gray-500 mt-0.5">Complete portfolio overview and allocation</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Total Value</div>
          <div className="text-xl font-bold mt-1">₹{(portfolioValue / 100000).toFixed(2)}L</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Cash</div>
          <div className="text-xl font-bold mt-1 text-blue-400">₹{(cash / 1000).toFixed(1)}K</div>
          <div className="text-[10px] text-gray-500">{((cash / portfolioValue) * 100).toFixed(1)}% of portfolio</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Invested</div>
          <div className="text-xl font-bold mt-1">₹{(investedCapital / 1000).toFixed(1)}K</div>
          <div className="text-[10px] text-gray-500">{((investedCapital / portfolioValue) * 100).toFixed(1)}% of portfolio</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Unrealized P&L</div>
          <div className={`text-xl font-bold mt-1 ${unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {unrealizedPnL >= 0 ? '+' : ''}₹{unrealizedPnL.toFixed(0)}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Realized P&L</div>
          <div className={`text-xl font-bold mt-1 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}₹{(totalPnL / 1000).toFixed(1)}K
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Allocation Pie */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4" /> Allocation
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={allocationData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {allocationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }} formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio History */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Portfolio Value History</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }} formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']} />
              <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#portGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Holdings Detail */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Holdings Detail</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800">
                <th className="text-left py-2 px-3">Symbol</th>
                <th className="text-right py-2 px-3">Quantity</th>
                <th className="text-right py-2 px-3">Avg Price</th>
                <th className="text-right py-2 px-3">Current</th>
                <th className="text-right py-2 px-3">Value</th>
                <th className="text-right py-2 px-3">Allocation</th>
                <th className="text-right py-2 px-3">P&L</th>
                <th className="text-right py-2 px-3">P&L %</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(pos => {
                const value = pos.currentPrice * pos.quantity;
                const allocation = (value / portfolioValue) * 100;
                const pnlPercent = ((pos.currentPrice - pos.averagePrice) / pos.averagePrice) * 100;
                return (
                  <tr key={pos.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2.5 px-3 font-medium">{pos.symbol}</td>
                    <td className="py-2.5 px-3 text-right">{pos.quantity}</td>
                    <td className="py-2.5 px-3 text-right">₹{pos.averagePrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right">₹{pos.currentPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right">₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${allocation}%` }} />
                        </div>
                        <span className="text-xs">{allocation.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className={`py-2.5 px-3 text-right font-medium ${pos.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pos.unrealizedPnL >= 0 ? '+' : ''}₹{pos.unrealizedPnL.toFixed(2)}
                    </td>
                    <td className={`py-2.5 px-3 text-right ${pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
              {/* Cash row */}
              <tr className="border-b border-gray-800/50 bg-gray-800/20">
                <td className="py-2.5 px-3 font-medium text-gray-400">Cash</td>
                <td className="py-2.5 px-3 text-right text-gray-400">—</td>
                <td className="py-2.5 px-3 text-right text-gray-400">—</td>
                <td className="py-2.5 px-3 text-right text-gray-400">—</td>
                <td className="py-2.5 px-3 text-right">₹{cash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                <td className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-500 rounded-full" style={{ width: `${(cash / portfolioValue) * 100}%` }} />
                    </div>
                    <span className="text-xs">{((cash / portfolioValue) * 100).toFixed(1)}%</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right text-gray-400">—</td>
                <td className="py-2.5 px-3 text-right text-gray-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
