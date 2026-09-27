'use client';

import React from 'react';
import { Cpu, Server, Database, Cloud, Shield, Zap, RefreshCw, FileText } from 'lucide-react';

export default function ArchitecturePage() {
  const awsServices = [
    { name: "CloudFront", category: "CDN / Edge", desc: "Global edge distribution for Next.js static assets and cached API responses with SSL termination." },
    { name: "AWS S3", category: "Object Storage", desc: "Encrypted storage bucket for raw Annual Reports, PDF filings, transcripts, and vector chunks." },
    { name: "ECS / EKS", category: "Compute Container", desc: "Autoscaling container clusters running FastAPI microservices and Celery background workers." },
    { name: "ALB (Application Load Balancer)", category: "Traffic Distribution", desc: "Layer-7 load balancing with dynamic path routing (/api/v1/* -> FastAPI backend)." },
    { name: "RDS PostgreSQL", category: "Relational DB", desc: "Multi-AZ PostgreSQL instance storing 10-year financial statements, master equities, and audit logs." },
    { name: "ElastiCache Redis", category: "In-Memory Cache", desc: "Sub-millisecond latency cache for stock quotes, calculated DCF outputs, and session state." },
    { name: "AWS SQS", category: "Queueing", desc: "Decoupled asynchronous queue for document chunk processing, RAG indexing, and news processing." },
    { name: "EventBridge", category: "Cron & Events", desc: "Scheduled event triggers for market close end-of-day data ingest and news feed updates." },
    { name: "Secrets Manager", category: "Security", desc: "Zero-exposure storage for LLM Provider API Keys (OpenAI, Anthropic, Gemini)." },
    { name: "CloudWatch", category: "Observability", desc: "Centralized logging, distributed tracing, latency APM metrics, and automated alert triggers." },
    { name: "Databricks Delta Lake", category: "Data Platform", desc: "Seamless connector for large-scale historical tick analytics, backtesting, and quantitative factor modeling." }
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Cpu className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">AWS & Databricks Production Architecture Specification</h1>
        </div>
        <p className="text-xs text-gray-400 max-w-3xl leading-relaxed">
          Production-grade enterprise cloud architecture blueprint designed for high availability, sub-second query latency, strict zero-hallucination AI guardrails, and Databricks historical analytics compatibility.
        </p>
      </div>

      {/* Architecture Visual Diagram Box */}
      <div className="bg-[#131822] border border-[#1E2638] rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-4">Enterprise System Dataflow Diagram</h2>
        <div className="bg-[#0B0E14] p-6 rounded-xl border border-[#1E2638] font-mono text-xs text-gray-300 overflow-x-auto space-y-4">
          <div className="flex items-center justify-between gap-4 min-w-[700px]">
            <div className="bg-blue-950/60 text-blue-300 border border-blue-800/60 p-3 rounded-lg text-center w-40">
              <span className="font-bold block">Clients / Web</span>
              <span className="text-[10px] text-gray-400">Next.js 14 / React</span>
            </div>
            <span className="text-blue-400 font-bold">➔ CloudFront / HTTPS ➔</span>
            <div className="bg-purple-950/60 text-purple-300 border border-purple-800/60 p-3 rounded-lg text-center w-48">
              <span className="font-bold block">ALB Load Balancer</span>
              <span className="text-[10px] text-gray-400">Layer-7 Route Manager</span>
            </div>
            <span className="text-purple-400 font-bold">➔</span>
            <div className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 p-3 rounded-lg text-center w-48">
              <span className="font-bold block">ECS FastAPI Cluster</span>
              <span className="text-[10px] text-gray-400">Python Financial Engines</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E2638] flex items-center justify-between gap-4 min-w-[700px]">
            <div className="bg-[#131822] border border-gray-700 p-3 rounded-lg text-center w-48">
              <span className="font-bold text-amber-400 block">ElastiCache Redis</span>
              <span className="text-[10px] text-gray-400">Metric Cache</span>
            </div>
            <div className="bg-[#131822] border border-gray-700 p-3 rounded-lg text-center w-48">
              <span className="font-bold text-blue-400 block">RDS PostgreSQL</span>
              <span className="text-[10px] text-gray-400">10Y Statements DB</span>
            </div>
            <div className="bg-[#131822] border border-gray-700 p-3 rounded-lg text-center w-48">
              <span className="font-bold text-purple-400 block">LLM Abstraction</span>
              <span className="text-[10px] text-gray-400">OpenAI / Gemini / Anthropic</span>
            </div>
            <div className="bg-[#131822] border border-gray-700 p-3 rounded-lg text-center w-48">
              <span className="font-bold text-emerald-400 block">Databricks Delta</span>
              <span className="text-[10px] text-gray-400">Historical Backtesting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {awsServices.map((svc, i) => (
          <div key={i} className="bg-[#131822] border border-[#1E2638] p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-base">{svc.name}</span>
              <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800/50 px-2 py-0.5 rounded font-bold uppercase">
                {svc.category}
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{svc.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
