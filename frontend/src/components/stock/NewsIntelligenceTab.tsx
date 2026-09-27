'use client';

import React, { useState } from 'react';
import { Newspaper, ExternalLink, Filter, Tag } from 'lucide-react';

interface NewsTabProps {
  articles: Array<{
    id: string;
    ticker: string;
    headline: string;
    source: string;
    published_at: string;
    category: string;
    summary: string;
    url?: string;
  }>;
}

export default function NewsIntelligenceTab({ articles }: NewsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Earnings', 'Regulatory', 'Management', 'M&A', 'Product', 'Industry', 'Litigation', 'Corporate Actions', 'Macro'];

  const filtered = selectedCategory === 'ALL'
    ? articles
    : articles.filter(a => a.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Filter Category Chips */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-300">
          <Filter className="w-4 h-4 text-blue-400" /> News Intelligence Category Filter:
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-[#0B0E14] text-gray-400 hover:text-white border border-[#1E2638]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Feed */}
      <div className="space-y-4">
        {filtered.map((art) => (
          <div key={art.id} className="bg-[#131822] border border-[#1E2638] rounded-2xl p-5 hover:border-blue-500/50 transition-colors space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800/50 px-2 py-0.5 rounded font-bold uppercase">
                  {art.category}
                </span>
                <span className="font-semibold text-gray-400">{art.source}</span>
              </div>
              <span className="text-gray-500 font-mono">{art.published_at}</span>
            </div>

            <h4 className="text-base font-bold text-white leading-snug">{art.headline}</h4>
            <p className="text-xs text-gray-300 leading-relaxed">{art.summary}</p>

            {art.url && (
              <div className="pt-2">
                <a
                  href={art.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium"
                >
                  <span>Read Full Coverage</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
