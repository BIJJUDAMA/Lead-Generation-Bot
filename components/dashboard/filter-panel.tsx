"use client";

import { X, ChevronDown, DollarSign, Users, TrendingUp, Zap, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface FilterPanelProps {
  className?: string;
}

export function FilterPanel({ className }: FilterPanelProps) {
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
    <div className={cn("w-[300px] space-y-12", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Refine Leads</h3>
          {isPending && <div className="w-1 h-1 rounded-full bg-white animate-pulse" />}
        </div>
        <button 
          onClick={resetFilters}
          className="text-[10px] font-bold uppercase text-white/20 hover:text-white/60 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Intent Score Slider */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/60">Minimum Intent Score</span>
          <span className="text-sm font-bold text-white font-mono">{minScore}+</span>
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
        <div className="flex justify-between text-[10px] font-bold text-white/10 tracking-widest">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Signal Types Vertical List */}
      <div className="space-y-6">
        <span className="text-xs font-semibold text-white/60">Signal Types</span>
        <div className="space-y-1">
          <SignalToggle icon={DollarSign} label="Funding" active={activeTypes.includes("Funding")} onClick={() => toggleType("Funding")} />
          <SignalToggle icon={Users} label="Hiring" active={activeTypes.includes("Hiring")} onClick={() => toggleType("Hiring")} />
          <SignalToggle icon={TrendingUp} label="Growth" active={activeTypes.includes("Growth")} onClick={() => toggleType("Growth")} />
          <SignalToggle icon={Rocket} label="Product Launch" active={activeTypes.includes("Product Launch")} onClick={() => toggleType("Product Launch")} />
          <SignalToggle icon={Zap} label="Expansion" active={activeTypes.includes("Expansion")} onClick={() => toggleType("Expansion")} />
        </div>
      </div>

      {/* Industry Dropdown */}
      <div className="space-y-6">
        <span className="text-xs font-semibold text-white/60">Industry</span>
        <button className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04] text-xs font-medium text-white/40 hover:text-white hover:bg-white/[0.05] transition-all">
          <span>All Industries</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SignalToggle({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border border-transparent group",
        active ? "bg-white/[0.06] border-white/5" : "hover:bg-white/[0.02]"
      )}
    >
      <div className="flex items-center space-x-3">
        <Icon className={cn("h-4 w-4 transition-colors", active ? "text-white" : "text-white/20 group-hover:text-white/40")} />
        <span className={cn("text-[13px] font-medium transition-colors", active ? "text-white" : "text-white/40 group-hover:text-white/60")}>
          {label}
        </span>
      </div>
      <div className={cn(
        "w-4 h-4 rounded border flex items-center justify-center transition-all",
        active ? "bg-white border-white" : "border-white/10 group-hover:border-white/20"
      )}>
        {active && <div className="w-2 h-2 bg-black rounded-[1px]" />}
      </div>
    </button>
  );
}
