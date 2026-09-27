'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Bell, Calendar, Newspaper, Star, ShieldCheck, Flame } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<any>('/dashboard')
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3" />
        Loading Market Dashboard...
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-gray-400">Failed to load market dashboard data.</div>;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131822] border border-[#1E2638] p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Professional Equity Research Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">Institutional fundamental analysis, 10-year financial metrics, DCF models, and RAG filings for Indian Equities.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/stock/RELIANCE" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-lg shadow-blue-500/20">
            Research RELIANCE
          </Link>
          <Link href="/stock/TCS" className="bg-[#1E2638] hover:bg-[#263248] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">
            Research TCS
          </Link>
        </div>
      </div>

      {/* Market Indices Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.indices.map((idx: any, i: number) => {
          const isPos = idx.change_pct >= 0;
          return (
            <div key={i} className="bg-[#131822] border border-[#1E2638] p-4 rounded-xl">
              <span className="text-xs text-gray-400 font-medium">{idx.name}</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-black text-white">{idx.value.toLocaleString('en-IN')}</span>
                <span className={`text-xs font-bold flex items-center ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                  {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {isPos ? `+${idx.change_pct}%` : `${idx.change_pct}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Gainers, Losers, 52W Highs/Lows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Gainers */}
        <div className="bg-[#131822] border border-[#1E2638] p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-green-400" /> Top Gainers Today
          </h3>
          <div className="space-y-2">
            {data.top_gainers.map((st: any) => (
              <Link key={st.ticker} href={`/stock/${st.ticker}`} className="flex items-center justify-between p-2.5 bg-[#0B0E14] hover:bg-[#1E2638] rounded-xl text-xs transition-colors">
                <div>
                  <div className="font-bold text-white">{st.ticker}</div>
                  <div className="text-[11px] text-gray-400">{st.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">₹{st.price}</div>
                  <div className="text-green-400 font-bold">+{st.change_pct}%</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-[#131822] border border-[#1E2638] p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-400 rotate-180" /> Top Losers Today
          </h3>
          <div className="space-y-2">
            {data.top_losers.map((st: any) => (
              <Link key={st.ticker} href={`/stock/${st.ticker}`} className="flex items-center justify-between p-2.5 bg-[#0B0E14] hover:bg-[#1E2638] rounded-xl text-xs transition-colors">
                <div>
                  <div className="font-bold text-white">{st.ticker}</div>
                  <div className="text-[11px] text-gray-400">{st.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">₹{st.price}</div>
                  <div className="text-red-400 font-bold">{st.change_pct}%</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 52-Week Highs */}
        <div className="bg-[#131822] border border-[#1E2638] p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" /> Hitting 52-Week Highs
          </h3>
          <div className="space-y-2">
            {data.high_52w.map((st: any) => (
              <Link key={st.ticker} href={`/stock/${st.ticker}`} className="flex items-center justify-between p-2.5 bg-[#0B0E14] hover:bg-[#1E2638] rounded-xl text-xs transition-colors">
                <div>
                  <div className="font-bold text-white">{st.ticker}</div>
                  <div className="text-[11px] text-gray-400">P/E: {st.pe_ratio}x</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">₹{st.price}</div>
                  <div className="text-amber-400 font-bold text-[10px] bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">52W High</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Watchlist & Portfolio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Watchlist */}
        <div className="bg-[#131822] border border-[#1E2638] p-6 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-4">Core Indian Equities Coverage Watchlist</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E2638] text-gray-400">
                  <th className="py-2.5 px-3">Ticker</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Change</th>
                  <th className="py-2.5 px-3 text-right">P/E</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2638]/50 text-gray-300">
                {data.watchlist.map((w: any) => (
                  <tr key={w.ticker} className="hover:bg-[#1E2638]/40">
                    <td className="py-2.5 px-3">
                      <Link href={`/stock/${w.ticker}`} className="font-bold text-white hover:text-blue-400">
                        {w.ticker} <span className="text-gray-400 font-normal text-[11px]">({w.name})</span>
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold">₹{w.price}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${w.change_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {w.change_pct >= 0 ? `+${w.change_pct}%` : `${w.change_pct}%`}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-400">{w.pe_ratio}x</td>
                    <td className="py-2.5 px-3 text-right">
                      <Link href={`/stock/${w.ticker}`} className="text-blue-400 hover:text-blue-300 font-medium text-[11px]">
                        Research →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Corporate Actions & Earnings Calendar */}
        <div className="bg-[#131822] border border-[#1E2638] p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" /> Recent Corporate Actions & Dividends
            </h3>
            <div className="space-y-2">
              {data.corporate_actions.map((act: any, idx: number) => (
                <div key={idx} className="bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638] text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-blue-400 mr-2">{act.ticker}</span>
                    <span className="text-gray-300">{act.action}</span>
                  </div>
                  <span className="text-gray-500 font-mono text-[11px]">{act.ex_date || act.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Alerts */}
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" /> Active Valuation & Signal Alerts
            </h3>
            <div className="space-y-2">
              {data.alerts.map((alt: any) => (
                <div key={alt.id} className="bg-amber-950/30 p-3 rounded-xl border border-amber-800/40 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-amber-300 mr-2">{alt.ticker}</span>
                    <span className="text-gray-200">{alt.condition}</span>
                  </div>
                  <span className="text-[10px] bg-amber-900 text-amber-200 px-2 py-0.5 rounded font-bold uppercase">{alt.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
