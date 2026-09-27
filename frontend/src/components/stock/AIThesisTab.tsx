'use client';

import React from 'react';
import { Sparkles, CheckCircle2, ShieldAlert, TrendingUp, AlertTriangle, FileCheck, Layers } from 'lucide-react';

interface ThesisProps {
  data: {
    ticker: string;
    company_name: string;
    overall_view: string;
    target_timeframe: string;
    facts_summary: string[];
    bull_case: string[];
    base_case: string[];
    bear_case: string[];
    invalidation_factors: string[];
    answers_to_14_questions: Record<string, string>;
  };
}

export default function AIThesisTab({ data }: ThesisProps) {
  const isBullish = data.overall_view === 'Bullish';

  return (
    <div className="space-y-8">
      {/* Evidence-Based Investment View Header */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Evidence-Based Investment View</h3>
            </div>
            <p className="text-xs text-gray-400">Calculated from 10Y audited financial statements, capital allocation, valuation percentiles, and exchange filings.</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className={`px-4 py-1.5 rounded-xl font-bold text-sm border ${
              isBullish ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 'bg-amber-950/60 text-amber-400 border-amber-800/50'
            }`}>
              Synthesis View: {data.overall_view}
            </span>
            <span className="text-xs bg-[#0B0E14] text-gray-300 px-3 py-1.5 rounded-xl border border-[#1E2638]">
              Horizon: {data.target_timeframe}
            </span>
          </div>
        </div>

        {/* Fact vs AI Interpretation Notice */}
        <div className="bg-[#0B0E14] p-3.5 rounded-xl border border-purple-900/40 text-xs text-gray-300 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            <strong className="text-purple-300">Data Integrity Enforcement:</strong> The AI synthesis layer operates on verified financial metrics and never fabricates quantitative values.
          </span>
        </div>
      </div>

      {/* 14 Core Equity Research Questions Answered */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" /> 14 Core Equity Research Answers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {Object.entries(data.answers_to_14_questions).map(([qKey, aVal], idx) => (
            <div key={idx} className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638] space-y-1">
              <span className="font-bold text-blue-400 block">{qKey}</span>
              <p className="text-gray-300 leading-relaxed">{aVal}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bull, Base, Bear Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bull Case */}
        <div className="bg-[#131822] border border-emerald-900/40 rounded-2xl p-6 space-y-3">
          <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Bull Case Scenario
          </h4>
          <ul className="space-y-2 text-xs text-gray-300 list-disc list-inside">
            {data.bull_case.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>

        {/* Base Case */}
        <div className="bg-[#131822] border border-blue-900/40 rounded-2xl p-6 space-y-3">
          <h4 className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Base Case Scenario
          </h4>
          <ul className="space-y-2 text-xs text-gray-300 list-disc list-inside">
            {data.base_case.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>

        {/* Bear Case */}
        <div className="bg-[#131822] border border-amber-900/40 rounded-2xl p-6 space-y-3">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Bear Case Scenario
          </h4>
          <ul className="space-y-2 text-xs text-gray-300 list-disc list-inside">
            {data.bear_case.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Thesis Invalidation Factors */}
      <div className="bg-red-950/30 border border-red-800/50 rounded-2xl p-6 space-y-4">
        <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" /> Thesis Invalidation Factors (Red Lines)
        </h4>
        <p className="text-xs text-gray-400">Specific empirical conditions under which the positive investment thesis becomes invalid:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {data.invalidation_factors.map((factor, idx) => (
            <div key={idx} className="bg-[#0B0E14] p-3.5 rounded-xl border border-red-900/40 text-gray-200 flex items-start gap-2">
              <span className="font-bold text-red-400">{idx + 1}.</span>
              <span>{factor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
