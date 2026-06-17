import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: "purple" | "cyan" | "orange";
}

export function GlassCard({ children, className, gradient }: GlassCardProps) {
  const gradients = {
    purple: "from-purple-500/10 to-pink-500/10",
    cyan: "from-cyan-500/10 to-blue-500/10",
    orange: "from-orange-500/10 to-red-500/10",
  };

  return (
    <div className={cn(
      "glass-card p-6 rounded-2xl relative overflow-hidden group",
      gradient && `bg-gradient-to-br ${gradients[gradient]}`,
      className
    )}>
      {/* Subtle Inner Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
