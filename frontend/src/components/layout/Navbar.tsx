'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Search, TrendingUp, X, LayoutDashboard, Layers, FileText, Cpu, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        fetchApi<any[]>(`/stocks/search?q=${encodeURIComponent(searchQuery.trim())}`)
          .then((res) => {
            setSearchResults(res || []);
            setShowDropdown(true);
            setIsSearching(false);
          })
          .catch(() => {
            setIsSearching(false);
          });
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/stock/${searchQuery.trim().toUpperCase()}`);
    }
  };

  const handleSelectStock = (ticker: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    router.push(`/stock/${ticker}`);
  };

  const quickStocks = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'BHARTIARTL'];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0E14]/95 backdrop-blur-md border-b border-[#1E2638]">
      {/* Top Ticker Marquee */}
      <div className="bg-[#131822] border-b border-[#1E2638] px-4 py-1.5 text-xs flex items-center justify-between text-gray-400">
        <div className="flex items-center space-x-6 overflow-x-auto whitespace-nowrap">
          <span className="font-semibold text-gray-300 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-400" /> NSE/BSE MARKETS:
          </span>
          <span className="flex items-center gap-1">
            NIFTY 50: <span className="text-green-400 font-medium">25,380.40 (+0.56%)</span>
          </span>
          <span className="flex items-center gap-1">
            SENSEX: <span className="text-green-400 font-medium">82,950.15 (+0.50%)</span>
          </span>
          <span className="flex items-center gap-1">
            NIFTY BANK: <span className="text-green-400 font-medium">53,120.80 (+0.61%)</span>
          </span>
          <span className="flex items-center gap-1">
            NIFTY IT: <span className="text-red-400 font-medium">42,150.30 (-0.43%)</span>
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-3 text-gray-400">
          <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded border border-blue-800/50">
            LLM Provider: Auto (Gemini / Anthropic / OpenAI)
          </span>
          <span>Market Open 15:30 IST</span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white tracking-tight shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 text-lg">
            AG
          </div>
          <span className="hidden sm:inline">Antigravity<span className="text-blue-500 font-normal">Equity</span></span>
        </Link>

        {/* PROMINENT HIGH-VISIBILITY SEARCH BAR */}
        <div className="relative flex-1 max-w-xl mx-2" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 pointer-events-none z-10" />
            
            <input
              type="text"
              placeholder="SEARCH ANY TICKER (e.g. RELIANCE, SBIN, AAPL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              style={{ color: '#FFFFFF', backgroundColor: '#182030' }}
              className="w-full text-white placeholder:text-gray-400 font-bold text-base sm:text-lg tracking-wide pl-12 pr-10 py-3 rounded-2xl border-2 border-blue-500/80 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-xl caret-blue-400 uppercase"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-full bg-[#131822] hover:bg-[#1E2638] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#131822] border-2 border-blue-500/60 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-[#1E2638] text-xs font-bold text-gray-300 flex items-center justify-between px-4 bg-[#0B0E14]">
                <span className="uppercase tracking-wider">Matching Equities ({searchResults.length})</span>
                {isSearching && <span className="text-blue-400 font-semibold animate-pulse">Searching Live Market...</span>}
              </div>

              {searchResults.length > 0 ? (
                <div className="divide-y divide-[#1E2638]">
                  {searchResults.map((st) => (
                    <button
                      key={st.ticker}
                      onClick={() => handleSelectStock(st.ticker)}
                      className="w-full text-left p-3.5 hover:bg-[#1E2638]/80 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/60 flex items-center justify-center font-black text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors shadow">
                          {st.ticker.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-black text-white text-base group-hover:text-blue-400 flex items-center gap-2">
                            <span>{st.ticker}</span>
                            <span className="text-xs bg-[#1E2638] text-gray-300 px-2 py-0.5 rounded font-mono font-normal">
                              {st.bse_code || 'NSE'}
                            </span>
                          </div>
                          <div className="text-gray-300 text-xs font-medium truncate max-w-[240px]">{st.name}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-white text-sm">₹{st.current_price}</div>
                        <div className="text-blue-400 text-xs font-bold flex items-center justify-end gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Research Page</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-center text-xs text-gray-300">
                  No direct ticker matches found. Press <kbd className="bg-[#1E2638] text-white px-2 py-1 rounded font-bold border border-gray-700">ENTER</kbd> to research <strong className="text-blue-400 font-black">"{searchQuery.toUpperCase()}"</strong>.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Tickers */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
          <span className="text-gray-500 mr-1">Popular:</span>
          {quickStocks.map((st) => (
            <Link
              key={st}
              href={`/stock/${st}`}
              className="px-2.5 py-1 rounded-lg bg-[#131822] hover:bg-[#1E2638] text-gray-300 hover:text-white font-semibold transition-colors border border-[#1E2638]"
            >
              {st}
            </Link>
          ))}
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Link href="/" className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-300 hover:text-white hover:bg-[#131822] flex items-center gap-1.5 transition-colors">
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link href="/compare" className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-300 hover:text-white hover:bg-[#131822] flex items-center gap-1.5 transition-colors">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Peers</span>
          </Link>
          <Link href="/rag" className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-300 hover:text-white hover:bg-[#131822] flex items-center gap-1.5 transition-colors">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">RAG Q&A</span>
          </Link>
          <Link href="/architecture" className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/30 border border-blue-800/40 flex items-center gap-1.5 transition-colors">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">AWS Architecture</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
