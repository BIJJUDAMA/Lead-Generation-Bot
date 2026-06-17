"use client";

import { useState } from "react";
import { LeadRow } from "./lead-row";
import { DetailPanel } from "./detail-panel";
import { motion } from "framer-motion";

interface LeadListProps {
  data: Array<{
    company: any;
    score: any;
    signals: any[];
  }>;
}

export function LeadList({ data }: LeadListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedData = data.find(d => d.company.id === selectedId) || null;

  return (
    <section className="space-y-1">
      <div className="flex items-center justify-between px-6 mb-6">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Ranked Opportunities</h4>
        <div className="flex items-center space-x-12 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
          <span className="w-24 text-right">Recency</span>
          <span className="w-12 text-right">Score</span>
        </div>
      </div>

      <div className="space-y-0.5">
        {data.map((item, index) => (
          <motion.div
            key={item.company.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 + 0.2 }}
          >
            <LeadRow 
              company={item.company}
              score={item.score}
              signals={item.signals}
              onClick={() => setSelectedId(item.company.id)}
            />
          </motion.div>
        ))}
      </div>

      <DetailPanel 
        isOpen={!!selectedId} 
        onClose={() => setSelectedId(null)} 
        data={selectedData} 
      />
    </section>
  );
}
