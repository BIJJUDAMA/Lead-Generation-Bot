"use client";

import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

interface FilterSidebarProps {
  className?: string;
  totalCount: number;
}

export function FilterSidebar({ className, totalCount }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for immediate feedback
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [minScore, setMinScore] = useState(Number(searchParams.get("score")) || 0);
  const [selectedTypes, setSelectedIdTypes] = useState<string[]>(
    searchParams.get("types")?.split(",").filter(Boolean) || []
  );

  // Sync URL function
  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "0") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get("q") || "")) {
        updateFilters({ q: search });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleType = (type: string) => {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedIdTypes(next);
    updateFilters({ types: next.join(",") });
  };

  const clearFilters = () => {
    setSearch("");
    setMinScore(0);
    setSelectedIdTypes([]);
    router.push(pathname);
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Search Input */}
      <div className="relative group">
        <Search className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
          isPending ? "text-cyan-500 animate-pulse" : "text-neutral-500 group-focus-within:text-white"
        )} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies..."
          className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-neutral-600 transition-all placeholder:text-neutral-600"
        />
      </div>

      {/* Filter Sections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Filters</h4>
          <button 
            onClick={clearFilters}
            className="text-[9px] font-bold text-neutral-600 hover:text-white uppercase flex items-center space-x-1 transition-colors"
          >
            <span>Reset</span>
            <X className="h-2.5 w-2.5" />
          </button>
        </div>

        {/* Intent Score Slider */}
        <div className="space-y-4">
          <label className="text-[11px] font-semibold text-neutral-400 font-tomorrow flex items-center justify-between">
            <span>Minimum Intent</span>
            <span className="text-purple-400 font-mono">{minScore}+</span>
          </label>
          <input 
            type="range"
            min="0"
            max="100"
            step="10"
            value={minScore}
            onChange={(e) => {
              const val = e.target.value;
              setMinScore(Number(val));
              updateFilters({ score: val });
            }}
            className="w-full h-1.5 bg-neutral-900 rounded-full appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[9px] font-mono text-neutral-600 uppercase">
            <span>Cold</span>
            <span>Warm</span>
            <span>Hot</span>
          </div>
        </div>

        {/* Signal Types */}
        <div className="space-y-3">
          <label className="text-[11px] font-semibold text-neutral-400 font-tomorrow">Signal Types</label>
          <div className="grid grid-cols-1 gap-2">
            {["Funding", "Hiring", "Product Launch", "Expansion"].map((type) => {
              const isActive = selectedTypes.includes(type);
              return (
                <button 
                  key={type}
                  onClick={() => toggleType(type)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-lg border transition-all text-left group",
                    isActive 
                      ? "border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                      : "border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 hover:bg-neutral-900"
                  )}
                >
                  <span className={cn(
                    "text-xs transition-colors",
                    isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-300"
                  )}>{type}</span>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    isActive ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "bg-neutral-800 group-hover:bg-neutral-700"
                  )} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Industries (Simplified for now) */}
        <div className="space-y-3">
          <label className="text-[11px] font-semibold text-neutral-400 font-tomorrow">Industry</label>
          <button className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900/30 text-xs text-neutral-500 hover:text-white transition-colors cursor-not-allowed">
            <span>All Industries</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="pt-8 border-t border-white/5">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border border-white/5">
          <div className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Results Found</div>
          <div className="text-2xl font-bold font-tomorrow text-white">{totalCount}</div>
          <div className={cn(
            "text-[9px] font-mono mt-1 transition-colors",
            isPending ? "text-cyan-500" : "text-neutral-600"
          )}>
            {isPending ? "Syncing data..." : "Real-time verification"}
          </div>
        </div>
      </div>
    </div>
  );
}
