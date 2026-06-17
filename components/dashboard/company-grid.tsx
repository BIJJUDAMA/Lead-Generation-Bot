"use client";

import { useState } from "react";
import { CompanyCard } from "./company-card";
import { DetailPanel } from "./detail-panel";
import { motion } from "framer-motion";

interface CompanyGridProps {
  data: Array<{
    company: any;
    score: any;
    signals: any[];
  }>;
}

export function CompanyGrid({ data }: CompanyGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedData = data.find(d => d.company.id === selectedId) || null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item, index) => (
          <motion.div
            key={item.company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <CompanyCard 
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
    </>
  );
}
