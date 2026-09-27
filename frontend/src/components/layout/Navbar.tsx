'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Search, TrendingUp, X, LayoutDashboard, Layers, FileText, Cpu, ArrowRight, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle live search fetching
  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        fetchApi<any[]>(`/stocks/search?q=${encodeURIComponent(searchQuery.trim())}`)
          .then((res) => {
            setSearchResults(res || []);
            setIsSearching(false);
          })
          .catch(() => {
            setIsSearching(false);
          });
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Keyboard shortcut Ctrl+K or / to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isModalOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const target = searchQuery.trim().toUpperCase();
      setIsModalOpen(false);
      setSearchQuery('');
      router.push(`/stock/${target}`);
    }
  };

  const handleSelectStock = (ticker: string) => {
    setIsModalOpen(false);
    setSearchQuery('');
    router.push(`/stock/${ticker}`);
  };

  const quickStocks = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'BHARTIARTL', 'SBIN', 'NVDA'];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0B0E14]/95 backdrop-blur-md border-b border-[#1E2638]">
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

        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white tracking-tight shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30 text-xl">
              AG
            </div>
            <span className="hidden sm:inline text-2xl font-black">Antigravity<span className="text-blue-500 font-normal">Equity</span></span>
          </Link>

          {/* ULTRA-SPACIOUS SEARCH TRIGGER BAR */}
          <div className="flex-1 max-w-2xl mx-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-[#1E293B] hover:bg-[#28364E] text-white border-2 border-blue-500/80 rounded-2xl px-5 py-3 flex items-center justify-between shadow-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-gray-300 font-bold text-sm sm:text-base tracking-wide">
                  SEARCH ANY STOCK TICKER (e.g. RELIANCE, SBIN, AAPL)...
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 font-mono bg-[#0F172A] px-2.5 py-1 rounded-lg border border-gray-700">
                <span>Ctrl</span> <span>+</span> <span>K</span>
              </div>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-2 shrink-0">
            <Link href="/" className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-[#131822] flex items-center gap-1.5 transition-colors">
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link href="/compare" className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-[#131822] flex items-center gap-1.5 transition-colors">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Peers</span>
            </Link>
            <Link href="/rag" className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-[#131822] flex items-center gap-1.5 transition-colors">
              <FileText className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">RAG Q&A</span>
            </Link>
            <Link href="/architecture" className="px-3 py-2 rounded-xl text-sm font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/40 border border-blue-800/50 flex items-center gap-1.5 transition-colors">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="hidden md:inline">AWS Infra</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* MASSIVE FULL-SCREEN COMMAND PALETTE SEARCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 px-4">
          <div className="bg-[#0F172A] border-2 border-blue-500 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            {/* Huge Input Header */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b-2 border-blue-500/60 p-4 bg-[#1E293B]">
              <Search className="w-7 h-7 text-blue-400 ml-2 mr-3 shrink-0" />
              
              <input
                ref={inputRef}
                type="text"
                placeholder="TYPE ANY TICKER OR COMPANY NAME..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  color: '#FFFFFF',
                  backgroundColor: 'transparent',
                  WebkitTextFillColor: '#FFFFFF',
                  caretColor: '#60A5FA'
                }}
                className="w-full text-white placeholder:text-gray-400 font-black text-xl sm:text-2xl tracking-wider uppercase border-none focus:outline-none focus:ring-0 shadow-none"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-2 rounded-full text-gray-400 hover:text-white bg-[#0F172A] hover:bg-gray-800 mr-2"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs bg-[#0F172A] hover:bg-gray-800 text-gray-300 px-3 py-2 rounded-xl border border-gray-700 font-bold"
              >
                ESC
              </button>
            </form>

            {/* Quick Popular Ticker Suggestions */}
            <div className="bg-[#0B0E14] px-6 py-3 border-b border-[#1E2638] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-400 font-bold uppercase text-[11px]">Popular Equities:</span>
              {quickStocks.map((st) => (
                <button
                  key={st}
                  onClick={() => handleSelectStock(st)}
                  className="px-3 py-1 rounded-lg bg-[#1E293B] hover:bg-blue-600 text-white font-bold transition-colors border border-gray-700 hover:border-blue-400"
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Live Search Results List */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="text-xs font-bold text-gray-400 mb-3 px-2 flex justify-between">
                <span>Matching Results ({searchResults.length})</span>
                {isSearching && <span className="text-blue-400 font-semibold animate-pulse">Searching Live Feeds...</span>}
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((st) => (
                    <button
                      key={st.ticker}
                      onClick={() => handleSelectStock(st.ticker)}
                      className="w-full text-left p-4 rounded-2xl bg-[#1E293B]/60 hover:bg-blue-950/60 border border-gray-800 hover:border-blue-500/80 flex items-center justify-between transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-11 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/60 flex items-center justify-center font-black text-xs px-1 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {st.ticker}
                        </div>
                        <div>
                          <div className="font-black text-white text-lg group-hover:text-blue-400 flex items-center gap-2">
                            <span>{st.ticker}</span>
                            <span className="text-xs bg-[#0F172A] text-gray-300 px-2.5 py-0.5 rounded-md font-mono border border-gray-700">
                              {st.bse_code || 'NSE'}
                            </span>
                          </div>
                          <div className="text-gray-300 text-xs font-semibold">{st.name}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-white text-base">₹{st.current_price}</div>
                        <div className="text-blue-400 text-xs font-bold flex items-center justify-end gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Open Research Page</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="p-8 text-center text-gray-300 space-y-3">
                  <p className="text-sm font-medium">Press <kbd className="bg-[#1E293B] text-white px-2 py-1 rounded font-bold border border-gray-700">ENTER</kbd> or click below to research custom ticker:</p>
                  <button
                    onClick={() => handleSelectStock(searchQuery.trim().toUpperCase())}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3 rounded-2xl text-base tracking-wide shadow-lg shadow-blue-500/30 transition-transform active:scale-95 inline-flex items-center gap-2"
                  >
                    <span>Research "{searchQuery.trim().toUpperCase()}"</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs">
                  Type any Indian or Global Stock Ticker (e.g., <strong className="text-white">RELIANCE, SBIN, TATAMOTORS, AAPL, NVDA</strong>) to launch real-time equity research.
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
