'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface CashFlowTabProps {
  data: {
    ticker: string;
    years: string[];
    rows: any[];
    formula: string;
    warnings: Array<{
      year: string;
      warning_type: string;
      severity: string;
      description: string;
    }>;
    currency?: string;
  };
}

export default function CashFlowTab({ data }: CashFlowTabProps) {
  const isUSD = data.currency === 'USD';
  const symbol = isUSD ? '$' : '₹';
  const locale = isUSD ? 'en-US' : 'en-IN';
  const unitLabel = isUSD ? '$ Millions' : '₹ Crores';

  return (
    <div className="space-y-6">
      {/* Cash Flow Warning Banner */}
      {data.warnings && data.warnings.length > 0 ? (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Cash Flow Risk Signals Identified ({data.warnings.length})</span>
          </div>
          <div className="space-y-2">
            {data.warnings.map((w, idx) => (
              <div key={idx} className="bg-[#0B0E14]/80 p-3 rounded-xl border border-amber-900/40 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <span>{w.warning_type}</span>
                    <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/50 px-1.5 py-0.2 rounded uppercase">
                      {w.severity}
                    </span>
                  </div>
                  <p className="text-gray-300 mt-1 leading-relaxed">{w.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>High Cash Conversion Quality: CFO aligns strongly with PAT, with no red flags in working capital.</span>
        </div>
      )}

      {/* Formula Header */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">10-Year Cash Flow Statement ({unitLabel})</h3>
          <div className="text-xs bg-blue-950/50 text-blue-300 border border-blue-800/50 px-3 py-1 rounded-lg flex items-center gap-1.5 font-mono">
            <Info className="w-3.5 h-3.5 text-blue-400" /> {data.formula}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E2638] text-gray-400">
                <th className="py-3 px-4 font-semibold text-gray-300 sticky left-0 bg-[#131822]">Cash Flow Category</th>
                {data.years.map((yr) => (
                  <th key={yr} className="py-3 px-3 font-semibold text-right">{yr}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/50 text-gray-300">
              <tr className="hover:bg-[#1E2638]/40 font-semibold text-emerald-400">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Cash Flow from Operations (CFO)</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">{symbol}{r.cfo.toLocaleString(locale)}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40 text-amber-400">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Capital Expenditure (Capex)</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">-{symbol}{r.capex.toLocaleString(locale)}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40 font-black text-white bg-blue-950/20">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Free Cash Flow (FCF = CFO - Capex)</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right text-blue-400">{symbol}{r.fcf.toLocaleString(locale)}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Cash Flow from Investing (CFI)</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right text-gray-400">{symbol}{r.cfi.toLocaleString(locale)}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Cash Flow from Financing (CFF)</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right text-gray-400">{symbol}{r.cff.toLocaleString(locale)}</td>
                ))}
              </tr>

              {/* Quality Check row */}
              <tr className="bg-[#0B0E14] text-gray-400 font-bold">
                <td colSpan={data.years.length + 1} className="py-2 px-4 uppercase text-[10px] tracking-wider text-purple-400">
                  Cash Flow Quality Metrics
                </td>
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2 px-4 sticky left-0 bg-[#131822]">Net Profit (PAT)</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2 px-3 text-right">{symbol}{r.pat.toLocaleString(locale)}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2 px-4 sticky left-0 bg-[#131822]">Working Capital Consumed</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2 px-3 text-right">{symbol}{r.working_capital.toLocaleString(locale)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
