'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import {
  Users, Bot, Sparkles, ArrowRight, ShieldAlert, TrendingUp,
  Cpu, Award, RefreshCw, CheckCircle2, AlertTriangle, Scale,
  Terminal, Code2, Copy, Check, ChevronDown, ChevronUp, Layers,
  Activity, ExternalLink, Zap
} from 'lucide-react';

interface ToolCall {
  tool_name: string;
  arguments: Record<string, any>;
  output_summary: string;
  duration_ms: number;
}

interface ThoughtStep {
  step_id: number;
  role: string;
  agent_name: string;
  avatar_color: string;
  phase_title: string;
  thought_process: string;
  tool_calls: ToolCall[];
  intermediate_conclusion: string;
}

interface AgentOpinion {
  role: string;
  agent_name: string;
  stance: string;
  conviction_score: number;
  summary: string;
  key_arguments: string[];
  critical_risks: string[];
  fair_value_estimate?: number;
}

interface CommitteeResult {
  ticker: string;
  company_name: string;
  current_price: number;
  currency: string;
  query: string;
  deliberation_steps: ThoughtStep[];
  agent_opinions: Record<string, AgentOpinion>;
  adversarial_clash: {
    bull_thesis: string;
    bear_thesis: string;
    conflict_resolution: string;
    key_pivot_factor: string;
  };
  consensus: {
    recommendation: string;
    overall_conviction: number;
    target_price: number;
    current_price: number;
    expected_return_pct: number;
    horizon: string;
    suggested_allocation_pct: string;
    executive_summary: string;
    key_catalysts: string[];
    key_tail_risks: string[];
  };
  statutory_disclaimer: string;
}

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<'committee' | 'mcp'>('committee');
  const [selectedTicker, setSelectedTicker] = useState<string>('TATAMOTORS');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CommitteeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true });

  // MCP State
  const [mcpTools, setMcpTools] = useState<any[]>([]);
  const [selectedMcpTool, setSelectedMcpTool] = useState<string>('alphiq_stock_overview');
  const [mcpArgs, setMcpArgs] = useState<string>('{"ticker": "TATAMOTORS"}');
  const [mcpResult, setMcpResult] = useState<any>(null);
  const [mcpLoading, setMcpLoading] = useState<boolean>(false);
  const [copiedConfig, setCopiedConfig] = useState<string | null>(null);
  const [mcpConfigData, setMcpConfigData] = useState<any>(null);

  const sampleTickers = [
    { ticker: 'TATAMOTORS', label: 'Tata Motors', hint: 'Auto / EV / Chip Fab' },
    { ticker: 'RELIANCE', label: 'Reliance Ind', hint: 'Energy / Jio / Retail' },
    { ticker: 'TCS', label: 'TCS', hint: 'Semiconductor VLSI / IT' },
    { ticker: 'INFY', label: 'Infosys', hint: 'Topaz AI / Cloud' },
    { ticker: 'HDFCBANK', label: 'HDFC Bank', hint: 'Credit Expansion' },
    { ticker: 'NVDA', label: 'NVIDIA', hint: 'AI GPUs / US Tech' },
  ];

  // Initial load
  useEffect(() => {
    handleRunCommittee('TATAMOTORS');
    loadMcpInfo();
  }, []);

  const loadMcpInfo = () => {
    fetchApi<any>('/mcp/tools')
      .then((data) => {
        if (data && data.tools) setMcpTools(data.tools);
      })
      .catch((err) => console.error('Failed to load MCP tools:', err));

    fetchApi<any>('/mcp/config')
      .then((data) => {
        if (data) setMcpConfigData(data);
      })
      .catch((err) => console.error('Failed to load MCP config:', err));
  };

  const handleRunCommittee = (tickerToRun: string, queryToRun?: string) => {
    setLoading(true);
    setError(null);
    setSelectedTicker(tickerToRun);

    fetchApi<CommitteeResult>('/agents/committee/deliberate', {
      method: 'POST',
      body: JSON.stringify({
        ticker: tickerToRun,
        query: queryToRun || `Evaluate long-term risk-adjusted potential for ${tickerToRun}`
      })
    })
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Deliberation error:', err);
        setError('Failed to run Multi-Agent Committee. Please check backend connection.');
        setLoading(false);
      });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicker) return;
    handleRunCommittee(selectedTicker, customPrompt);
  };

  const toggleStep = (stepId: number) => {
    setExpandedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const handleExecuteMcpTool = () => {
    setMcpLoading(true);
    setMcpResult(null);

    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(mcpArgs);
    } catch (e) {
      setMcpResult({ error: 'Invalid JSON format in tool arguments.' });
      setMcpLoading(false);
      return;
    }

    fetchApi<any>(`/mcp/tools/${selectedMcpTool}/execute`, {
      method: 'POST',
      body: JSON.stringify(parsedArgs)
    })
      .then((res) => {
        setMcpResult(res);
        setMcpLoading(false);
      })
      .catch((err) => {
        setMcpResult({ error: err.message || 'Tool execution failed' });
        setMcpLoading(false);
      });
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedConfig(key);
    setTimeout(() => setCopiedConfig(null), 2500);
  };

  const currSym = result?.currency === 'USD' ? '$' : '₹';

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="relative bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-purple-950/60 border border-blue-500/30 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                AI Multi-Agent Investment Committee
              </h1>
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                Autonomous MCP Engine
              </span>
            </div>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              Five specialized AI agents debate intrinsic DCF valuations, ML forecasting trajectories, and governance red-flags. Agents autonomously query Alphiq's Model Context Protocol (MCP) tools to deliver institutional investment memorandums.
            </p>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="flex items-center gap-2 bg-[#0E131F] p-1.5 rounded-2xl border border-[#1E2638] self-start md:self-auto shrink-0 shadow-lg">
            <button
              onClick={() => setActiveTab('committee')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'committee'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-[#131822]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Investment Committee</span>
            </button>
            <button
              onClick={() => setActiveTab('mcp')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'mcp'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-[#131822]'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>MCP Protocol Hub</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'committee' ? (
        /* ========================================================================= */
        /* TAB 1: MULTI-AGENT INVESTMENT COMMITTEE DELIBERATION                      */
        /* ========================================================================= */
        <div className="space-y-8">
          {/* Preset Selector & Custom Input Box */}
          <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Select Ticker for Committee Deliberation
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Choose a bellwether stock or enter a custom research prompt below.
                </p>
              </div>
              <div className="text-xs font-mono text-gray-400">
                Quorum: <span className="text-emerald-400 font-bold">5 Autonomous Agents</span>
              </div>
            </div>

            {/* Quick Ticker Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {sampleTickers.map((st) => (
                <button
                  key={st.ticker}
                  onClick={() => handleRunCommittee(st.ticker)}
                  disabled={loading}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex flex-col text-left ${
                    selectedTicker === st.ticker
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/20'
                      : 'bg-[#131822] border-[#1E2638] text-gray-300 hover:border-blue-500/50 hover:bg-[#1A2234]'
                  }`}
                >
                  <span className="font-extrabold">{st.ticker}</span>
                  <span className={`text-[10px] ${selectedTicker === st.ticker ? 'text-blue-100' : 'text-gray-400'}`}>
                    {st.hint}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Input Form */}
            <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Custom Research Angle (e.g., 'Evaluate Tata Motors EV margin trajectory vs chip fab capex')..."
                className="flex-1 bg-[#131822] text-white placeholder-gray-500 px-4 py-3 rounded-xl border border-[#1E2638] focus:border-blue-500 focus:outline-none text-xs sm:text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Agents Deliberating...</span>
                  </>
                ) : (
                  <>
                    <span>Convene Committee</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs sm:text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Animation */}
          {loading && !result && (
            <div className="flex flex-col items-center justify-center min-h-[360px] bg-[#0E131F] rounded-3xl border border-[#1E2638] p-8 text-center space-y-4 shadow-2xl">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <Bot className="w-8 h-8 text-blue-400 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Investment Committee in Session</h4>
                <p className="text-xs text-gray-400 max-w-md">
                  Fundamentalist is auditing DCF models, Quant is running ARIMA-GARCH volatility cones, and the Devil's Advocate is probing downside vulnerabilities...
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-blue-400 bg-blue-950/40 px-3 py-1.5 rounded-xl border border-blue-800/40">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>Autonomous MCP Tool Invocations in Progress</span>
              </div>
            </div>
          )}

          {/* RESULTS: COMMITTEE DELIBERATION */}
          {result && !loading && (
            <div className="space-y-8">
              {/* Institutional Committee Consensus Hero Card */}
              <div className="bg-gradient-to-br from-[#0E131F] via-[#131822] to-[#161D2C] border-2 border-blue-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Award className="w-64 h-64 text-white" />
                </div>

                {/* Hero Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E2638] pb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-800/50">
                        {result.ticker}
                      </span>
                      <span className="text-xs font-semibold text-gray-400">
                        {result.company_name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3 mt-2">
                      <span className="text-3xl sm:text-4xl font-black text-white">
                        {currSym}{result.consensus.target_price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">Blended Target Price</span>
                      <span className={`text-sm font-bold px-2.5 py-0.5 rounded-lg ${
                        result.consensus.expected_return_pct >= 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {result.consensus.expected_return_pct >= 0 ? '+' : ''}{result.consensus.expected_return_pct}%
                      </span>
                    </div>
                  </div>

                  {/* Conviction & Recommendation Badges */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-[#1A2234] border border-[#2A364F] px-4 py-2.5 rounded-2xl text-center">
                      <div className="text-[10px] text-gray-400 uppercase font-bold">Consensus Verdict</div>
                      <div className="text-base sm:text-lg font-black text-blue-400">
                        {result.consensus.recommendation}
                      </div>
                    </div>

                    <div className="bg-[#1A2234] border border-[#2A364F] px-4 py-2.5 rounded-2xl text-center">
                      <div className="text-[10px] text-gray-400 uppercase font-bold">Conviction Score</div>
                      <div className="text-base sm:text-lg font-black text-emerald-400">
                        {result.consensus.overall_conviction} <span className="text-xs text-gray-500 font-normal">/ 10</span>
                      </div>
                    </div>

                    <div className="bg-[#1A2234] border border-[#2A364F] px-4 py-2.5 rounded-2xl text-center">
                      <div className="text-[10px] text-gray-400 uppercase font-bold">Horizon</div>
                      <div className="text-xs sm:text-sm font-bold text-gray-200 mt-0.5">
                        {result.consensus.horizon}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Executive Summary Memo */}
                <div className="space-y-2">
                  <div className="text-xs uppercase font-extrabold tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Executive Committee Memorandum</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-200 leading-relaxed bg-[#0B0E14]/70 p-5 rounded-2xl border border-[#1E2638]">
                    {result.consensus.executive_summary}
                  </p>
                </div>

                {/* Key Catalysts vs Tail Risks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#0B0E14]/60 border border-emerald-500/20 rounded-2xl p-4 space-y-2.5">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" /> Key Growth Catalysts
                    </span>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {result.consensus.key_catalysts.map((cat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{cat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#0B0E14]/60 border border-amber-500/20 rounded-2xl p-4 space-y-2.5">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Key Vulnerabilities & Tail Risks
                    </span>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {result.consensus.key_tail_risks.map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Allocation & Link Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#1E2638] text-xs">
                  <div className="text-gray-400">
                    Suggested Portfolio Sizing: <span className="text-white font-bold">{result.consensus.suggested_allocation_pct}</span>
                  </div>
                  <Link
                    href={`/stock/${result.ticker}`}
                    className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold"
                  >
                    <span>Open Detailed Financial Modeling for {result.ticker}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Adversarial Clash Card */}
              <div className="bg-[#0E131F] border border-[#1E2638] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Adversarial Debate Clash: Bull Thesis vs Devil's Advocate
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bull Case */}
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase text-emerald-400">Bull Case (Fundamental + Quant)</span>
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-500/40">
                        Upside Skew
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed">
                      {result.adversarial_clash.bull_thesis}
                    </p>
                  </div>

                  {/* Bear Case */}
                  <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase text-red-400">Bear Case (Devil's Advocate)</span>
                      <span className="text-[10px] font-mono text-red-300 bg-red-900/40 px-2 py-0.5 rounded border border-red-500/40">
                        Stress-Tested
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed">
                      {result.adversarial_clash.bear_thesis}
                    </p>
                  </div>
                </div>

                {/* Key Pivot Factor */}
                <div className="bg-[#131822] p-4 rounded-xl border border-[#1E2638] text-xs text-gray-300 flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Critical Pivot Point for Outperformance: </span>
                    <span>{result.adversarial_clash.key_pivot_factor}</span>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Deliberation Trace */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    Autonomous Deliberation Stepper & MCP Tool Execution Trace
                  </h3>
                  <button
                    onClick={() => {
                      const allOpen = Object.values(expandedSteps).every(Boolean);
                      setExpandedSteps({
                        1: !allOpen, 2: !allOpen, 3: !allOpen, 4: !allOpen, 5: !allOpen, 6: !allOpen
                      });
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Toggle All Steps
                  </button>
                </div>

                <div className="space-y-4">
                  {result.deliberation_steps.map((step) => {
                    const isOpen = expandedSteps[step.step_id] ?? true;
                    return (
                      <div
                        key={step.step_id}
                        className="bg-[#0E131F] border border-[#1E2638] rounded-2xl overflow-hidden transition-all shadow-md"
                      >
                        {/* Step Header */}
                        <button
                          onClick={() => toggleStep(step.step_id)}
                          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#131822] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md"
                              style={{ backgroundColor: step.avatar_color }}
                            >
                              S{step.step_id}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{step.agent_name}</span>
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-[#1E2638] text-gray-300">
                                  {step.role}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">{step.phase_title}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {step.tool_calls.length > 0 && (
                              <span className="hidden sm:inline text-[11px] font-mono text-blue-400 bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-800/40">
                                {step.tool_calls.length} MCP Tool{step.tool_calls.length > 1 ? 's' : ''}
                              </span>
                            )}
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {/* Step Expanded Body */}
                        {isOpen && (
                          <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-[#1E2638]/60 bg-[#0B0E14]/40">
                            {/* Thought Process */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                Agent Internal Reasoning
                              </span>
                              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-[#131822] p-3.5 rounded-xl border border-[#1E2638]">
                                {step.thought_process}
                              </p>
                            </div>

                            {/* Tool Calls Executed */}
                            {step.tool_calls.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider flex items-center gap-1">
                                  <Terminal className="w-3 h-3" /> MCP Tools Executed
                                </span>
                                <div className="space-y-2">
                                  {step.tool_calls.map((tc, tcIdx) => (
                                    <div
                                      key={tcIdx}
                                      className="p-3 rounded-xl bg-[#0F172A] border border-blue-500/20 text-xs font-mono space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between text-blue-400">
                                        <span className="font-bold">{tc.tool_name}</span>
                                        <span className="text-[10px] text-gray-400">{tc.duration_ms} ms</span>
                                      </div>
                                      <div className="text-gray-400 text-[11px]">
                                        Args: <span className="text-gray-200">{JSON.stringify(tc.arguments)}</span>
                                      </div>
                                      <div className="text-emerald-400 text-[11px] bg-[#070D18] p-2 rounded-lg border border-gray-800">
                                        {tc.output_summary}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Intermediate Conclusion */}
                            <div className="flex items-start gap-2 text-xs font-semibold text-gray-300 bg-blue-950/20 p-3 rounded-xl border border-blue-500/20">
                              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                              <span>{step.intermediate_conclusion}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Statutory Disclaimer */}
              <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 flex items-start gap-3 shadow-lg">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                    Statutory Educational Compliance (SEBI / RBI Norms)
                  </span>
                  <p className="text-gray-300 leading-relaxed text-[11px]">
                    {result.statutory_disclaimer}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* TAB 2: MODEL CONTEXT PROTOCOL (MCP) HUB & LIVE SANDBOX                    */
        /* ========================================================================= */
        <div className="space-y-8">
          {/* MCP Overview Info */}
          <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Alphiq Model Context Protocol (MCP) Architecture</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              The <strong>Model Context Protocol (MCP)</strong> is the open standard that connects LLM applications and external agents with secure platform capabilities. Alphiq implements standard JSON-RPC 2.0 (specification <code>2024-11-05</code>) over both <strong>stdio transport</strong> (for Claude Desktop / Antigravity IDE) and <strong>HTTP JSON-RPC transport</strong>.
            </p>
          </div>

          {/* Interactive Live MCP Sandbox */}
          <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Live MCP Tool Interactive Sandbox
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Execute any registered Alphiq MCP tool directly and view the raw JSON-RPC response.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-800/40">
                {mcpTools.length} Tools Live
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Tool Selector & Arguments */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Select MCP Tool:
                  </label>
                  <select
                    value={selectedMcpTool}
                    onChange={(e) => {
                      const t = e.target.value;
                      setSelectedMcpTool(t);
                      if (t === 'alphiq_ml_forecast') {
                        setMcpArgs('{"ticker": "TATAMOTORS", "days": 90}');
                      } else if (t === 'alphiq_dcf_valuation') {
                        setMcpArgs('{"ticker": "TATAMOTORS", "wacc": 11.5, "terminal_growth": 5.0}');
                      } else {
                        setMcpArgs('{"ticker": "TATAMOTORS"}');
                      }
                    }}
                    className="w-full bg-[#131822] text-white px-3.5 py-2.5 rounded-xl border border-[#1E2638] text-xs font-mono focus:outline-none focus:border-blue-500"
                  >
                    {mcpTools.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    JSON Input Arguments:
                  </label>
                  <textarea
                    rows={5}
                    value={mcpArgs}
                    onChange={(e) => setMcpArgs(e.target.value)}
                    className="w-full bg-[#070D18] text-emerald-400 font-mono text-xs p-3.5 rounded-xl border border-[#1E2638] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleExecuteMcpTool}
                  disabled={mcpLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {mcpLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Executing Tool...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Execute '{selectedMcpTool}'</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: JSON-RPC Execution Output */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase">
                  Execution Output (JSON-RPC):
                </label>
                <div className="bg-[#070D18] border border-[#1E2638] rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs text-gray-300">
                  {mcpResult ? (
                    <pre className="text-emerald-400 whitespace-pre-wrap">
                      {JSON.stringify(mcpResult, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-gray-500 text-center flex flex-col items-center justify-center h-full">
                      <Code2 className="w-8 h-8 mb-2 opacity-50" />
                      <span>Click 'Execute' to run this tool live against Alphiq engine</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Connect Alphiq MCP to External Clients (Claude Desktop / Antigravity) */}
          <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">
                One-Click Configuration for Claude Desktop & Cursor / Antigravity
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-300 leading-relaxed">
                Add this snippet to your <code>claude_desktop_config.json</code> (or Antigravity IDE configuration) to allow Claude Desktop to directly evaluate Indian equities and run Alphiq DCF and ML forecast tools:
              </p>

              {mcpConfigData && (
                <div className="relative bg-[#070D18] border border-[#1E2638] rounded-2xl p-4 font-mono text-xs text-gray-200 overflow-x-auto">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(mcpConfigData.claude_desktop, null, 2), 'claude')}
                    className="absolute top-3 right-3 px-3 py-1.5 bg-[#1E2638] hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg flex items-center gap-1.5 text-xs transition-colors"
                  >
                    {copiedConfig === 'claude' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Config</span>
                      </>
                    )}
                  </button>

                  <pre className="text-blue-300">
                    {JSON.stringify(mcpConfigData.claude_desktop, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
