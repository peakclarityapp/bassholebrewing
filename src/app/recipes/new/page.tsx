"use client";

import { useState, useEffect, useMemo } from "react";
import { useMutation, useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../../convex/_generated/api";
import { CosmicBackground } from "@/components/CosmicBackground";
import { AdminGuard, LogoutButton } from "@/components/AdminGuard";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Fermentable {
  name: string;
  amount: number;
  type: string;
  color?: number;
  potential?: number;
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
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMON INGREDIENTS
// ═══════════════════════════════════════════════════════════════════════════

const COMMON_GRAINS = [
  { name: "Pale Ale Malt 2-Row", potential: 37, color: 3, type: "Grain" },
  { name: "Pilsner Malt", potential: 37, color: 1.5, type: "Grain" },
  { name: "Maris Otter", potential: 38, color: 3, type: "Grain" },
  { name: "Munich Malt", potential: 37, color: 10, type: "Grain" },
  { name: "Vienna Malt", potential: 36, color: 4, type: "Grain" },
  { name: "Crystal 20", potential: 35, color: 20, type: "Grain" },
  { name: "Crystal 40", potential: 34, color: 40, type: "Grain" },
  { name: "Crystal 60", potential: 34, color: 60, type: "Grain" },
  { name: "Crystal 80", potential: 33, color: 80, type: "Grain" },
  { name: "Flaked Oats", potential: 33, color: 1, type: "Grain" },
  { name: "Wheat Malt", potential: 37, color: 2, type: "Grain" },
  { name: "Chocolate Malt", potential: 28, color: 350, type: "Grain" },
  { name: "DME - Light", potential: 44, color: 3, type: "Extract" },
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
  { name: "Idaho 7", alpha: 13 },
  { name: "Nelson Sauvin", alpha: 12 },
  { name: "Sabro", alpha: 15 },
];

const COMMON_YEASTS = [
  { name: "Safale US-05", attenuation: 77 },
  { name: "Safale S-04", attenuation: 75 },
  { name: "Nottingham", attenuation: 77 },
  { name: "Imperial Yeast A38 Juice", attenuation: 77 },
  { name: "WLP001 California Ale", attenuation: 76 },
];

const BEER_STYLES = [
  "West Coast IPA",
  "NEIPA",
  "Session IPA",
  "American Pale Ale",
  "Amber Ale",
  "Stout",
  "Porter",
  "Pilsner",
  "Wheat Beer",
];

// Water profile presets
const WATER_PROFILES = {
  "West Coast IPA": { sulfate: 275, chloride: 62, ratio: "Sulfate-forward", description: "Crisp, dry, hop-forward bite" },
  "NEIPA": { sulfate: 100, chloride: 175, ratio: "Chloride-forward", description: "Soft, round, pillowy mouthfeel" },
  "Balanced": { sulfate: 100, chloride: 100, ratio: "Balanced", description: "Even malt/hop character" },
  "Pilsner": { sulfate: 50, chloride: 40, ratio: "Soft", description: "Delicate, soft water" },
  "Stout": { sulfate: 75, chloride: 150, ratio: "Chloride-forward", description: "Smooth, full-bodied" },
  "Amber/Malty": { sulfate: 80, chloride: 120, ratio: "Slight chloride", description: "Malt-forward balance" },
};

// Mash step presets
const MASH_PRESETS = {
  "Single Infusion": [
    { name: "Saccharification", temp: 152, time: 60, notes: "Main conversion rest" },
  ],
  "Single Infusion + Mash Out": [
    { name: "Saccharification", temp: 152, time: 60, notes: "Main conversion rest" },
    { name: "Mash Out", temp: 168, time: 10, notes: "Stop enzyme activity" },
  ],
  "Step Mash (Light Body)": [
    { name: "Beta Rest", temp: 145, time: 20, notes: "More fermentable, drier" },
    { name: "Alpha Rest", temp: 158, time: 40, notes: "Finish conversion" },
    { name: "Mash Out", temp: 168, time: 10, notes: "Stop enzyme activity" },
  ],
  "Step Mash (Full Body)": [
    { name: "Protein Rest", temp: 122, time: 15, notes: "Break down proteins" },
    { name: "Saccharification", temp: 156, time: 60, notes: "Fuller body" },
    { name: "Mash Out", temp: 168, time: 10, notes: "Stop enzyme activity" },
  ],
};

interface MashStep {
  name: string;
  temp: number;
  time: number;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CALCULATION FUNCTIONS (client-side for real-time)
// ═══════════════════════════════════════════════════════════════════════════

function calculateOG(fermentables: Fermentable[], batchSize: number, efficiency: number): number {
  let totalPoints = 0;
  for (const f of fermentables) {
    const ppg = f.potential || 36;
    const eff = (f.type === 'Extract' || f.type === 'Sugar') ? 100 : efficiency;
    totalPoints += ppg * f.amount * (eff / 100);
  }
  const og = 1 + (totalPoints / batchSize / 1000);
  return Math.round(og * 1000) / 1000;
}

function calculateFG(og: number, attenuation: number): number {
  const fg = og - (og - 1) * (attenuation / 100);
  return Math.round(fg * 1000) / 1000;
}

function calculateABV(og: number, fg: number): number {
  const abv = (og - fg) * 131.25;
  return Math.round(abv * 10) / 10;
}

function hopUtilization(og: number, boilTime: number): number {
  const fG = 1.65 * Math.pow(0.000125, og - 1);
  const fT = (1 - Math.exp(-0.04 * boilTime)) / 4.15;
  return fG * fT;
}

function calculateIBU(hops: Hop[], og: number, batchSize: number): number {
  let totalIBU = 0;
  for (const hop of hops) {
    if (hop.use === 'Dry Hop' || hop.time <= 0) continue;
    const timeMultiplier = hop.use === 'Whirlpool' ? 0.5 : 1;
    const effectiveTime = hop.time * timeMultiplier;
    const util = hopUtilization(og, effectiveTime);
    const ibu = (hop.alpha / 100) * hop.amount * 7490 / batchSize * util;
    totalIBU += ibu;
  }
  return Math.round(totalIBU);
}

function calculateSRM(fermentables: Fermentable[], batchSize: number): number {
  let mcu = 0;
  for (const f of fermentables) {
    const color = f.color || 3;
    mcu += (color * f.amount) / batchSize;
  }
  const srm = 1.4922 * Math.pow(mcu, 0.6859);
  return Math.round(srm * 10) / 10;
}

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

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function NewRecipe() {
  const router = useRouter();
  const createRecipe = useAction(api.recipes.createWithCalculations);
  
  // Recipe metadata
  const [name, setName] = useState("");
  const [style, setStyle] = useState("West Coast IPA");
  const [tagline, setTagline] = useState("");
  const [batchSize, setBatchSize] = useState(2.5);
  const [efficiency, setEfficiency] = useState(72);
  const [boilTime, setBoilTime] = useState(60);
  
  // Water profile
  const [waterProfileName, setWaterProfileName] = useState<keyof typeof WATER_PROFILES>("West Coast IPA");
  const [customSulfate, setCustomSulfate] = useState(275);
  const [customChloride, setCustomChloride] = useState(62);
  const [useCustomWater, setUseCustomWater] = useState(false);
  
  // Mash schedule
  const [mashPreset, setMashPreset] = useState<keyof typeof MASH_PRESETS>("Single Infusion");
  const [mashSteps, setMashSteps] = useState<MashStep[]>(MASH_PRESETS["Single Infusion"]);
  
  // Ingredients
  const [fermentables, setFermentables] = useState<Fermentable[]>([
    { name: "Pale Ale Malt 2-Row", amount: 6, type: "Grain", potential: 37, color: 3 }
  ]);
  const [hops, setHops] = useState<Hop[]>([
    { name: "Citra", amount: 1, alpha: 12, time: 60, use: "Boil" }
  ]);
  const [yeast, setYeast] = useState<Yeast>({ name: "Safale US-05", attenuation: 77 });
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [showGrainPicker, setShowGrainPicker] = useState(false);
  const [showHopPicker, setShowHopPicker] = useState(false);
  
  // Update water profile when style changes
  useEffect(() => {
    if (style in WATER_PROFILES) {
      setWaterProfileName(style as keyof typeof WATER_PROFILES);
      const profile = WATER_PROFILES[style as keyof typeof WATER_PROFILES];
      setCustomSulfate(profile.sulfate);
      setCustomChloride(profile.chloride);
    }
  }, [style]);
  
  // Update mash steps when preset changes
  useEffect(() => {
    setMashSteps([...MASH_PRESETS[mashPreset]]);
  }, [mashPreset]);
  
  // Real-time calculations
  const calculations = useMemo(() => {
    const og = calculateOG(fermentables, batchSize, efficiency);
    const fg = calculateFG(og, yeast.attenuation || 75);
    const abv = calculateABV(og, fg);
    const ibu = calculateIBU(hops, og, batchSize);
    const srm = calculateSRM(fermentables, batchSize);
    const buGu = (og - 1) * 1000 > 0 ? Math.round((ibu / ((og - 1) * 1000)) * 100) / 100 : 0;
    return { og, fg, abv, ibu, srm, buGu };
  }, [fermentables, hops, yeast, batchSize, efficiency]);
  
  // Water salts (calculated from sulfate/chloride targets)
  const waterProfile = useMemo(() => {
    const targetSulfate = useCustomWater ? customSulfate : (WATER_PROFILES[waterProfileName]?.sulfate || 150);
    const targetChloride = useCustomWater ? customChloride : (WATER_PROFILES[waterProfileName]?.chloride || 75);
    
    // Wayne's tap water baseline: SO4=26.6, Cl=15.5
    const gypsum = Math.round(((targetSulfate - 26.6) / 147.4) * batchSize * 10) / 10;
    const cacl2 = Math.round(((targetChloride - 15.5) / 127.4) * batchSize * 10) / 10;
    
    return { 
      gypsum: Math.max(0, gypsum), 
      cacl2: Math.max(0, cacl2), 
      lacticAcid: 3,
      targetSulfate,
      targetChloride,
      ratio: targetSulfate / Math.max(targetChloride, 1),
    };
  }, [waterProfileName, customSulfate, customChloride, useCustomWater, batchSize]);
  
  // Handle save
  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a recipe name");
      return;
    }
    
    setSaving(true);
    try {
      // Use main saccharification step temp/time
      const mainMashStep = mashSteps.find(s => s.name.toLowerCase().includes('sacch') || s.name.toLowerCase().includes('rest')) || mashSteps[0];
      const totalMashTime = mashSteps.reduce((sum, s) => sum + s.time, 0);
      
      const result = await createRecipe({
        name,
        style,
        tagline: tagline || undefined,
        type: "all-grain",
        batchSize,
        boilTime,
        efficiency,
        fermentables,
        hopsDetailed: hops,
        yeastDetailed: yeast,
        waterProfile: {
          gypsum: waterProfile.gypsum,
          cacl2: waterProfile.cacl2,
          lacticAcid: waterProfile.lacticAcid,
          notes: `SO₄:Cl = ${waterProfile.targetSulfate}:${waterProfile.targetChloride} (${waterProfile.ratio.toFixed(1)}:1)`,
        },
        mashTemp: mainMashStep?.temp || 152,
        mashTime: totalMashTime,
        createdBy: "user",
      });
      router.push(`/recipes/${result.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };
  
  // Add fermentable
  const addFermentable = (grain: typeof COMMON_GRAINS[0]) => {
    setFermentables([...fermentables, { ...grain, amount: 1 }]);
    setShowGrainPicker(false);
  };
  
  // Add hop
  const addHop = (hop: typeof COMMON_HOPS[0]) => {
    setHops([...hops, { ...hop, amount: 1, time: 15, use: "Boil" }]);
    setShowHopPicker(false);
  };
  
  // Remove fermentable
  const removeFermentable = (index: number) => {
    setFermentables(fermentables.filter((_, i) => i !== index));
  };
  
  // Remove hop
  const removeHop = (index: number) => {
    setHops(hops.filter((_, i) => i !== index));
  };
  
  // Update fermentable
  const updateFermentable = (index: number, updates: Partial<Fermentable>) => {
    setFermentables(fermentables.map((f, i) => i === index ? { ...f, ...updates } : f));
  };
  
  // Update hop
  const updateHop = (index: number, updates: Partial<Hop>) => {
    setHops(hops.map((h, i) => i === index ? { ...h, ...updates } : h));
  };
  
  return (
    <AdminGuard>
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <CosmicBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/recipes" className="text-zinc-400 hover:text-white transition-colors">
              ← Back
            </Link>
            <h1 className="text-xl font-bold font-mono">
              <span className="text-amber-500">NEW</span>
              <span className="text-zinc-400">_</span>
              <span className="text-cyan-400">RECIPE</span>
            </h1>
            <LogoutButton />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "SAVING..." : "SAVE RECIPE"}
          </button>
        </div>
      </header>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Recipe Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
            >
              <h2 className="text-lg font-bold text-amber-500 mb-4 font-mono">RECIPE_INFO</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="West Coast Ripper"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Style</label>
                  <select
                    value={style}
                    onChange={e => setStyle(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                  >
                    {BEER_STYLES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    placeholder="Piney, citrusy, crushable"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              {/* Batch Settings */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Batch (gal)</label>
                  <input
                    type="number"
                    value={batchSize}
                    onChange={e => setBatchSize(parseFloat(e.target.value) || 2.5)}
                    step="0.5"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-center font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Efficiency %</label>
                  <input
                    type="number"
                    value={efficiency}
                    onChange={e => setEfficiency(parseInt(e.target.value) || 72)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-center font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Boil (min)</label>
                  <input
                    type="number"
                    value={boilTime}
                    onChange={e => setBoilTime(parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-center font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Fermentables Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-orange-500 font-mono">FERMENTABLES</h2>
                <button
                  onClick={() => setShowGrainPicker(true)}
                  className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-mono transition-colors"
                >
                  + ADD GRAIN
                </button>
              </div>
              
              <div className="space-y-3">
                {fermentables.map((grain, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg"
                  >
                    <div
                      className="w-8 h-8 rounded-full border-2 border-zinc-600 flex-shrink-0"
                      style={{ backgroundColor: srmToColor(grain.color || 3) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{grain.name}</div>
                      <div className="text-xs text-zinc-500">{grain.type} • {grain.color}°L • {grain.potential} PPG</div>
                    </div>
                    <input
                      type="number"
                      value={grain.amount}
                      onChange={e => updateFermentable(index, { amount: parseFloat(e.target.value) || 0 })}
                      step="0.25"
                      className="w-20 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center font-mono text-sm focus:border-amber-500 focus:outline-none"
                    />
                    <span className="text-sm text-zinc-400">lbs</span>
                    <button
                      onClick={() => removeFermentable(index)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </div>
              
              {/* Grain Picker Modal */}
              <AnimatePresence>
                {showGrainPicker && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowGrainPicker(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto"
                      onClick={e => e.stopPropagation()}
                    >
                      <h3 className="text-lg font-bold text-amber-500 mb-4 font-mono">SELECT GRAIN</h3>
                      <div className="space-y-2">
                        {COMMON_GRAINS.map((grain, i) => (
                          <button
                            key={i}
                            onClick={() => addFermentable(grain)}
                            className="w-full flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-left"
                          >
                            <div
                              className="w-6 h-6 rounded-full border border-zinc-600"
                              style={{ backgroundColor: srmToColor(grain.color) }}
                            />
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
            </motion.div>
            
            {/* Hops Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-green-500 font-mono">HOPS</h2>
                <button
                  onClick={() => setShowHopPicker(true)}
                  className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-mono transition-colors"
                >
                  + ADD HOP
                </button>
              </div>
              
              <div className="space-y-3">
                {hops.map((hop, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-600/30 border-2 border-green-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-green-400">
                      🌿
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{hop.name}</div>
                      <div className="text-xs text-zinc-500">{hop.alpha}% AA</div>
                    </div>
                    <input
                      type="number"
                      value={hop.amount}
                      onChange={e => updateHop(index, { amount: parseFloat(e.target.value) || 0 })}
                      step="0.25"
                      className="w-16 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center font-mono text-sm focus:border-amber-500 focus:outline-none"
                    />
                    <span className="text-sm text-zinc-400">oz</span>
                    <select
                      value={hop.use}
                      onChange={e => updateHop(index, { use: e.target.value })}
                      className="px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-sm focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Boil">Boil</option>
                      <option value="Whirlpool">Whirlpool</option>
                      <option value="Dry Hop">Dry Hop</option>
                    </select>
                    <input
                      type="number"
                      value={hop.time}
                      onChange={e => updateHop(index, { time: parseInt(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center font-mono text-sm focus:border-amber-500 focus:outline-none"
                    />
                    <span className="text-sm text-zinc-400">min</span>
                    <button
                      onClick={() => removeHop(index)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </div>
              
              {/* Hop Picker Modal */}
              <AnimatePresence>
                {showHopPicker && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowHopPicker(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto"
                      onClick={e => e.stopPropagation()}
                    >
                      <h3 className="text-lg font-bold text-green-500 mb-4 font-mono">SELECT HOP</h3>
                      <div className="space-y-2">
                        {COMMON_HOPS.map((hop, i) => (
                          <button
                            key={i}
                            onClick={() => addHop(hop)}
                            className="w-full flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-left"
                          >
                            <div className="w-6 h-6 rounded-full bg-green-600/30 border border-green-600 flex items-center justify-center text-xs">
                              🌿
                            </div>
                            <div>
                              <div className="font-medium">{hop.name}</div>
                              <div className="text-xs text-zinc-500">{hop.alpha}% Alpha Acid</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Yeast Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
            >
              <h2 className="text-lg font-bold text-purple-500 mb-4 font-mono">YEAST</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Strain</label>
                  <select
                    value={yeast.name}
                    onChange={e => {
                      const selected = COMMON_YEASTS.find(y => y.name === e.target.value);
                      if (selected) setYeast(selected);
                    }}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                  >
                    {COMMON_YEASTS.map(y => (
                      <option key={y.name} value={y.name}>{y.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Attenuation %</label>
                  <input
                    type="number"
                    value={yeast.attenuation || 75}
                    onChange={e => setYeast({ ...yeast, attenuation: parseInt(e.target.value) || 75 })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Water Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
            >
              <h2 className="text-lg font-bold text-blue-400 mb-4 font-mono">WATER_PROFILE</h2>
              
              {/* Profile Preset Selector */}
              <div className="mb-4">
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Profile Preset</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(Object.keys(WATER_PROFILES) as Array<keyof typeof WATER_PROFILES>).map(profile => (
                    <button
                      key={profile}
                      onClick={() => {
                        setWaterProfileName(profile);
                        setUseCustomWater(false);
                        setCustomSulfate(WATER_PROFILES[profile].sulfate);
                        setCustomChloride(WATER_PROFILES[profile].chloride);
                      }}
                      className={`p-2 rounded-lg border text-xs text-left transition-all ${
                        waterProfileName === profile && !useCustomWater
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <div className="font-bold truncate">{profile}</div>
                      <div className="text-zinc-500">{WATER_PROFILES[profile].ratio}</div>
                    </button>
                  ))}
                  <button
                    onClick={() => setUseCustomWater(true)}
                    className={`p-2 rounded-lg border text-xs text-left transition-all ${
                      useCustomWater
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <div className="font-bold">Custom</div>
                    <div className="text-zinc-500">Set your own</div>
                  </button>
                </div>
              </div>
              
              {/* Custom Sulfate/Chloride Inputs */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Target SO₄ (ppm)</label>
                  <input
                    type="number"
                    value={useCustomWater ? customSulfate : WATER_PROFILES[waterProfileName].sulfate}
                    onChange={e => {
                      setUseCustomWater(true);
                      setCustomSulfate(parseInt(e.target.value) || 100);
                    }}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-center focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Target Cl (ppm)</label>
                  <input
                    type="number"
                    value={useCustomWater ? customChloride : WATER_PROFILES[waterProfileName].chloride}
                    onChange={e => {
                      setUseCustomWater(true);
                      setCustomChloride(parseInt(e.target.value) || 100);
                    }}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-center focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              {/* Ratio Display */}
              <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                <div className="text-xs text-zinc-500 uppercase mb-1">SO₄:Cl Ratio</div>
                <div className="text-2xl font-mono font-bold text-blue-400">
                  {waterProfile.ratio.toFixed(1)}:1
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {waterProfile.ratio > 2 ? "Hop-forward" : waterProfile.ratio < 0.8 ? "Malt-forward" : "Balanced"}
                </div>
              </div>
            </motion.div>
            
            {/* Mash Schedule Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
            >
              <h2 className="text-lg font-bold text-amber-500 mb-4 font-mono">MASH_SCHEDULE</h2>
              
              {/* Preset Selector */}
              <div className="mb-4">
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Preset</label>
                <select
                  value={mashPreset}
                  onChange={e => setMashPreset(e.target.value as keyof typeof MASH_PRESETS)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                >
                  {Object.keys(MASH_PRESETS).map(preset => (
                    <option key={preset} value={preset}>{preset}</option>
                  ))}
                </select>
              </div>
              
              {/* Mash Steps */}
              <div className="space-y-3">
                {mashSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={step.name}
                        onChange={e => {
                          const newSteps = [...mashSteps];
                          newSteps[index] = { ...step, name: e.target.value };
                          setMashSteps(newSteps);
                        }}
                        className="w-full bg-transparent border-none text-white font-medium focus:outline-none"
                      />
                      {step.notes && (
                        <div className="text-xs text-zinc-500">{step.notes}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={step.temp}
                        onChange={e => {
                          const newSteps = [...mashSteps];
                          newSteps[index] = { ...step, temp: parseInt(e.target.value) || 150 };
                          setMashSteps(newSteps);
                        }}
                        className="w-16 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center font-mono text-sm focus:border-amber-500 focus:outline-none"
                      />
                      <span className="text-zinc-500 text-sm">°F</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={step.time}
                        onChange={e => {
                          const newSteps = [...mashSteps];
                          newSteps[index] = { ...step, time: parseInt(e.target.value) || 30 };
                          setMashSteps(newSteps);
                        }}
                        className="w-16 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center font-mono text-sm focus:border-amber-500 focus:outline-none"
                      />
                      <span className="text-zinc-500 text-sm">min</span>
                    </div>
                    <button
                      onClick={() => setMashSteps(mashSteps.filter((_, i) => i !== index))}
                      className="p-1 text-zinc-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Add Step Button */}
              <button
                onClick={() => setMashSteps([...mashSteps, { name: "New Step", temp: 152, time: 15 }])}
                className="mt-3 w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-mono transition-colors"
              >
                + ADD STEP
              </button>
              
              {/* Total Time */}
              <div className="mt-4 pt-3 border-t border-zinc-700 flex justify-between text-sm">
                <span className="text-zinc-500">Total Mash Time</span>
                <span className="font-mono font-bold text-amber-400">
                  {mashSteps.reduce((sum, s) => sum + s.time, 0)} min
                </span>
              </div>
            </motion.div>
            
          </div>
          
          {/* Right Column - Stats Panel */}
          <div className="space-y-6">
            
            {/* Live Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm sticky top-4"
            >
              <h2 className="text-lg font-bold text-cyan-400 mb-6 font-mono">STATS_LIVE</h2>
              
              {/* Color Preview */}
              <div className="mb-6">
                <div className="h-24 rounded-lg border border-zinc-700 overflow-hidden relative">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom, ${srmToColor(calculations.srm)}, ${srmToColor(calculations.srm + 5)})`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">🍺</span>
                  </div>
                  {/* Foam */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-amber-100 to-amber-200/50" />
                </div>
                <div className="text-center mt-2 text-sm text-zinc-400">
                  {calculations.srm} SRM
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-400">OG</span>
                  <span className="font-mono text-xl font-bold text-amber-400">{calculations.og.toFixed(3)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-400">FG</span>
                  <span className="font-mono text-xl font-bold text-amber-400">{calculations.fg.toFixed(3)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-400">ABV</span>
                  <span className="font-mono text-2xl font-bold text-green-400">{calculations.abv}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-400">IBU</span>
                  <span className="font-mono text-2xl font-bold text-cyan-400">{calculations.ibu}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-400">BU:GU</span>
                  <span className="font-mono text-lg font-bold text-purple-400">{calculations.buGu}</span>
                </div>
              </div>
              
              {/* Water Chemistry */}
              <div className="mt-6 pt-6 border-t border-zinc-700">
                <h3 className="text-sm font-bold text-blue-400 mb-3 font-mono">WATER_SALTS</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Gypsum (CaSO₄)</span>
                    <span className="font-mono text-white">{waterProfile.gypsum}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">CaCl₂</span>
                    <span className="font-mono text-white">{waterProfile.cacl2}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Lactic Acid 85%</span>
                    <span className="font-mono text-white">{waterProfile.lacticAcid}ml</span>
                  </div>
                </div>
              </div>
              
              {/* Grain Bill Summary */}
              <div className="mt-6 pt-6 border-t border-zinc-700">
                <h3 className="text-sm font-bold text-orange-400 mb-3 font-mono">GRAIN_BILL</h3>
                <div className="text-sm text-zinc-400">
                  Total: {fermentables.reduce((sum, f) => sum + f.amount, 0).toFixed(2)} lbs
                </div>
                {fermentables.map((f, i) => {
                  const total = fermentables.reduce((sum, f) => sum + f.amount, 0);
                  const pct = total > 0 ? Math.round((f.amount / total) * 100) : 0;
                  return (
                    <div key={i} className="flex justify-between text-xs mt-1">
                      <span className="text-zinc-500 truncate">{f.name}</span>
                      <span className="text-zinc-400">{pct}%</span>
                    </div>
                  );
                })}
              </div>
              
            </motion.div>
          </div>
          
        </div>
      </div>
    </main>
    </AdminGuard>
  );
}
