"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Calendar, ChevronRight } from "lucide-react";
import { SignalBadge } from "./signal-badge";
import { cn } from "@/lib/utils";

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    company: {
      name: string;
      website: string | null;
      industry: string | null;
      description: string | null;
      size: string | null;
      stage: string | null;
    };
    score: {
      totalScore: number;
      reasoning: string | null;
      breakdown: {
        hiring: number;
        funding: number;
        growth: number;
      };
    } | null;
    signals: Array<{
      id: string;
      type: string;
      content: string;
      createdAt: Date;
    }>;
  } | null;
}

export function DetailPanel({ isOpen, onClose, data }: DetailPanelProps) {
  if (!data) return null;

  const { company, score, signals } = data;

  const getScoreColor = (s: number) => {
    if (s >= 70) return "text-emerald-500";
    if (s >= 40) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#0B0B0B] border-l border-white/[0.06] z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-10 pb-6 flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-4xl font-bold tracking-tight text-white">{company.name}</h2>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-white/30">{company.industry}</span>
                  {company.website && (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      className="flex items-center space-x-1 text-xs text-white/20 hover:text-white/60 transition-colors"
                    >
                      <span>{company.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-white/20 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-10 py-6 space-y-16">
              {/* Score Highlight */}
              <section className="flex items-baseline space-x-4">
                <span className={cn("text-7xl font-bold tracking-tighter", getScoreColor(score?.totalScore || 0))}>
                  {score?.totalScore}
                </span>
                <div className="flex flex-col">
                  <span className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", getScoreColor(score?.totalScore || 0))}>
                    Intent Priority
                  </span>
                  <span className="text-xs text-white/20 font-medium">Last updated today</span>
                </div>
              </section>

              {/* Reasoning */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Strategy Reasoning</h3>
                <p className="text-xl text-white/80 leading-relaxed font-medium">
                  {score?.reasoning}
                </p>
              </section>

              {/* Breakdown Bars */}
              <section className="space-y-8">
                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Signal Breakdown</h3>
                <div className="grid grid-cols-1 gap-6">
                  <ScoreBar label="Hiring" value={score?.breakdown.hiring || 0} max={60} color="bg-white" />
                  <ScoreBar label="Funding" value={score?.breakdown.funding || 0} max={55} color="bg-white/40" />
                  <ScoreBar label="Growth" value={score?.breakdown.growth || 0} max={35} color="bg-white/20" />
                </div>
              </section>

              {/* Signal Timeline */}
              <section className="space-y-8 pb-10">
                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Timeline</h3>
                <div className="space-y-1">
                  {signals.map((signal) => (
                    <div key={signal.id} className="group py-4 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <SignalBadge type={signal.type as any} />
                        <span className="text-[10px] font-mono text-white/20">{new Date(signal.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[15px] text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
                        {signal.content}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Actions */}
            <div className="p-10 pt-6 border-t border-white/[0.06] bg-[#0B0B0B]">
              <button className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center space-x-2">
                <span>Start Outreach</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ScoreBar({ label, value, max, color }: { label: string, value: number, max: number, color: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white/40">{label}</span>
        <span className="text-sm font-bold text-white/60 tabular-nums">{value}</span>
      </div>
      <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className={cn("h-full rounded-full", color)} 
        />
      </div>
    </div>
  );
}
