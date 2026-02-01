"use client";

import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { CosmicBackground } from "@/components/CosmicBackground";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminNav } from "@/components/AdminNav";
import Link from "next/link";

// SRM to CSS color
function srmToColor(srm: number): string {
  const colors: Record<number, string> = {
    1: '#FFE699', 2: '#FFD878', 3: '#FFCA5A', 4: '#FFBF42', 5: '#FBB123',
    6: '#F8A600', 7: '#F39C00', 8: '#EA8F00', 9: '#E58500', 10: '#DE7C00',
    11: '#D77200', 12: '#CF6900', 13: '#CB6200', 14: '#C35900', 15: '#BB5100',
    20: '#8D4C32', 25: '#5D341A', 30: '#261716', 35: '#1B1212', 40: '#100B0B',
  };
  const keys = Object.keys(colors).map(Number).sort((a, b) => a - b);
  for (const key of keys) {
    if (srm <= key) return colors[key];
  }
  return colors[40];
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  planning: { color: "text-zinc-400", bg: "bg-zinc-500/20", border: "border-zinc-500/50", label: "Planning" },
  brewing: { color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/50", label: "Brewing" },
  fermenting: { color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/50", label: "Fermenting" },
  conditioning: { color: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-500/50", label: "Conditioning" },
  carbonating: { color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/50", label: "Carbonating" },
  "on-tap": { color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/50", label: "On Tap" },
  kicked: { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/50", label: "Kicked" },
  archived: { color: "text-zinc-500", bg: "bg-zinc-700/20", border: "border-zinc-700/50", label: "Archived" },
};

export default function BatchesPage() {
  const batches = useQuery(api.batches.list, {});
  
  // Group batches by status
  const groupedBatches = batches?.reduce((acc, batch) => {
    const status = batch.status || "planning";
    if (!acc[status]) acc[status] = [];
    acc[status].push(batch);
    return acc;
  }, {} as Record<string, typeof batches>);
  
  // Order statuses for display
  const statusOrder = ["brewing", "fermenting", "conditioning", "carbonating", "on-tap", "planning", "kicked", "archived"];
  
  return (
    <AdminGuard>
      <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
        <CosmicBackground />
        <AdminNav />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold font-mono">
                <span className="text-amber-500">BATCH</span>
                <span className="text-zinc-400">_</span>
                <span className="text-cyan-400">TRACKER</span>
              </h1>
              <p className="text-zinc-500 text-sm mt-1">All brews, all statuses</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-amber-400">
                {batches?.length || 0}
              </div>
              <div className="text-xs text-zinc-500 uppercase">Total Batches</div>
            </div>
          </div>
          
          {/* Loading */}
          {!batches && (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-4xl"
              >
                🦘
              </motion.div>
            </div>
          )}
          
          {/* Empty */}
          {batches && batches.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🧪</div>
              <h2 className="text-2xl font-bold text-zinc-400 mb-2">No batches yet</h2>
              <p className="text-zinc-500 mb-6">Start a batch from a recipe</p>
              <Link
                href="/recipes"
                className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
              >
                View Recipes
              </Link>
            </motion.div>
          )}
          
          {/* Batches by Status */}
          {groupedBatches && statusOrder.map((status) => {
            const statusBatches = groupedBatches[status];
            if (!statusBatches || statusBatches.length === 0) return null;
            
            const config = STATUS_CONFIG[status] || STATUS_CONFIG.planning;
            
            return (
              <motion.section
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                {/* Status Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`px-3 py-1 rounded-lg ${config.bg} ${config.border} border`}>
                    <span className={`font-mono text-sm font-bold ${config.color}`}>
                      {config.label.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-zinc-500 text-sm">
                    {statusBatches.length} batch{statusBatches.length !== 1 ? "es" : ""}
                  </div>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>
                
                {/* Batch Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statusBatches.map((batch, index) => (
                    <motion.div
                      key={batch._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/batches/${batch._id}`}>
                        <div className={`bg-zinc-900/80 border ${config.border} rounded-xl p-4 backdrop-blur-sm hover:border-amber-500/50 transition-all cursor-pointer group`}>
                          {/* Color bar */}
                          <div 
                            className="h-1.5 rounded-full mb-3"
                            style={{ backgroundColor: srmToColor(batch.srm || 5) }}
                          />
                          
                          {/* Batch info */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500 font-mono text-sm">#{batch.batchNo}</span>
                                <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                                  {batch.name}
                                </h3>
                              </div>
                              <p className="text-zinc-400 text-sm mt-0.5">{batch.style}</p>
                            </div>
                            <div className="text-right ml-3">
                              <div className="font-mono font-bold text-green-400">
                                {batch.abv?.toFixed(1)}%
                              </div>
                              <div className="text-xs text-zinc-500">ABV</div>
                            </div>
                          </div>
                          
                          {/* Brew date */}
                          {batch.brewDate && (
                            <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-500">
                              Brewed: {new Date(batch.brewDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      </main>
    </AdminGuard>
  );
}
