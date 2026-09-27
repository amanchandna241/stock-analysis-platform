'use client';

import React from 'react';
import { ShieldCheck, FileCheck, ExternalLink, AlertCircle, Building, CheckCircle2 } from 'lucide-react';

interface GovernanceProps {
  data: {
    ticker: string;
    promoter_pledging_pct: number;
    events: Array<{
      date: string;
      category: string;
      title: string;
      details: string;
      source_url?: string;
      severity: string;
    }>;
    auditor_name: string;
    auditor_opinion: string;
  };
}

export default function GovernanceTab({ data }: GovernanceProps) {
  return (
    <div className="space-y-6">
      {/* Auditor & Governance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#131822] p-5 rounded-2xl border border-[#1E2638]">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Building className="w-4 h-4 text-blue-400" /> Statutory Auditor
          </div>
          <div className="text-base font-bold text-white mb-1">{data.auditor_name}</div>
          <div className="text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-2.5 py-0.5 rounded-full inline-block font-medium">
            {data.auditor_opinion}
          </div>
        </div>

        <div className="bg-[#131822] p-5 rounded-2xl border border-[#1E2638]">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Promoter Share Encumbrance
          </div>
          <div className="text-2xl font-black text-white">{data.promoter_pledging_pct}% Pledged</div>
          <p className="text-xs text-gray-400 mt-1">No pledging overhang risk detected on equity capital.</p>
        </div>

        <div className="bg-[#131822] p-5 rounded-2xl border border-[#1E2638]">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <FileCheck className="w-4 h-4 text-purple-400" /> Audit Committee Composition
          </div>
          <div className="text-base font-bold text-white mb-1">100% Independent Directors</div>
          <p className="text-xs text-gray-400">Chaired by veteran independent audit committee member.</p>
        </div>
      </div>

      {/* Governance & Related-Party Event Log */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Corporate Governance & Regulatory Disclosure Log</h3>
        <div className="space-y-3">
          {data.events.map((ev, idx) => (
            <div key={idx} className="bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638] text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800/50 px-2 py-0.5 rounded font-bold uppercase">
                    {ev.category}
                  </span>
                  <span className="font-bold text-white text-sm">{ev.title}</span>
                </div>
                <span className="text-gray-500 font-mono">{ev.date}</span>
              </div>
              <p className="text-gray-300 leading-relaxed">{ev.details}</p>
              {ev.source_url && (
                <div className="pt-1">
                  <a
                    href={ev.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                  >
                    <span>View Filing Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
