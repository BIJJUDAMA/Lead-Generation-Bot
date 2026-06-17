import { cn } from "@/lib/utils";

type SignalType = "Funding" | "Hiring" | "Growth" | "Expansion" | "Product Launch" | "Other";

interface SignalBadgeProps {
  type: SignalType;
  className?: string;
}

export function SignalBadge({ type, className }: SignalBadgeProps) {
  const config: Record<string, string> = {
    Funding: "text-purple-400",
    Hiring: "text-blue-400",
    Growth: "text-emerald-400",
    Expansion: "text-orange-400",
    "Product Launch": "text-pink-400",
    Other: "text-white/40",
  };

  const color = config[type] || config.Other;

  return (
    <div className={cn("inline-flex items-center text-[10px] font-bold uppercase tracking-wider", color, className)}>
      <span>{type}</span>
    </div>
  );
}
