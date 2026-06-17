"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, ExternalLink, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterPopover } from "./filter-popover";

interface Signal {
  id: string;
  type: string;
  content: string;
  createdAt: string | Date;
}

interface Company {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
}

interface Score {
  totalScore: number;
  reasoning: string | null;
}

interface Lead {
  company: Company;
  score: Score | null;
  signals: Signal[];
}

export function LeadTable({ data }: { data: Lead[] }) {
  const [activeTab, setActiveTab] = useState("All Leads");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const tabs = ["All Leads", "High Intent", "Medium", "Low"];

  return (
    <div className="flex-1 min-w-0 space-y-8">
      {/* Table Header */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold text-white tracking-tight">Lead Intelligence</h3>
        
        <div className="flex items-center space-x-12">
          {/* Tabs */}
          <div className="flex items-center space-x-8">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-[13px] font-bold uppercase tracking-widest transition-all",
                  activeTab === tab ? "text-white" : "text-white/20 hover:text-white/40"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filter Popover Trigger */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "flex items-center space-x-2.5 px-4 py-2 rounded-xl border transition-all text-[12px] font-bold uppercase tracking-wider",
                isFilterOpen 
                  ? "bg-white text-black border-white" 
                  : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white hover:border-white/10"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filter</span>
            </button>
            <FilterPopover isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="space-y-1">
        {/* Column Labels */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/[0.04] text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
          <div className="w-[30%]">Company</div>
          <div className="w-[15%]">Intent Score</div>
          <div className="w-[25%]">Signals</div>
          <div className="w-[15%]">Trend</div>
          <div className="w-[10%]">Recency</div>
          <div className="w-8" />
        </div>

        {/* Rows */}
        {data.map((lead) => (
          <LeadRow 
            key={lead.company.id} 
            lead={lead} 
            isExpanded={expandedId === lead.company.id}
            onToggle={() => setExpandedId(expandedId === lead.company.id ? null : lead.company.id)}
          />
        ))}
      </div>
    </div>
  );
}

function LeadRow({ lead, isExpanded, onToggle }: { lead: Lead, isExpanded: boolean, onToggle: () => void }) {
  const { company, score, signals } = lead;
  const totalScore = score?.totalScore || 0;

  const getScoreColor = (s: number) => {
    if (s >= 70) return "text-emerald-500";
    if (s >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const getTier = (s: number) => {
    if (s >= 70) return "High";
    if (s >= 40) return "Medium";
    return "Low";
  };

  return (
    <div className="group border-b border-white/[0.02] last:border-0 overflow-hidden transition-colors hover:bg-white/[0.01]">
      {/* Summary Row */}
      <div 
        onClick={onToggle}
        className="flex items-center justify-between px-8 py-6 cursor-pointer group/row transition-all hover:-translate-y-[1px]"
      >
        {/* Company */}
        <div className="w-[30%] flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-white/20 group-hover/row:text-white/40 transition-colors uppercase font-bold text-sm font-mono">
            {company.name.charAt(0)}
          </div>
          <div>
            <h4 className="text-[15px] font-semibold text-white tracking-tight">{company.name}</h4>
            <div className="text-[12px] text-white/20 font-medium">{company.website || 'No website'}</div>
          </div>
        </div>

        {/* Score */}
        <div className="w-[15%] flex items-baseline space-x-2">
          <span className={cn("text-2xl font-bold tracking-tighter tabular-nums", getScoreColor(totalScore))}>
            {totalScore}
          </span>
          <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-40", getScoreColor(totalScore))}>
            {getTier(totalScore)}
          </span>
        </div>

        {/* Signals */}
        <div className="w-[25%] flex flex-wrap gap-2">
          {Array.from(new Set(signals.map(s => s.type))).slice(0, 2).map((type, i) => (
            <span key={i} className="text-[11px] font-bold text-white/30 bg-white/[0.04] px-2 py-0.5 rounded-md">
              {type}
            </span>
          ))}
          {signals.length > 2 && <span className="text-[10px] font-bold text-white/10 self-center">+{signals.length - 2}</span>}
        </div>

        {/* Trend */}
        <div className="w-[15%]">
           <SimpleSparkline data={[40, 45, 38, 52, 60, 58, 65]} color={totalScore >= 40 ? "#10B981" : "#EF4444"} />
        </div>

        {/* Recency */}
        <div className="w-[10%] text-[12px] text-white/20 font-medium">
          2h ago
        </div>

        {/* Action */}
        <div className="w-8 flex justify-end text-white/10 group-hover/row:text-white/40 transition-colors">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/[0.02]"
          >
            <div className="px-24 py-12 space-y-12 border-t border-white/[0.04]">
              {/* Reasoning */}
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/20">Strategic Intent Reasoning</h5>
                <p className="text-xl text-white/70 leading-relaxed font-medium max-w-3xl">
                  {score?.reasoning || "Analyzing latest signals to determine outreach strategy..."}
                </p>
              </div>

              {/* Detailed Signals Feed */}
              <div className="space-y-6">
                <h5 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/20">Discovery Timeline</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {signals.map(s => (
                    <div key={s.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">{s.type}</span>
                        <span className="text-[10px] font-mono text-white/10">{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed italic">"{s.content}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SimpleSparkline({ data, color }: { data: number[], color: string }) {
  const width = 80;
  const height = 16;
  const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - (d / 100) * height}`).join(" ");

  return (
    <svg width={width} height={height} className="opacity-30 group-hover/row:opacity-60 transition-opacity">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
