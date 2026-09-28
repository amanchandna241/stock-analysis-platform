'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import {
  Sparkles, Star, TrendingUp, ShieldCheck, Award, ArrowLeft, ArrowUpRight,
  Info, CheckCircle2, User, Building2, Calendar, FileText, AlertTriangle, ArrowRight
} from 'lucide-react';

export default function MutualFundDetailPage() {
  const params = useParams();
  const schemeCode = params.scheme_code as string;

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<string>('3Y');
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetchApi<any>(`/mutual-funds/${schemeCode}`)
      .then((res) => {
        setDetail(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch scheme details:', err);
        setLoading(false);
      });
  }, [schemeCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm">
        <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mr-3" />
        Loading Scheme Analytics & Historical NAV for Code {schemeCode}...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-12 text-gray-400 space-y-4">
        <p>Mutual Fund scheme code '{schemeCode}' not found.</p>
        <Link href="/mutual-funds" className="bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold inline-block">
          Return to Mutual Funds Explorer
        </Link>
      </div>
    );
  }

  const { overview } = detail;
  const isPositive = overview.change_percent >= 0;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link href="/mutual-funds" className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Mutual Funds Explorer
        </Link>
      </div>

      {/* Scheme Header Card */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs bg-blue-950 text-blue-300 border border-blue-800/50 px-2.5 py-0.5 rounded-full font-bold">
                {overview.sub_category}
              </span>
              <span className="text-xs bg-[#1E2638] text-gray-300 px-2 py-0.5 rounded font-mono">
                AMFI: {overview.scheme_code}
              </span>
              <div className="flex items-center text-amber-400">
                {[...Array(overview.star_rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2.5 py-0.5 rounded-full font-bold">
                Recommendation: {overview.recommendation}
              </span>
            </div>

            <h1 className="text-2xl font-black text-white mb-1">{overview.scheme_name}</h1>
            <p className="text-xs text-gray-400 mb-4 flex items-center gap-4">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-blue-400" /> {overview.fund_house}</span>
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-purple-400" /> Manager: {detail.fund_manager}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-500" /> Inception: {detail.inception_date}</span>
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="text-gray-400">Category Rank: <strong className="text-amber-400">{detail.category_rank}</strong></span>
              <span className="text-gray-400">Riskometer: <strong className="text-red-400">{overview.risk_rating}</strong></span>
              <span className="text-gray-400">Min SIP: <strong className="text-white">₹{overview.min_sip_amount}</strong></span>
            </div>
          </div>

          {/* Price & AUM Box */}
          <div className="lg:text-right shrink-0 bg-[#0B0E14] p-5 rounded-2xl border border-[#1E2638]">
            <div className="text-xs text-gray-400 mb-1">NAV Date: {overview.nav_date}</div>
            <div className="flex items-baseline lg:justify-end gap-2 mb-1">
              <span className="text-3xl font-black text-white">₹{overview.nav}</span>
              <div className={`flex items-center text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{overview.change_amount} ({overview.change_percent}%)
              </div>
            </div>

            <div className="text-xs text-gray-400 flex items-center lg:justify-end gap-4 mt-2 pt-2 border-t border-[#1E2638]">
              <div>
                <span className="text-gray-500">Fund AUM:</span>{' '}
                <span className="font-bold text-white">₹{overview.aum_cr.toLocaleString('en-IN')} Cr</span>
              </div>
              <div>
                <span className="text-gray-500">Expense Ratio:</span>{' '}
                <span className="font-bold text-white">{overview.expense_ratio}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Return Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#131822] p-5 rounded-2xl border border-[#1E2638]">
          <span className="text-xs text-gray-400">1-Year Annual Return</span>
          <div className="text-3xl font-black text-green-400 mt-1">+{overview.return_1y}%</div>
          <span className="text-[11px] text-gray-500 block mt-1">Abs. Trailing 1Y Growth</span>
        </div>

        <div className="bg-[#131822] p-5 rounded-2xl border border-[#1E2638]">
          <span className="text-xs text-gray-400">3-Year CAGR Return</span>
          <div className="text-3xl font-black text-amber-400 mt-1">+{overview.return_3y_cagr}%</div>
          <span className="text-[11px] text-gray-500 block mt-1">Annualized 3Y Compounded</span>
        </div>

        <div className="bg-[#131822] p-5 rounded-2xl border border-[#1E2638]">
          <span className="text-xs text-gray-400">5-Year CAGR Return</span>
          <div className="text-3xl font-black text-emerald-400 mt-1">+{overview.return_5y_cagr}%</div>
          <span className="text-[11px] text-gray-500 block mt-1">Annualized 5Y Compounded</span>
        </div>
      </div>

      {/* Historical NAV Performance Chart */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Historical NAV Trajectory & Benchmark Comparison</h3>
            <p className="text-xs text-gray-400">Grounded historical NAV curve with benchmark index overlay.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#0B0E14] p-1 rounded-xl border border-[#1E2638]">
              {['1D', '3D', '5D', '1M', '6M', '1Y', '3Y', '5Y', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                    timeframe === tf ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowBenchmark(!showBenchmark)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                showBenchmark ? 'bg-amber-950/60 text-amber-400 border-amber-800/50' : 'bg-[#0B0E14] text-gray-400 border-[#1E2638]'
              }`}
            >
              Overlay Benchmark Index
            </button>
          </div>
        </div>

        {(() => {
          const getFilteredNavHistory = () => {
            if (!detail?.nav_history || detail.nav_history.length === 0) return [];
            switch (timeframe) {
              case '1D': return detail.nav_history.slice(-2);
              case '3D': return detail.nav_history.slice(-5);
              case '5D': return detail.nav_history.slice(-10);
              case '1M': return detail.nav_history.slice(-25);
              case '6M': return detail.nav_history.slice(-120);
              case '1Y': return detail.nav_history.slice(-250);
              case '3Y': return detail.nav_history.slice(-750);
              case '5Y': return detail.nav_history.slice(-1250);
              case 'ALL':
              default:
                return detail.nav_history;
            }
          };
          const navData = getFilteredNavHistory();
          const navInterval = Math.max(0, Math.floor(navData.length / 8));

          return (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={navData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
                  <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 10 }} interval={navInterval} />
                  <YAxis yAxisId="nav" stroke="#9CA3AF" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  {showBenchmark && <YAxis yAxisId="bench" orientation="right" stroke="#F59E0B" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />}
                  <Tooltip contentStyle={{ backgroundColor: '#131822', borderColor: '#1E2638', color: '#fff' }} />
                  <Legend />
                  <Line yAxisId="nav" type="monotone" dataKey="nav" name="Scheme NAV (₹)" stroke="#10B981" strokeWidth={2.5} dot={false} />
                  {showBenchmark && <Line yAxisId="bench" type="monotone" dataKey="benchmark_val" name="Category Benchmark" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })()}
      </div>

      {/* Quantitative Risk Ratios & Holdings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk & Alpha Metrics */}
        <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Quantitative Risk & Alpha Ratios
          </h4>

          <div className="space-y-3 text-xs">
            <div className="bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638] flex justify-between items-center">
              <span className="text-gray-400">Sharpe Ratio</span>
              <span className="font-bold text-amber-400 text-sm">{detail.sharpe_ratio}</span>
            </div>
            <div className="bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638] flex justify-between items-center">
              <span className="text-gray-400">Alpha (% excess return)</span>
              <span className="font-bold text-emerald-400 text-sm">+{detail.alpha}%</span>
            </div>
            <div className="bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638] flex justify-between items-center">
              <span className="text-gray-400">Portfolio Beta</span>
              <span className="font-bold text-white text-sm">{detail.beta}</span>
            </div>
            <div className="bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638] flex justify-between items-center">
              <span className="text-gray-400">Standard Deviation (Volatility)</span>
              <span className="font-bold text-gray-300 text-sm">{detail.std_dev}%</span>
            </div>
          </div>
        </div>

        {/* Top Holdings Table */}
        <div className="lg:col-span-2 bg-[#131822] border border-[#1E2638] rounded-2xl p-6 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-400" /> Top Portfolio Holdings & Allocation
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E2638] text-gray-400">
                  <th className="py-2.5 px-3">Company Name</th>
                  <th className="py-2.5 px-3">Sector</th>
                  <th className="py-2.5 px-3 text-right">Allocation %</th>
                  <th className="py-2.5 px-3 text-right">Research Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2638]/50 text-gray-300">
                {detail.top_holdings.map((h: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#1E2638]/40">
                    <td className="py-2.5 px-3 font-bold text-white">{h.company_name}</td>
                    <td className="py-2.5 px-3 text-gray-400">{h.sector}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">{h.allocation_pct}%</td>
                    <td className="py-2.5 px-3 text-right">
                      {h.ticker ? (
                        <Link href={`/stock/${h.ticker}`} className="text-blue-400 hover:text-blue-300 font-semibold flex items-center justify-end gap-1">
                          <span>Research Stock</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Recommendation & Suitability Analysis Card */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> AI Fund Recommendation & Suitability Analysis
          </h3>
          <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800/40 px-3 py-1 rounded-full font-bold">
            Quantitative Rationale
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Rationale */}
          <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638] space-y-2">
            <h4 className="font-bold text-amber-400 uppercase text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Core Investment Rationale
            </h4>
            <ul className="space-y-2 text-gray-300 list-disc list-inside">
              {detail.recommendation_thesis.map((point: string, idx: number) => (
                <li key={idx} className="leading-relaxed">{point}</li>
              ))}
            </ul>
          </div>

          {/* Investor profile */}
          <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638] space-y-2">
            <h4 className="font-bold text-blue-400 uppercase text-[11px] flex items-center gap-1.5">
              <User className="w-4 h-4" /> Who Should Invest?
            </h4>
            <ul className="space-y-2 text-gray-300 list-disc list-inside">
              {detail.who_should_invest.map((item: string, idx: number) => (
                <li key={idx} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tax Rules */}
        <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638] text-xs space-y-1">
          <h4 className="font-bold text-purple-400 uppercase text-[11px]">Taxation & Capital Gains Rules</h4>
          <p className="text-gray-300 leading-relaxed">{detail.tax_implications}</p>
        </div>
      </div>
    </div>
  );
}
