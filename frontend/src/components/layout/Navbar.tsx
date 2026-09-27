'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Search, TrendingUp, Building2, LayoutDashboard, Layers, FileText, Cpu, ArrowRight } from 'lucide-react';

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
      }, 200);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white tracking-tight shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
            AG
          </div>
          <span>Antigravity<span className="text-blue-500 font-normal">Equity</span></span>
        </Link>

        {/* Search Bar Container */}
        <div className="relative flex-1 max-w-md" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ticker or company (e.g. RELIANCE, TCS, SBIN)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              style={{ color: '#FFFFFF', backgroundColor: '#131822' }}
              className="w-full text-white placeholder-gray-400 font-medium text-sm pl-10 pr-4 py-2.5 rounded-xl border border-[#1E2638] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
            />
          </form>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#131822] border border-[#1E2638] rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
              <div className="p-2 border-b border-[#1E2638] text-[11px] text-gray-400 flex items-center justify-between px-3">
                <span>Matching Equities ({searchResults.length})</span>
                {isSearching && <span className="text-blue-400 font-medium animate-pulse">Searching...</span>}
              </div>

              {searchResults.length > 0 ? (
                <div className="divide-y divide-[#1E2638]">
                  {searchResults.map((st) => (
                    <button
                      key={st.ticker}
                      onClick={() => handleSelectStock(st.ticker)}
                      className="w-full text-left p-3 hover:bg-[#1E2638]/70 flex items-center justify-between transition-colors text-xs group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center font-black text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {st.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-blue-400 flex items-center gap-1.5">
                            <span>{st.ticker}</span>
                            <span className="text-[10px] bg-[#1E2638] text-gray-300 px-1.5 py-0.2 rounded font-mono">
                              {st.bse_code || 'NSE'}
                            </span>
                          </div>
                          <div className="text-gray-400 text-[11px] truncate max-w-[200px]">{st.name}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-white">₹{st.current_price}</div>
                        <div className="text-blue-400 text-[11px] flex items-center justify-end gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          <span>Research</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-gray-400">
                  No direct matches found. Press <kbd className="bg-[#1E2638] px-1.5 py-0.5 rounded text-gray-200">Enter</kbd> to research ticker <strong className="text-white">"{searchQuery.toUpperCase()}"</strong>.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Tickers */}
        <div className="hidden lg:flex items-center gap-1 text-xs text-gray-400">
          <span className="text-gray-500 mr-1">Popular:</span>
          {quickStocks.map((st) => (
            <Link
              key={st}
              href={`/stock/${st}`}
              className="px-2 py-1 rounded bg-[#131822] hover:bg-[#1E2638] text-gray-300 hover:text-white transition-colors border border-[#1E2638]"
            >
              {st}
            </Link>
          ))}
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#131822] flex items-center gap-1.5 transition-colors">
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link href="/compare" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#131822] flex items-center gap-1.5 transition-colors">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Peers</span>
          </Link>
          <Link href="/rag" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#131822] flex items-center gap-1.5 transition-colors">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">RAG Q&A</span>
          </Link>
          <Link href="/architecture" className="px-3 py-2 rounded-lg text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-950/30 border border-blue-800/40 flex items-center gap-1.5 transition-colors">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">AWS Architecture</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
