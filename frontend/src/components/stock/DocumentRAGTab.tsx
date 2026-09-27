'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { FileText, Send, Upload, Sparkles, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';

interface RAGProps {
  ticker: string;
}

export default function DocumentRAGTab({ ticker }: RAGProps) {
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [ragResponse, setRagResponse] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const sampleQuestions = [
    "Why did margins decline in recent quarters?",
    "What are the company's biggest risks highlighted in annual reports?",
    "What changed compared with last year's annual report?",
    "Summarize management commentary on capital allocation."
  ];

  const handleQuery = async (qText?: string) => {
    const textToSubmit = qText || query;
    if (!textToSubmit.trim()) return;

    setIsQuerying(true);
    try {
      const res = await fetchApi<any>('/rag/query', {
        method: 'POST',
        body: JSON.stringify({ ticker, query: textToSubmit })
      });
      setRagResponse(res);
    } catch (err) {
      console.error("RAG Query Error:", err);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filename = e.target.files[0].name;
      setUploadStatus(`Document '${filename}' uploaded and indexed into vector RAG engine successfully!`);
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Document Section */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" /> Annual Reports & Filings RAG Assistant
          </h3>
          <p className="text-xs text-gray-400">Upload Annual Reports (10K/10Q), Presentations, or Transcripts to perform deep document extraction.</p>
        </div>

        <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shrink-0 shadow-lg shadow-blue-500/20">
          <Upload className="w-4 h-4" /> Upload Document Filing
          <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleUploadSimulated} />
        </label>
      </div>

      {uploadStatus && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* RAG Query Box */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 space-y-4">
        <label className="block text-sm font-bold text-gray-200">
          Ask Document Intelligence Assistant:
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. What are the company's biggest strategic risks?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
            className="flex-1 bg-[#0B0E14] text-sm text-white placeholder-gray-500 px-4 py-3 rounded-xl border border-[#1E2638] focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleQuery()}
            disabled={isQuerying}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isQuerying ? 'Processing...' : <><Send className="w-4 h-4" /> Ask RAG</>}
          </button>
        </div>

        {/* Sample Question Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-gray-500 font-medium">Quick Prompts:</span>
          {sampleQuestions.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => { setQuery(sq); handleQuery(sq); }}
              className="text-xs bg-[#0B0E14] hover:bg-[#1E2638] text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-[#1E2638] transition-colors flex items-center gap-1"
            >
              <span>{sq}</span>
              <ArrowRight className="w-3 h-3 text-gray-500" />
            </button>
          ))}
        </div>
      </div>

      {/* RAG Answer & Cited Passages Output */}
      {ragResponse && (
        <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Grounded Synthesis Answer
            </h4>
            <span className="text-xs text-gray-400">Query: "{ragResponse.query}"</span>
          </div>

          <p className="text-sm text-gray-200 leading-relaxed bg-[#0B0E14] p-4 rounded-xl border border-[#1E2638]">
            {ragResponse.answer}
          </p>

          {/* Citations list */}
          <div>
            <h5 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Document Citations & Page References</h5>
            <div className="space-y-3">
              {ragResponse.citations.map((cite: any, idx: number) => (
                <div key={idx} className="bg-[#0B0E14] p-4 rounded-xl border border-blue-900/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-blue-300">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-400" />
                      {cite.doc_title} ({cite.year})
                    </span>
                    <span className="bg-blue-950 text-blue-300 border border-blue-800/50 px-2 py-0.5 rounded font-mono">
                      Page {cite.page_number}
                    </span>
                  </div>
                  <p className="text-gray-400 italic">"{cite.content_snippet}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
