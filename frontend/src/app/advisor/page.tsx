'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import {
  Sparkles, Search, ArrowRight, TrendingUp, ShieldAlert,
  Zap, Compass, Award, ExternalLink, RefreshCw, DollarSign
} from 'lucide-react';

export default function AdvisorPage() {
  const [query, setQuery] = useState<string>('Need recommendation in EV space in India for long term');
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load suggested prompts on initial mount
  useEffect(() => {
    fetchApi<string[]>('/advisor/suggested-prompts')
      .then((prompts) => {
        if (prompts && prompts.length > 0) {
          setSuggestedPrompts(prompts);
        }
      })
      .catch((err) => console.error('Failed to fetch suggested prompts:', err));

    // Execute initial query
    handleFetchRecommendation('Need recommendation in EV space in India for long term');
  }, []);

  const handleFetchRecommendation = (searchPrompt: string) => {
    if (!searchPrompt || searchPrompt.trim().length < 3) return;
    setLoading(true);
    setError(null);

    fetchApi<any>('/advisor/recommend', {
      method: 'POST',
      body: JSON.stringify({ query: searchPrompt.trim() }),
    })
      .then((res) => {
        setRecommendation(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Advisor query error:', err);
        setError('Failed to generate AI investment recommendation. Please try again.');
        setLoading(false);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchRecommendation(query);
  };

  const handlePromptClick = (promptText: string) => {
    setQuery(promptText);
    handleFetchRecommendation(promptText);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/20 rounded-3xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl md:text-3xl font-black text-white">LLM Conversational Equity Advisor</h1>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-blue-500/20 text-blue-300 border border-blue-400/30">
              GenAI Recommendation Engine
            </span>
          </div>
          <p className="text-sm text-gray-300 max-w-3xl leading-relaxed">
            Ask thematic investment questions in natural language (*"Need recommendation in EV space in India for long term"*, *"High dividend growth US tech stocks"*). The engine synthesizes real-time financial statements, competitive moats, and valuation metrics into grounded portfolio recommendations.
          </p>
        </div>
      </div>

      {/* Interactive Search Box & Quick Pills */}
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI Advisor e.g., 'Need recommendation in EV space in India for long term'..."
            className="w-full bg-[#0E131F] text-white placeholder-gray-500 pl-12 pr-36 py-4 rounded-2xl border border-[#1E2638] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm md:text-base transition-all shadow-xl"
          />
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs md:text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <span>Ask Advisor</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        {suggestedPrompts.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs text-gray-500 font-semibold whitespace-nowrap flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-blue-400" /> Suggested Prompts:
            </span>
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  query === p
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-[#0E131F] border-[#1E2638] text-gray-400 hover:text-white hover:bg-[#131822]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error View */}
      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !recommendation && (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-[#0E131F] rounded-2xl border border-[#1E2638] text-gray-400">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-sm font-semibold text-gray-300">Synthesizing LLM Investment Recommendation...</p>
          <p className="text-xs text-gray-500 mt-1">Filtering 10-Year Balance Sheets & Sector Moats</p>
        </div>
      )}

      {/* Recommendation Results */}
      {recommendation && !loading && (
        <div className="space-y-6">
          {/* Macro Synthesis Card */}
          <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1E2638] pb-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">
                  {recommendation.market}
                </span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
                  <Award className="w-5 h-5 text-amber-400" />
                  {recommendation.theme_name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Horizon: {recommendation.target_horizon}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed bg-[#131822] p-4 rounded-xl border border-[#1E2638]">
              {recommendation.macro_synthesis}
            </p>
          </div>

          {/* Recommended Stock Portfolio Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Recommended Thematic Stocks & Allocation Weights
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {recommendation.recommended_stocks.map((stock: any, idx: number) => {
                const currSymbol = stock.currency === 'USD' ? '$' : '₹';
                return (
                  <div
                    key={idx}
                    className="bg-[#0E131F] border border-[#1E2638] hover:border-blue-500/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all group"
                  >
                    <div className="space-y-4">
                      {/* Top Ticker Header & Allocation Badge */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">
                              {stock.ticker}
                            </span>
                            <span className="text-xs font-bold text-gray-400">
                              {stock.sector}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{stock.name}</div>
                        </div>

                        <div className="bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-extrabold px-3 py-1.5 rounded-xl">
                          {stock.allocation_pct}% Allocation
                        </div>
                      </div>

                      {/* Spot Price & Ratios Grid */}
                      <div className="grid grid-cols-3 gap-2 bg-[#131822] p-3 rounded-xl border border-[#1E2638] text-center">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase">Spot Price</div>
                          <div className="text-xs font-bold text-white mt-0.5">
                            {currSymbol}{stock.current_price.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase">P/E Ratio</div>
                          <div className="text-xs font-bold text-blue-400 mt-0.5">
                            {stock.pe_ratio}x
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase">3Y CAGR</div>
                          <div className="text-xs font-bold text-emerald-400 mt-0.5">
                            +{stock.rev_cagr_3y}%
                          </div>
                        </div>
                      </div>

                      {/* Thesis Summary */}
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {stock.thesis_summary}
                      </p>

                      {/* Key Catalysts */}
                      <div className="space-y-1.5 pt-2 border-t border-[#1E2638]">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Key Growth Catalysts
                        </span>
                        <ul className="space-y-1">
                          {stock.key_catalysts.map((c: string, cIdx: number) => (
                            <li key={cIdx} className="text-[11px] text-gray-400 flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Risk Factors */}
                      <div className="space-y-1.5 pt-2 border-t border-[#1E2638]">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Risk Factors
                        </span>
                        <ul className="space-y-1">
                          {stock.risk_factors.map((r: string, rIdx: number) => (
                            <li key={rIdx} className="text-[11px] text-gray-400 flex items-start gap-1.5">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Direct Action Link */}
                    <div className="pt-4 border-t border-[#1E2638]">
                      <Link
                        href={`/stock/${stock.ticker}`}
                        className="w-full py-2.5 px-4 bg-[#131822] hover:bg-blue-600 text-gray-300 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-[#1E2638] hover:border-blue-500"
                      >
                        <span>Deep-Dive Equity Research</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-[#0E131F] border border-[#1E2638] rounded-xl text-[11px] text-gray-500">
            {recommendation.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
