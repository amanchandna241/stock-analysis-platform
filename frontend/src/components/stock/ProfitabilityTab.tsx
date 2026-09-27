'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, AlertCircle, Info } from 'lucide-react';

interface ProfitabilityProps {
  data: {
    ticker: string;
    metrics: Record<string, Array<{ year: string; value: number }>>;
    trends_5y: Record<string, number>;
    trends_10y: Record<string, number>;
    explanations: string[];
  };
}

export default function ProfitabilityTab({ data }: ProfitabilityProps) {
  const chartData = data.metrics.ebitda_margin?.map((item, idx) => ({
    year: item.year,
    gross_margin: data.metrics.gross_margin?.[idx]?.value || 0,
    ebitda_margin: item.value,
    net_margin: data.metrics.net_margin?.[idx]?.value || 0,
    roe: data.metrics.roe?.[idx]?.value || 0,
    roce: data.metrics.roce?.[idx]?.value || 0,
    roic: data.metrics.roic?.[idx]?.value || 0,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Explanations & Insight Banner */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" /> Margin & Return Trend Explanations
        </h3>
        <div className="space-y-2">
          {data.explanations.map((exp, idx) => (
            <div key={idx} className="bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638] text-xs text-gray-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{exp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Margin Trends Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-4">Gross, EBITDA & Net Margin Trends (10Y)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
                <XAxis dataKey="year" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#131822', borderColor: '#1E2638', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="gross_margin" name="Gross Margin %" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ebitda_margin" name="EBITDA Margin %" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="net_margin" name="Net Margin %" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-4">Capital Efficiency: ROE, ROCE & ROIC Trends (10Y)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
                <XAxis dataKey="year" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#131822', borderColor: '#1E2638', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="roe" name="ROE %" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="roce" name="ROCE %" stroke="#EC4899" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="roic" name="ROIC %" stroke="#06B6D4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
