'use client';

import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { Activity, ShieldCheck, TrendingUp, Info } from 'lucide-react';

interface TechTabProps {
  data: {
    ticker: string;
    current_price: number;
    indicators: {
      sma_20: number;
      sma_50: number;
      sma_100: number;
      sma_200: number;
      ema_20: number;
      ema_50: number;
      rsi_14: number;
      macd_val: number;
      macd_signal: number;
      macd_hist: number;
      bollinger_upper: number;
      bollinger_middle: number;
      bollinger_lower: number;
      atr_14: number;
      volume_ma_20: number;
    };
    patterns: Array<{
      name: string;
      type: string;
      description: string;
    }>;
    chart_data: any[];
    metrics: Record<string, number>;
    currency?: string;
  };
}

export default function TechnicalAnalysisTab({ data }: TechTabProps) {
  const [timeframe, setTimeframe] = useState<string>('1Y');
  const [showNifty, setShowNifty] = useState<boolean>(true);
  const [showSMA, setShowSMA] = useState<boolean>(true);

  const isUSD = data.currency === 'USD';
  const symbol = isUSD ? '$' : '₹';

  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y', 'MAX'];

  return (
    <div className="space-y-8">
      {/* Risk Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <div className="bg-[#131822] p-4 rounded-xl border border-[#1E2638]">
          <span className="text-xs text-gray-400">1Y Absolute Return</span>
          <div className={`text-xl font-bold ${data.metrics.absolute_return_1y >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.metrics.absolute_return_1y > 0 ? `+${data.metrics.absolute_return_1y}%` : `${data.metrics.absolute_return_1y}%`}
          </div>
        </div>

        <div className="bg-[#131822] p-4 rounded-xl border border-[#1E2638]">
          <span className="text-xs text-gray-400">Relative vs Nifty 50</span>
          <div className={`text-xl font-bold ${data.metrics.relative_return_vs_nifty_1y >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {data.metrics.relative_return_vs_nifty_1y > 0 ? `+${data.metrics.relative_return_vs_nifty_1y}%` : `${data.metrics.relative_return_vs_nifty_1y}%`}
          </div>
        </div>

        <div className="bg-[#131822] p-4 rounded-xl border border-[#1E2638]">
          <span className="text-xs text-gray-400">Annualized Volatility</span>
          <div className="text-xl font-bold text-white">{data.metrics.annualized_volatility}%</div>
        </div>

        <div className="bg-[#131822] p-4 rounded-xl border border-[#1E2638]">
          <span className="text-xs text-gray-400">Max Drawdown (1Y)</span>
          <div className="text-xl font-bold text-red-400">{data.metrics.max_drawdown_1y}%</div>
        </div>

        <div className="bg-[#131822] p-4 rounded-xl border border-[#1E2638]">
          <span className="text-xs text-gray-400">Sharpe Ratio (Rf=6.5%)</span>
          <div className="text-xl font-bold text-blue-400">{data.metrics.sharpe_ratio}</div>
        </div>
      </div>

      {/* Interactive Price Chart with Overlays */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Interactive Price Action & Technical Trend Chart</h3>
            <p className="text-xs text-gray-400">Factual technical price observations with NIFTY 50 benchmark comparison overlay.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#0B0E14] p-1 rounded-xl border border-[#1E2638]">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                    timeframe === tf ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowNifty(!showNifty)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                showNifty ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 'bg-[#0B0E14] text-gray-400 border-[#1E2638]'
              }`}
            >
              Overlay Nifty 50
            </button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chart_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
              <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 10 }} interval={30} />
              <YAxis yAxisId="price" stroke="#9CA3AF" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              {showNifty && <YAxis yAxisId="nifty" orientation="right" stroke="#10B981" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />}
              <Tooltip contentStyle={{ backgroundColor: '#131822', borderColor: '#1E2638', color: '#fff' }} />
              <Legend />
              <Line yAxisId="price" type="monotone" dataKey="close" name={`${data.ticker} Close (${symbol})`} stroke="#3B82F6" strokeWidth={2} dot={false} />
              {showSMA && <Line yAxisId="price" type="monotone" dataKey="sma_50" name="SMA 50" stroke="#F59E0B" strokeWidth={1.5} dot={false} />}
              {showSMA && <Line yAxisId="price" type="monotone" dataKey="sma_200" name="SMA 200" stroke="#8B5CF6" strokeWidth={1.5} dot={false} />}
              {showNifty && <Line yAxisId="nifty" type="monotone" dataKey="nifty50_close" name="Nifty 50 Index" stroke="#10B981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Technical Indicators & Observable Patterns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Indicators Table */}
        <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-4">Core Indicator Calculations</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638] flex justify-between">
              <span className="text-gray-400">SMA 20 / 50</span>
              <span className="font-mono text-white">{symbol}{data.indicators.sma_20} / {symbol}{data.indicators.sma_50}</span>
            </div>
            <div className="bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638] flex justify-between">
              <span className="text-gray-400">SMA 100 / 200</span>
              <span className="font-mono text-white">{symbol}{data.indicators.sma_100} / {symbol}{data.indicators.sma_200}</span>
            </div>
            <div className="bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638] flex justify-between">
              <span className="text-gray-400">EMA 20 / 50</span>
              <span className="font-mono text-white">{symbol}{data.indicators.ema_20} / {symbol}{data.indicators.ema_50}</span>
            </div>
            <div className="bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638] flex justify-between">
              <span className="text-gray-400">RSI (14-Period)</span>
              <span className={`font-mono font-bold ${data.indicators.rsi_14 > 70 ? 'text-amber-400' : data.indicators.rsi_14 < 30 ? 'text-green-400' : 'text-blue-400'}`}>
                {data.indicators.rsi_14}
              </span>
            </div>
            <div className="bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638] flex justify-between">
              <span className="text-gray-400">MACD (12, 26, 9)</span>
              <span className="font-mono text-white">{data.indicators.macd_val} (Hist: {data.indicators.macd_hist})</span>
            </div>
            <div className="bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638] flex justify-between">
              <span className="text-gray-400">Bollinger Upper/Lower</span>
              <span className="font-mono text-white">{symbol}{data.indicators.bollinger_upper} / {symbol}{data.indicators.bollinger_lower}</span>
            </div>
          </div>
        </div>

        {/* Observable Patterns */}
        <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-4">Identified Technical Conditions (Non-Recommendation)</h4>
          <div className="space-y-3">
            {data.patterns.map((pat, idx) => (
              <div key={idx} className="bg-[#0B0E14] p-3.5 rounded-xl border border-[#1E2638] text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${pat.type === 'Bullish' ? 'bg-green-400' : pat.type === 'Bearish' ? 'bg-red-400' : 'bg-amber-400'}`} />
                  <span className="font-bold text-white">{pat.name}</span>
                </div>
                <p className="text-gray-400 leading-relaxed">{pat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
