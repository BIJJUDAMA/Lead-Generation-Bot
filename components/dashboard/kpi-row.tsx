"use client";

import { TrendingUp, Users, Zap, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  zap: Zap,
  users: Users,
  trending: TrendingUp,
  bar: BarChart3,
};

interface KPI {
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: keyof typeof iconMap;
  sparkline: number[];
}

export function KPIRow({ data }: { data: KPI[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-12 mb-16">
      {data.map((kpi, i) => {
        const Icon = iconMap[kpi.icon];
        
        return (
          <div 
            key={i} 
            className="p-6 rounded-2xl bg-[#111111] border border-white/[0.04] flex flex-col justify-between h-[160px] group hover:border-white/[0.08] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center text-white/40 group-hover:text-white/60 transition-colors">
                <Icon className="h-4 w-4" />
              </div>
              <div className={cn(
                "flex items-center space-x-1 text-[11px] font-bold",
                kpi.trendUp ? "text-emerald-500" : "text-red-500"
              )}>
                <span>{kpi.trend}</span>
                {kpi.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-white/30 uppercase tracking-[0.15em]">{kpi.label}</div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold tracking-tighter text-white">{kpi.value}</div>
                <Sparkline data={kpi.sparkline} color={kpi.trendUp ? "#10B981" : "#EF4444"} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Sparkline({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 24;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="opacity-40 group-hover:opacity-70 transition-opacity">
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
