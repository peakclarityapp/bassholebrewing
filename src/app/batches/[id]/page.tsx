"use client";

import { use, useState, useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

// Fermentation Chart Component
function FermentationChart({ logs }: { logs: Array<{ timestamp: number; gravity?: number; temperature?: number }> }) {
  const gravityLogs = logs.filter(l => l.gravity).sort((a, b) => a.timestamp - b.timestamp);
  
  if (gravityLogs.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">
        Need at least 2 gravity readings to show chart
      </div>
    );
  }
  
  const minGravity = Math.min(...gravityLogs.map(l => l.gravity!)) - 0.002;
  const maxGravity = Math.max(...gravityLogs.map(l => l.gravity!)) + 0.002;
  const range = maxGravity - minGravity;
  
  const points = gravityLogs.map((log, i) => {
    const x = (i / (gravityLogs.length - 1)) * 100;
    const y = 100 - ((log.gravity! - minGravity) / range) * 100;
    return { x, y, gravity: log.gravity!, timestamp: log.timestamp };
  });
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  return (
    <div className="h-48 relative">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-zinc-500 font-mono">
        <span>{maxGravity.toFixed(3)}</span>
        <span>{((maxGravity + minGravity) / 2).toFixed(3)}</span>
        <span>{minGravity.toFixed(3)}</span>
      </div>
      
      {/* Chart area */}
      <div className="absolute left-14 right-0 top-0 bottom-4 border-l border-b border-zinc-700">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="#3f3f46" strokeWidth="0.5" strokeDasharray="2,2" />
          
          {/* Gradient fill under line */}
          <defs>
            <linearGradient id="gravityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path 
            d={`${pathD} L 100 100 L 0 100 Z`} 
            fill="url(#gravityGradient)" 
          />
          
          {/* Line */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="#f59e0b" 
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Points */}
          {points.map((p, i) => (
            <circle 
              key={i} 
              cx={p.x} 
              cy={p.y} 
              r="3" 
              fill="#f59e0b"
              className="drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        
        {/* Hover tooltips would go here */}
      </div>
      
      {/* X-axis labels */}
      <div className="absolute left-14 right-0 bottom-0 flex justify-between text-xs text-zinc-500">
        <span>Day 1</span>
        <span>Day {Math.ceil((gravityLogs[gravityLogs.length - 1].timestamp - gravityLogs[0].timestamp) / (1000 * 60 * 60 * 24)) || 1}</span>
      </div>
    </div>
  );
}

// What-If Results Component
function WhatIfResults({ results, onClose }: { 
  results: {
    actualEfficiency: number;
    projectedOG: number;
    projectedAbv: number;
    difference: number;
    expectedPreBoil: number;
    expectedOG: number;
    dmeBoost: { ounces: number; lbs: number } | null;
    options: Array<{ action: string; projectedOg: number; projectedAbv: number }>;
  };
  onClose: () => void;
}) {
  const isUnder = results.difference < 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 rounded-lg border ${isUnder ? 'bg-amber-500/10 border-amber-500/50' : 'bg-green-500/10 border-green-500/50'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-lg">
          {isUnder ? '⚠️ Under Target' : '✅ On Target'}
        </h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-zinc-400">Expected Pre-Boil:</span>
          <span className="font-mono ml-2">{results.expectedPreBoil.toFixed(3)}</span>
        </div>
        <div>
          <span className="text-zinc-400">Difference:</span>
          <span className={`font-mono ml-2 ${isUnder ? 'text-amber-400' : 'text-green-400'}`}>
            {results.difference > 0 ? '+' : ''}{(results.difference * 1000).toFixed(0)} points
          </span>
        </div>
        <div>
          <span className="text-zinc-400">Actual Efficiency:</span>
          <span className="font-mono ml-2">{results.actualEfficiency}%</span>
        </div>
        <div>
          <span className="text-zinc-400">Projected OG:</span>
          <span className="font-mono ml-2">{results.projectedOG.toFixed(3)}</span>
        </div>
      </div>
      
      {isUnder && results.options.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-amber-400">Options:</h4>
          {results.options.map((opt, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded text-sm">
              <span>{opt.action}</span>
              <span className="font-mono">
                OG: {opt.projectedOg.toFixed(3)} → {opt.projectedAbv.toFixed(1)}% ABV
              </span>
            </div>
          ))}
          {results.dmeBoost && (
            <div className="mt-2 p-2 bg-amber-500/20 rounded text-sm">
              💡 <strong>Quick fix:</strong> Add {results.dmeBoost.ounces.toFixed(1)} oz ({results.dmeBoost.lbs.toFixed(2)} lbs) DME to hit target OG
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const batch = useQuery(api.batches.getWithLogs, { id: id as Id<"beers"> });
  const updateStatus = useMutation(api.batches.updateStatus);
  const logMeasurement = useMutation(api.batches.logMeasurement);
  const addFermentationLog = useMutation(api.batches.addFermentationLog);
  const whatIfAction = useAction(api.batches.whatIfPreBoilGravity);
  const updateIngredients = useMutation(api.batches.updateIngredients);
  const saveAsNewRecipe = useMutation(api.batches.saveAsNewRecipe);
  const updateMasterRecipe = useMutation(api.batches.updateMasterRecipe);
  const recalculateBatch = useAction(api.batches.recalculateBatch);
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editedFermentables, setEditedFermentables] = useState<Array<{name: string; amount: number; type: string; color?: number; potential?: number}>>([]);
  const [editedHops, setEditedHops] = useState<Array<{name: string; amount: number; alpha: number; time: number; use: string}>>([]);
  const [saveAsName, setSaveAsName] = useState("");
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  
  // Initialize edit state from batch when entering edit mode
  const handleEnterEditMode = () => {
    setEditedFermentables(batch?.fermentables || []);
    setEditedHops(batch?.hopsDetailed || []);
    setEditMode(true);
  };
  
  const handleSaveIngredients = async () => {
    await updateIngredients({
      id: id as Id<"beers">,
      fermentables: editedFermentables,
      hopsDetailed: editedHops,
    });
    // Recalculate values
    await recalculateBatch({ id: id as Id<"beers"> });
    setEditMode(false);
  };
  
  const handleSaveAsNew = async () => {
    if (!saveAsName.trim()) return;
    const newRecipeId = await saveAsNewRecipe({
      id: id as Id<"beers">,
      name: saveAsName,
    });
    setShowSaveAsModal(false);
    setSaveAsName("");
    alert(`Saved as new recipe!`);
  };
  
  const handleUpdateMaster = async () => {
    if (!confirm("Update the master recipe with these changes?")) return;
    await updateMasterRecipe({ id: id as Id<"beers"> });
    alert("Master recipe updated!");
  };
  
  // Measurement inputs
  const [preBoilGravity, setPreBoilGravity] = useState("");
  const [preBoilVolume, setPreBoilVolume] = useState("");
  const [ogReading, setOgReading] = useState("");
  const [fgReading, setFgReading] = useState("");
  const [gravityLog, setGravityLog] = useState("");
  const [tempLog, setTempLog] = useState("");
  const [notesLog, setNotesLog] = useState("");
  
  // What-If state
  const [whatIfResults, setWhatIfResults] = useState<{
    actualEfficiency: number;
    projectedOG: number;
    projectedAbv: number;
    difference: number;
    expectedPreBoil: number;
    expectedOG: number;
    dmeBoost: { ounces: number; lbs: number } | null;
    options: Array<{ action: string; projectedOg: number; projectedAbv: number }>;
  } | null>(null);
  const [whatIfLoading, setWhatIfLoading] = useState(false);
  
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
  
  const handleLogPreBoilWithWhatIf = async () => {
    if (!preBoilGravity) return;
    const value = parseFloat(preBoilGravity);
    
    // Log the measurement
    await handleLogMeasurement("preBoilGravity", value);
    
    // Run what-if analysis
    setWhatIfLoading(true);
    try {
      const results = await whatIfAction({
        id: id as Id<"beers">,
        measuredGravity: value,
      });
      setWhatIfResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setWhatIfLoading(false);
      setPreBoilGravity("");
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
  
  // Calculate actual ABV if we have measured values
  const actualAbv = useMemo(() => {
    if (batch.measuredOg && batch.measuredFg) {
      return ((batch.measuredOg - batch.measuredFg) * 131.25).toFixed(1);
    }
    return null;
  }, [batch.measuredOg, batch.measuredFg]);
  
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
          <div className="flex items-center gap-3">
            {batch.recipeId && (
              <Link
                href={`/recipes/${batch.recipeId}`}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm transition-colors"
              >
                View Recipe →
              </Link>
            )}
            {(batch.status === "planning" || batch.status === "brewing") && (
              <Link
                href={`/brew/${id}`}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
              >
                🍺 Brew Day Mode
              </Link>
            )}
          </div>
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
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-zinc-800 flex-wrap">
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
            {actualAbv && (
              <div>
                <div className="text-xs text-zinc-500 uppercase">Actual ABV</div>
                <div className="text-2xl font-mono font-bold text-green-400">{actualAbv}%</div>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Recipe Editing Section */}
        {batch.status === "planning" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-cyan-400 font-mono">BATCH_RECIPE</h2>
              <div className="flex gap-2">
                {!editMode ? (
                  <button
                    onClick={handleEnterEditMode}
                    className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-lg text-sm font-bold transition-all"
                  >
                    ✏️ Edit Recipe
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveIngredients}
                      className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg text-sm transition-all"
                    >
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {editMode ? (
              <div className="space-y-6">
                {/* Fermentables Editor */}
                <div>
                  <h3 className="text-sm font-bold text-orange-400 mb-2">Fermentables</h3>
                  <div className="space-y-2">
                    {editedFermentables.map((grain, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg">
                        <input
                          type="text"
                          value={grain.name}
                          onChange={e => {
                            const updated = [...editedFermentables];
                            updated[i] = { ...grain, name: e.target.value };
                            setEditedFermentables(updated);
                          }}
                          className="flex-1 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-sm"
                        />
                        <input
                          type="number"
                          step="0.25"
                          value={grain.amount}
                          onChange={e => {
                            const updated = [...editedFermentables];
                            updated[i] = { ...grain, amount: parseFloat(e.target.value) || 0 };
                            setEditedFermentables(updated);
                          }}
                          className="w-20 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center font-mono text-sm"
                        />
                        <span className="text-sm text-zinc-500">lbs</span>
                        <button
                          onClick={() => setEditedFermentables(editedFermentables.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setEditedFermentables([...editedFermentables, { name: "New Grain", amount: 1, type: "Grain" }])}
                      className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
                    >
                      + Add Fermentable
                    </button>
                  </div>
                </div>
                
                {/* Hops Editor */}
                <div>
                  <h3 className="text-sm font-bold text-green-400 mb-2">Hops</h3>
                  <div className="space-y-2">
                    {editedHops.map((hop, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded-lg">
                        <input
                          type="text"
                          value={hop.name}
                          onChange={e => {
                            const updated = [...editedHops];
                            updated[i] = { ...hop, name: e.target.value };
                            setEditedHops(updated);
                          }}
                          className="flex-1 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-sm"
                        />
                        <input
                          type="number"
                          step="0.25"
                          value={hop.amount}
                          onChange={e => {
                            const updated = [...editedHops];
                            updated[i] = { ...hop, amount: parseFloat(e.target.value) || 0 };
                            setEditedHops(updated);
                          }}
                          className="w-16 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center font-mono text-sm"
                        />
                        <span className="text-xs text-zinc-500">oz</span>
                        <select
                          value={hop.use}
                          onChange={e => {
                            const updated = [...editedHops];
                            updated[i] = { ...hop, use: e.target.value };
                            setEditedHops(updated);
                          }}
                          className="px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-sm"
                        >
                          <option value="Boil">Boil</option>
                          <option value="Whirlpool">Whirlpool</option>
                          <option value="Dry Hop">Dry Hop</option>
                        </select>
                        <input
                          type="number"
                          value={hop.time}
                          onChange={e => {
                            const updated = [...editedHops];
                            updated[i] = { ...hop, time: parseInt(e.target.value) || 0 };
                            setEditedHops(updated);
                          }}
                          className="w-14 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center font-mono text-sm"
                        />
                        <span className="text-xs text-zinc-500">min</span>
                        <button
                          onClick={() => setEditedHops(editedHops.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setEditedHops([...editedHops, { name: "New Hop", amount: 1, alpha: 10, time: 15, use: "Boil" }])}
                      className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
                    >
                      + Add Hop
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Display current recipe */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-orange-400 mb-2">Fermentables</h3>
                    {batch.fermentables?.map((f, i) => (
                      <div key={i} className="text-sm text-zinc-300">
                        {f.amount} lbs {f.name}
                      </div>
                    )) || <div className="text-sm text-zinc-500">No data</div>}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-green-400 mb-2">Hops</h3>
                    {batch.hopsDetailed?.map((h, i) => (
                      <div key={i} className="text-sm text-zinc-300">
                        {h.amount} oz {h.name} @ {h.time} min ({h.use})
                      </div>
                    )) || <div className="text-sm text-zinc-500">No data</div>}
                  </div>
                </div>
                
                {/* Recipe Save Options */}
                <div className="pt-4 border-t border-zinc-700 flex gap-3">
                  <button
                    onClick={() => setShowSaveAsModal(true)}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 rounded-lg text-sm transition-all"
                  >
                    💾 Save as New Recipe
                  </button>
                  {batch.recipeId && (
                    <button
                      onClick={handleUpdateMaster}
                      className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-400 rounded-lg text-sm transition-all"
                    >
                      ⬆️ Update Master Recipe
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Save As Modal */}
        <AnimatePresence>
          {showSaveAsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowSaveAsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-purple-400 mb-4">Save as New Recipe</h3>
                <input
                  type="text"
                  value={saveAsName}
                  onChange={e => setSaveAsName(e.target.value)}
                  placeholder="New recipe name..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSaveAsModal(false)}
                    className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAsNew}
                    disabled={!saveAsName.trim()}
                    className="flex-1 py-2 bg-purple-500 hover:bg-purple-400 disabled:bg-zinc-600 text-white font-bold rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
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
              {/* Pre-Boil Gravity with What-If */}
              <div>
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
                    onClick={handleLogPreBoilWithWhatIf}
                    disabled={!preBoilGravity || whatIfLoading}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-600 text-black font-bold rounded-lg transition-colors"
                  >
                    {whatIfLoading ? "..." : "Log + Analyze"}
                  </button>
                </div>
                {batch.measuredPreBoilGravity && (
                  <div className="mt-2 text-sm">
                    <span className="text-zinc-500">Logged:</span>
                    <span className="font-mono text-green-400 ml-2">{batch.measuredPreBoilGravity.toFixed(3)}</span>
                  </div>
                )}
              </div>
              
              {/* What-If Results */}
              <AnimatePresence>
                {whatIfResults && (
                  <WhatIfResults results={whatIfResults} onClose={() => setWhatIfResults(null)} />
                )}
              </AnimatePresence>
              
              {/* Pre-Boil Volume */}
              <div>
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
                {batch.measuredPreBoilVolume && (
                  <div className="mt-2 text-sm">
                    <span className="text-zinc-500">Logged:</span>
                    <span className="font-mono text-green-400 ml-2">{batch.measuredPreBoilVolume} gal</span>
                  </div>
                )}
              </div>
              
              {/* OG */}
              <div>
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
                {batch.measuredOg && (
                  <div className="mt-2 text-sm">
                    <span className="text-zinc-500">Logged:</span>
                    <span className="font-mono text-green-400 ml-2">{batch.measuredOg.toFixed(3)}</span>
                  </div>
                )}
              </div>
              
              {/* FG */}
              <div>
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
                {batch.measuredFg && (
                  <div className="mt-2 text-sm">
                    <span className="text-zinc-500">Logged:</span>
                    <span className="font-mono text-green-400 ml-2">{batch.measuredFg.toFixed(3)}</span>
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
          
          {/* Fermentation Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
          >
            <h2 className="text-lg font-bold text-purple-500 mb-4 font-mono">FERMENTATION</h2>
            
            {/* Fermentation Chart */}
            {batch.fermentationLogs && batch.fermentationLogs.length > 0 && (
              <div className="mb-6">
                <FermentationChart logs={batch.fermentationLogs} />
              </div>
            )}
            
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
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {batch.fermentationLogs && batch.fermentationLogs.length > 0 ? (
                batch.fermentationLogs.slice().reverse().map((log: { timestamp: number; gravity?: number; temperature?: number; notes?: string }, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-zinc-800/30 rounded-lg text-sm">
                    <div className="text-xs text-zinc-500 w-20">
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
