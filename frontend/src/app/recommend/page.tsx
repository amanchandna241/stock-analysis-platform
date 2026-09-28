'use client';

import React, { useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import {
  Sparkles, TrendingUp, BarChart3, Shield, Zap, SlidersHorizontal,
  ChevronDown, Star, Trophy, ArrowUpRight, ArrowDownRight, RefreshCw, Target
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScoreBreakdown {
  composite: number;
  growth_score: number;
  quality_score: number;
  value_score: number;
  momentum_score: number;
  rev_3y_cagr: number;
  pat_3y_cagr: number;
  roe: number;
  ebitda_margin: number;
  pe_ratio: number;
  pb_ratio: number;
  div_yield: number;
}

interface Recommendation {
  rank: number;
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  exchange: string;
  market_cap_cr: number;
  current_price: number;
  currency: string;
  change_percent: number;
  pe_ratio: number;
  pb_ratio: number;
  div_yield: number;
  high_52w: number;
  low_52w: number;
  scores: ScoreBreakdown;
  rationale: string[];
}

interface RecommendationResponse {
  filters: {
    cap_type: string | null;
    sector: string | null;
    horizon: string;
    exchange: string | null;
  };
  horizon_weights: Record<string, number>;
  total_screened: number;
  matches_found: number;
  recommendations: Recommendation[];
}

// ─── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const filled = (score / 100) * c;
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E2638" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={`${filled} ${c}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text
        x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={size / 4.5} fontWeight="700"
        style={{ transform: 'rotate(90deg)', transformOrigin: `${size / 2}px ${size / 2}px` }}
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}

// ─── Score Bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const color = value >= 70 ? 'from-emerald-500 to-emerald-400'
    : value >= 50 ? 'from-amber-500 to-amber-400'
    : 'from-rose-500 to-rose-400';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] text-gray-400">{icon}{label}</span>
        <span className="text-[10px] font-bold text-white">{Math.round(value)}</span>
      </div>
      <div className="h-1.5 bg-[#1E2638] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ─── Rank Badge ────────────────────────────────────────────────────────────────
const RANK_COLORS = [
  'from-yellow-400 to-amber-500 text-black',
  'from-gray-300 to-gray-400 text-black',
  'from-amber-700 to-amber-600 text-white',
  'from-blue-500 to-blue-600 text-white',
  'from-purple-500 to-purple-600 text-white',
];
function RankBadge({ rank }: { rank: number }) {
  const cls = RANK_COLORS[rank - 1] || 'from-slate-600 to-slate-700 text-white';
  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${cls} flex items-center justify-center text-xs font-black shadow-lg`}>
      {rank === 1 ? <Trophy className="w-4 h-4" /> : `#${rank}`}
    </div>
  );
}

// ─── Filter Chip ───────────────────────────────────────────────────────────────
function FilterChip({
  label, selected, onClick
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
        selected
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
          : 'bg-[#0B0E14] text-gray-400 hover:text-white border border-[#1E2638] hover:border-gray-500'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function RecommendationsPage() {
  const [capType, setCapType]     = useState<string>('');
  const [sector, setSector]       = useState<string>('');
  const [horizon, setHorizon]     = useState<string>('medium');
  const [exchange, setExchange]   = useState<string>('');
  const [minRoe, setMinRoe]       = useState<string>('');
  const [maxPe, setMaxPe]         = useState<string>('');
  const [topN, setTopN]           = useState<number>(5);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<RecommendationResponse | null>(null);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (capType)  params.set('cap_type', capType);
      if (sector)   params.set('sector', sector);
      if (horizon)  params.set('horizon', horizon);
      if (exchange) params.set('exchange', exchange);
      if (minRoe)   params.set('min_roe', minRoe);
      if (maxPe)    params.set('max_pe', maxPe);
      params.set('top_n', String(topN));

      const data = await fetchApi<RecommendationResponse>(`/recommendations?${params.toString()}`);
      setResult(data);
      setExpanded(data.recommendations[0]?.ticker ?? null);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }, [capType, sector, horizon, exchange, minRoe, maxPe, topN]);

  const formatCap = (v: number) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L Cr`;
    if (v >= 1000)   return `₹${(v / 1000).toFixed(1)}K Cr`;
    return `₹${v.toFixed(0)} Cr`;
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[#131822] to-[#0d1420] border border-[#1E2638] rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              AI Stock Screener & Recommender
            </h1>
            <p className="text-xs text-gray-400 max-w-lg">
              Define your investment preferences — cap size, sector, time horizon — and our scoring engine
              ranks the top stocks across growth, quality, value, and momentum dimensions.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <Target className="w-4 h-4 text-blue-400" />
            <span>Multi-factor scoring model</span>
          </div>
        </div>
      </div>

      {/* ── Filters Panel ── */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-5 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <SlidersHorizontal className="w-4 h-4 text-blue-400" />
          Investment Preferences
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Cap Size */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-medium">Market Cap</label>
            <div className="flex flex-wrap gap-2">
              {['', 'small', 'mid', 'large'].map((c) => (
                <FilterChip key={c || 'all'} label={c ? c.charAt(0).toUpperCase() + c.slice(1) + ' Cap' : 'Any'} selected={capType === c} onClick={() => setCapType(c)} />
              ))}
            </div>
          </div>

          {/* Sector */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-medium">Sector</label>
            <div className="flex flex-wrap gap-2">
              {['', 'Technology', 'Financial Services', 'Energy', 'Telecom'].map((s) => (
                <FilterChip key={s || 'all'} label={s || 'Any'} selected={sector === s} onClick={() => setSector(s)} />
              ))}
            </div>
          </div>

          {/* Exchange */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-medium">Exchange</label>
            <div className="flex flex-wrap gap-2">
              {['', 'NSE', 'NASDAQ', 'NYSE'].map((ex) => (
                <FilterChip key={ex || 'all'} label={ex || 'All'} selected={exchange === ex} onClick={() => setExchange(ex)} />
              ))}
            </div>
          </div>

          {/* Horizon */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-medium">Investment Horizon</label>
            <div className="flex flex-wrap gap-2">
              {[
                { v: 'short',  l: 'Short < 1yr' },
                { v: 'medium', l: 'Medium 1–3yr' },
                { v: 'long',   l: 'Long 3yr+' },
              ].map(({ v, l }) => (
                <FilterChip key={v} label={l} selected={horizon === v} onClick={() => setHorizon(v)} />
              ))}
            </div>
          </div>

          {/* Hard Filters */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-medium">Hard Filters</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 mb-1 block">Min ROE %</label>
                <input
                  type="number" value={minRoe} onChange={(e) => setMinRoe(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full bg-[#0B0E14] border border-[#1E2638] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 mb-1 block">Max P/E</label>
                <input
                  type="number" value={maxPe} onChange={(e) => setMaxPe(e.target.value)}
                  placeholder="e.g. 35"
                  className="w-full bg-[#0B0E14] border border-[#1E2638] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Top N + Run */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-medium">Top Picks</label>
            <div className="flex items-end gap-3">
              <div className="flex gap-1.5">
                {[3, 5, 7, 10].map((n) => (
                  <FilterChip key={n} label={`Top ${n}`} selected={topN === n} onClick={() => setTopN(n)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Run Button */}
        <button
          onClick={run} disabled={loading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-sm font-bold
            hover:from-emerald-500 hover:to-blue-500 transition-all shadow-lg shadow-emerald-900/30
            disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Screening universe…</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate Recommendations</>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-rose-900/20 border border-rose-700/40 rounded-xl p-4 text-rose-400 text-xs">{error}</div>
      )}

      {/* ── Results ── */}
      {result && (
        <div className="space-y-4">
          {/* Meta bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">
                Screened <span className="text-white font-bold">{result.total_screened}</span> stocks
                · Found <span className="text-emerald-400 font-bold">{result.matches_found}</span> matches
                · Showing top <span className="text-blue-400 font-bold">{result.recommendations.length}</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              {Object.entries(result.horizon_weights).map(([k, v]) => (
                <span key={k} className="capitalize">
                  {k}: <span className="text-gray-300 font-semibold">{(v * 100).toFixed(0)}%</span>
                </span>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {result.recommendations.map((rec) => {
              const isOpen = expanded === rec.ticker;
              const pct52 = rec.high_52w > rec.low_52w
                ? ((rec.current_price - rec.low_52w) / (rec.high_52w - rec.low_52w)) * 100
                : 50;

              return (
                <div
                  key={rec.ticker}
                  className={`bg-[#131822] border rounded-2xl overflow-hidden transition-all ${
                    isOpen ? 'border-blue-500/50 shadow-lg shadow-blue-900/20' : 'border-[#1E2638]'
                  }`}
                >
                  {/* Card Header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : rec.ticker)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                  >
                    <RankBadge rank={rec.rank} />
                    <ScoreRing score={rec.scores.composite} />

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-white">{rec.ticker}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E2638] text-gray-400">{rec.exchange}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300">{rec.sector}</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{rec.name}</p>
                    </div>

                    <div className="hidden md:block text-right">
                      <div className="text-sm font-bold text-white">
                        {rec.currency === 'USD' ? '$' : '₹'}{rec.current_price?.toLocaleString()}
                      </div>
                      <div className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${rec.change_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {rec.change_percent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(rec.change_percent).toFixed(2)}%
                      </div>
                    </div>

                    <div className="hidden lg:block text-right">
                      <div className="text-xs text-gray-500">Mkt Cap</div>
                      <div className="text-xs font-bold text-white">{formatCap(rec.market_cap_cr)}</div>
                    </div>

                    <div className="hidden lg:grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
                      <span className="text-gray-500">P/E</span><span className="text-white font-semibold text-right">{rec.pe_ratio?.toFixed(1)}x</span>
                      <span className="text-gray-500">ROE</span><span className="text-emerald-400 font-semibold text-right">{rec.scores.roe.toFixed(1)}%</span>
                    </div>

                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Expanded Details */}
                  {isOpen && (
                    <div className="border-t border-[#1E2638] p-5 space-y-5">
                      {/* Score Bars */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ScoreBar label="Growth"   value={rec.scores.growth_score}   icon={<TrendingUp  className="w-3 h-3 text-blue-400" />} />
                        <ScoreBar label="Quality"  value={rec.scores.quality_score}  icon={<Shield      className="w-3 h-3 text-emerald-400" />} />
                        <ScoreBar label="Value"    value={rec.scores.value_score}    icon={<Star        className="w-3 h-3 text-amber-400" />} />
                        <ScoreBar label="Momentum" value={rec.scores.momentum_score} icon={<Zap         className="w-3 h-3 text-purple-400" />} />
                      </div>

                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {[
                          { l: 'Rev CAGR 3Y',   v: `${rec.scores.rev_3y_cagr.toFixed(1)}%`,   c: 'text-emerald-400' },
                          { l: 'PAT CAGR 3Y',   v: `${rec.scores.pat_3y_cagr.toFixed(1)}%`,   c: 'text-blue-400' },
                          { l: 'EBITDA Margin', v: `${rec.scores.ebitda_margin.toFixed(1)}%`,  c: 'text-purple-400' },
                          { l: 'ROE',           v: `${rec.scores.roe.toFixed(1)}%`,            c: 'text-amber-400' },
                          { l: 'P/E Ratio',     v: `${rec.scores.pe_ratio?.toFixed(1)}x`,      c: 'text-white' },
                          { l: 'Dividend Yield',v: `${(rec.div_yield ?? 0).toFixed(2)}%`,      c: 'text-rose-400' },
                        ].map(({ l, v, c }) => (
                          <div key={l} className="bg-[#0B0E14] rounded-xl p-3 text-center border border-[#1E2638]">
                            <div className={`text-sm font-bold ${c}`}>{v}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{l}</div>
                          </div>
                        ))}
                      </div>

                      {/* 52W Range */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-gray-500">
                          <span>52W Low: {rec.currency === 'USD' ? '$' : '₹'}{rec.low_52w?.toLocaleString()}</span>
                          <span className="text-white font-semibold">Current: {rec.currency === 'USD' ? '$' : '₹'}{rec.current_price?.toLocaleString()}</span>
                          <span>52W High: {rec.currency === 'USD' ? '$' : '₹'}{rec.high_52w?.toLocaleString()}</span>
                        </div>
                        <div className="relative h-2 bg-[#1E2638] rounded-full">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500"
                            style={{ width: `${Math.min(100, Math.max(0, pct52))}%`, transition: 'width 0.6s ease' }}
                          />
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-blue-400 shadow-lg"
                            style={{ left: `calc(${Math.min(100, Math.max(0, pct52))}% - 6px)` }}
                          />
                        </div>
                      </div>

                      {/* Rationale */}
                      <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-gray-300">Why recommended:</div>
                        <div className="grid gap-1.5">
                          {rec.rationale.map((r, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                              <span className="text-emerald-500 mt-0.5">✓</span>
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex gap-2">
                        <a
                          href={`/stock/${rec.ticker}`}
                          className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
                        >
                          <BarChart3 className="w-3.5 h-3.5" /> Full Analysis
                        </a>
                        <a
                          href={`/compare?a=${rec.ticker}`}
                          className="flex-1 py-2 rounded-xl bg-[#1E2638] hover:bg-[#253048] text-gray-300 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                        >
                          Compare
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-20 text-gray-500">
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-gray-700" />
          <p className="text-sm">Set your preferences above and click <span className="text-emerald-400 font-semibold">Generate Recommendations</span></p>
          <p className="text-xs mt-1 text-gray-600">Our scoring engine will rank the best stocks for your investment style.</p>
        </div>
      )}
    </div>
  );
}
