import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Search, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Instrument, Timeframe, OHLCV } from '../types';
import { generateOHLCV } from '../data/mockData';

interface MarketProps {
  instruments: Instrument[];
}

export default function Market({ instruments }: MarketProps) {
  const [search, setSearch] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [watchlist, setWatchlist] = useState<string[]>(['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK']);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const timeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '1D'];

  const filteredInstruments = useMemo(() =>
    instruments.filter(i => i.symbol.toLowerCase().includes(search.toLowerCase())),
    [instruments, search]
  );

  const selectedInstrument = instruments.find(i => i.symbol === selectedSymbol);
  const chartData = useMemo(() => {
    if (!selectedInstrument) return [];
    const ohlcv = generateOHLCV(selectedInstrument.ltp, timeframe === '1D' ? 90 : 30, timeframe);
    return ohlcv.map(d => ({
      time: new Date(d.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }));
  }, [selectedSymbol, timeframe, selectedInstrument]);

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]);
  };

  return (
    <div className="space-y-4">
      {/* Search and Watchlist */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Watchlist */}
        <div className="lg:w-80 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-300">Watchlist</h3>
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search symbol..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {filteredInstruments.map(inst => (
              <button
                key={inst.symbol}
                onClick={() => setSelectedSymbol(inst.symbol)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${selectedSymbol === inst.symbol ? 'bg-blue-600/20 border border-blue-600/30' : 'hover:bg-gray-800'}`}
              >
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); toggleWatchlist(inst.symbol); }} className="p-0.5">
                    <Star className={`w-3 h-3 ${watchlist.includes(inst.symbol) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                  </button>
                  <div>
                    <div className="text-xs font-medium">{inst.symbol}</div>
                    <div className="text-[10px] text-gray-500">{inst.exchange}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium">₹{inst.ltp.toLocaleString('en-IN')}</div>
                  <div className={`text-[10px] flex items-center gap-0.5 justify-end ${inst.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {inst.change >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {inst.changePercent >= 0 ? '+' : ''}{inst.changePercent}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-4">
          {selectedInstrument && (
            <>
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{selectedInstrument.symbol}</h2>
                    <span className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-400">{selectedInstrument.exchange}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xl font-bold">₹{selectedInstrument.ltp.toLocaleString('en-IN')}</span>
                    <span className={`text-sm font-medium flex items-center gap-1 ${selectedInstrument.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedInstrument.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {selectedInstrument.change >= 0 ? '+' : ''}₹{selectedInstrument.change.toFixed(2)} ({selectedInstrument.changePercent}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-gray-800 rounded-lg p-0.5">
                    {timeframes.map(tf => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-2.5 py-1 text-xs rounded-md transition-colors ${timeframe === tf ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                  <div className="flex bg-gray-800 rounded-lg p-0.5">
                    <button onClick={() => setChartType('area')} className={`px-2 py-1 text-xs rounded-md ${chartType === 'area' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Area</button>
                    <button onClick={() => setChartType('bar')} className={`px-2 py-1 text-xs rounded-md ${chartType === 'bar' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Vol</button>
                  </div>
                </div>
              </div>

              {/* OHLC Info */}
              <div className="grid grid-cols-5 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-[10px] text-gray-500">Open</div>
                  <div className="text-xs font-medium">₹{selectedInstrument.open.toLocaleString('en-IN')}</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-[10px] text-gray-500">High</div>
                  <div className="text-xs font-medium text-green-400">₹{selectedInstrument.high.toLocaleString('en-IN')}</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-[10px] text-gray-500">Low</div>
                  <div className="text-xs font-medium text-red-400">₹{selectedInstrument.low.toLocaleString('en-IN')}</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-[10px] text-gray-500">Close</div>
                  <div className="text-xs font-medium">₹{selectedInstrument.close.toLocaleString('en-IN')}</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-[10px] text-gray-500">Volume</div>
                  <div className="text-xs font-medium">{(selectedInstrument.volume / 1000000).toFixed(2)}M</div>
                </div>
              </div>

              {/* Chart */}
              <ResponsiveContainer width="100%" height={320}>
                {chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedInstrument.change >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={selectedInstrument.change >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} interval="preserveStartEnd" />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="close" stroke={selectedInstrument.change >= 0 ? '#10b981' : '#ef4444'} fill="url(#priceGradient)" strokeWidth={2} />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="volume" fill="#3b82f6" opacity={0.7} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
