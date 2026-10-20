'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import {
  FileText, Send, Upload, Sparkles, BookOpen, CheckCircle,
  ArrowRight, Database, Search, Filter, ShieldCheck, Layers,
  AlertCircle, RefreshCw, BarChart2
} from 'lucide-react';

interface RAGProps {
  ticker: string;
}

export default function DocumentRAGTab({ ticker }: RAGProps) {
  const [query, setQuery] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('ALL');
  const [isQuerying, setIsQuerying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ragResponse, setRagResponse] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [ragStats, setRagStats] = useState<any>(null);
  const [uploadDocType, setUploadDocType] = useState('Annual Report');

  const sampleQuestions: Record<string, string[]> = {
    TATAMOTORS: [
      "What is JLR's free cash flow and net debt reduction status?",
      "What is Tata Motors' domestic EV market share and roadmap?",
      "Summarize the demerger into commercial and passenger vehicle entities.",
      "What are the capital commitments toward semiconductor chip fab investments?"
    ],
    RELIANCE: [
      "What is the capital expenditure breakdown for the Green Energy Giga Complex?",
      "How did Jio ARPU and 5G subscriber adoption perform in FY24?",
      "What is the contribution of digital commerce to Reliance Retail revenue?",
      "Summarize key margin drivers in the Oil-to-Chemicals (O2C) segment."
    ],
    TCS: [
      "What is TCS's operating margin guidance and free cash flow conversion rate?",
      "What are the primary capabilities of TCS Semiconductor & Silicon Engineering unit?",
      "Summarize large deal TCV and enterprise AI customer adoption.",
      "What are the biggest geopolitical or client tech spend risks?"
    ],
    DEFAULT: [
      "What are the company's biggest strategic risk disclosures in annual reports?",
      "Summarize management commentary on capital allocation and capex plans.",
      "How are operating margins and free cash flow conversion trending?",
      "What new product or capacity expansion milestones were achieved?"
    ]
  };

  const currentQuestions = sampleQuestions[ticker.toUpperCase()] || sampleQuestions.DEFAULT;

  useEffect(() => {
    loadRagStats();
    // Auto-run first question
    if (currentQuestions && currentQuestions.length > 0) {
      handleQuery(currentQuestions[0]);
    }
  }, [ticker]);

  const loadRagStats = () => {
    fetchApi<any>('/rag/stats')
      .then((data) => setRagStats(data))
      .catch((err) => console.error('Failed to load RAG stats:', err));
  };

  const handleQuery = async (qText?: string) => {
    const textToSubmit = qText || query;
    if (!textToSubmit.trim()) return;

    setIsQuerying(true);
    try {
      const res = await fetchApi<any>('/rag/query', {
        method: 'POST',
        body: JSON.stringify({
          ticker,
          query: textToSubmit,
          doc_type: selectedDocType === 'ALL' ? undefined : selectedDocType
        })
      });
      setRagResponse(res);
    } catch (err) {
      console.error("RAG Query Error:", err);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('ticker', ticker);
    formData.append('doc_type', uploadDocType);
    formData.append('year', '2024');

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    try {
      const res = await fetch(`${apiBase}/rag/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
      }

      const data = await res.json();
      setUploadStatus(data.message || `Document '${file.name}' indexed into RAG store.`);
      loadRagStats();
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadStatus(`Upload failed: ${err.message || 'Error processing file'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* RAG Vector Store Live Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#131822] border border-[#1E2638] rounded-xl p-3.5 flex items-center gap-3">
          <Database className="w-5 h-5 text-purple-400 shrink-0" />
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">Vector Chunks</div>
            <div className="text-base font-black text-white">
              {ragStats ? ragStats.total_chunks : '35+'}
            </div>
          </div>
        </div>

        <div className="bg-[#131822] border border-[#1E2638] rounded-xl p-3.5 flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-blue-400 shrink-0" />
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">Audited Reports</div>
            <div className="text-base font-black text-white">
              {ragStats ? ragStats.total_documents : '12+'}
            </div>
          </div>
        </div>

        <div className="bg-[#131822] border border-[#1E2638] rounded-xl p-3.5 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">Hybrid Search</div>
            <div className="text-xs font-bold text-emerald-400">Dense + BM25</div>
          </div>
        </div>

        <div className="bg-[#131822] border border-[#1E2638] rounded-xl p-3.5 flex items-center gap-3">
          <Layers className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">Embedding Vocab</div>
            <div className="text-base font-black text-white">
              {ragStats?.vocabulary_features ? `${(ragStats.vocabulary_features / 1000).toFixed(1)}k` : '1.2k'}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Section */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Index New Annual Report / 10-K Filing for {ticker}
          </h3>
          <p className="text-xs text-gray-400">
            Upload real PDF or TXT documents. Our engine extracts text, generates sliding-window semantic chunks, and updates the vector store.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <select
            value={uploadDocType}
            onChange={(e) => setUploadDocType(e.target.value)}
            className="bg-[#0B0E14] text-xs text-gray-300 px-3 py-2.5 rounded-xl border border-[#1E2638] focus:outline-none"
          >
            <option value="Annual Report">Annual Report</option>
            <option value="10-K Annual Filing">10-K Annual Filing</option>
            <option value="Earnings Call Transcript">Earnings Transcript</option>
            <option value="Investor Presentation">Investor Presentation</option>
          </select>

          <label className={`cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Indexing PDF...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload PDF / Text</span>
              </>
            )}
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Upload Status Banner */}
      {uploadStatus && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* RAG Query Box */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-sm font-bold text-gray-200 flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-400" />
            Semantic Document Intelligence Assistant ({ticker})
          </label>

          {/* Doc Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {['ALL', 'Annual Report', 'Investor Presentation', 'Corporate Filing'].map((dt) => (
              <button
                key={dt}
                onClick={() => setSelectedDocType(dt)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  selectedDocType === dt
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#0B0E14] text-gray-400 hover:text-white border border-[#1E2638]'
                }`}
              >
                {dt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Ask filings e.g. "What is ${ticker}'s capital allocation or EV timeline?"...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
            className="flex-1 bg-[#0B0E14] text-sm text-white placeholder-gray-500 px-4 py-3 rounded-xl border border-[#1E2638] focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => handleQuery()}
            disabled={isQuerying}
            className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shrink-0 shadow-lg shadow-purple-600/30"
          >
            {isQuerying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Searching Vectors...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Search Filings</span>
              </>
            )}
          </button>
        </div>

        {/* Sample Question Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-gray-500 font-medium">Verified Questions:</span>
          {currentQuestions.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => { setQuery(sq); handleQuery(sq); }}
              className="text-xs bg-[#0B0E14] hover:bg-[#1E2638] text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-[#1E2638] transition-colors flex items-center gap-1.5"
            >
              <span>{sq}</span>
              <ArrowRight className="w-3 h-3 text-gray-500" />
            </button>
          ))}
        </div>
      </div>

      {/* RAG Answer & Cited Passages Output */}
      {ragResponse && (
        <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2638] pb-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Grounded Synthesis Response
            </h4>
            <div className="flex items-center gap-3">
              {ragResponse.confidence_score && (
                <span className="text-xs font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 px-2.5 py-1 rounded-lg">
                  Relevance: {(ragResponse.confidence_score * 100).toFixed(0)}%
                </span>
              )}
              <span className="text-xs text-gray-400">Ticker: <strong>{ragResponse.ticker}</strong></span>
            </div>
          </div>

          <p className="text-sm text-gray-200 leading-relaxed bg-[#0B0E14] p-5 rounded-xl border border-[#1E2638]">
            {ragResponse.answer}
          </p>

          {/* Citations list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Verified Document Citations & Page References ({ragResponse.citations.length})
              </h5>
              <span className="text-[11px] text-gray-500">Ranked by Vector Cosine + BM25 Fusion</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ragResponse.citations.map((cite: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-[#0B0E14] p-4 rounded-xl border border-blue-900/40 text-xs space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-bold text-blue-300">
                      <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        {cite.doc_title}
                      </span>
                      <span className="bg-blue-950 text-blue-300 border border-blue-800/50 px-2 py-0.5 rounded font-mono text-[11px] shrink-0">
                        Page {cite.page_number}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span className="bg-[#131822] px-2 py-0.5 rounded border border-[#1E2638]">{cite.doc_type}</span>
                      <span>FY{cite.year}</span>
                      {cite.section && <span className="text-purple-400 font-semibold">• {cite.section}</span>}
                    </div>
                  </div>

                  <p className="text-gray-300 leading-relaxed italic bg-[#131822]/60 p-2.5 rounded-lg border border-[#1E2638]/50 mt-2">
                    "{cite.content_snippet}"
                  </p>

                  {cite.relevance_score && (
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-[#1E2638]/50">
                      <span>Semantic Score:</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {(cite.relevance_score * 100).toFixed(1)}% match
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
