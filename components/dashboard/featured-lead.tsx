"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturedLeadProps {
  data: {
    company: {
      name: string;
      industry: string | null;
    };
    score: {
      totalScore: number;
      reasoning: string | null;
    } | null;
  } | null;
}

export function FeaturedLead({ data }: FeaturedLeadProps) {
  if (!data) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mb-16 rounded-3xl bg-white/[0.02] border border-white/[0.04] p-12 flex flex-col md:flex-row items-center justify-between gap-12 group hover:bg-white/[0.03] transition-colors"
    >
      <div className="space-y-8 flex-1">
        <div className="flex items-center space-x-2.5">
          <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">Top Opportunity</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-5xl font-bold tracking-tight text-white leading-none">{data.company.name}</h2>
          <p className="text-xl text-white/50 leading-relaxed font-medium max-w-lg">
            {data.score?.reasoning}
          </p>
        </div>

        <button className="flex items-center space-x-2 text-sm font-semibold text-white/40 hover:text-white transition-colors group/btn">
          <span>Explore deep intelligence</span>
          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="flex flex-col items-end">
        <div className="text-[140px] font-bold tracking-tighter leading-none text-white/90 group-hover:text-white transition-colors">
          {data.score?.totalScore}
        </div>
        <div className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/20 mt-2">Intent Matrix</div>
      </div>
    </motion.section>
  );
}
