'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';

import StockHeader from '@/components/stock/StockHeader';
import InvestmentSnapshot from '@/components/stock/InvestmentSnapshot';
import IncomeStatementTab from '@/components/stock/IncomeStatementTab';
import BalanceSheetTab from '@/components/stock/BalanceSheetTab';
import CashFlowTab from '@/components/stock/CashFlowTab';
import ProfitabilityTab from '@/components/stock/ProfitabilityTab';
import GrowthTab from '@/components/stock/GrowthTab';
import ValuationTab from '@/components/stock/ValuationTab';
import PeerComparisonTab from '@/components/stock/PeerComparisonTab';
import TechnicalAnalysisTab from '@/components/stock/TechnicalAnalysisTab';
import ShareholdingTab from '@/components/stock/ShareholdingTab';
import GovernanceTab from '@/components/stock/GovernanceTab';
import EarningsAnalysisTab from '@/components/stock/EarningsAnalysisTab';
import DocumentRAGTab from '@/components/stock/DocumentRAGTab';
import NewsIntelligenceTab from '@/components/stock/NewsIntelligenceTab';
import AIThesisTab from '@/components/stock/AIThesisTab';

import {
  FileText, TrendingUp, DollarSign, Calculator, Layers, Activity,
  Users, ShieldCheck, Sparkles, BookOpen, Newspaper, LineChart as ChartIcon
} from 'lucide-react';

export default function StockResearchPage() {
  const params = useParams();
  const ticker = (params.ticker as string).toUpperCase();

  const [activeTab, setActiveTab] = useState<string>('thesis');
  const [overview, setOverview] = useState<any>(null);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [incomeData, setIncomeData] = useState<any>(null);
  const [balanceData, setBalanceData] = useState<any>(null);
  const [cashFlowData, setCashFlowData] = useState<any>(null);
  const [profitabilityData, setProfitabilityData] = useState<any>(null);
  const [growthData, setGrowthData] = useState<any>(null);
  const [valuationData, setValuationData] = useState<any>(null);
  const [peerData, setPeerData] = useState<any>(null);
  const [techData, setTechData] = useState<any>(null);
  const [shareholdingData, setShareholdingData] = useState<any>(null);
  const [governanceData, setGovernanceData] = useState<any>(null);
  const [earningsData, setEarningsData] = useState<any>(null);
  const [newsData, setNewsData] = useState<any>(null);
  const [thesisData, setThesisData] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchApi<any>(`/stocks/${ticker}/overview`),
      fetchApi<any>(`/stocks/${ticker}/snapshot`),
      fetchApi<any>(`/financials/${ticker}/income-statement`),
      fetchApi<any>(`/financials/${ticker}/balance-sheet`),
      fetchApi<any>(`/financials/${ticker}/cash-flow`),
      fetchApi<any>(`/analytics/${ticker}/profitability`),
      fetchApi<any>(`/analytics/${ticker}/growth`),
      fetchApi<any>(`/valuation/${ticker}`),
      fetchApi<any>(`/peers/${ticker}`),
      fetchApi<any>(`/technicals/${ticker}`),
      fetchApi<any>(`/governance/${ticker}/shareholding`),
      fetchApi<any>(`/governance/${ticker}/governance-events`),
      fetchApi<any>(`/earnings/${ticker}`),
      fetchApi<any>(`/news?ticker=${ticker}`),
      fetchApi<any>(`/thesis/${ticker}`),
    ])
      .then(([ov, sn, inc, bal, cf, prof, gr, val, pr, tech, sh, gov, earn, news, th]) => {
        setOverview(ov);
        setSnapshot(sn);
        setIncomeData(inc);
        setBalanceData(bal);
        setCashFlowData(cf);
        setProfitabilityData(prof);
        setGrowthData(gr);
        setValuationData(val);
        setPeerData(pr);
        setTechData(tech);
        setShareholdingData(sh);
        setGovernanceData(gov);
        setEarningsData(earn);
        setNewsData(news);
        setThesisData(th);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch stock research data:', err);
        setLoading(false);
      });
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3" />
        Running Equity Research Engine for {ticker}...
      </div>
    );
  }

  if (!overview) {
    return <div className="text-center py-12 text-gray-400">Stock ticker '{ticker}' not found.</div>;
  }

  const tabs = [
    { id: 'thesis', label: 'AI Investment Thesis', icon: Sparkles },
    { id: 'income', label: 'Income Statement (10Y)', icon: FileText },
    { id: 'balance', label: 'Balance Sheet (10Y)', icon: DollarSign },
    { id: 'cashflow', label: 'Cash Flow & Red Flags', icon: Activity },
    { id: 'profitability', label: 'Profitability Trends', icon: TrendingUp },
    { id: 'growth', label: 'CAGR Growth', icon: ChartIcon },
    { id: 'valuation', label: 'Valuation & DCF', icon: Calculator },
    { id: 'peers', label: 'Peer Comparison', icon: Layers },
    { id: 'technicals', label: 'Technical Analysis', icon: Activity },
    { id: 'shareholding', label: 'Shareholding', icon: Users },
    { id: 'governance', label: 'Governance & Auditors', icon: ShieldCheck },
    { id: 'earnings', label: 'Earnings Analysis', icon: Sparkles },
    { id: 'rag', label: 'Document RAG Q&A', icon: BookOpen },
    { id: 'news', label: 'News Intelligence', icon: Newspaper },
  ];

  return (
    <div className="space-y-6">
      {/* Stock Header */}
      <StockHeader overview={overview} />

      {/* Investment Snapshot */}
      {snapshot && <InvestmentSnapshot snapshot={snapshot} />}

      {/* Navigation Tabs Bar */}
      <div className="border-b border-[#1E2638] overflow-x-auto pb-1">
        <div className="flex space-x-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#131822]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">
        {activeTab === 'thesis' && thesisData && <AIThesisTab data={thesisData} />}
        {activeTab === 'income' && incomeData && <IncomeStatementTab data={incomeData} />}
        {activeTab === 'balance' && balanceData && <BalanceSheetTab data={balanceData} />}
        {activeTab === 'cashflow' && cashFlowData && <CashFlowTab data={cashFlowData} />}
        {activeTab === 'profitability' && profitabilityData && <ProfitabilityTab data={profitabilityData} />}
        {activeTab === 'growth' && growthData && <GrowthTab data={growthData} />}
        {activeTab === 'valuation' && valuationData && <ValuationTab ticker={ticker} data={valuationData} />}
        {activeTab === 'peers' && peerData && <PeerComparisonTab targetTicker={ticker} peers={peerData.peers} />}
        {activeTab === 'technicals' && techData && <TechnicalAnalysisTab data={techData} />}
        {activeTab === 'shareholding' && shareholdingData && <ShareholdingTab data={shareholdingData} />}
        {activeTab === 'governance' && governanceData && <GovernanceTab data={governanceData} />}
        {activeTab === 'earnings' && earningsData && <EarningsAnalysisTab data={earningsData} />}
        {activeTab === 'rag' && <DocumentRAGTab ticker={ticker} />}
        {activeTab === 'news' && newsData && <NewsIntelligenceTab articles={newsData} />}
      </div>
    </div>
  );
}
