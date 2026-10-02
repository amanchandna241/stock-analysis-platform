'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import {
  Cpu, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck,
  BarChart2, Activity, Zap, Layers, RefreshCw
} from 'lucide-react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

interface MLForecastTabProps {
  ticker: string;
}

export default function MLForecastTab({ ticker }: MLForecastTabProps) {
  const [horizonDays, setHorizonDays] = useState<number>(90);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchApi<any>(`/ml/forecast/${ticker}?days=${horizonDays}`)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load ML forecast:', err);
        setError('Failed to calculate ML forecast models for ' + ticker);
        setLoading(false);
      });
  }, [ticker, horizonDays]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#0E131F] rounded-2xl border border-[#1E2638] text-gray-400">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-300">Simulating 1,000 Monte Carlo Paths & Fitting Ensemble Regression Models...</p>
        <p className="text-xs text-gray-500 mt-1">Calculating Parkinson Volatility & 95% Confidence Intervals</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-[#0E131F] rounded-2xl border border-red-500/20 text-center text-red-400 text-sm">
        {error || 'No forecast data available.'}
      </div>
    );
  }

  const {
    current_price,
    currency,
    volatility_metrics,
    volatility_regime,
    monte_carlo_outcomes,
    horizons,
    model_weights,
    historical_chart,
    forecast_chart
  } = data;

  const currSymbol = currency === 'USD' ? '$' : '₹';

  // Prepare unified chart data (Historical + Forecast concatenated)
  const chartData = [
    ...historical_chart.map((pt: any) => ({
      date: pt.date,
      historical: pt.price,
      forecast: null,
      upper_95: null,
      lower_95: null,
      upper_80: null,
      lower_80: null,
    })),
    // Link point
    {
      date: historical_chart[historical_chart.length - 1]?.date || 'Today',
      historical: current_price,
      forecast: current_price,
      upper_95: current_price,
      lower_95: current_price,
      upper_80: current_price,
      lower_80: current_price,
    },
    ...forecast_chart.map((pt: any) => ({
      date: pt.date,
      historical: null,
      forecast: pt.forecast_price,
      upper_95: pt.upper_95,
      lower_95: pt.lower_95,
      upper_80: pt.upper_80,
      lower_80: pt.lower_80,
    })),
  ];

  const regimeBadgeColor =
    volatility_regime.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
    volatility_regime.color === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
    volatility_regime.color === 'red' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
    'bg-blue-500/10 text-blue-400 border-blue-500/30';

  return (
    <div className="space-y-6">
      {/* Header & Forecast Horizon Controls */}
      <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">ML Ensemble Price Forecasting & Volatility Regimes</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
              AI Quantitative Engine
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Combines 1,000-run Monte Carlo GBM simulation, dampened polynomial drift regression, and Parkinson intraday volatility analysis.
          </p>
        </div>

        {/* Horizon Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-[#131822] p-1.5 rounded-xl border border-[#1E2638]">
          {[30, 90, 180].map((days) => (
            <button
              key={days}
              onClick={() => setHorizonDays(days)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                horizonDays === days
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-[#1E2638]'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Base Case Forecast */}
        <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Base Case Target ({horizonDays}D)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {currSymbol}{monte_carlo_outcomes.base_case.price.toLocaleString()}
          </div>
          <div className={`text-xs font-bold flex items-center gap-1 ${
            monte_carlo_outcomes.base_case.return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            <span>{monte_carlo_outcomes.base_case.return_pct >= 0 ? '+' : ''}{monte_carlo_outcomes.base_case.return_pct}% Expected</span>
            <span className="text-gray-500 font-normal">from current ({currSymbol}{current_price})</span>
          </div>
        </div>

        {/* Monte Carlo Range */}
        <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Monte Carlo Bull / Bear Range</span>
            <BarChart2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-sm font-bold text-gray-200">
            <span className="text-emerald-400">{currSymbol}{monte_carlo_outcomes.bull_case.price}</span>
            <span className="text-gray-500 mx-1 border-b border-dashed border-gray-600 px-2 text-xs">to</span>
            <span className="text-red-400">{currSymbol}{monte_carlo_outcomes.bear_case.price}</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Bull (+{monte_carlo_outcomes.bull_case.return_pct}%) | Bear ({monte_carlo_outcomes.bear_case.return_pct}%)
          </div>
        </div>

        {/* Volatility Regime */}
        <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Volatility Regime</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold border ${regimeBadgeColor}`}>
            {volatility_regime.name}
          </div>
          <p className="text-[11px] text-gray-400 line-clamp-2">
            {volatility_regime.description}
          </p>
        </div>

        {/* Annualized Volatility & Parkinson Ratio */}
        <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Parkinson Volatility</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {volatility_metrics.parkinson_annualized_pct}%
          </div>
          <div className="text-[11px] text-gray-400 flex items-center justify-between">
            <span>Close Vol: {volatility_metrics.close_to_close_annualized_pct}%</span>
            <span className="text-purple-400 font-semibold">Ratio: {volatility_metrics.parkinson_ratio}x</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Forecast Chart */}
      <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#1E2638] pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Multi-Horizon Forecast Trajectory & Confidence Channels
            </h3>
            <p className="text-xs text-gray-400">Shaded area represents 95% Monte Carlo confidence interval bounds.</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-blue-500" />
              <span className="text-gray-300">Historical Price</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-emerald-400 border-dashed border-t" />
              <span className="text-gray-300">ML Forecast</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-500/20 border border-blue-500/30 rounded" />
              <span className="text-gray-400">95% Confidence Band</span>
            </div>
          </div>
        </div>

        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" vertical={false} />
              <XAxis dataKey="date" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 10 }} minTickGap={30} />
              <YAxis domain={['auto', 'auto']} stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={(v) => `${currSymbol}${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#131822', borderColor: '#1E2638', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any, name: string) => [
                  val ? `${currSymbol}${val.toLocaleString()}` : '-',
                  name === 'historical' ? 'Historical Close' :
                  name === 'forecast' ? 'ML Ensemble Forecast' :
                  name === 'upper_95' ? 'Upper 95% Band' :
                  name === 'lower_95' ? 'Lower 95% Band' : name
                ]}
              />
              {/* Confidence Band Area */}
              <Area type="monotone" dataKey="upper_95" stroke="none" fill="#3B82F6" fillOpacity={0.15} />
              <Area type="monotone" dataKey="lower_95" stroke="none" fill="#0E131F" fillOpacity={1} />
              
              {/* Forecast Line */}
              <Line type="monotone" dataKey="forecast" stroke="#10B981" strokeWidth={2.5} strokeDasharray="4 4" dot={false} name="forecast" />
              
              {/* Historical Line */}
              <Line type="monotone" dataKey="historical" stroke="#3B82F6" strokeWidth={2} dot={false} name="historical" />
              <ReferenceLine y={current_price} stroke="#6B7280" strokeDasharray="2 2" label={{ value: 'Current', fill: '#9CA3AF', fontSize: 10 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Target Horizons & Model Ensemble Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Horizon Breakdowns */}
        <div className="lg:col-span-2 bg-[#0E131F] border border-[#1E2638] rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider text-gray-400">
            Multi-Horizon Target Price Summary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: '30-Day Target', data: horizons.target_30d },
              { label: '90-Day Target', data: horizons.target_90d },
              { label: '180-Day Target', data: horizons.target_180d },
            ].map((h, idx) => {
              if (!h.data) return null;
              const retPct = roundTwo(((h.data.forecast_price - current_price) / current_price) * 100);
              return (
                <div key={idx} className="bg-[#131822] border border-[#1E2638] rounded-xl p-4 space-y-2">
                  <span className="text-[11px] text-gray-400 font-semibold">{h.label}</span>
                  <div className="text-xl font-extrabold text-white">
                    {currSymbol}{h.data.forecast_price.toLocaleString()}
                  </div>
                  <div className={`text-xs font-bold ${retPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {retPct >= 0 ? '+' : ''}{retPct}% return
                  </div>
                  <div className="text-[10px] text-gray-500 pt-2 border-t border-[#1E2638]/60 space-y-0.5">
                    <div>95% Upper: {currSymbol}{h.data.upper_95}</div>
                    <div>95% Lower: {currSymbol}{h.data.lower_95}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Model Ensemble Composition */}
        <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            Ensemble Model Weights
          </h4>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-gray-300 font-medium mb-1">
                <span>Monte Carlo GBM Median</span>
                <span className="font-bold text-blue-400">{model_weights.monte_carlo_median}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#131822] rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${model_weights.monte_carlo_median}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 font-medium mb-1">
                <span>Dampened Polynomial Trend</span>
                <span className="font-bold text-emerald-400">{model_weights.dampened_polynomial_trend}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#131822] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${model_weights.dampened_polynomial_trend}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 font-medium mb-1">
                <span>GBM Constant Drift Model</span>
                <span className="font-bold text-purple-400">{model_weights.gbm_constant_drift}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#131822] rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${model_weights.gbm_constant_drift}%` }} />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 pt-2 border-t border-[#1E2638]">
            Models are automatically re-calibrated on live exchange daily tick updates.
          </p>
        </div>
      </div>
    </div>
  );
}

function roundTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
