import { Bell, Signal, ShoppingCart, ShieldAlert, AlertTriangle, Check, CheckCheck, Info } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

export default function Notifications({ notifications, onMarkRead }: NotificationsProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'signal': return <Signal className="w-4 h-4" />;
      case 'order': return <ShoppingCart className="w-4 h-4" />;
      case 'risk': return <ShieldAlert className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: Notification['severity']) => {
    switch (severity) {
      case 'success': return 'border-green-500/30 bg-green-500/5';
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'error': return 'border-red-500/30 bg-red-500/5';
      default: return 'border-gray-700 bg-gray-800/30';
    }
  };

  const getIconColor = (severity: Notification['severity']) => {
    switch (severity) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Notifications
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {notifications.map(notif => (
          <div
            key={notif.id}
            onClick={() => !notif.read && onMarkRead(notif.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${getSeverityColor(notif.severity)} ${!notif.read ? 'ring-1 ring-blue-500/20' : 'opacity-70'}`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${notif.severity === 'error' ? 'bg-red-500/20' : notif.severity === 'warning' ? 'bg-yellow-500/20' : notif.severity === 'success' ? 'bg-green-500/20' : 'bg-blue-500/20'} ${getIconColor(notif.severity)}`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium">{notif.title}</h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-gray-500">{formatTime(notif.timestamp)}</span>
                    {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{notif.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-500 capitalize">{notif.type}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                    notif.severity === 'error' ? 'bg-red-500/20 text-red-400' :
                    notif.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    notif.severity === 'success' ? 'bg-green-500/20 text-green-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>{notif.severity}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notification Types Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Notification Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
            <Signal className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-gray-400">Trading Signals</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
            <ShoppingCart className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-gray-400">Order Updates</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs text-gray-400">Risk Alerts</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-gray-400">System Errors</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
            <Info className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-gray-400">System Events</span>
          </div>
        </div>
      </div>
    </div>
  );
}
