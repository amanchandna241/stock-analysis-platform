'use client';

import React from 'react';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, BookmarkCheck, FileText } from 'lucide-react';

interface EarningsProps {
  data: {
    ticker: string;
    quarters: Array<{
      quarter: string;
      revenue: number;
      ebitda: number;
      ebitda_margin: number;
      pat: number;
      eps: number;
      yoy_rev_growth: number;
      qoq_rev_growth: number;
      yoy_pat_growth: number;
      qoq_pat_growth: number;
    }>;
    ai_analysis: {
      what_changed: string;
      why_changed: string;
      positive_developments: string[];
      negative_developments: string[];
      management_commentary: string;
      things_to_monitor: string[];
      citations: string[];
    };
    currency?: string;
  };
}

export default function EarningsAnalysisTab({ data }: EarningsProps) {
  const ai = data.ai_analysis;
  const isUSD = data.currency === 'USD';
  const symbol = isUSD ? '$' : '₹';
  const locale = isUSD ? 'en-US' : 'en-IN';
  const unitLabel = isUSD ? '$ Millions' : '₹ Crores';

  return (
    <div className="space-y-8">
      {/* Quarterly Performance Table */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Quarterly Financial Results ({unitLabel})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E2638] text-gray-400">
                <th className="py-3 px-4 font-semibold text-gray-300 sticky left-0 bg-[#131822]">Metric</th>
                {data.quarters.map((q) => (
                  <th key={q.quarter} className="py-3 px-3 font-semibold text-right">{q.quarter}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/50 text-gray-300">
              <tr className="hover:bg-[#1E2638]/40 font-bold text-white">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Revenue</td>
                {data.quarters.map((q, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">{symbol}{q.revenue.toLocaleString(locale)}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">YoY Rev Growth</td>
                {data.quarters.map((q, i) => (
                  <td key={i} className={`py-2.5 px-3 text-right font-mono ${q.yoy_rev_growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    +{q.yoy_rev_growth}%
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">QoQ Rev Growth</td>
                {data.quarters.map((q, i) => (
                  <td key={i} className="py-2.5 px-3 text-right font-mono text-gray-400">+{q.qoq_rev_growth}%</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">EBITDA</td>
                {data.quarters.map((q, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">{symbol}{q.ebitda.toLocaleString(locale)}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40 italic">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">EBITDA Margin</td>
                {data.quarters.map((q, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">{q.ebitda_margin}%</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40 font-bold text-blue-400">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Net Profit (PAT)</td>
                {data.quarters.map((q, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">{symbol}{q.pat.toLocaleString(locale)}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">YoY PAT Growth</td>
                {data.quarters.map((q, i) => (
                  <td key={i} className={`py-2.5 px-3 text-right font-mono ${q.yoy_pat_growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    +{q.yoy_pat_growth}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Earnings Summary Card */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" /> AI Earnings Synthesis & Commentary
          </h3>
          <span className="text-xs bg-purple-950/60 text-purple-300 border border-purple-800/40 px-3 py-1 rounded-full">
            Grounded in Exchange Filings
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638] space-y-2">
            <h4 className="font-bold text-blue-400 uppercase text-[11px]">What Changed?</h4>
            <p className="text-gray-300 leading-relaxed">{ai.what_changed}</p>
          </div>

          <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638] space-y-2">
            <h4 className="font-bold text-purple-400 uppercase text-[11px]">Why Did It Change?</h4>
            <p className="text-gray-300 leading-relaxed">{ai.why_changed}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638] space-y-2">
            <h4 className="font-bold text-green-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Positive Developments
            </h4>
            <ul className="space-y-1.5 text-gray-300 list-disc list-inside">
              {ai.positive_developments.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638] space-y-2">
            <h4 className="font-bold text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Headwinds & Negative Developments
            </h4>
            <ul className="space-y-1.5 text-gray-300 list-disc list-inside">
              {ai.negative_developments.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638] text-xs space-y-2">
          <h4 className="font-bold text-amber-400 uppercase text-[11px]">Management Commentary & Guidance</h4>
          <p className="text-gray-200 italic leading-relaxed">"{ai.management_commentary}"</p>
        </div>

        <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638] text-xs space-y-2">
          <h4 className="font-bold text-emerald-400 uppercase text-[11px]">Key Things to Monitor Next Quarter</h4>
          <ul className="space-y-1.5 text-gray-300 list-disc list-inside">
            {ai.things_to_monitor.map((mon, idx) => (
              <li key={idx}>{mon}</li>
            ))}
          </ul>
        </div>

        {/* Citations Footer */}
        <div className="pt-4 border-t border-[#1E2638] flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
          <span className="font-semibold text-gray-300 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-blue-400" /> Evidence Citations:
          </span>
          {ai.citations.map((cite, idx) => (
            <span key={idx} className="bg-[#0B0E14] border border-[#1E2638] text-gray-300 px-2 py-0.5 rounded font-mono">
              {cite}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
