"use client";

import { Search, Bell, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function TopBar() {
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
    <div className="h-[72px] px-12 border-b border-white/[0.04] bg-[#0A0A0A] flex items-center justify-between sticky top-0 z-30">
      {/* Spotlight-style Search */}
      <div className="relative w-full max-w-[600px]">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
          <Search className="h-4 w-4" />
        </div>
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search companies, signals, industries..."
          className="w-full bg-[#050505] border border-white/[0.06] rounded-xl py-2.5 pl-11 pr-4 text-[13px] text-white focus:outline-none focus:border-white/10 transition-all placeholder:text-white/20"
        />
      </div>

      {/* Global Actions - Removed */}
      <div className="flex items-center space-x-6">
      </div>
    </div>
  );
}
