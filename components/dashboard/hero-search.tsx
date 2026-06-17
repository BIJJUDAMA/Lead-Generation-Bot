"use client";

import { Search, Command } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function HeroSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query);
      else params.delete("q");
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative max-w-2xl mx-auto mb-16">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30">
        <Search className="h-5 w-5" />
      </div>
      <input 
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search companies, signals, industries..."
        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl py-5 pl-16 pr-20 text-lg text-white focus:outline-none focus:bg-white/[0.05] focus:border-white/10 transition-all placeholder:text-white/20"
      />
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] font-bold text-white/40">
        <Command className="h-3 w-3" />
        <span>K</span>
      </div>
    </div>
  );
}
