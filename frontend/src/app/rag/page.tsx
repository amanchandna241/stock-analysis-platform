'use client';

import React, { useState } from 'react';
import DocumentRAGTab from '@/components/stock/DocumentRAGTab';
import { BookOpen } from 'lucide-react';

export default function GlobalRAGPage() {
  const [selectedTicker, setSelectedTicker] = useState('RELIANCE');

  return (
    <div className="space-y-6">
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" /> Filings & Annual Report RAG Intelligence Assistant
          </h1>
          <p className="text-xs text-gray-400">Perform semantic search across indexed Annual Reports, Earnings Call Transcripts, and Investor Presentations with exact page citations.</p>
        </div>

        <div className="flex items-center gap-2">
          {['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'BHARTIARTL'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTicker(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedTicker === t ? 'bg-purple-600 text-white' : 'bg-[#0B0E14] text-gray-400 hover:text-white border border-[#1E2638]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <DocumentRAGTab ticker={selectedTicker} />
    </div>
  );
}
