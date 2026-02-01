"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { CosmicBackground } from "@/components/CosmicBackground";
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

const STATUSES = [
  { value: "planning", label: "Planning", color: "zinc" },
  { value: "brewing", label: "Brewing", color: "amber" },
  { value: "fermenting", label: "Fermenting", color: "purple" },
  { value: "conditioning", label: "Conditioning", color: "cyan" },
  { value: "carbonating", label: "Carbonating", color: "blue" },
  { value: "on-tap", label: "On Tap", color: "green" },
  { value: "kicked", label: "Kicked", color: "red" },
];

export default function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const batch = useQuery(api.batches.getWithLogs, { id: id as Id<"beers"> });
  const updateStatus = useMutation(api.batches.updateStatus);
  const logMeasurement = useMutation(api.batches.logMeasurement);
  const addFermentationLog = useMutation(api.batches.addFermentationLog);
  
  // Measurement inputs
  const [preBoilGravity, setPreBoilGravity] = useState("");
  const [preBoilVolume, setPreBoilVolume] = useState("");
  const [ogReading, setOgReading] = useState("");
  const [fgReading, setFgReading] = useState("");
  const [gravityLog, setGravityLog] = useState("");
  const [tempLog, setTempLog] = useState("");
  const [notesLog, setNotesLog] = useState("");
  
  if (!batch) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          🦘
        </motion.div>
      </main>
    );
  }
  
  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus({
        id: id as Id<"beers">,
        status: newStatus as "planning" | "brewing" | "fermenting" | "conditioning" | "carbonating" | "on-tap" | "kicked" | "archived",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };
  
  const handleLogMeasurement = async (type: string, value: number) => {
    try {
      await logMeasurement({
        id: id as Id<"beers">,
        type: type as "preBoilGravity" | "preBoilVolume" | "og" | "fg" | "mashPh",
        value,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to log measurement");
    }
  };
  
  const handleAddFermentationLog = async () => {
    if (!gravityLog && !tempLog) return;
    try {
      await addFermentationLog({
        beerId: id as Id<"beers">,
        gravity: gravityLog ? parseFloat(gravityLog) : undefined,
        temperature: tempLog ? parseFloat(tempLog) : undefined,
        notes: notesLog || undefined,
      });
      setGravityLog("");
      setTempLog("");
      setNotesLog("");
    } catch (err) {
      console.error(err);
      alert("Failed to add fermentation log");
    }
  };
  
  const currentStatusIndex = STATUSES.findIndex(s => s.value === batch.status);
  
  return (
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <CosmicBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
              ← Home
            </Link>
            <h1 className="text-xl font-bold font-mono">
              <span className="text-amber-500">BATCH</span>
              <span className="text-zinc-400">_</span>
              <span className="text-cyan-400">#{batch.batchNo}</span>
            </h1>
          </div>
          {batch.recipeId && (
            <Link
              href={`/recipes/${batch.recipeId}`}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm transition-colors"
            >
              View Recipe →
            </Link>
          )}
        </div>
      </header>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        
        {/* Batch Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm mb-8"
        >
          {/* Color Bar */}
          <div 
            className="h-3 rounded-full mb-6"
            style={{ backgroundColor: srmToColor(batch.srm || 5) }}
          />
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{batch.name}</h1>
              <p className="text-lg text-amber-500 mb-2">{batch.style}</p>
              {batch.tagline && (
                <p className="text-zinc-400 italic">"{batch.tagline}"</p>
              )}
              {batch.brewDate && (
                <p className="text-sm text-zinc-500 mt-2">Brewed: {batch.brewDate}</p>
              )}
            </div>
            
            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
              batch.status === 'on-tap' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
              batch.status === 'fermenting' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' :
              batch.status === 'conditioning' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' :
              batch.status === 'brewing' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' :
              batch.status === 'kicked' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
              'bg-zinc-500/20 text-zinc-400 border border-zinc-500/50'
            }`}>
              {batch.status.toUpperCase()}
            </div>
          </div>
          
          {/* Status Progress */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              {STATUSES.slice(0, -1).map((status, i) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                  className={`flex-1 text-center py-2 px-1 text-xs font-mono transition-all ${
                    i <= currentStatusIndex 
                      ? 'text-amber-400' 
                      : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${
                    i < currentStatusIndex ? 'bg-amber-500' :
                    i === currentStatusIndex ? 'bg-amber-500 ring-2 ring-amber-500/50' :
                    'bg-zinc-700'
                  }`} />
                  {status.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-zinc-800">
            <div>
              <div className="text-xs text-zinc-500 uppercase">Target ABV</div>
              <div className="text-2xl font-mono font-bold text-green-400">{batch.abv?.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase">Target IBU</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">{batch.ibu}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase">Target OG</div>
              <div className="text-2xl font-mono font-bold text-amber-400">{batch.og?.toFixed(3)}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase">Target FG</div>
              <div className="text-2xl font-mono font-bold text-amber-400">{batch.fg?.toFixed(3)}</div>
            </div>
            {batch.measuredOg && (
              <div>
                <div className="text-xs text-zinc-500 uppercase">Actual OG</div>
                <div className="text-2xl font-mono font-bold text-green-400">{batch.measuredOg.toFixed(3)}</div>
              </div>
            )}
            {batch.measuredFg && (
              <div>
                <div className="text-xs text-zinc-500 uppercase">Actual FG</div>
                <div className="text-2xl font-mono font-bold text-green-400">{batch.measuredFg.toFixed(3)}</div>
              </div>
            )}
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Brew Day Measurements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
          >
            <h2 className="text-lg font-bold text-amber-500 mb-4 font-mono">BREW_DAY</h2>
            
            <div className="space-y-4">
              {/* Pre-Boil Gravity */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Pre-Boil Gravity</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.001"
                      value={preBoilGravity}
                      onChange={e => setPreBoilGravity(e.target.value)}
                      placeholder="1.045"
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (preBoilGravity) {
                          handleLogMeasurement("preBoilGravity", parseFloat(preBoilGravity));
                          setPreBoilGravity("");
                        }
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
                    >
                      Log
                    </button>
                  </div>
                </div>
                {batch.measuredPreBoilGravity && (
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">Logged</div>
                    <div className="font-mono text-green-400">{batch.measuredPreBoilGravity.toFixed(3)}</div>
                  </div>
                )}
              </div>
              
              {/* Pre-Boil Volume */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Pre-Boil Volume (gal)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={preBoilVolume}
                      onChange={e => setPreBoilVolume(e.target.value)}
                      placeholder="3.5"
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (preBoilVolume) {
                          handleLogMeasurement("preBoilVolume", parseFloat(preBoilVolume));
                          setPreBoilVolume("");
                        }
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
                    >
                      Log
                    </button>
                  </div>
                </div>
                {batch.measuredPreBoilVolume && (
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">Logged</div>
                    <div className="font-mono text-green-400">{batch.measuredPreBoilVolume} gal</div>
                  </div>
                )}
              </div>
              
              {/* OG */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Original Gravity</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.001"
                      value={ogReading}
                      onChange={e => setOgReading(e.target.value)}
                      placeholder="1.058"
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (ogReading) {
                          handleLogMeasurement("og", parseFloat(ogReading));
                          setOgReading("");
                        }
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
                    >
                      Log
                    </button>
                  </div>
                </div>
                {batch.measuredOg && (
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">Logged</div>
                    <div className="font-mono text-green-400">{batch.measuredOg.toFixed(3)}</div>
                  </div>
                )}
              </div>
              
              {/* FG */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Final Gravity</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.001"
                      value={fgReading}
                      onChange={e => setFgReading(e.target.value)}
                      placeholder="1.012"
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (fgReading) {
                          handleLogMeasurement("fg", parseFloat(fgReading));
                          setFgReading("");
                        }
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
                    >
                      Log
                    </button>
                  </div>
                </div>
                {batch.measuredFg && (
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">Logged</div>
                    <div className="font-mono text-green-400">{batch.measuredFg.toFixed(3)}</div>
                  </div>
                )}
              </div>
              
              {/* Actual Efficiency */}
              {batch.actualEfficiency && (
                <div className="mt-4 pt-4 border-t border-zinc-700">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Actual Efficiency</span>
                    <span className={`font-mono font-bold text-xl ${
                      batch.actualEfficiency >= 70 ? 'text-green-400' : 'text-amber-400'
                    }`}>
                      {batch.actualEfficiency}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Fermentation Log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
          >
            <h2 className="text-lg font-bold text-purple-500 mb-4 font-mono">FERMENTATION_LOG</h2>
            
            {/* Add New Log */}
            <div className="p-4 bg-zinc-800/50 rounded-lg mb-4">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Gravity</label>
                  <input
                    type="number"
                    step="0.001"
                    value={gravityLog}
                    onChange={e => setGravityLog(e.target.value)}
                    placeholder="1.020"
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white font-mono text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Temp °F</label>
                  <input
                    type="number"
                    value={tempLog}
                    onChange={e => setTempLog(e.target.value)}
                    placeholder="68"
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white font-mono text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Notes</label>
                  <input
                    type="text"
                    value={notesLog}
                    onChange={e => setNotesLog(e.target.value)}
                    placeholder="Dry hop added"
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleAddFermentationLog}
                disabled={!gravityLog && !tempLog}
                className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-400 disabled:bg-zinc-600 disabled:text-zinc-400 text-white font-bold rounded-lg transition-colors"
              >
                + Add Log Entry
              </button>
            </div>
            
            {/* Log History */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {batch.fermentationLogs && batch.fermentationLogs.length > 0 ? (
                batch.fermentationLogs.slice().reverse().map((log: { timestamp: number; gravity?: number; temperature?: number; notes?: string }, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-zinc-800/30 rounded-lg text-sm">
                    <div className="text-xs text-zinc-500 w-16">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                    {log.gravity && (
                      <div className="font-mono">
                        <span className="text-zinc-500">SG:</span>{" "}
                        <span className="text-amber-400">{log.gravity.toFixed(3)}</span>
                      </div>
                    )}
                    {log.temperature && (
                      <div className="font-mono">
                        <span className="text-zinc-500">Temp:</span>{" "}
                        <span className="text-cyan-400">{log.temperature}°F</span>
                      </div>
                    )}
                    {log.notes && (
                      <div className="text-zinc-400 flex-1 truncate">{log.notes}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  No fermentation logs yet
                </div>
              )}
            </div>
          </motion.div>
          
        </div>
        
        {/* Notes Section */}
        {batch.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
          >
            <h2 className="text-lg font-bold text-zinc-400 mb-4 font-mono">NOTES</h2>
            <p className="text-zinc-300 whitespace-pre-wrap">{batch.notes}</p>
          </motion.div>
        )}
        
      </div>
    </main>
  );
}
