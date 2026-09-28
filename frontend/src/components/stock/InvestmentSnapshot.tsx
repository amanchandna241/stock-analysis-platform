'use client';

import React, { useState } from 'react';
import { Info, HelpCircle, CheckCircle2, TrendingUp, DollarSign, PieChart, Activity } from 'lucide-react';

interface SnapshotProps {
  snapshot: {
    revenue_growth_3y: number;
    ebitda_growth_3y: number;
    pat_growth_3y: number;
    eps_growth_3y: number;
    roe: number;
    roce: number;
    debt_equity: number;
    free_cash_flow_cr: number;
    operating_margin: number;
    pe_ratio: number;
    pb_ratio: number;
    ev_ebitda: number;
    dividend_yield: number;
    formulas: Record<string, string>;
    currency?: string;
  };
}

export default function InvestmentSnapshot({ snapshot }: SnapshotProps) {
  const [activeFormula, setActiveFormula] = useState<string | null>(null);
  const isUSD = snapshot.currency === 'USD';
  const symbol = isUSD ? '$' : '₹';
  const locale = isUSD ? 'en-US' : 'en-IN';
  const fcfLabel = isUSD ? 'Free Cash Flow ($M)' : 'Free Cash Flow (Cr)';

  const metricsList = [
    { label: '3Y Rev CAGR', value: `${snapshot.revenue_growth_3y}%`, category: 'Growth', highlight: snapshot.revenue_growth_3y > 10, formulaKey: 'Revenue Growth (3Y)' },
    { label: '3Y EBITDA CAGR', value: `${snapshot.ebitda_growth_3y}%`, category: 'Growth', highlight: snapshot.ebitda_growth_3y > 10 },
    { label: '3Y PAT CAGR', value: `${snapshot.pat_growth_3y}%`, category: 'Growth', highlight: snapshot.pat_growth_3y > 10 },
    { label: '3Y EPS CAGR', value: `${snapshot.eps_growth_3y}%`, category: 'Growth', highlight: snapshot.eps_growth_3y > 10 },
    { label: 'Return on Equity (ROE)', value: `${snapshot.roe}%`, category: 'Efficiency', highlight: snapshot.roe > 15, formulaKey: 'ROE' },
    { label: 'ROCE', value: `${snapshot.roce}%`, category: 'Efficiency', highlight: snapshot.roce > 18, formulaKey: 'ROCE' },
    { label: 'Debt to Equity', value: snapshot.debt_equity, category: 'Solvency', highlight: snapshot.debt_equity < 0.5, formulaKey: 'Debt/Equity' },
    { label: fcfLabel, value: `${symbol}${snapshot.free_cash_flow_cr.toLocaleString(locale)}`, category: 'Cash Flow', highlight: snapshot.free_cash_flow_cr > 0, formulaKey: 'Free Cash Flow' },
    { label: 'Operating Margin', value: `${snapshot.operating_margin}%`, category: 'Profitability', highlight: snapshot.operating_margin > 15 },
    { label: 'P/E Ratio', value: `${snapshot.pe_ratio}x`, category: 'Valuation', highlight: snapshot.pe_ratio < 30 },
    { label: 'P/B Ratio', value: `${snapshot.pb_ratio}x`, category: 'Valuation', highlight: true },
    { label: 'EV / EBITDA', value: `${snapshot.ev_ebitda}x`, category: 'Valuation', highlight: true, formulaKey: 'EV/EBITDA' },
    { label: 'Dividend Yield', value: `${snapshot.dividend_yield}%`, category: 'Yield', highlight: snapshot.dividend_yield > 1.0 },
  ];

  return (
    <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" /> Investment Snapshot
          </h2>
          <p className="text-xs text-gray-400">Core fundamental health, profitability, valuation, and capital efficiency indicators.</p>
        </div>
        <span className="text-xs bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full border border-blue-800/40">
          Formula Audit Enabled
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {metricsList.map((m, i) => (
          <div
            key={i}
            className="bg-[#0B0E14] p-3.5 rounded-xl border border-[#1E2638] hover:border-blue-500/50 transition-colors relative group"
          >
            <div className="flex items-center justify-between text-gray-400 text-[11px] mb-1">
              <span>{m.label}</span>
              {m.formulaKey && (
                <button
                  onClick={() => setActiveFormula(activeFormula === m.formulaKey ? null : m.formulaKey)}
                  className="text-gray-500 hover:text-blue-400"
                  title="View calculation formula"
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className={`text-sm font-black ${m.highlight ? 'text-white' : 'text-gray-300'}`}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Formula Modal / Banner */}
      {activeFormula && snapshot.formulas[activeFormula] && (
        <div className="mt-4 p-3.5 bg-blue-950/40 border border-blue-800/50 rounded-xl text-xs text-blue-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-blue-200">{activeFormula} Formula:</span>{' '}
            <code className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-mono">
              {snapshot.formulas[activeFormula]}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
