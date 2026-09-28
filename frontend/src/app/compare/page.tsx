'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import {
  GitCompareArrows, Search, TrendingUp, BarChart3, Shield, Trophy,
  ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle, XCircle, Minus, ChevronDown
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StockMeta {
  ticker: string; name: string; sector: string; industry: string;
  exchange: string; currency: string; market_cap_cr: number;
  current_price: number; change_percent: number;
  high_52w: number; low_52w: number; last_updated: string;
  pe_ratio: number; pb_ratio: number; ev_ebitda: number; dividend_yield: number;
  rev_3y_cagr: number; rev_5y_cagr: number;
  pat_3y_cagr: number; pat_5y_cagr: number;
  eps_3y_cagr: number; ebitda_3y_cagr: number;
  revenue_latest: number; pat_latest: number; eps_latest: number;
  ebitda_margin: number; pat_margin: number; roe: number; roce: number;
  debt_equity: number; net_debt: number; net_debt_ebitda: number;
  free_cash_flow: number; fcf_margin: number; fcf_yield: number;
  revenue_history: [string, number][]; pat_history: [string, number][];
}

interface ComparisonRow {
  metric: string; a: number; b: number; winner: 'a' | 'b' | 'tie'; description: string;
}

interface CompareResponse {
  stock_a: StockMeta; stock_b: StockMeta;
  comparison: {
    valuation: ComparisonRow[]; growth: ComparisonRow[];
    profitability: ComparisonRow[]; leverage: ComparisonRow[]; cash_flow: ComparisonRow[];
  };
  scorecard: { wins_a: number; wins_b: number; ties: number; total_metrics: number; overall_winner: string };
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: [string, number][]; color: string }) {
  if (!data || data.length < 2) return null;
  const values = data.map(([, v]) => v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const w = 120; const h = 32;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / Math.max(1, max - min)) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((values[values.length - 1] - min) / Math.max(1, max - min)) * h} r="2.5" fill={color} />
    </svg>
  );
}

// ─── Metric Row ───────────────────────────────────────────────────────────────
function MetricRow({
  row, colorA, colorB, suffix = '', inverse = false
}: { row: ComparisonRow; colorA: string; colorB: string; suffix?: string; inverse?: boolean }) {
  const winA = row.winner === 'a';
  const winB = row.winner === 'b';
  const isTie = row.winner === 'tie';

  const fmt = (v: number) => {
    if (Math.abs(v) >= 100000) return (v / 100000).toFixed(1) + 'L';
    if (Math.abs(v) >= 1000)   return (v / 1000).toFixed(1) + 'K';
    return v.toFixed(2);
  };

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2 border-b border-[#1E2638] last:border-0 group hover:bg-white/2 rounded transition">
      {/* Stock A value */}
      <div className="flex items-center justify-end gap-2">
        {winA && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
        <span className={`text-sm font-bold ${winA ? 'text-emerald-400' : 'text-gray-300'}`}>
          {fmt(row.a)}{suffix}
        </span>
      </div>

      {/* Metric label */}
      <div className="text-center px-3">
        <div className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{row.metric}</div>
        <div className="flex justify-center mt-0.5">
          {isTie ? (
            <Minus className="w-3 h-3 text-gray-600" />
          ) : winA ? (
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorA}`} />
          ) : (
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorB}`} />
          )}
        </div>
      </div>

      {/* Stock B value */}
      <div className="flex items-center justify-start gap-2">
        <span className={`text-sm font-bold ${winB ? 'text-blue-400' : 'text-gray-300'}`}>
          {fmt(row.b)}{suffix}
        </span>
        {winB && <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
      </div>
    </div>
  );
}

// ─── Section Panel ────────────────────────────────────────────────────────────
function SectionPanel({
  title, icon, rows, colorA, colorB, suffix
}: { title: string; icon: React.ReactNode; rows: ComparisonRow[]; colorA: string; colorB: string; suffix?: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-[#131822] border border-[#1E2638] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-white">{icon} {title}</div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4">
          {rows.map((r) => <MetricRow key={r.metric} row={r} colorA={colorA} colorB={colorB} suffix={suffix} />)}
        </div>
      )}
    </div>
  );
}

// ─── Stock Header Card ─────────────────────────────────────────────────────────
function StockCard({ data, wins, total, side, colorClass }: {
  data: StockMeta; wins: number; total: number; side: 'A' | 'B'; colorClass: string;
}) {
  const isPositive = data.change_percent >= 0;
  const pct52 = data.high_52w > data.low_52w
    ? ((data.current_price - data.low_52w) / (data.high_52w - data.low_52w)) * 100 : 50;
  const sym = data.currency === 'USD' ? '$' : '₹';
  const winPct = Math.round((wins / total) * 100);

  return (
    <div className={`bg-[#131822] border-2 rounded-2xl p-5 space-y-4 transition-all ${colorClass}`}>
      {/* Identity */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-black text-white">{data.ticker}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E2638] text-gray-400">{data.exchange}</span>
          </div>
          <p className="text-xs text-gray-400">{data.name}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">{data.sector} · {data.industry}</p>
        </div>
        {/* Win badge */}
        <div className="text-center flex-shrink-0">
          <div className="text-2xl font-black text-white">{wins}</div>
          <div className="text-[10px] text-gray-500">wins</div>
          <div className="h-1 w-12 bg-[#1E2638] rounded-full mt-1 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${winPct}%` }} />
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-end gap-3">
        <span className="text-3xl font-black text-white">{sym}{data.current_price?.toLocaleString()}</span>
        <span className={`text-sm font-bold flex items-center gap-0.5 mb-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(data.change_percent).toFixed(2)}%
        </span>
      </div>

      {/* 52w bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>{sym}{data.low_52w?.toLocaleString()}</span>
          <span>52-Week Range</span>
          <span>{sym}{data.high_52w?.toLocaleString()}</span>
        </div>
        <div className="relative h-1.5 bg-[#1E2638] rounded-full">
          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500"
            style={{ width: `${Math.min(100, Math.max(0, pct52))}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full border border-blue-400 shadow"
            style={{ left: `calc(${Math.min(100, Math.max(0, pct52))}% - 5px)` }} />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { l: 'P/E', v: `${data.pe_ratio?.toFixed(1)}x` },
          { l: 'P/B', v: `${data.pb_ratio?.toFixed(1)}x` },
          { l: 'ROE', v: `${data.roe?.toFixed(1)}%` },
          { l: 'EBITDA Margin', v: `${data.ebitda_margin?.toFixed(1)}%` },
        ].map(({ l, v }) => (
          <div key={l} className="bg-[#0B0E14] rounded-xl p-2 border border-[#1E2638]">
            <div className="text-xs font-bold text-white">{v}</div>
            <div className="text-[10px] text-gray-500">{l}</div>
          </div>
        ))}
      </div>

      {/* Revenue sparkline */}
      <div className="space-y-1">
        <div className="text-[10px] text-gray-500">Revenue Trend (10Y)</div>
        <Sparkline data={data.revenue_history} color={side === 'A' ? '#10b981' : '#3b82f6'} />
      </div>
    </div>
  );
}

// ─── Search Input ─────────────────────────────────────────────────────────────
function TickerInput({
  value, onChange, placeholder, onEnter
}: { value: string; onChange: (v: string) => void; placeholder: string; onEnter: () => void }) {
  return (
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        placeholder={placeholder}
        className="w-full bg-[#0B0E14] border border-[#1E2638] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white
          placeholder-gray-600 focus:outline-none focus:border-blue-500 uppercase font-mono tracking-widest"
      />
    </div>
  );
}

// ─── Inner content (uses useSearchParams) ─────────────────────────────────────
function CompareInner() {
  const searchParams = useSearchParams();
  const [tickerA, setTickerA] = useState(searchParams.get('a') || 'TCS');
  const [tickerB, setTickerB] = useState(searchParams.get('b') || 'INFY');
  const [result, setResult]   = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!tickerA || !tickerB) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi<CompareResponse>(`/compare/${tickerA}/vs/${tickerB}`);
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Failed to compare stocks');
    } finally {
      setLoading(false);
    }
  }, [tickerA, tickerB]);

  // auto-load if URL params provided
  useEffect(() => {
    if (searchParams.get('a')) run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const QUICK_PAIRS = [
    ['TCS', 'INFY'], ['HDFCBANK', 'ICICIBANK'], ['RELIANCE', 'BHARTIARTL'],
    ['AAPL', 'MSFT'], ['MSFT', 'NVDA'], ['JPM', 'GS'],
  ];

  const colorA = 'border-emerald-500/60';
  const colorB = 'border-blue-500/60';

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[#131822] to-[#0d1420] border border-[#1E2638] rounded-2xl p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <GitCompareArrows className="w-5 h-5 text-purple-400" />
          Stock Comparison — Side-by-Side Fundamentals
        </h1>
        <p className="text-xs text-gray-400">
          Compare two stocks across valuation, growth, profitability, leverage, and cash flow metrics.
        </p>
      </div>

      {/* ── Inputs ── */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <TickerInput value={tickerA} onChange={setTickerA} placeholder="Stock A (e.g. TCS)" onEnter={run} />
          <div className="text-gray-500 font-bold text-sm flex-shrink-0">vs</div>
          <TickerInput value={tickerB} onChange={setTickerB} placeholder="Stock B (e.g. INFY)" onEnter={run} />
          <button
            onClick={run} disabled={loading}
            className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600
              text-white text-sm font-bold hover:from-purple-500 hover:to-blue-500 transition-all
              disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitCompareArrows className="w-4 h-4" />}
            Compare
          </button>
        </div>

        {/* Quick pairs */}
        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] text-gray-600 self-center">Quick pairs:</span>
          {QUICK_PAIRS.map(([a, b]) => (
            <button
              key={`${a}-${b}`}
              onClick={() => { setTickerA(a); setTickerB(b); }}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#0B0E14] border border-[#1E2638] text-gray-400 hover:text-white hover:border-gray-500 transition"
            >
              {a} / {b}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-900/20 border border-rose-700/40 rounded-xl p-4 text-rose-400 text-xs">{error}</div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Fetching fundamentals…</span>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-5">
          {/* ── Scorecard Banner ── */}
          <div className="bg-gradient-to-r from-emerald-900/30 via-[#131822] to-blue-900/30 border border-[#1E2638] rounded-2xl p-5">
            <div className="grid grid-cols-3 items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-emerald-400">{result.scorecard.wins_a}</div>
                <div className="text-xs text-gray-400">{result.stock_a.ticker} wins</div>
                <div className="text-[10px] text-gray-600 mt-0.5">
                  ({Math.round((result.scorecard.wins_a / result.scorecard.total_metrics) * 100)}%)
                </div>
              </div>
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="text-base font-black text-white">
                    {result.scorecard.overall_winner === 'tie'
                      ? 'Tied!'
                      : `${result.scorecard.overall_winner} Wins`}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500">
                  {result.scorecard.total_metrics} metrics · {result.scorecard.ties} ties
                </div>
                {/* Progress bar */}
                <div className="h-2 bg-[#1E2638] rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(result.scorecard.wins_a / result.scorecard.total_metrics) * 100}%` }}
                  />
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${(result.scorecard.wins_b / result.scorecard.total_metrics) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-blue-400">{result.scorecard.wins_b}</div>
                <div className="text-xs text-gray-400">{result.stock_b.ticker} wins</div>
                <div className="text-[10px] text-gray-600 mt-0.5">
                  ({Math.round((result.scorecard.wins_b / result.scorecard.total_metrics) * 100)}%)
                </div>
              </div>
            </div>
          </div>

          {/* ── Stock Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StockCard data={result.stock_a} wins={result.scorecard.wins_a} total={result.scorecard.total_metrics} side="A" colorClass={colorA} />
            <StockCard data={result.stock_b} wins={result.scorecard.wins_b} total={result.scorecard.total_metrics} side="B" colorClass={colorB} />
          </div>

          {/* ── Section label row ── */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-400">{result.stock_a.ticker}</span>
            </div>
            <span className="text-xs text-gray-500">Metric</span>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs font-bold text-blue-400">{result.stock_b.ticker}</span>
              <div className="w-3 h-3 rounded-full bg-blue-500" />
            </div>
          </div>

          {/* ── Comparison Sections ── */}
          <SectionPanel
            title="Valuation"
            icon={<BarChart3 className="w-4 h-4 text-amber-400" />}
            rows={result.comparison.valuation}
            colorA="from-emerald-500 to-emerald-600"
            colorB="from-blue-500 to-blue-600"
            suffix="x"
          />
          <SectionPanel
            title="Growth Rates"
            icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
            rows={result.comparison.growth}
            colorA="from-emerald-500 to-emerald-600"
            colorB="from-blue-500 to-blue-600"
            suffix="%"
          />
          <SectionPanel
            title="Profitability"
            icon={<Shield className="w-4 h-4 text-purple-400" />}
            rows={result.comparison.profitability}
            colorA="from-emerald-500 to-emerald-600"
            colorB="from-blue-500 to-blue-600"
            suffix="%"
          />
          <SectionPanel
            title="Leverage & Debt"
            icon={<XCircle className="w-4 h-4 text-rose-400" />}
            rows={result.comparison.leverage}
            colorA="from-emerald-500 to-emerald-600"
            colorB="from-blue-500 to-blue-600"
          />
          <SectionPanel
            title="Cash Flow"
            icon={<CheckCircle className="w-4 h-4 text-emerald-400" />}
            rows={result.comparison.cash_flow}
            colorA="from-emerald-500 to-emerald-600"
            colorB="from-blue-500 to-blue-600"
            suffix="%"
          />

          {/* ── Detailed Stats Grid ── */}
          <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Detailed Financial Snapshot</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1E2638]">
                    <th className="text-left text-gray-500 pb-2 font-medium">Metric</th>
                    <th className="text-center text-emerald-400 pb-2 font-bold">{result.stock_a.ticker}</th>
                    <th className="text-center text-blue-400 pb-2 font-bold">{result.stock_b.ticker}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2638]">
                  {[
                    { l: 'Latest Revenue', a: result.stock_a.revenue_latest, b: result.stock_b.revenue_latest, sfx: ' Cr' },
                    { l: 'Latest PAT', a: result.stock_a.pat_latest, b: result.stock_b.pat_latest, sfx: ' Cr' },
                    { l: 'Latest EPS', a: result.stock_a.eps_latest, b: result.stock_b.eps_latest, sfx: '' },
                    { l: 'Market Cap', a: result.stock_a.market_cap_cr, b: result.stock_b.market_cap_cr, sfx: ' Cr' },
                    { l: 'ROE %', a: result.stock_a.roe, b: result.stock_b.roe, sfx: '%' },
                    { l: 'ROCE %', a: result.stock_a.roce, b: result.stock_b.roce, sfx: '%' },
                    { l: 'EBITDA Margin %', a: result.stock_a.ebitda_margin, b: result.stock_b.ebitda_margin, sfx: '%' },
                    { l: 'PAT Margin %', a: result.stock_a.pat_margin, b: result.stock_b.pat_margin, sfx: '%' },
                    { l: 'Debt / Equity', a: result.stock_a.debt_equity, b: result.stock_b.debt_equity, sfx: 'x' },
                    { l: 'Net Debt/EBITDA', a: result.stock_a.net_debt_ebitda, b: result.stock_b.net_debt_ebitda, sfx: 'x' },
                    { l: 'FCF Margin %', a: result.stock_a.fcf_margin, b: result.stock_b.fcf_margin, sfx: '%' },
                    { l: 'Dividend Yield %', a: result.stock_a.dividend_yield, b: result.stock_b.dividend_yield, sfx: '%' },
                  ].map(({ l, a, b, sfx }) => {
                    const fmt = (v: number) => {
                      if (Math.abs(v) >= 100000) return (v / 100000).toFixed(1) + 'L';
                      if (Math.abs(v) >= 1000)   return (v / 1000).toFixed(1) + 'K';
                      return v.toFixed(2);
                    };
                    return (
                      <tr key={l}>
                        <td className="py-2 text-gray-500">{l}</td>
                        <td className="py-2 text-center text-white font-semibold">{fmt(a)}{sfx}</td>
                        <td className="py-2 text-center text-white font-semibold">{fmt(b)}{sfx}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Full Analysis CTAs */}
          <div className="grid grid-cols-2 gap-3">
            <a href={`/stock/${result.stock_a.ticker}`}
              className="py-3 rounded-xl bg-emerald-600/20 border border-emerald-600/40 text-emerald-400 text-sm font-bold text-center hover:bg-emerald-600/30 transition flex items-center justify-center gap-1">
              <BarChart3 className="w-4 h-4" /> Deep Dive: {result.stock_a.ticker}
            </a>
            <a href={`/stock/${result.stock_b.ticker}`}
              className="py-3 rounded-xl bg-blue-600/20 border border-blue-600/40 text-blue-400 text-sm font-bold text-center hover:bg-blue-600/30 transition flex items-center justify-center gap-1">
              <BarChart3 className="w-4 h-4" /> Deep Dive: {result.stock_b.ticker}
            </a>
          </div>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="text-center py-20 text-gray-500">
          <GitCompareArrows className="w-10 h-10 mx-auto mb-3 text-gray-700" />
          <p className="text-sm">Enter two tickers and click <span className="text-purple-400 font-semibold">Compare</span></p>
          <p className="text-xs mt-1 text-gray-600">Side-by-side analysis across 15+ fundamental metrics.</p>
        </div>
      )}
    </div>
  );
}

// ─── Page (wraps Suspense for useSearchParams) ────────────────────────────────
export default function ComparePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500 text-sm">Loading…</div>}>
      <CompareInner />
    </Suspense>
  );
}
