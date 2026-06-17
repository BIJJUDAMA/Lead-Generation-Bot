"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LeadRowProps {
  company: {
    id: string;
    name: string;
  };
  score: {
    totalScore: number;
  } | null;
  signals: Array<{
    type: string;
  }>;
  onClick?: () => void;
}

export function LeadRow({ company, score, signals, onClick }: LeadRowProps) {
  const totalScore = score?.totalScore || 0;
  
  const getScoreColor = (s: number) => {
    if (s >= 70) return "text-emerald-500";
    if (s >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const signalSummary = Array.from(new Set(signals.map(s => s.type)))
    .slice(0, 2)
    .join(" • ");

  return (
    <div 
      onClick={onClick}
      className="group flex items-center justify-between py-5 px-8 rounded-2xl hover:bg-white/[0.03] transition-colors cursor-pointer border border-transparent hover:border-white/[0.02]"
    >
      <div className="flex items-center space-x-16 flex-1">
        {/* Name */}
        <div className="w-64">
          <h3 className="text-lg font-semibold text-white tracking-tight">
            {company.name}
          </h3>
        </div>

        {/* Signals Summary */}
        <div className="flex-1">
          <span className="text-sm text-white/30 font-medium italic group-hover:text-white/50 transition-colors">
            {signalSummary || "No recent activity"}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-16 text-right">
        {/* Recency */}
        <div className="w-24">
          <span className="text-[13px] text-white/10 font-medium">Just now</span>
        </div>

        {/* Score */}
        <div className="w-16">
          <span className={cn(
            "text-lg font-bold tabular-nums tracking-tighter",
            getScoreColor(totalScore)
          )}>
            {totalScore}
          </span>
        </div>
      </div>
    </div>
  );
}
