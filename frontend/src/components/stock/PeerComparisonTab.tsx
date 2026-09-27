'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, ArrowUpDown } from 'lucide-react';

interface PeerTabProps {
  targetTicker: string;
  peers: any[];
}

export default function PeerComparisonTab({ targetTicker, peers }: PeerTabProps) {
  const [sortMetric, setSortMetric] = useState<string>('market_cap_cr');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const sortedPeers = [...peers].sort((a, b) => {
    const valA = a[sortMetric] || 0;
    const valB = b[sortMetric] || 0;
    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (metric: string) => {
    if (sortMetric === metric) {
      setSortAsc(!sortAsc);
    } else {
      setSortMetric(metric);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" /> Sector Peer Positioning Matrix
          </h3>
          <p className="text-xs text-gray-400">Sort and compare revenue growth, margins, return ratios, debt leverage, and valuation multiples.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1E2638] text-gray-400">
              <th className="py-3 px-4 font-semibold text-gray-300 sticky left-0 bg-[#131822]">Company / Ticker</th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('market_cap_cr')}>
                M.Cap (Cr) <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('revenue_growth_3y')}>
                3Y Rev % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('ebitda_margin')}>
                EBITDA % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('pat_growth_3y')}>
                3Y PAT % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('roe')}>
                ROE % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('roce')}>
                ROCE % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('debt_equity')}>
                D/E <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('pe_ratio')}>
                P/E <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('ev_ebitda')}>
                EV/EBITDA <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('fcf_yield')}>
                FCF Yield % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2638]/50 text-gray-300">
            {sortedPeers.map((p, idx) => {
              const isTarget = p.ticker === targetTicker;
              return (
                <tr key={idx} className={`hover:bg-[#1E2638]/40 ${isTarget ? 'bg-blue-950/30 font-bold border-l-4 border-blue-500' : ''}`}>
                  <td className="py-3 px-4 sticky left-0 bg-[#131822]">
                    <Link href={`/stock/${p.ticker}`} className="text-white hover:text-blue-400 flex items-center gap-1.5">
                      <span>{p.ticker}</span>
                      <span className="text-[11px] text-gray-500 font-normal">({p.name})</span>
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-right">₹{p.market_cap_cr.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-mono">{p.revenue_growth_3y}%</td>
                  <td className="py-3 px-3 text-right font-mono">{p.ebitda_margin}%</td>
                  <td className="py-3 px-3 text-right font-mono">{p.pat_growth_3y}%</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">{p.roe}%</td>
                  <td className="py-3 px-3 text-right font-mono">{p.roce}%</td>
                  <td className="py-3 px-3 text-right font-mono">{p.debt_equity}</td>
                  <td className="py-3 px-3 text-right font-mono text-blue-400">{p.pe_ratio}x</td>
                  <td className="py-3 px-3 text-right font-mono">{p.ev_ebitda}x</td>
                  <td className="py-3 px-3 text-right font-mono">{p.fcf_yield}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
