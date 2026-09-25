import { useEffect, useState } from 'react';
import { db } from './services/database';
import { Strategy } from './types';

function App() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load strategies from database
    const loadStrategies = () => {
      const data = db.getStrategies();
      setStrategies(data);
      setLoading(false);
    };

    loadStrategies();
  }, []);

  const toggleStrategy = (id: string) => {
    db.toggleStrategy(id);
    setStrategies(db.getStrategies());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Trading Bot</h1>
          <p className="text-gray-400">Trading Strategies Dashboard</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Active Strategies ({strategies.filter(s => s.enabled).length})</h2>
          <div className="space-y-4">
            {strategies.map(strategy => (
              <div key={strategy.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium">{strategy.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      strategy.enabled ? 'bg-green-600' : 'bg-gray-600'
                    }`}>
                      {strategy.enabled ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleStrategy(strategy.id)}
                    className={`px-4 py-2 rounded ${
                      strategy.enabled 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {strategy.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="ml-2">{strategy.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Timeframe:</span>
                    <span className="ml-2">{strategy.timeframe}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Symbols:</span>
                    <span className="ml-2">{strategy.symbols.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Max Positions:</span>
                    <span className="ml-2">{strategy.maxPositions}</span>
                  </div>
                </div>

                {strategy.performance && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Return:</span>
                        <span className={`ml-2 ${strategy.performance.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {strategy.performance.totalReturn}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Win Rate:</span>
                        <span className="ml-2">{strategy.performance.winRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Trades:</span>
                        <span className="ml-2">{strategy.performance.totalTrades}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Profit Factor:</span>
                        <span className="ml-2">{strategy.performance.profitFactor}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Max DD:</span>
                        <span className="ml-2 text-red-400">{strategy.performance.maxDrawdown}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Sharpe:</span>
                        <span className="ml-2">{strategy.performance.sharpeRatio}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-400">
                  <div><strong>Entry:</strong> {strategy.entryRules}</div>
                  <div><strong>Exit:</strong> {strategy.exitRules}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Database Info</h2>
          <div className="text-sm text-gray-400 space-y-2">
            <div>Total Strategies: {strategies.length}</div>
            <div>Active Strategies: {strategies.filter(s => s.enabled).length}</div>
            <div>Database Status: ✅ Initialized</div>
            <div>Storage: LocalStorage</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
