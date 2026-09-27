'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, ShieldAlert, FileText, Newspaper, LayoutDashboard, Cpu, Layers } from 'lucide-react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/stock/${searchQuery.trim().toUpperCase()}`);
    }
  };

  const quickStocks = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'BHARTIARTL'];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#1E2638]">
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

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search ticker or company (e.g. RELIANCE, TCS, INFY)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#131822] text-sm text-white placeholder-gray-500 pl-10 pr-4 py-2 rounded-xl border border-[#1E2638] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </form>

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
