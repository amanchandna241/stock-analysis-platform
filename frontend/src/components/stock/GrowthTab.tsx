'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface GrowthTabProps {
  data: {
    ticker: string;
    table: Array<{
      metric: string;
      cagr_3y: number;
      cagr_5y: number;
      cagr_10y: number;
    }>;
    cagr_chart_data: any[];
    currency?: string;
  };
}

export default function GrowthTab({ data }: GrowthTabProps) {
  const isUSD = data.currency === 'USD';
  const unitLabel = isUSD ? '$ Millions' : '₹ Cr';

  return (
    <div className="space-y-6">
      {/* CAGR Table */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Compounded Annual Growth Rate (CAGR) Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E2638] text-gray-400">
                <th className="py-3 px-4 font-semibold text-gray-300">Financial Growth Metric</th>
                <th className="py-3 px-4 font-semibold text-right">3-Year CAGR</th>
                <th className="py-3 px-4 font-semibold text-right">5-Year CAGR</th>
                <th className="py-3 px-4 font-semibold text-right">10-Year CAGR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/50 text-gray-300">
              {data.table.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#1E2638]/40">
                  <td className="py-3 px-4 font-semibold text-white">{row.metric}</td>
                  <td className={`py-3 px-4 text-right font-mono font-bold ${row.cagr_3y > 12 ? 'text-green-400' : 'text-gray-300'}`}>
                    {row.cagr_3y}%
                  </td>
                  <td className={`py-3 px-4 text-right font-mono font-bold ${row.cagr_5y > 12 ? 'text-green-400' : 'text-gray-300'}`}>
                    {row.cagr_5y}%
                  </td>
                  <td className={`py-3 px-4 text-right font-mono font-bold ${row.cagr_10y > 10 ? 'text-green-400' : 'text-gray-300'}`}>
                    {row.cagr_10y}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">Multi-Year Fundamental Scale Comparison ({unitLabel})</h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.cagr_chart_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
              <XAxis dataKey="year" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#131822', borderColor: '#1E2638', color: '#fff' }} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ebitda" name="EBITDA" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pat" name="PAT" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fcf" name="Free Cash Flow" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
