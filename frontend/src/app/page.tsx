'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Bell, Calendar, Star, Flame, Plus, X, RefreshCw, Trash2, Sliders } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Watchlist input states
  const [newWatchlistTicker, setNewWatchlistTicker] = useState('');
  const [addingWatchlist, setAddingWatchlist] = useState(false);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);

  // Custom Alert input states
  const [newAlertTicker, setNewAlertTicker] = useState('');
  const [newAlertCondition, setNewAlertCondition] = useState('');
  const [newAlertType, setNewAlertType] = useState('Valuation Opportunity');
  const [addingAlert, setAddingAlert] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const loadDashboard = async () => {
    try {
      const res = await fetchApi<any>('/dashboard');
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleAddWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = newWatchlistTicker.trim().toUpperCase();
    if (!ticker) return;

    if (data?.watchlist?.some((w: any) => w.ticker === ticker)) {
      setWatchlistError(`Ticker '${ticker}' is already in your watchlist.`);
      setTimeout(() => setWatchlistError(null), 3000);
      return;
    }

    setAddingWatchlist(true);
    try {
      await fetchApi<any>(`/dashboard/watchlist/add?ticker=${encodeURIComponent(ticker)}`, { method: 'POST' });
      setNewWatchlistTicker('');
      setWatchlistError(null);
      await loadDashboard();
    } catch (err) {
      setWatchlistError(`Failed to add ticker '${ticker}'. Verify ticker symbol.`);
      setTimeout(() => setWatchlistError(null), 4000);
    } finally {
      setAddingWatchlist(false);
    }
  };

  const handleRemoveWatchlist = async (ticker: string) => {
    try {
      await fetchApi<any>(`/dashboard/watchlist/remove?ticker=${encodeURIComponent(ticker)}`, { method: 'DELETE' });
      await loadDashboard();
    } catch (err) {
      console.error('Failed to remove ticker from watchlist:', err);
    }
  };

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = newAlertTicker.trim().toUpperCase();
    const condition = newAlertCondition.trim();
    if (!ticker || !condition) return;

    setAddingAlert(true);
    try {
      await fetchApi<any>(
        `/dashboard/alerts/add?ticker=${encodeURIComponent(ticker)}&condition=${encodeURIComponent(condition)}&alert_type=${encodeURIComponent(newAlertType)}`,
        { method: 'POST' }
      );
      setNewAlertTicker('');
      setNewAlertCondition('');
      setShowAlertModal(false);
      await loadDashboard();
    } catch (err) {
      console.error('Failed to create alert:', err);
    } finally {
      setAddingAlert(false);
    }
  };

  const handleRemoveAlert = async (alertId: string) => {
    try {
      await fetchApi<any>(`/dashboard/alerts/remove?alert_id=${encodeURIComponent(alertId)}`, { method: 'DELETE' });
      await loadDashboard();
    } catch (err) {
      console.error('Failed to remove alert:', err);
    }
  };

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
          <p className="text-xs text-gray-400 mt-1">Institutional fundamental analysis, 10-year financial metrics, DCF models, and dynamic watchlist tracking.</p>
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
                  <div className="font-bold text-white">{st.currency === 'USD' ? '$' : '₹'}{st.price}</div>
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
                  <div className="font-bold text-white">{st.currency === 'USD' ? '$' : '₹'}{st.price}</div>
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
                  <div className="font-bold text-white">{st.currency === 'USD' ? '$' : '₹'}{st.price}</div>
                  <div className="text-amber-400 font-bold text-[10px] bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">52W High</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Watchlist & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Watchlist Component */}
        <div className="bg-[#131822] border border-[#1E2638] p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2638] pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Dynamic Equities Watchlist
                <span className="text-xs bg-blue-950 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-800">
                  {data.watchlist?.length || 0} Stocks
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Customize your live market watchlist. Add any Indian (e.g. TATAMOTORS) or global ticker.</p>
            </div>

            {/* Inline Add Ticker Form */}
            <form onSubmit={handleAddWatchlist} className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="Add Ticker..."
                value={newWatchlistTicker}
                onChange={(e) => setNewWatchlistTicker(e.target.value)}
                style={{ color: '#FFFFFF', backgroundColor: '#0B0E14' }}
                className="text-xs font-bold text-white placeholder-gray-400 px-3 py-1.5 rounded-xl border border-[#1E2638] focus:outline-none focus:border-blue-500 uppercase w-36"
              />
              <button
                type="submit"
                disabled={addingWatchlist}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {addingWatchlist ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Add</span>
              </button>
            </form>
          </div>

          {watchlistError && (
            <div className="p-2.5 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-300">
              {watchlistError}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E2638] text-gray-400">
                  <th className="py-2.5 px-3">Ticker</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Change</th>
                  <th className="py-2.5 px-3 text-right">P/E</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2638]/50 text-gray-300">
                {data.watchlist.map((w: any) => (
                  <tr key={w.ticker} className="hover:bg-[#1E2638]/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <Link href={`/stock/${w.ticker}`} className="font-bold text-white hover:text-blue-400">
                        {w.ticker} <span className="text-gray-400 font-normal text-[11px]">({w.name})</span>
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-white">
                      {w.currency === 'USD' ? '$' : '₹'}{w.price}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold ${w.change_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {w.change_pct >= 0 ? `+${w.change_pct}%` : `${w.change_pct}%`}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-400">{w.pe_ratio}x</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/stock/${w.ticker}`} className="text-blue-400 hover:text-blue-300 font-medium text-[11px]">
                          Research →
                        </Link>
                        <button
                          onClick={() => handleRemoveWatchlist(w.ticker)}
                          className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                          title="Remove from Watchlist"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Corporate Actions & Active Valuation Alerts */}
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

          {/* Active Alerts Component */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" /> Active Valuation & Signal Alerts
              </h3>
              <button
                onClick={() => setShowAlertModal(!showAlertModal)}
                className="text-xs bg-amber-950 text-amber-300 hover:bg-amber-900 border border-amber-800/60 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> New Alert
              </button>
            </div>

            {/* Custom Alert Modal / Inline Form */}
            {showAlertModal && (
              <form onSubmit={handleAddAlert} className="bg-[#0B0E14] p-4 rounded-xl border border-amber-800/40 mb-3 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-amber-300">
                  <span>Create Custom Valuation / Signal Alert</span>
                  <button type="button" onClick={() => setShowAlertModal(false)} className="text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Ticker (e.g. TCS)"
                    value={newAlertTicker}
                    onChange={(e) => setNewAlertTicker(e.target.value)}
                    style={{ color: '#FFFFFF', backgroundColor: '#131822' }}
                    className="text-xs font-bold text-white placeholder-gray-400 px-3 py-1.5 rounded-lg border border-[#1E2638] focus:outline-none uppercase"
                  />
                  <select
                    value={newAlertType}
                    onChange={(e) => setNewAlertType(e.target.value)}
                    style={{ color: '#FFFFFF', backgroundColor: '#131822' }}
                    className="text-xs font-bold text-white px-3 py-1.5 rounded-lg border border-[#1E2638] focus:outline-none"
                  >
                    <option value="Valuation Opportunity">Valuation Opportunity</option>
                    <option value="Breakout">Breakout</option>
                    <option value="Target Price Hit">Target Price Hit</option>
                    <option value="Earnings Signal">Earnings Signal</option>
                  </select>
                  <button
                    type="submit"
                    disabled={addingAlert}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                  >
                    {addingAlert ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Save Alert</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Condition (e.g. P/E dropped below 22x or target ₹3,500 hit)"
                  value={newAlertCondition}
                  onChange={(e) => setNewAlertCondition(e.target.value)}
                  style={{ color: '#FFFFFF', backgroundColor: '#131822' }}
                  className="w-full text-xs text-white placeholder-gray-400 px-3 py-1.5 rounded-lg border border-[#1E2638] focus:outline-none"
                />
              </form>
            )}

            <div className="space-y-2">
              {data.alerts?.map((alt: any) => (
                <div key={alt.id} className="bg-amber-950/30 p-3 rounded-xl border border-amber-800/40 text-xs flex justify-between items-center group">
                  <div>
                    <span className="font-bold text-amber-300 mr-2">{alt.ticker}</span>
                    <span className="text-gray-200">{alt.condition}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-amber-900 text-amber-200 px-2 py-0.5 rounded font-bold uppercase">{alt.type}</span>
                    <button
                      onClick={() => handleRemoveAlert(alt.id)}
                      className="text-gray-400 hover:text-red-400 p-0.5 transition-colors"
                      title="Dismiss Alert"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
