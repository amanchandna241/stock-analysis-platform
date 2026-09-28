'use client';

import React, { useState } from 'react';
import DocumentRAGTab from '@/components/stock/DocumentRAGTab';
import { BookOpen, Search, Sparkles } from 'lucide-react';

export default function GlobalRAGPage() {
  const [selectedTicker, setSelectedTicker] = useState('RELIANCE');
  const [customInput, setCustomInput] = useState('');

  const featuredTickers = [
    'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN',
    'TATAMOTORS', 'BHARTIARTL', 'LT', 'WIPRO', 'ITC', 'AXISBANK',
    'AAPL', 'NVDA', 'MSFT', 'TSLA'
  ];

  const handleCustomTickerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      setSelectedTicker(customInput.trim().toUpperCase());
      setCustomInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-950 text-purple-400 border border-purple-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> All NIFTY 50 & US Equities Supported (10,000+ Tickers)
              </span>
            </div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" /> Filings & Annual Report RAG Intelligence Assistant
            </h1>
            <p className="text-xs text-gray-400">Perform semantic search across indexed Annual Reports, Earnings Call Transcripts, and Investor Presentations with page citations.</p>
          </div>

          {/* Search Any Stock Input Form */}
          <form onSubmit={handleCustomTickerSubmit} className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Ticker (e.g. SBIN, TATAMOTORS, AAPL)"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="bg-[#0B0E14] text-xs text-white placeholder-gray-500 pl-9 pr-4 py-2.5 rounded-xl border border-[#1E2638] focus:outline-none focus:border-purple-500 w-64"
              />
            </div>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-lg shadow-purple-500/20"
            >
              Analyze
            </button>
          </form>
        </div>

        {/* Quick Ticker Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none border-t border-[#1E2638]">
          <span className="text-xs text-gray-400 font-bold shrink-0">Quick Ticker:</span>
          {featuredTickers.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTicker(t)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedTicker === t
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                  : 'bg-[#0B0E14] text-gray-400 hover:text-white border border-[#1E2638] hover:border-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* RAG Component */}
      <DocumentRAGTab ticker={selectedTicker} />
    </div>
  );
}
