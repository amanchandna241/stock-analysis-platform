'use client';

import React from 'react';

interface BalanceTabProps {
  data: {
    ticker: string;
    years: string[];
    rows: any[];
    currency?: string;
  };
}

export default function BalanceSheetTab({ data }: BalanceTabProps) {
  const isUSD = data.currency === 'USD';
  const symbol = isUSD ? '$' : '₹';
  const locale = isUSD ? 'en-US' : 'en-IN';
  const unitLabel = isUSD ? '$ Millions' : '₹ Crores';

  return (
    <div className="space-y-6">
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">10-Year Balance Sheet & Solvency Ratios ({unitLabel})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E2638] text-gray-400">
                <th className="py-3 px-4 font-semibold text-gray-300 sticky left-0 bg-[#131822]">Balance Sheet Items</th>
                {data.years.map((yr) => (
                  <th key={yr} className="py-3 px-3 font-semibold text-right">{yr}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/50 text-gray-300">
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Cash & Cash Equivalents</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">{symbol}{r.cash.toLocaleString(locale)}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Total Borrowings (Debt)</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right text-amber-400">{symbol}{r.debt.toLocaleString(locale)}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40 font-semibold">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Net Debt</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">{symbol}{r.net_debt.toLocaleString(locale)}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Trade Receivables</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">{symbol}{r.receivables.toLocaleString(locale)}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Inventory</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">{symbol}{r.inventory.toLocaleString(locale)}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Total Assets</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right font-bold text-white">{symbol}{r.total_assets.toLocaleString(locale)}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40 font-bold text-emerald-400">
                <td className="py-2.5 px-4 sticky left-0 bg-[#131822]">Total Shareholder Equity</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2.5 px-3 text-right">{symbol}{r.equity.toLocaleString(locale)}</td>
                ))}
              </tr>

              {/* Ratios subheader */}
              <tr className="bg-[#0B0E14] text-gray-400 font-bold">
                <td colSpan={data.years.length + 1} className="py-2 px-4 uppercase text-[10px] tracking-wider text-blue-400">
                  Calculated Balance Sheet Ratios
                </td>
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2 px-4 sticky left-0 bg-[#131822]">Debt / Equity Ratio</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2 px-3 text-right">{r.debt_to_equity}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2 px-4 sticky left-0 bg-[#131822]">Interest Coverage Ratio</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2 px-3 text-right">{r.interest_coverage}x</td>
                ))}
              </tr>
              <tr className="hover:bg-[#1E2638]/40">
                <td className="py-2 px-4 sticky left-0 bg-[#131822]">Asset Turnover Ratio</td>
                {data.rows.map((r, i) => (
                  <td key={i} className="py-2 px-3 text-right">{r.asset_turnover}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
