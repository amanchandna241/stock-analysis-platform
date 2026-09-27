'use client';

import React from 'react';
import { Building2, Globe, Clock, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';

interface StockHeaderProps {
  overview: {
    ticker: string;
    bse_code?: string;
    name: string;
    sector: string;
    industry: string;
    current_price: number;
    change_amount: number;
    change_percent: number;
    market_cap_cr: number;
    last_updated: string;
    business_summary: string;
    key_products: string[];
  };
}

export default function StockHeader({ overview }: StockHeaderProps) {
  const isPositive = overview.change_percent >= 0;

  return (
    <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Section */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-black text-white tracking-tight">{overview.ticker}</span>
            {overview.bse_code && (
              <span className="text-xs bg-[#1E2638] text-gray-300 px-2 py-0.5 rounded font-mono">
                BSE: {overview.bse_code}
              </span>
            )}
            <span className="text-xs bg-blue-950/60 text-blue-400 border border-blue-800/50 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {overview.sector}
            </span>
          </div>

          <h1 className="text-xl font-bold text-gray-200 mb-1">{overview.name}</h1>
          <p className="text-xs text-gray-400 mb-3">{overview.industry}</p>

          <p className="text-xs text-gray-300 max-w-3xl leading-relaxed mb-3">
            {overview.business_summary}
          </p>

          {/* Key products */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium mr-1">Products:</span>
            {overview.key_products.map((prod, idx) => (
              <span key={idx} className="text-xs bg-[#1E2638]/70 text-gray-300 px-2 py-0.5 rounded flex items-center gap-1">
                <Tag className="w-2.5 h-2.5 text-blue-400" /> {prod}
              </span>
            ))}
          </div>
        </div>

        {/* Right Section: Price & Market Cap */}
        <div className="lg:text-right shrink-0 bg-[#0B0E14] p-5 rounded-xl border border-[#1E2638]">
          <div className="text-xs text-gray-400 mb-1 flex items-center lg:justify-end gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-500" /> {overview.last_updated}
          </div>

          <div className="flex items-baseline lg:justify-end gap-2 mb-1">
            <span className="text-3xl font-black text-white">₹{overview.current_price.toLocaleString('en-IN')}</span>
            <div className={`flex items-center text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {overview.change_amount > 0 ? `+${overview.change_amount}` : overview.change_amount} ({overview.change_percent}%)
            </div>
          </div>

          <div className="text-xs text-gray-400 flex items-center lg:justify-end gap-4 mt-2 pt-2 border-t border-[#1E2638]">
            <div>
              <span className="text-gray-500">Market Cap:</span>{' '}
              <span className="font-semibold text-white">₹{overview.market_cap_cr.toLocaleString('en-IN')} Cr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
