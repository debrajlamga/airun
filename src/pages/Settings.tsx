import { useState } from 'react';
import { Settings as SettingsIcon, User, Key, Bell, Shield, Database, Globe, Save, AlertTriangle } from 'lucide-react';
import { TradingMode } from '../types';

interface SettingsProps {
  tradingMode: TradingMode;
  onModeChange: (mode: TradingMode) => void;
}

export default function Settings({ tradingMode, onModeChange }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [showLiveWarning, setShowLiveWarning] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'trading', label: 'Trading Mode', icon: Globe },
    { id: 'broker', label: 'Broker', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data', icon: Database },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-gray-400" />
          Settings
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Configure your trading platform preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Tabs */}
        <div className="lg:w-48 flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-5">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Display Name</label>
                  <input type="text" defaultValue="Trader" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  <input type="email" defaultValue="trader@example.com" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Default Exchange</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                    <option>NSE</option>
                    <option>BSE</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Currency</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Timezone</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                    <option>Asia/Kolkata (IST)</option>
                    <option>UTC</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Theme</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                    <option>Dark</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trading' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Trading Mode Configuration</h3>
              
              <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-400/80">
                  <strong>Important:</strong> LIVE trading uses real money and real broker APIs. Ensure you understand all risks before enabling.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${tradingMode === 'BACKTEST' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 hover:border-gray-600'}`} onClick={() => onModeChange('BACKTEST')}>
                  <div className="text-sm font-bold text-purple-400">BACKTEST</div>
                  <p className="text-xs text-gray-400 mt-1">Test strategies against historical data. No real orders.</p>
                  {tradingMode === 'BACKTEST' && <div className="text-[10px] text-purple-400 mt-2">✓ Active</div>}
                </div>
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${tradingMode === 'PAPER' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}`} onClick={() => onModeChange('PAPER')}>
                  <div className="text-sm font-bold text-blue-400">PAPER TRADING</div>
                  <p className="text-xs text-gray-400 mt-1">Simulated trading with virtual money. No real orders.</p>
                  {tradingMode === 'PAPER' && <div className="text-[10px] text-blue-400 mt-2">✓ Active</div>}
                </div>
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${tradingMode === 'LIVE' ? 'border-red-500 bg-red-500/10' : 'border-gray-700 hover:border-gray-600'}`} onClick={() => { if (tradingMode !== 'LIVE') setShowLiveWarning(true); }}>
                  <div className="text-sm font-bold text-red-400">⚠️ LIVE TRADING</div>
                  <p className="text-xs text-gray-400 mt-1">Real broker orders with real money. Requires confirmation.</p>
                  {tradingMode === 'LIVE' && <div className="text-[10px] text-red-400 mt-2">✓ Active</div>}
                </div>
              </div>

              {/* Live Warning Modal */}
              {showLiveWarning && (
                <div className="bg-red-900/30 border-2 border-red-600 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-red-400 mb-2">⚠️ Confirm LIVE Trading Activation</h4>
                  <p className="text-xs text-gray-300 mb-4">
                    You are about to enable LIVE trading. This will send real orders to your broker using real money. 
                    Ensure you have configured your broker API credentials, risk management settings, and understand all risks involved.
                  </p>
                  <div className="space-y-2 mb-4">
                    <label className="flex items-center gap-2 text-xs text-gray-300">
                      <input type="checkbox" className="rounded" /> I understand that LIVE trading involves real financial risk
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-300">
                      <input type="checkbox" className="rounded" /> I have configured risk management settings
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-300">
                      <input type="checkbox" className="rounded" /> I have tested my strategies in paper trading first
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { onModeChange('LIVE'); setShowLiveWarning(false); }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-bold">
                      Confirm: Enable LIVE Trading
                    </button>
                    <button onClick={() => setShowLiveWarning(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'broker' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Broker Configuration</h3>
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-400">Configure your broker API credentials. Credentials are encrypted and never stored in plain text.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Broker</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                    <option>Zerodha (Kite Connect)</option>
                    <option>Upstox</option>
                    <option>Angel One</option>
                    <option>ICICI Direct</option>
                    <option>5paisa</option>
                    <option>Custom / Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">API Key</label>
                  <input type="password" placeholder="Enter API key" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">API Secret</label>
                  <input type="password" placeholder="Enter API secret" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Access Token</label>
                  <input type="password" placeholder="Enter access token" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">Test Connection</button>
                <span className="text-xs text-gray-500">Not connected</span>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notification Settings</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-xs font-medium mb-3">Telegram Notifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Bot Token</label>
                      <input type="password" placeholder="Enter Telegram bot token" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Chat ID</label>
                      <input type="text" placeholder="Enter chat ID" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-xs font-medium mb-3">Email Notifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">SMTP Host</label>
                      <input type="text" placeholder="smtp.gmail.com" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">SMTP Port</label>
                      <input type="text" placeholder="587" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Username</label>
                      <input type="text" placeholder="your@email.com" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Password</label>
                      <input type="password" placeholder="App password" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Security Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-sm">Two-Factor Authentication</div>
                    <div className="text-[10px] text-gray-500">Add extra security to your account</div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">Not Enabled</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-sm">Session Timeout</div>
                    <div className="text-[10px] text-gray-500">Auto logout after inactivity</div>
                  </div>
                  <select className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-xs">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                    <option>Never</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-sm">API Rate Limiting</div>
                    <div className="text-[10px] text-gray-500">Protect against abuse</div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Enabled</span>
                </div>
                <div>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg">Change Password</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Data Management</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-xs font-medium mb-2">Database</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">PostgreSQL connected</span>
                    <span className="text-xs text-green-400">● Healthy</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-xs font-medium mb-2">Redis Cache</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Redis connected</span>
                    <span className="text-xs text-green-400">● Healthy</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">Export Data</button>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg">Import Data</button>
                  <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg border border-red-600/30">Clear Cache</button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
              <Save className="w-4 h-4" /> {saved ? 'Saved ✓' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
