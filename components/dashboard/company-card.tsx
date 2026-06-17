import { GlassCard } from "@/components/ui/glass-card";
import { SignalBadge } from "./signal-badge";
import { ArrowUpRight, Globe, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    website: string | null;
    industry: string | null;
    description: string | null;
  };
  score: {
    totalScore: number;
    reasoning: string | null;
  } | null;
  signals: Array<{
    type: string;
  }>;
  onClick?: () => void;
}

export function CompanyCard({ company, score, signals, onClick }: CompanyCardProps) {
  const totalScore = score?.totalScore || 0;
  
  // Scoring tier color mapping
  const getScoreColor = (s: number) => {
    if (s >= 70) return "text-cyan-400 border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]";
    if (s >= 40) return "text-purple-400 border-purple-400/30 shadow-[0_0_15px_rgba(147,51,234,0.2)]";
    return "text-neutral-500 border-neutral-800";
  };

  return (
    <GlassCard 
      className="cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
      gradient={totalScore >= 70 ? "cyan" : totalScore >= 40 ? "purple" : undefined}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-neutral-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-tomorrow text-white leading-tight">
              {company.name}
            </h3>
            <div className="flex items-center space-x-2 text-[10px] text-neutral-500 font-mono mt-1">
              <Globe className="h-3 w-3" />
              <span>{company.website?.replace(/^https?:\/\//, '') || 'no-website.com'}</span>
            </div>
          </div>
        </div>
        
        <div className={cn(
          "px-3 py-1 rounded-full border bg-black/40 backdrop-blur-md font-tomorrow font-bold text-sm transition-all",
          getScoreColor(totalScore)
        )}>
          {totalScore}
        </div>
      </div>

      <p className="text-sm text-neutral-400 line-clamp-2 mb-6 h-10 leading-relaxed">
        {company.description || "No description available for this lead."}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {signals.slice(0, 3).map((s, i) => (
          <SignalBadge key={i} type={s.type as any} />
        ))}
        {signals.length > 3 && (
          <div className="text-[10px] text-neutral-600 font-bold self-center">
            +{signals.length - 3} MORE
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
          {company.industry || 'Unknown Industry'}
        </span>
        <div className="flex items-center space-x-1 text-neutral-400 group-hover:text-white transition-colors text-[10px] font-bold uppercase tracking-tighter">
          <span>View Insights</span>
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </div>
    </GlassCard>
  );
}
