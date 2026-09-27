'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Users, AlertTriangle } from 'lucide-react';

interface ShareholdingProps {
  data: {
    ticker: string;
    history: Array<{
      quarter: string;
      promoter: number;
      fii: number;
      dii: number;
      public: number;
      promoter_pledge_pct: number;
    }>;
    key_insights: string[];
  };
}

export default function ShareholdingTab({ data }: ShareholdingProps) {
  const latest = data.history[data.history.length - 1];

  return (
    <div className="space-y-6">
      {/* Promoter Pledge Alert */}
      {latest && latest.promoter_pledge_pct > 0 ? (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Promoter Share Pledging Detected:</span> {latest.promoter_pledge_pct}% of total promoter holding is encumbered/pledged. Monitor closely for debt repayment obligations.
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-300">
          <Users className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Zero Promoter Pledging (0.0% encumbrance): High financial stability with no collateral leverage risks.</span>
        </div>
      )}

      {/* Shareholding Breakdown Table */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Quarterly Shareholding Pattern History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E2638] text-gray-400">
                <th className="py-3 px-4 font-semibold text-gray-300">Quarter</th>
                <th className="py-3 px-4 font-semibold text-right">Promoter %</th>
                <th className="py-3 px-4 font-semibold text-right">FII %</th>
                <th className="py-3 px-4 font-semibold text-right">DII %</th>
                <th className="py-3 px-4 font-semibold text-right">Public / Others %</th>
                <th className="py-3 px-4 font-semibold text-right">Promoter Pledge %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/50 text-gray-300">
              {data.history.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#1E2638]/40">
                  <td className="py-3 px-4 font-bold text-white">{row.quarter}</td>
                  <td className="py-3 px-4 text-right font-mono text-blue-400">{row.promoter}%</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400">{row.fii}%</td>
                  <td className="py-3 px-4 text-right font-mono text-purple-400">{row.dii}%</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-400">{row.public}%</td>
                  <td className={`py-3 px-4 text-right font-mono font-bold ${row.promoter_pledge_pct > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                    {row.promoter_pledge_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stacked Chart */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">Ownership Distribution Trend</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
              <XAxis dataKey="quarter" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#131822', borderColor: '#1E2638', color: '#fff' }} />
              <Legend />
              <Bar dataKey="promoter" name="Promoter" stackId="a" fill="#3B82F6" />
              <Bar dataKey="fii" name="FII (Foreign Inst)" stackId="a" fill="#10B981" />
              <Bar dataKey="dii" name="DII (Domestic Inst)" stackId="a" fill="#8B5CF6" />
              <Bar dataKey="public" name="Public" stackId="a" fill="#6B7280" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
