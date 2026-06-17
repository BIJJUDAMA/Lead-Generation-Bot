import { db } from "@/lib/db";
import { companies, intentScores, signals } from "@/lib/db/schema";
import { desc, ilike, or } from "drizzle-orm";
import { TopBar } from "@/components/dashboard/top-bar";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { LeadTable } from "@/components/dashboard/lead-table";
import { Suspense } from "react";

async function getDashboardData(searchParams: { q?: string, score?: string, types?: string }) {
  const query = searchParams.q || "";
  const minScore = Number(searchParams.score) || 0;
  const types = searchParams.types?.split(",").filter(Boolean) || [];

  const allCompanies = await db.query.companies.findMany({
    where: query ? or(ilike(companies.name, `%${query}%`), ilike(companies.industry || '', `%${query}%`)) : undefined,
    with: {
      intentScore: true,
      signals: {
        limit: 10,
        orderBy: [desc(signals.createdAt)],
      },
    },
  });

  let formatted = allCompanies.map(c => ({
    company: c,
    score: c.intentScore ? {
      totalScore: c.intentScore.totalScore,
      reasoning: c.intentScore.reasoning,
    } : null,
    signals: c.signals,
  }));

  // Apply Filters
  if (minScore > 0) {
    formatted = formatted.filter(r => (r.score?.totalScore || 0) >= minScore);
  }

  if (types.length > 0) {
    formatted = formatted.filter(r => 
      r.signals.some(s => types.some(t => s.type.toLowerCase().includes(t.toLowerCase())))
    );
  }

  return formatted.sort((a, b) => (b.score?.totalScore || 0) - (a.score?.totalScore || 0));
}

export default async function DashboardPage(props: { 
  searchParams: Promise<{ q?: string, score?: string, types?: string }> 
}) {
  const searchParams = await props.searchParams;
  const data = await getDashboardData(searchParams);
  
  const kpiData: any[] = [
    { label: "High Intent Leads", value: data.filter(d => (d.score?.totalScore || 0) >= 70).length, trend: "+12%", trendUp: true, icon: "zap", sparkline: [30, 40, 35, 50, 48, 60, 55] },
    { label: "New Signals", value: 142, trend: "+5%", trendUp: true, icon: "trending", sparkline: [20, 25, 30, 28, 35, 40, 42] },
    { label: "Companies Tracked", value: data.length, trend: "-2%", trendUp: false, icon: "users", sparkline: [50, 48, 45, 47, 46, 44, 43] },
    { label: "Avg. Intent Score", value: Math.round(data.reduce((acc, d) => acc + (d.score?.totalScore || 0), 0) / (data.length || 1)), trend: "+8%", trendUp: true, icon: "bar", sparkline: [40, 42, 45, 48, 50, 52, 55] },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="h-[72px] bg-[#0A0A0A] border-b border-white/[0.04]" />}>
        <TopBar />
      </Suspense>
      
      <div className="flex-1 py-16">
        {/* KPI Section */}
        <KPIRow data={kpiData} />

        {/* Main Content Area: Full Width Lead Table */}
        <div className="px-12">
          <div className="max-w-[1200px] mx-auto">
             <LeadTable data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
