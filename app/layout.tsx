import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Bookmark, 
  Ban, 
  Settings, 
  UserCircle 
} from "lucide-react";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Intelligence",
  description: "Internal Lead Generation Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "bg-[#050505] text-white antialiased")}>
        <div className="flex min-h-screen">
          {/* macOS-style Matte Sidebar */}
          <aside className="w-[260px] border-r border-white/[0.06] bg-[#050505] flex flex-col fixed inset-y-0 z-20">
            {/* Sidebar Branding */}
            <div className="p-10 pb-12">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/90">Lead Intelligence</span>
              </div>
            </div>
            
            {/* Primary Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              <SidebarLink href="/" icon={LayoutDashboard} label="Dashboard" active />
            </nav>
            </aside>


          {/* Clean Main Content (Matte Surface) */}
          <main className="flex-1 ml-[260px] min-h-screen bg-[#0A0A0A]">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

function SidebarLink({ 
  href, 
  icon: Icon, 
  label, 
  active = false 
}: { 
  href: string, 
  icon: any, 
  label: string, 
  active?: boolean 
}) {
  return (
    <a 
      href={href} 
      className={cn(
        "flex items-center space-x-3.5 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group",
        active 
          ? "bg-white/[0.08] text-white shadow-inner" 
          : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
      )}
    >
      <Icon className={cn(
        "h-[18px] w-[18px] transition-colors", 
        active ? "text-white" : "text-white/30 group-hover:text-white/50"
      )} />
      <span>{label}</span>
    </a>
  );
}
