'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { Layers, ArrowUpDown, Plus, X, RefreshCw, Filter } from 'lucide-react';

interface PeerTabProps {
  targetTicker: string;
  peers: any[];
}

export default function PeerComparisonTab({ targetTicker, peers: initialPeers }: PeerTabProps) {
  const [peersList, setPeersList] = useState<any[]>(initialPeers);
  const [newPeerInput, setNewPeerInput] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [sortMetric, setSortMetric] = useState<string>('market_cap_cr');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddCustomPeer = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPeer = newPeerInput.trim().toUpperCase();
    if (!cleanPeer) return;

    if (peersList.some((p) => p.ticker === cleanPeer)) {
      setErrorMsg(`Ticker '${cleanPeer}' is already in the comparison matrix.`);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setIsAdding(true);
    try {
      const currentTickers = peersList.map((p) => p.ticker).join(',');
      const updatedPeersStr = `${currentTickers},${cleanPeer}`;
      const res = await fetchApi<any>(`/peers/${targetTicker}?custom_peers=${updatedPeersStr}`);
      setPeersList(res.peers || []);
      setNewPeerInput('');
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(`Failed to add ticker '${cleanPeer}'. Please verify symbol.`);
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemovePeer = (tickerToRemove: string) => {
    if (tickerToRemove === targetTicker) return; // Cannot remove target stock
    setPeersList(peersList.filter((p) => p.ticker !== tickerToRemove));
  };

  const handleSort = (metric: string) => {
    if (sortMetric === metric) {
      setSortAsc(!sortAsc);
    } else {
      setSortMetric(metric);
      setSortAsc(false);
    }
  };

  const sortedPeers = [...peersList].sort((a, b) => {
    const valA = a[sortMetric] ?? 0;
    const valB = b[sortMetric] ?? 0;
    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2638] pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" /> Dynamic Sector Peer Comparison Matrix
          </h3>
          <p className="text-xs text-gray-400">Add or remove custom competitor tickers to compare growth, margins, return ratios, debt leverage, and valuation multiples based on your preference.</p>
        </div>

        {/* Dynamic Add Peer Form */}
        <form onSubmit={handleAddCustomPeer} className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Add Peer (e.g. SBIN, AXISBANK)..."
            value={newPeerInput}
            onChange={(e) => setNewPeerInput(e.target.value)}
            style={{ color: '#FFFFFF', backgroundColor: '#0B0E14' }}
            className="text-xs font-bold text-white placeholder-gray-400 px-3 py-2 rounded-xl border border-[#1E2638] focus:outline-none focus:border-blue-500 uppercase w-48"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isAdding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Add Peer</span>
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      {/* Active Peer Badges Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638]">
        <span className="text-gray-400 font-bold mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-blue-400" /> Comparing ({peersList.length}):
        </span>
        {peersList.map((p) => {
          const isTarget = p.ticker === targetTicker;
          return (
            <span
              key={p.ticker}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors ${
                isTarget ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-[#131822] text-gray-200 border-[#1E2638]'
              }`}
            >
              <span>{p.ticker}</span>
              {isTarget ? (
                <span className="text-[10px] text-blue-400 font-normal">(Target)</span>
              ) : (
                <button onClick={() => handleRemovePeer(p.ticker)} className="text-gray-400 hover:text-red-400 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          );
        })}
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1E2638] text-gray-400">
              <th className="py-3 px-4 font-semibold text-gray-300 sticky left-0 bg-[#131822]">Company / Ticker</th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('market_cap_cr')}>
                M.Cap (Cr) <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('revenue_growth_3y')}>
                3Y Rev % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('ebitda_margin')}>
                EBITDA % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('pat_growth_3y')}>
                3Y PAT % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('roe')}>
                ROE % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('roce')}>
                ROCE % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('debt_equity')}>
                D/E <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('pe_ratio')}>
                P/E <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('ev_ebitda')}>
                EV/EBITDA <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
              <th className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('fcf_yield')}>
                FCF Yield % <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2638]/50 text-gray-300">
            {sortedPeers.map((p, idx) => {
              const isTarget = p.ticker === targetTicker;
              return (
                <tr key={idx} className={`hover:bg-[#1E2638]/40 ${isTarget ? 'bg-blue-950/30 font-bold border-l-4 border-blue-500' : ''}`}>
                  <td className="py-3 px-4 sticky left-0 bg-[#131822]">
                    <div className="flex items-center justify-between">
                      <Link href={`/stock/${p.ticker}`} className="text-white hover:text-blue-400 flex items-center gap-1.5">
                        <span>{p.ticker}</span>
                        <span className="text-[11px] text-gray-500 font-normal truncate max-w-[120px]">({p.name})</span>
                      </Link>
                      {!isTarget && (
                        <button onClick={() => handleRemovePeer(p.ticker)} className="text-gray-500 hover:text-red-400 ml-2" title="Remove Peer">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {p.currency === 'USD' ? '$' : '₹'}{p.market_cap_cr.toLocaleString('en-US')} {p.currency === 'USD' ? 'M' : 'Cr'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">{p.revenue_growth_3y}%</td>
                  <td className="py-3 px-3 text-right font-mono">{p.ebitda_margin}%</td>
                  <td className="py-3 px-3 text-right font-mono">{p.pat_growth_3y}%</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">{p.roe}%</td>
                  <td className="py-3 px-3 text-right font-mono">{p.roce}%</td>
                  <td className="py-3 px-3 text-right font-mono">{p.debt_equity}</td>
                  <td className="py-3 px-3 text-right font-mono text-blue-400">{p.pe_ratio}x</td>
                  <td className="py-3 px-3 text-right font-mono">{p.ev_ebitda}x</td>
                  <td className="py-3 px-3 text-right font-mono">{p.fcf_yield}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
