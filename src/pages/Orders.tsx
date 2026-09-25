import { ShoppingCart, Filter } from 'lucide-react';
import { Order } from '../types';

interface OrdersProps {
  orders: Order[];
}

export default function Orders({ orders }: OrdersProps) {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'FILLED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'OPEN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'SUBMITTED': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'CANCELLED': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'REJECTED': case 'FAILED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'PARTIALLY_FILLED': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Orders</h2>
          <p className="text-xs text-gray-500 mt-0.5">Track all order activity and lifecycle</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500">Total Orders</div>
          <div className="text-lg font-bold">{orders.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500">Filled</div>
          <div className="text-lg font-bold text-green-400">{orders.filter(o => o.status === 'FILLED').length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500">Open</div>
          <div className="text-lg font-bold text-blue-400">{orders.filter(o => ['OPEN', 'SUBMITTED'].includes(o.status)).length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500">Rejected</div>
          <div className="text-lg font-bold text-red-400">{orders.filter(o => o.status === 'REJECTED').length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500">Cancelled</div>
          <div className="text-lg font-bold text-gray-400">{orders.filter(o => o.status === 'CANCELLED').length}</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800 bg-gray-900">
                <th className="text-left py-3 px-4">Order ID</th>
                <th className="text-left py-3 px-4">Time</th>
                <th className="text-left py-3 px-4">Symbol</th>
                <th className="text-left py-3 px-4">Side</th>
                <th className="text-right py-3 px-4">Qty</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-right py-3 px-4">Price</th>
                <th className="text-right py-3 px-4">Filled</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Strategy</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-gray-400">{order.id}</td>
                  <td className="py-3 px-4 text-xs text-gray-400">{new Date(order.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="py-3 px-4 font-medium">{order.symbol}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded ${order.side === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {order.side}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">{order.quantity}</td>
                  <td className="py-3 px-4 text-xs text-gray-400">{order.orderType}</td>
                  <td className="py-3 px-4 text-right">₹{order.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-xs">{order.filledQuantity}/{order.quantity}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    {order.error && <div className="text-[10px] text-red-400 mt-0.5">{order.error}</div>}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">{order.strategyId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Lifecycle */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Order Lifecycle</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {['CREATED', 'VALIDATING', 'SUBMITTED', 'OPEN', 'PARTIALLY_FILLED', 'FILLED'].map((status, i) => (
            <div key={status} className="flex items-center gap-2">
              <div className="px-2 py-1 bg-gray-800 rounded text-[10px] text-gray-400">{status.replace('_', ' ')}</div>
              {i < 5 && <span className="text-gray-600">→</span>}
            </div>
          ))}
          <span className="text-gray-600 mx-2">|</span>
          {['CANCELLED', 'REJECTED', 'FAILED'].map(status => (
            <div key={status} className="px-2 py-1 bg-red-900/20 rounded text-[10px] text-red-400">{status}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
