'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import {
  Sparkles, Star, TrendingUp, Filter, Search, ArrowUpDown,
  ShieldCheck, Award, Layers, ArrowRight, RefreshCw, CheckCircle2, DollarSign
} from 'lucide-react';

export default function MutualFundsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortField, setSortField] = useState<string>('return_3y_cagr');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  useEffect(() => {
    fetchApi<any>('/mutual-funds/explore')
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load mutual fund explore data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm">
        <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mr-3" />
        Running Indian Mutual Funds Analytics & Screening Engine (AMFI / mfapi.in)...
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-400">Failed to load mutual funds data.</div>;
  }

  const categories = ['ALL', 'Flexi Cap', 'Small Cap', 'Mid Cap', 'Large Cap', 'ELSS', 'Hybrid', 'Index', 'Technology'];

  // Filtering schemes
  const filteredSchemes = (data.all_schemes || []).filter((s: any) => {
    const matchesCat = selectedCategory === 'ALL' || s.sub_category.toLowerCase().includes(selectedCategory.toLowerCase()) || s.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchFilter.trim() ||
      s.scheme_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.fund_house.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.sub_category.toLowerCase().includes(searchFilter.toLowerCase()) ||
      String(s.scheme_code).includes(searchFilter);
    return matchesCat && matchesSearch;
  });

  // Sorting schemes
  const sortedSchemes = [...filteredSchemes].sort((a: any, b: any) => {
    const valA = a[sortField] ?? 0;
    const valB = b[sortField] ?? 0;
    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-[#131822] to-blue-950/40 border border-amber-800/40 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-950 text-amber-400 border border-amber-800/60 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AMFI / Open Source API Engine
              </span>
              <span className="text-xs bg-blue-950 text-blue-300 border border-blue-800/50 px-3 py-1 rounded-full font-medium">
                Live NAV Sync
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Indian Mutual Funds Performance & AI Recommendation Engine
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed">
              Analyze 1Y, 3Y, 5Y CAGR returns, Sharpe ratios, expense ratios, riskometer ratings, and AI-curated 5-Star recommendations across Small Cap, Flexi Cap, ELSS Tax Savers, and Index Funds.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-[#0B0E14] p-4 rounded-2xl border border-[#1E2638] text-center min-w-[120px]">
              <span className="text-[11px] text-gray-400 block font-semibold">Tracked Funds</span>
              <span className="text-2xl font-black text-amber-400">{data.all_schemes?.length || 0}+</span>
            </div>
            <div className="bg-[#0B0E14] p-4 rounded-2xl border border-[#1E2638] text-center min-w-[120px]">
              <span className="text-[11px] text-gray-400 block font-semibold">Top 5-Star Pick</span>
              <span className="text-2xl font-black text-emerald-400">PPFAS / Quant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5-Star Recommended Schemes Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Top 5-Star Recommended Mutual Funds
          </h2>
          <span className="text-xs text-amber-400 font-semibold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/40">
            Filtered by High Sharpe Ratio & Consistent Alpha
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data.top_recommended || []).map((fund: any) => (
            <div
              key={fund.scheme_code}
              className="bg-[#131822] border border-[#1E2638] hover:border-amber-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] bg-blue-950 text-blue-300 font-bold px-2.5 py-0.5 rounded-full border border-blue-800">
                    {fund.sub_category}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {[...Array(fund.star_rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors line-clamp-2 mb-1">
                  {fund.scheme_name}
                </h3>
                <p className="text-xs text-gray-400 mb-4">{fund.fund_house}</p>

                {/* Return stats */}
                <div className="grid grid-cols-3 gap-2 bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638] text-center mb-4">
                  <div>
                    <span className="text-[10px] text-gray-500 block">1Y Return</span>
                    <span className="text-sm font-black text-green-400">+{fund.return_1y}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">3Y CAGR</span>
                    <span className="text-sm font-black text-amber-400">+{fund.return_3y_cagr}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">5Y CAGR</span>
                    <span className="text-sm font-black text-emerald-400">+{fund.return_5y_cagr}%</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-[#1E2638] mb-4">
                  <div>
                    <span className="text-gray-500">NAV:</span>{' '}
                    <span className="font-bold text-white">₹{fund.nav}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">AUM:</span>{' '}
                    <span className="font-bold text-white">₹{fund.aum_cr.toLocaleString('en-IN')} Cr</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Expense:</span>{' '}
                    <span className="font-bold text-white">{fund.expense_ratio}%</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/mutual-funds/${fund.scheme_code}`}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-600/20"
              >
                <span>Analyze Scheme Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Category Performance Heatmap Table */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" /> Category Performance & Return CAGR Heatmap
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E2638] text-gray-400">
                <th className="py-2.5 px-4 font-semibold text-gray-300">Category</th>
                <th className="py-2.5 px-4 font-semibold text-right">Avg 1Y Return</th>
                <th className="py-2.5 px-4 font-semibold text-right">Avg 3Y CAGR</th>
                <th className="py-2.5 px-4 font-semibold text-right">Avg 5Y CAGR</th>
                <th className="py-2.5 px-4 font-semibold text-left pl-6">Top Performing Category Scheme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/50 text-gray-300">
              {(data.categories || []).map((cat: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#1E2638]/40">
                  <td className="py-2.5 px-4 font-bold text-white">{cat.category_name}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-green-400">+{cat.avg_return_1y}%</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-400">+{cat.avg_return_3y}%</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">+{cat.avg_return_5y}%</td>
                  <td className="py-2.5 px-4 text-left pl-6">
                    <Link href={`/mutual-funds/${cat.top_scheme_code}`} className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                      <span>{cat.top_scheme_name}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Filterable & Sortable Mutual Fund Universe Table */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2638] pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" /> Full Mutual Fund Scheme Universe
            </h3>
            <p className="text-xs text-gray-400">Search and filter Indian mutual funds by sub-category, returns, AUM, and riskometer ratings.</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search scheme name or AMC..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{ color: '#FFFFFF', backgroundColor: '#0B0E14' }}
              className="w-full text-xs text-white placeholder-gray-400 pl-9 pr-3 py-2 rounded-xl border border-[#1E2638] focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-bold mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                  : 'bg-[#0B0E14] text-gray-400 hover:text-white border border-[#1E2638]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E2638] text-gray-400">
                <th className="py-3 px-4 font-semibold text-gray-300 sticky left-0 bg-[#131822]">Scheme Name</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('nav')}>
                  NAV (₹) <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                </th>
                <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('aum_cr')}>
                  AUM (Cr) <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                </th>
                <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('expense_ratio')}>
                  Expense % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                </th>
                <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('return_1y')}>
                  1Y % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                </th>
                <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('return_3y_cagr')}>
                  3Y CAGR % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                </th>
                <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('return_5y_cagr')}>
                  5Y CAGR % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                </th>
                <th className="py-3 px-3 font-semibold text-center">Star Rating</th>
                <th className="py-3 px-3 font-semibold text-center">Recommendation</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/50 text-gray-300">
              {sortedSchemes.map((fund: any) => (
                <tr key={fund.scheme_code} className="hover:bg-[#1E2638]/40 transition-colors">
                  <td className="py-3 px-4 sticky left-0 bg-[#131822] max-w-[280px]">
                    <Link href={`/mutual-funds/${fund.scheme_code}`} className="font-bold text-white hover:text-amber-400 block truncate">
                      {fund.scheme_name}
                    </Link>
                    <span className="text-[11px] text-gray-500">{fund.fund_house}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] bg-[#0B0E14] text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded font-semibold">
                      {fund.sub_category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">₹{fund.nav}</td>
                  <td className="py-3 px-3 text-right font-mono">₹{fund.aum_cr.toLocaleString('en-IN')} Cr</td>
                  <td className="py-3 px-3 text-right font-mono text-gray-400">{fund.expense_ratio}%</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-green-400">+{fund.return_1y}%</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">+{fund.return_3y_cagr}%</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">+{fund.return_5y_cagr}%</td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center text-amber-400">
                      {[...Array(fund.star_rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      fund.recommendation === 'Strong Buy'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                        : 'bg-blue-950/60 text-blue-300 border-blue-800/40'
                    }`}>
                      {fund.recommendation}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/mutual-funds/${fund.scheme_code}`} className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center justify-end gap-1">
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
