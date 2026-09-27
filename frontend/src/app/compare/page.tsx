'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import PeerComparisonTab from '@/components/stock/PeerComparisonTab';
import { Layers } from 'lucide-react';

export default function ComparePage() {
  const [ticker, setTicker] = useState('RELIANCE');
  const [peerData, setPeerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadPeers = (target: string) => {
    setLoading(true);
    fetchApi<any>(`/peers/${target}`)
      .then((res) => {
        setPeerData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Peer fetch error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPeers(ticker);
  }, [ticker]);

  return (
    <div className="space-y-6">
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" /> Multi-Stock Peer & Sector Comparison Tool
          </h1>
          <p className="text-xs text-gray-400">Select any target equity ticker to generate comparative matrix analysis across growth, ROE, ROCE, debt, and valuation.</p>
        </div>

        <div className="flex items-center gap-2">
          {['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'BHARTIARTL'].map((t) => (
            <button
              key={t}
              onClick={() => { setTicker(t); loadPeers(t); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                ticker === t ? 'bg-blue-600 text-white' : 'bg-[#0B0E14] text-gray-400 hover:text-white border border-[#1E2638]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-xs">Loading comparative matrix...</div>
      ) : peerData ? (
        <PeerComparisonTab targetTicker={ticker} peers={peerData.peers} />
      ) : null}
    </div>
  );
}
