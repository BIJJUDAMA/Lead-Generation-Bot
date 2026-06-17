"use client";

import { X, ChevronDown, DollarSign, Users, TrendingUp, Zap, Rocket, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface FilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterPopover({ isOpen, onClose }: FilterPopoverProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [minScore, setMinScore] = useState(Number(searchParams.get("score")) || 0);
  const [activeTypes, setActiveTypes] = useState<string[]>(
    searchParams.get("types")?.split(",").filter(Boolean) || []
  );

  // Sync state with URL
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (minScore > 0) params.set("score", minScore.toString());
        else params.delete("score");

        if (activeTypes.length > 0) params.set("types", activeTypes.join(","));
        else params.delete("types");

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [minScore, activeTypes]);

  const toggleType = (type: string) => {
    setActiveTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const resetFilters = () => {
    setMinScore(0);
    setActiveTypes([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-full mt-4 w-[320px] p-8 rounded-2xl bg-[#111111] border border-white/[0.08] shadow-2xl z-50 space-y-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-white/40" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Refine Intelligence</span>
            </div>
            <button 
              onClick={resetFilters}
              className="text-[10px] font-bold uppercase text-white/20 hover:text-white/60 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Intent Score */}
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white/60">Min. Intent Score</span>
              <span className="text-white font-mono">{minScore}+</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              step="10"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Signal Types */}
          <div className="space-y-5">
            <span className="text-xs font-semibold text-white/60">Signal Focus</span>
            <div className="space-y-0.5">
              <SignalToggle icon={DollarSign} label="Funding" active={activeTypes.includes("Funding")} onClick={() => toggleType("Funding")} />
              <SignalToggle icon={Users} label="Hiring" active={activeTypes.includes("Hiring")} onClick={() => toggleType("Hiring")} />
              <SignalToggle icon={TrendingUp} label="Growth" active={activeTypes.includes("Growth")} onClick={() => toggleType("Growth")} />
              <SignalToggle icon={Rocket} label="Launch" active={activeTypes.includes("Product Launch")} onClick={() => toggleType("Product Launch")} />
            </div>
          </div>

          {/* Sync Status */}
          {isPending && (
            <div className="pt-2 flex justify-center">
              <div className="flex items-center space-x-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                <span>Syncing Data...</span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SignalToggle({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all border border-transparent group",
        active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
      )}
    >
      <div className="flex items-center space-x-3">
        <Icon className={cn("h-3.5 w-3.5 transition-colors", active ? "text-white" : "text-white/20 group-hover:text-white/40")} />
        <span className={cn("text-[12px] font-medium transition-colors", active ? "text-white" : "text-white/40 group-hover:text-white/60")}>
          {label}
        </span>
      </div>
      <div className={cn(
        "w-3.5 h-3.5 rounded border flex items-center justify-center transition-all",
        active ? "bg-white border-white" : "border-white/10"
      )}>
        {active && <div className="w-1.5 h-1.5 bg-black rounded-[0.5px]" />}
      </div>
    </button>
  );
}
