'use client';

import React, { useState } from 'react';
import { Building2, Clock, ArrowUpRight, ArrowDownRight, Tag, LineChart as ChartIcon } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

interface StockHeaderProps {
  overview: {
    ticker: string;
    bse_code?: string;
    exchange?: string;
    name: string;
    sector: string;
    industry: string;
    current_price: number;
    change_amount: number;
    change_percent: number;
    market_cap_cr: number;
    last_updated: string;
    business_summary: string;
    key_products: string[];
    currency?: string;
  };
  chartData?: Array<{
    date: string;
    close: number;
    open?: number;
    high?: number;
    low?: number;
    volume?: number;
  }>;
}

export default function StockHeader({ overview, chartData }: StockHeaderProps) {
  const [timeframe, setTimeframe] = useState<string>('1Y');

  const isPositive = overview.change_percent >= 0;
  const isUSD = overview.currency === 'USD';
  const symbol = isUSD ? '$' : '₹';
  const locale = isUSD ? 'en-US' : 'en-IN';
  const capUnit = isUSD ? 'M' : 'Cr';

  const timeframes = ['1D', '3D', '5D', '1M', '6M', '1Y', '3Y', '5Y', 'ALL'];

  const getFilteredChartData = () => {
    if (!chartData || chartData.length === 0) return [];
    switch (timeframe) {
      case '1D': return chartData.slice(-5);
      case '3D': return chartData.slice(-15);
      case '5D': return chartData.slice(-25);
      case '1M': return chartData.slice(-30);
      case '6M': return chartData.slice(-120);
      case '1Y': return chartData.slice(-250);
      case '3Y': return chartData.slice(-750);
      case '5Y': return chartData.slice(-1250);
      case 'ALL':
      default:
        return chartData;
    }
  };

  const filteredData = getFilteredChartData();
  const xAxisInterval = Math.max(0, Math.floor(filteredData.length / 7));

  // Determine trajectory color
  const startPrice = filteredData.length > 0 ? filteredData[0].close : overview.current_price;
  const endPrice = filteredData.length > 0 ? filteredData[filteredData.length - 1].close : overview.current_price;
  const isChartPositive = endPrice >= startPrice;
  const strokeColor = isChartPositive ? '#10B981' : '#EF4444';
  const gradientId = `stockGradient_${overview.ticker}_${isChartPositive ? 'pos' : 'neg'}`;

  return (
    <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 mb-6 shadow-xl">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#1E2638]">
        {/* Left Section: Company Info */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-3xl font-black text-white tracking-tight">{overview.ticker}</span>
            <span className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg font-mono font-bold">
              NSE: {overview.ticker}
            </span>
            {overview.bse_code && (
              <span className="text-xs bg-[#1E2638] text-gray-300 px-2.5 py-1 rounded-lg font-mono">
                BSE: {overview.bse_code}
              </span>
            )}
            <span className="text-xs bg-blue-950/60 text-blue-400 border border-blue-800/50 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {overview.sector}
            </span>
          </div>

          <h1 className="text-xl font-bold text-gray-200 mb-1">{overview.name}</h1>
          <p className="text-xs text-gray-400 mb-3">{overview.industry}</p>

          <p className="text-xs text-gray-300 max-w-3xl leading-relaxed mb-3">
            {overview.business_summary}
          </p>

          {/* Key products */}
          {overview.key_products && overview.key_products.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium mr-1">Key Offerings:</span>
              {overview.key_products.map((prod, idx) => (
                <span key={idx} className="text-xs bg-[#1E2638]/70 text-gray-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5 text-blue-400" /> {prod}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Price & Market Cap Card */}
        <div className="lg:text-right shrink-0 bg-[#0B0E14] p-5 rounded-2xl border border-[#1E2638] shadow-inner min-w-[240px]">
          <div className="text-xs text-gray-400 mb-1 flex items-center lg:justify-end gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-500" /> {overview.last_updated}
          </div>

          <div className="flex items-baseline lg:justify-end gap-2 mb-1">
            <span className="text-3xl font-black text-white">
              {symbol}{overview.current_price.toLocaleString(locale)}
            </span>
            <div className={`flex items-center text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {overview.change_amount > 0 ? `+${overview.change_amount}` : overview.change_amount} ({overview.change_percent}%)
            </div>
          </div>

          <div className="text-xs text-gray-400 flex items-center lg:justify-end gap-4 mt-2 pt-2 border-t border-[#1E2638]">
            <div>
              <span className="text-gray-500">Market Cap:</span>{' '}
              <span className="font-bold text-white">
                {symbol}{overview.market_cap_cr.toLocaleString(locale)} {capUnit}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Interactive Price Chart Section */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <ChartIcon className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              <span className="text-blue-400 mr-1.5 font-mono">[{overview.ticker}]</span>
              Interactive Price Chart & Trajectory
            </h3>
            <span className="text-[11px] text-gray-400 font-mono">({timeframe})</span>
          </div>

          {/* Timeframe selector pills */}
          <div className="flex flex-wrap items-center gap-1 bg-[#0B0E14] p-1 rounded-xl border border-[#1E2638]">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-[#1E2638]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {filteredData.length > 0 ? (
          <div className="h-64 w-full bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  tick={{ fontSize: 10 }}
                  interval={xAxisInterval}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6B7280"
                  tick={{ fontSize: 10 }}
                  domain={['auto', 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${symbol}${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131822',
                    borderColor: '#1E2638',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  formatter={(value: any) => [`${symbol}${Number(value).toLocaleString(locale)}`, 'Close Price']}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={strokeColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={`url(#${gradientId})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center bg-[#0B0E14] rounded-xl border border-[#1E2638] text-xs text-gray-500">
            No chart price series data available for timeframe {timeframe}.
          </div>
        )}
      </div>
    </div>
  );
}

