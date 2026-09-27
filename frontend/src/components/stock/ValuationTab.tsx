'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Calculator, AlertCircle, TrendingUp, Sliders, ShieldAlert } from 'lucide-react';

interface ValuationProps {
  ticker: string;
  data: {
    relative_table: Array<{
      metric: string;
      company_value: number;
      sector_median: number;
      peer_median: number;
      historical_median_5y: number;
      valuation_status: string;
    }>;
    historical: {
      metric_name: string;
      current: number;
      median_5y: number;
      min_5y: number;
      max_5y: number;
      percentile: number;
      historical_chart: any[];
    };
    dcf_default: any;
  };
}

export default function ValuationTab({ ticker, data }: ValuationProps) {
  const [dcfParams, setDcfParams] = useState({
    revenue_growth_rate: 0.12,
    ebitda_margin: 0.22,
    tax_rate: 0.25,
    wacc: 0.11,
    terminal_growth_rate: 0.045
  });

  const [dcfResult, setDcfResult] = useState(data.dcf_default);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleRecalculateDCF = async (newParams: typeof dcfParams) => {
    setIsCalculating(true);
    try {
      const res = await fetchApi<any>(`/valuation/${ticker}/dcf-calculator`, {
        method: 'POST',
        body: JSON.stringify(newParams)
      });
      setDcfResult(res);
    } catch (err) {
      console.error("DCF Calculation error:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  const updateParam = (key: keyof typeof dcfParams, val: number) => {
    const next = { ...dcfParams, [key]: val };
    setDcfParams(next);
    handleRecalculateDCF(next);
  };

  return (
    <div className="space-y-8">
      {/* Relative Valuation Table */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Relative Valuation Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E2638] text-gray-400">
                <th className="py-3 px-4 font-semibold text-gray-300">Valuation Metric</th>
                <th className="py-3 px-4 font-semibold text-right">Company Value</th>
                <th className="py-3 px-4 font-semibold text-right">Sector Median</th>
                <th className="py-3 px-4 font-semibold text-right">Peer Median</th>
                <th className="py-3 px-4 font-semibold text-right">5Y Hist. Median</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/50 text-gray-300">
              {data.relative_table.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#1E2638]/40">
                  <td className="py-3 px-4 font-semibold text-white">{row.metric}</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-400">{row.company_value}</td>
                  <td className="py-3 px-4 text-right">{row.sector_median}</td>
                  <td className="py-3 px-4 text-right">{row.peer_median}</td>
                  <td className="py-3 px-4 text-right">{row.historical_median_5y}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      row.valuation_status === 'Premium' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                    }`}>
                      {row.valuation_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Valuation Percentile Gauge */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-2">Historical P/E Range & Percentile Position</h3>
        <p className="text-xs text-gray-400 mb-6">Current valuation multiple compared against 5-year cyclical high and low bands.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638]">
            <span className="text-xs text-gray-400">Current P/E</span>
            <div className="text-2xl font-black text-white">{data.historical.current}x</div>
          </div>
          <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638]">
            <span className="text-xs text-gray-400">5Y Median P/E</span>
            <div className="text-2xl font-black text-blue-400">{data.historical.median_5y}x</div>
          </div>
          <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638]">
            <span className="text-xs text-gray-400">5Y Band Range</span>
            <div className="text-2xl font-black text-gray-300">{data.historical.min_5y}x – {data.historical.max_5y}x</div>
          </div>
          <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638]">
            <span className="text-xs text-gray-400">5Y Percentile</span>
            <div className="text-2xl font-black text-amber-400">{data.historical.percentile}%</div>
          </div>
        </div>

        {/* Visual Range Bar */}
        <div className="relative pt-4 pb-2">
          <div className="h-3 w-full bg-[#1E2638] rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500/80 w-1/3" title="Value Zone" />
            <div className="h-full bg-blue-500/80 w-1/3" title="Fair Zone" />
            <div className="h-full bg-amber-500/80 w-1/3" title="Premium Zone" />
          </div>

          <div
            className="absolute top-1 -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${Math.min(95, Math.max(5, data.historical.percentile))}%` }}
          >
            <div className="w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-lg" />
            <span className="text-[10px] font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded mt-1">
              Current: {data.historical.current}x
            </span>
          </div>
        </div>
      </div>

      {/* Configurable DCF Model */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-400" /> Interactive Discounted Cash Flow (DCF) Valuation Model
            </h3>
            <p className="text-xs text-gray-400">Adjust assumption sliders to re-estimate fair intrinsic share value dynamically.</p>
          </div>
          <div className="bg-amber-950/40 text-amber-300 border border-amber-800/50 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 max-w-md">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{dcfResult.disclaimer}</span>
          </div>
        </div>

        {/* Interactive Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-[#0B0E14] rounded-xl border border-[#1E2638] mb-6">
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-1 block">
              Rev Growth Rate: <span className="text-blue-400">{(dcfParams.revenue_growth_rate * 100).toFixed(1)}%</span>
            </label>
            <input
              type="range" min="0.02" max="0.30" step="0.005"
              value={dcfParams.revenue_growth_rate}
              onChange={(e) => updateParam('revenue_growth_rate', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 mb-1 block">
              EBITDA Margin: <span className="text-blue-400">{(dcfParams.ebitda_margin * 100).toFixed(1)}%</span>
            </label>
            <input
              type="range" min="0.05" max="0.50" step="0.01"
              value={dcfParams.ebitda_margin}
              onChange={(e) => updateParam('ebitda_margin', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 mb-1 block">
              WACC Discount Rate: <span className="text-purple-400">{(dcfParams.wacc * 100).toFixed(1)}%</span>
            </label>
            <input
              type="range" min="0.07" max="0.18" step="0.005"
              value={dcfParams.wacc}
              onChange={(e) => updateParam('wacc', parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 mb-1 block">
              Terminal Growth Rate: <span className="text-purple-400">{(dcfParams.terminal_growth_rate * 100).toFixed(1)}%</span>
            </label>
            <input
              type="range" min="0.02" max="0.07" step="0.002"
              value={dcfParams.terminal_growth_rate}
              onChange={(e) => updateParam('terminal_growth_rate', parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 mb-1 block">
              Tax Rate: <span className="text-gray-400">{(dcfParams.tax_rate * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range" min="0.15" max="0.35" step="0.01"
              value={dcfParams.tax_rate}
              onChange={(e) => updateParam('tax_rate', parseFloat(e.target.value))}
              className="w-full accent-gray-500"
            />
          </div>
        </div>

        {/* Output Valuation Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-gradient-to-r from-purple-950/30 to-blue-950/30 rounded-xl border border-purple-800/40 mb-8">
          <div>
            <span className="text-xs text-gray-400">Implied Fair Share Value</span>
            <div className="text-3xl font-black text-purple-300">
              {(data as any)?.currency === 'USD' ? '$' : '₹'}{dcfResult.fair_value_per_share}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-400">Current Market Price</span>
            <div className="text-2xl font-bold text-white">
              {(data as any)?.currency === 'USD' ? '$' : '₹'}{dcfResult.current_price}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-400">Margin of Safety</span>
            <div className={`text-2xl font-bold ${dcfResult.margin_of_safety_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dcfResult.margin_of_safety_pct > 0 ? `+${dcfResult.margin_of_safety_pct}%` : `${dcfResult.margin_of_safety_pct}%`}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-400">Implied Equity Value</span>
            <div className="text-xl font-bold text-gray-200">
              {(data as any)?.currency === 'USD' ? '$' : '₹'}{dcfResult.equity_value_cr.toLocaleString('en-US')} {(data as any)?.currency === 'USD' ? 'M' : 'Cr'}
            </div>
          </div>
        </div>

        {/* 5x5 Sensitivity Matrix Table */}
        <div>
          <h4 className="text-sm font-bold text-white mb-3">5x5 Valuation Sensitivity Table (Implied Price {(data as any)?.currency === 'USD' ? '$' : '₹'} vs WACC & Terminal Growth)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border border-[#1E2638] rounded-xl overflow-hidden">
              <thead className="bg-[#0B0E14] text-gray-400">
                <tr>
                  <th className="py-2.5 px-3 border-r border-[#1E2638] text-left">WACC \ Terminal Growth</th>
                  {dcfResult.sensitivity_growths.map((g: number, idx: number) => (
                    <th key={idx} className="py-2.5 px-3 font-semibold">{g}%</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2638]">
                {dcfResult.sensitivity_table.map((row: any[], rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-[#1E2638]/40">
                    <td className="py-2.5 px-3 font-bold text-left bg-[#0B0E14] border-r border-[#1E2638] text-purple-300">
                      {dcfResult.sensitivity_waccs[rIdx]}%
                    </td>
                    {row.map((cell: any, cIdx: number) => {
                      const isBase = cell.wacc === Math.round(dcfParams.wacc * 1000) / 10 && cell.terminal_growth === Math.round(dcfParams.terminal_growth_rate * 1000) / 10;
                      return (
                        <td
                          key={cIdx}
                          className={`py-2.5 px-3 font-mono font-medium ${
                            isBase ? 'bg-purple-900/60 text-white font-bold border-2 border-purple-400' :
                            cell.implied_share_price > dcfResult.current_price ? 'text-green-400' : 'text-gray-300'
                          }`}
                        >
                          {(data as any)?.currency === 'USD' ? '$' : '₹'}{cell.implied_share_price}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
