'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface IncomeTabProps {
  data: {
    ticker: string;
    years: string[];
    rows: any[];
    revenue_chart: any[];
    ebitda_chart: any[];
    pat_chart: any[];
    margin_trend: any[];
  };
}

export default function IncomeStatementTab({ data }: IncomeTabProps) {
  return (
    <div className="space-y-8">
      {/* 10-Year Income Statement Table */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">10-Year Income Statement (₹ Crores)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E2638] text-gray-400">
                <th className="py-3 px-4 font-semibold text-gray-300 sticky left-0 bg-[#131822]">Financial Metric</th>
                {data.years.map((yr) => (
                  <th key={yr} className="py-3 px-3 font-semibold text-right">{yr}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/50 text-gray-300">
              <tr className="hover:bg-[#1E2638]/40 font-bold text-white">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Sales / Revenue</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">₹{r.revenue.toLocaleString('en-IN')}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">EBITDA</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">₹{r.ebitda.toLocaleString('en-IN')}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">EBIT</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">₹{r.ebit.toLocaleString('en-IN')}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Profit Before Tax (PBT)</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">₹{r.pbt.toLocaleString('en-IN')}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40 font-bold text-blue-400">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Net Profit (PAT)</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">₹{r.pat.toLocaleString('en-IN')}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">EPS (₹)</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">₹{r.eps}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40 text-gray-400 italic">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">EBITDA Margin (%)</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">{r.ebitda_margin}%</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40 text-gray-400 italic">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Net Margin (%)</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">{r.pat_margin}%</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-4">Revenue & Net Profit Trajectory (10Y)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
                <XAxis dataKey="year" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#131822', borderColor: '#1E2638', color: '#fff' }} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue (Cr)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pat" name="Net Profit (Cr)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-4">Operating & Net Margin Expansion Trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.margin_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
                <XAxis dataKey="year" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#131822', borderColor: '#1E2638', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="ebitda_margin" name="EBITDA Margin %" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="net_margin" name="Net Margin %" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
