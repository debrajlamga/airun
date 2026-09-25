import { useState } from 'react';
import { ShieldAlert, AlertTriangle, Save, Lock, Unlock } from 'lucide-react';
import { RiskSettings } from '../types';

interface RiskProps {
  settings: RiskSettings;
  onUpdate: (settings: Partial<RiskSettings>) => void;
  emergencyStop: () => void;
  resumeFromEmergency: () => void;
}

export default function Risk({ settings, onUpdate, emergencyStop, resumeFromEmergency }: RiskProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdate(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (key: keyof RiskSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-400" />
            Risk Management
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Configure risk limits and safety parameters. All orders are validated against these rules.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          <Save className="w-4 h-4" /> {saved ? 'Saved ✓' : 'Save Settings'}
        </button>
      </div>

      {/* Emergency Kill Switch */}
      <div className={`rounded-xl p-5 border-2 ${settings.emergencyKillSwitch ? 'bg-red-900/20 border-red-600' : 'bg-gray-900 border-gray-800'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${settings.emergencyKillSwitch ? 'bg-red-600 animate-pulse' : 'bg-gray-800'}`}>
              {settings.emergencyKillSwitch ? <Lock className="w-6 h-6 text-white" /> : <Unlock className="w-6 h-6 text-gray-400" />}
            </div>
            <div>
              <h3 className="text-sm font-bold">Emergency Kill Switch</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {settings.emergencyKillSwitch
                  ? '⚠️ ACTIVE: All trading is halted. No new orders will be placed.'
                  : 'When activated, stops all trading immediately. Cancels open orders and prevents new signals.'}
              </p>
            </div>
          </div>
          <div>
            {settings.emergencyKillSwitch ? (
              <button onClick={resumeFromEmergency} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg">
                Deactivate Kill Switch
              </button>
            ) : (
              <button onClick={emergencyStop} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> ACTIVATE
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Risk Parameters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-medium mb-4">Risk Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Max Risk Per Trade (%)</label>
            <input type="number" step="0.5" value={localSettings.maxRiskPerTrade} onChange={e => updateField('maxRiskPerTrade', parseFloat(e.target.value))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            <p className="text-[10px] text-gray-600 mt-1">Maximum loss allowed per single trade</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Max Daily Loss (%)</label>
            <input type="number" step="0.5" value={localSettings.maxDailyLoss} onChange={e => updateField('maxDailyLoss', parseFloat(e.target.value))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            <p className="text-[10px] text-gray-600 mt-1">Trading stops if daily loss exceeds this</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Max Total Exposure (%)</label>
            <input type="number" step="5" value={localSettings.maxTotalExposure} onChange={e => updateField('maxTotalExposure', parseFloat(e.target.value))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            <p className="text-[10px] text-gray-600 mt-1">Maximum percentage of capital deployed</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Max Position Size (%)</label>
            <input type="number" step="1" value={localSettings.maxPositionSize} onChange={e => updateField('maxPositionSize', parseFloat(e.target.value))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            <p className="text-[10px] text-gray-600 mt-1">Maximum single position as % of capital</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Max Open Positions</label>
            <input type="number" value={localSettings.maxOpenPositions} onChange={e => updateField('maxOpenPositions', parseInt(e.target.value))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            <p className="text-[10px] text-gray-600 mt-1">Maximum number of simultaneous positions</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Max Orders Per Minute</label>
            <input type="number" value={localSettings.maxOrdersPerMinute} onChange={e => updateField('maxOrdersPerMinute', parseInt(e.target.value))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            <p className="text-[10px] text-gray-600 mt-1">Rate limit for order submissions</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Max Consecutive Losses</label>
            <input type="number" value={localSettings.maxConsecutiveLosses} onChange={e => updateField('maxConsecutiveLosses', parseInt(e.target.value))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            <p className="text-[10px] text-gray-600 mt-1">Stop trading after N consecutive losing trades</p>
          </div>
        </div>
      </div>

      {/* Safety Rules */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-medium mb-4">Safety Rules</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div>
              <div className="text-sm">Require Stop-Loss on All Orders</div>
              <div className="text-[10px] text-gray-500">Every order must have a valid stop-loss</div>
            </div>
            <button onClick={() => updateField('requireStopLoss', !localSettings.requireStopLoss)} className={`w-12 h-6 rounded-full transition-colors ${localSettings.requireStopLoss ? 'bg-green-600' : 'bg-gray-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${localSettings.requireStopLoss ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div>
              <div className="text-sm">Daily Trading Lock</div>
              <div className="text-[10px] text-gray-500">Lock all trading after daily loss limit is hit</div>
            </div>
            <button onClick={() => updateField('dailyTradingLock', !localSettings.dailyTradingLock)} className={`w-12 h-6 rounded-full transition-colors ${localSettings.dailyTradingLock ? 'bg-green-600' : 'bg-gray-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${localSettings.dailyTradingLock ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Position Sizing Formula */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-medium mb-4">Position Sizing Formula</h3>
        <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-xs text-gray-300 space-y-2">
          <p><span className="text-blue-400">Risk Amount</span> = Account Equity × Risk %</p>
          <p><span className="text-green-400">Position Size</span> = Risk Amount / Stop Loss Distance</p>
          <p className="text-gray-500 pt-2 border-t border-gray-700">Example: ₹5,00,000 × 2% = ₹10,000 risk</p>
          <p className="text-gray-500">If SL distance = ₹50, Position = ₹10,000 / ₹50 = 200 shares</p>
        </div>
      </div>

      {/* Current Risk Status */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-medium mb-4">Current Risk Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="text-[10px] text-gray-500">Daily Loss Used</div>
            <div className="text-sm font-bold text-yellow-400">84%</div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '84%' }} />
            </div>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="text-[10px] text-gray-500">Exposure Used</div>
            <div className="text-sm font-bold text-blue-400">42%</div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }} />
            </div>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="text-[10px] text-gray-500">Positions Used</div>
            <div className="text-sm font-bold text-green-400">4/5</div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '80%' }} />
            </div>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="text-[10px] text-gray-500">Consecutive Losses</div>
            <div className="text-sm font-bold text-green-400">0/3</div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '0%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
