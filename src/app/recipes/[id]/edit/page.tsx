"use client";

import { use, useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { CosmicBackground } from "@/components/CosmicBackground";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminNav } from "@/components/AdminNav";
import { StyleGuidelines } from "@/components/StyleGuidelines";
import { ScaleToOG, ScaleToIBU, PercentageToggle } from "@/components/ScaleToTarget";
import { BJCP_STYLES, findStyle } from "@/lib/bjcp-styles";
import Link from "next/link";

// Types
interface Fermentable {
  name: string;
  amount: number;
  type: string;
  color?: number;
  potential?: number;
  percentage?: number;
}

interface Hop {
  name: string;
  amount: number;
  alpha: number;
  time: number;
  use: string;
}

interface Yeast {
  name: string;
  attenuation?: number;
  tempRange?: string;
}

// Common ingredients for picker
const COMMON_GRAINS = [
  { name: "Pale Ale Malt 2-Row", potential: 37, color: 3, type: "Grain" },
  { name: "Pilsner Malt", potential: 37, color: 1.5, type: "Grain" },
  { name: "Maris Otter", potential: 38, color: 3, type: "Grain" },
  { name: "Munich Malt", potential: 37, color: 10, type: "Grain" },
  { name: "Vienna Malt", potential: 36, color: 4, type: "Grain" },
  { name: "Crystal 20", potential: 35, color: 20, type: "Grain" },
  { name: "Crystal 40", potential: 34, color: 40, type: "Grain" },
  { name: "Crystal 60", potential: 34, color: 60, type: "Grain" },
  { name: "Flaked Oats", potential: 33, color: 1, type: "Grain" },
  { name: "Wheat Malt", potential: 37, color: 2, type: "Grain" },
  { name: "Chocolate Malt", potential: 28, color: 350, type: "Grain" },
];

const COMMON_HOPS = [
  { name: "Citra", alpha: 12 },
  { name: "Mosaic", alpha: 12.5 },
  { name: "Galaxy", alpha: 14 },
  { name: "Simcoe", alpha: 13 },
  { name: "Amarillo", alpha: 9.5 },
  { name: "Cascade", alpha: 6 },
  { name: "Centennial", alpha: 10 },
  { name: "Chinook", alpha: 13 },
  { name: "El Dorado", alpha: 15 },
  { name: "Nelson Sauvin", alpha: 12 },
];

const COMMON_YEASTS = [
  { name: "Safale US-05", attenuation: 77 },
  { name: "Safale S-04", attenuation: 75 },
  { name: "Nottingham", attenuation: 77 },
  { name: "Imperial Yeast A38 Juice", attenuation: 77 },
  { name: "WLP001 California Ale", attenuation: 76 },
];

// Use BJCP style names + Unknown for unmatched
const BEER_STYLES = [...new Set([...BJCP_STYLES.map(s => s.name), "Unknown"])];

// SRM to color
function srmToColor(srm: number): string {
  const colors: Record<number, string> = {
    1: '#FFE699', 2: '#FFD878', 3: '#FFCA5A', 5: '#FBB123',
    10: '#DE7C00', 15: '#BB5100', 20: '#8D4C32', 30: '#261716', 40: '#100B0B',
  };
  const keys = Object.keys(colors).map(Number).sort((a, b) => a - b);
  for (const key of keys) {
    if (srm <= key) return colors[key];
  }
  return colors[40];
}

// Calculations
function calculateOG(fermentables: Fermentable[], batchSize: number, efficiency: number): number {
  let totalPoints = 0;
  for (const f of fermentables) {
    const ppg = f.potential || 36;
    const eff = (f.type === 'Extract' || f.type === 'Sugar') ? 100 : efficiency;
    totalPoints += ppg * f.amount * (eff / 100);
  }
  return Math.round((1 + (totalPoints / batchSize / 1000)) * 1000) / 1000;
}

function calculateFG(og: number, attenuation: number): number {
  return Math.round((og - (og - 1) * (attenuation / 100)) * 1000) / 1000;
}

function calculateABV(og: number, fg: number): number {
  return Math.round((og - fg) * 131.25 * 10) / 10;
}

function calculateIBU(hops: Hop[], og: number, batchSize: number): number {
  let totalIBU = 0;
  for (const hop of hops) {
    if (hop.use === 'Dry Hop' || hop.time <= 0) continue;
    const timeMultiplier = hop.use === 'Whirlpool' ? 0.5 : 1;
    const effectiveTime = hop.time * timeMultiplier;
    const fG = 1.65 * Math.pow(0.000125, og - 1);
    const fT = (1 - Math.exp(-0.04 * effectiveTime)) / 4.15;
    const util = fG * fT;
    totalIBU += (hop.alpha / 100) * hop.amount * 7490 / batchSize * util;
  }
  return Math.round(totalIBU);
}

function calculateSRM(fermentables: Fermentable[], batchSize: number): number {
  let mcu = 0;
  for (const f of fermentables) {
    mcu += ((f.color || 3) * f.amount) / batchSize;
  }
  return Math.round(1.4922 * Math.pow(mcu, 0.6859) * 10) / 10;
}

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const recipe = useQuery(api.recipes.get, { id: id as Id<"recipes"> });
  const updateRecipe = useMutation(api.recipes.update);
  
  // Form state
  const [name, setName] = useState("");
  const [style, setStyle] = useState("");
  const [tagline, setTagline] = useState("");
  const [batchSize, setBatchSize] = useState(2.5);
  const [efficiency, setEfficiency] = useState(72);
  const [boilTime, setBoilTime] = useState(60);
  const [mashTemp, setMashTemp] = useState(152);
  const [mashTime, setMashTime] = useState(60);
  const [fermentables, setFermentables] = useState<Fermentable[]>([]);
  const [hops, setHops] = useState<Hop[]>([]);
  const [yeast, setYeast] = useState<Yeast>({ name: "Safale US-05", attenuation: 77 });
  const [gypsum, setGypsum] = useState(0);
  const [cacl2, setCacl2] = useState(0);
  const [lacticAcid, setLacticAcid] = useState(3);
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showGrainPicker, setShowGrainPicker] = useState(false);
  const [showHopPicker, setShowHopPicker] = useState(false);
  const [showPercentage, setShowPercentage] = useState(false);
  
  // Find matching BJCP style
  const bjcpStyle = useMemo(() => findStyle(style), [style]);
  
  // Load recipe data
  useEffect(() => {
    if (recipe && !loaded) {
      setName(recipe.name || "");
      setStyle(recipe.style || "");
      setTagline(recipe.tagline || "");
      setBatchSize(recipe.batchSize || 2.5);
      setEfficiency(recipe.efficiency || 72);
      setBoilTime(recipe.boilTime || 60);
      setMashTemp(recipe.mashTemp || 152);
      setMashTime(recipe.mashTime || 60);
      setFermentables(recipe.fermentables || []);
      setHops(recipe.hopsDetailed || []);
      if (recipe.yeastDetailed) setYeast(recipe.yeastDetailed);
      if (recipe.waterProfile) {
        setGypsum(recipe.waterProfile.gypsum || 0);
        setCacl2(recipe.waterProfile.cacl2 || 0);
        setLacticAcid(recipe.waterProfile.lacticAcid || 3);
      }
      setLoaded(true);
    }
  }, [recipe, loaded]);
  
  // Real-time calculations
  const calculations = useMemo(() => {
    const og = calculateOG(fermentables, batchSize, efficiency);
    const fg = calculateFG(og, yeast.attenuation || 75);
    const abv = calculateABV(og, fg);
    const ibu = calculateIBU(hops, og, batchSize);
    const srm = calculateSRM(fermentables, batchSize);
    return { og, fg, abv, ibu, srm };
  }, [fermentables, hops, yeast, batchSize, efficiency]);
  
  // Save handler
  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a recipe name");
      return;
    }
    
    setSaving(true);
    try {
      await updateRecipe({
        id: id as Id<"recipes">,
        name,
        style,
        tagline: tagline || undefined,
        batchSize,
        boilTime,
        efficiency,
        fermentables,
        hopsDetailed: hops,
        yeastDetailed: yeast,
        waterProfile: { gypsum, cacl2, lacticAcid },
        mashTemp,
        mashTime,
        calculatedOg: calculations.og,
        calculatedFg: calculations.fg,
        calculatedAbv: calculations.abv,
        calculatedIbu: calculations.ibu,
        calculatedSrm: calculations.srm,
      });
      router.push(`/recipes/${id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };
  
  // Ingredient handlers
  const addFermentable = (grain: typeof COMMON_GRAINS[0]) => {
    setFermentables([...fermentables, { ...grain, amount: 1 }]);
    setShowGrainPicker(false);
  };
  
  const addHop = (hop: typeof COMMON_HOPS[0]) => {
    setHops([...hops, { ...hop, amount: 1, time: 15, use: "Boil" }]);
    setShowHopPicker(false);
  };
  
  const removeFermentable = (index: number) => setFermentables(fermentables.filter((_, i) => i !== index));
  const removeHop = (index: number) => setHops(hops.filter((_, i) => i !== index));
  
  const updateFermentable = (index: number, updates: Partial<Fermentable>) => {
    setFermentables(fermentables.map((f, i) => i === index ? { ...f, ...updates } : f));
  };
  
  const updateHop = (index: number, updates: Partial<Hop>) => {
    setHops(hops.map((h, i) => i === index ? { ...h, ...updates } : h));
  };
  
  if (!recipe) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-4xl">🦘</motion.div>
      </main>
    );
  }
  
  return (
    <AdminGuard>
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <CosmicBackground />
      <AdminNav />
      
      {/* Header */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/recipes/${id}`} className="text-zinc-400 hover:text-white transition-colors text-sm">
            ← Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "SAVING..." : "💾 SAVE CHANGES"}
          </button>
        </div>
        <h1 className="text-2xl font-bold font-mono mb-6">
          <span className="text-cyan-400">EDIT</span>
          <span className="text-zinc-400">_</span>
          <span className="text-amber-500">RECIPE</span>
        </h1>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-amber-500 mb-4 font-mono">RECIPE_INFO</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Style</label>
                  <select value={style} onChange={e => setStyle(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none">
                    {BEER_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Tagline</label>
                  <input type="text" value={tagline} onChange={e => setTagline(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none" />
                </div>
              </div>
              
              {/* Settings */}
              <div className="grid grid-cols-5 gap-3 mt-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Batch (gal)</label>
                  <input type="number" value={batchSize} onChange={e => setBatchSize(parseFloat(e.target.value) || 2.5)} step="0.5"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-center font-mono focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Eff %</label>
                  <input type="number" value={efficiency} onChange={e => setEfficiency(parseInt(e.target.value) || 72)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-center font-mono focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Boil</label>
                  <input type="number" value={boilTime} onChange={e => setBoilTime(parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-center font-mono focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Mash °F</label>
                  <input type="number" value={mashTemp} onChange={e => setMashTemp(parseInt(e.target.value) || 152)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-center font-mono focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Mash min</label>
                  <input type="number" value={mashTime} onChange={e => setMashTime(parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-center font-mono focus:border-amber-500 focus:outline-none" />
                </div>
              </div>
            </motion.div>
            
            {/* Fermentables */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-orange-500 font-mono">FERMENTABLES</h2>
                <div className="flex items-center gap-2">
                  <PercentageToggle showPercentage={showPercentage} onToggle={() => setShowPercentage(!showPercentage)} />
                  <ScaleToOG currentOG={calculations.og} fermentables={fermentables} onScale={setFermentables} />
                  <button onClick={() => setShowGrainPicker(true)}
                    className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-mono">+ ADD</button>
                </div>
              </div>
              <div className="space-y-2">
                {fermentables.map((grain, index) => {
                  const totalGrain = fermentables.reduce((sum, f) => sum + f.amount, 0);
                  const pct = totalGrain > 0 ? Math.round((grain.amount / totalGrain) * 100) : 0;
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full border-2 border-zinc-600" style={{ backgroundColor: srmToColor(grain.color || 3) }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{grain.name}</div>
                        {showPercentage && <div className="text-xs text-orange-400 font-mono">{pct}%</div>}
                      </div>
                      <input type="number" value={grain.amount} onChange={e => updateFermentable(index, { amount: parseFloat(e.target.value) || 0 })} step="0.25"
                        className="w-16 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center font-mono text-sm" />
                      <span className="text-xs text-zinc-400">lbs</span>
                      <button onClick={() => removeFermentable(index)} className="text-zinc-500 hover:text-red-400">✕</button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
            
            {/* Hops */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-green-500 font-mono">HOPS</h2>
                <div className="flex items-center gap-2">
                  <ScaleToIBU currentIBU={calculations.ibu} hops={hops} onScale={setHops} />
                  <button onClick={() => setShowHopPicker(true)}
                    className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-mono">+ ADD</button>
                </div>
              </div>
              <div className="space-y-2">
                {hops.map((hop, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{hop.name} ({hop.alpha}%)</div>
                    </div>
                    <input type="number" value={hop.amount} onChange={e => updateHop(index, { amount: parseFloat(e.target.value) || 0 })} step="0.25"
                      className="w-14 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center font-mono text-sm" />
                    <span className="text-xs text-zinc-400">oz</span>
                    <input type="number" value={hop.time} onChange={e => updateHop(index, { time: parseInt(e.target.value) || 0 })}
                      className="w-14 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center font-mono text-sm" />
                    <span className="text-xs text-zinc-400">min</span>
                    <select value={hop.use} onChange={e => updateHop(index, { use: e.target.value })}
                      className="px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-sm">
                      <option value="Boil">Boil</option>
                      <option value="Whirlpool">Whirlpool</option>
                      <option value="Dry Hop">Dry Hop</option>
                    </select>
                    <button onClick={() => removeHop(index)} className="text-zinc-500 hover:text-red-400">✕</button>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Yeast */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-purple-500 mb-4 font-mono">YEAST</h2>
              <div className="flex items-center gap-4">
                <select value={yeast.name} onChange={e => {
                  const y = COMMON_YEASTS.find(y => y.name === e.target.value);
                  if (y) setYeast(y);
                }} className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white">
                  {COMMON_YEASTS.map(y => <option key={y.name} value={y.name}>{y.name}</option>)}
                  {!COMMON_YEASTS.find(y => y.name === yeast.name) && <option value={yeast.name}>{yeast.name}</option>}
                </select>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Atten %</label>
                  <input type="number" value={yeast.attenuation || 75} onChange={e => setYeast({ ...yeast, attenuation: parseInt(e.target.value) || 75 })}
                    className="w-20 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-center font-mono" />
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column - Stats & Water */}
          <div className="space-y-6">
            
            {/* Style Guidelines */}
            {bjcpStyle && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
                <StyleGuidelines
                  style={bjcpStyle}
                  og={calculations.og}
                  fg={calculations.fg}
                  abv={calculations.abv}
                  ibu={calculations.ibu}
                  srm={calculations.srm}
                  animated={false}
                />
              </motion.div>
            )}
            
            {/* Live Stats (shown if no style match) */}
            {!bjcpStyle && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
                <h2 className="text-lg font-bold text-cyan-400 mb-4 font-mono">CALCULATED</h2>
                <div className="h-4 rounded-full mb-4" style={{ backgroundColor: srmToColor(calculations.srm) }} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase">OG</div>
                    <div className="text-2xl font-mono font-bold text-amber-400">{calculations.og.toFixed(3)}</div>
                  </div>
                  <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase">FG</div>
                    <div className="text-2xl font-mono font-bold text-amber-400">{calculations.fg.toFixed(3)}</div>
                  </div>
                  <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase">ABV</div>
                    <div className="text-2xl font-mono font-bold text-green-400">{calculations.abv}%</div>
                  </div>
                  <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase">IBU</div>
                    <div className="text-2xl font-mono font-bold text-cyan-400">{calculations.ibu}</div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Water Chemistry */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-blue-400 mb-4 font-mono">WATER_SALTS</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-400">Gypsum (CaSO₄)</span>
                  <div className="flex items-center gap-2">
                    <input type="number" value={gypsum} onChange={e => setGypsum(parseFloat(e.target.value) || 0)} step="0.5"
                      className="w-16 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center font-mono text-sm" />
                    <span className="text-xs text-zinc-400">g</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-400">CaCl₂</span>
                  <div className="flex items-center gap-2">
                    <input type="number" value={cacl2} onChange={e => setCacl2(parseFloat(e.target.value) || 0)} step="0.5"
                      className="w-16 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center font-mono text-sm" />
                    <span className="text-xs text-zinc-400">g</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-400">Lactic Acid 85%</span>
                  <div className="flex items-center gap-2">
                    <input type="number" value={lacticAcid} onChange={e => setLacticAcid(parseFloat(e.target.value) || 0)} step="0.5"
                      className="w-16 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center font-mono text-sm" />
                    <span className="text-xs text-zinc-400">ml</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Grain Picker Modal */}
      <AnimatePresence>
        {showGrainPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowGrainPicker(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-amber-500 mb-4 font-mono">SELECT GRAIN</h3>
              <div className="space-y-2">
                {COMMON_GRAINS.map((grain, i) => (
                  <button key={i} onClick={() => addFermentable(grain)}
                    className="w-full flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left">
                    <div className="w-6 h-6 rounded-full border border-zinc-600" style={{ backgroundColor: srmToColor(grain.color) }} />
                    <div>
                      <div className="font-medium">{grain.name}</div>
                      <div className="text-xs text-zinc-500">{grain.color}°L • {grain.potential} PPG</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hop Picker Modal */}
      <AnimatePresence>
        {showHopPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHopPicker(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-green-500 mb-4 font-mono">SELECT HOP</h3>
              <div className="space-y-2">
                {COMMON_HOPS.map((hop, i) => (
                  <button key={i} onClick={() => addHop(hop)}
                    className="w-full flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left">
                    <div className="w-6 h-6 rounded-full bg-green-600/30 border border-green-600 flex items-center justify-center text-xs">🌿</div>
                    <div>
                      <div className="font-medium">{hop.name}</div>
                      <div className="text-xs text-zinc-500">{hop.alpha}% AA</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
    </AdminGuard>
  );
}
