"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

interface ScaleToOGProps {
  currentOG: number;
  fermentables: Fermentable[];
  onScale: (newFermentables: Fermentable[]) => void;
}

interface ScaleToIBUProps {
  currentIBU: number;
  hops: Hop[];
  onScale: (newHops: Hop[]) => void;
}

// Scale fermentables to hit target OG while maintaining ratios
export function ScaleToOG({ currentOG, fermentables, onScale }: ScaleToOGProps) {
  const [showModal, setShowModal] = useState(false);
  const [targetOG, setTargetOG] = useState(currentOG);
  
  const handleScale = () => {
    if (currentOG <= 1 || targetOG <= 1) return;
    
    // Calculate scale factor
    const currentGU = (currentOG - 1) * 1000;
    const targetGU = (targetOG - 1) * 1000;
    const scaleFactor = targetGU / currentGU;
    
    // Scale all fermentables
    const newFermentables = fermentables.map(f => ({
      ...f,
      amount: Math.round(f.amount * scaleFactor * 100) / 100,
    }));
    
    onScale(newFermentables);
    setShowModal(false);
  };
  
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setTargetOG(currentOG);
          setShowModal(true);
        }}
        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-mono font-bold transition-colors"
      >
        OG
      </motion.button>
      
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-amber-500/30 rounded-xl p-6 max-w-sm w-full shadow-2xl shadow-amber-500/10"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-amber-500 mb-2 font-mono flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                SCALE_TO_OG
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                Adjust all grain amounts proportionally to hit your target OG while maintaining the current grain bill ratios.
              </p>
              
              <div className="mb-4">
                <label className="block text-xs text-zinc-500 uppercase mb-1 font-mono">Target Original Gravity</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={targetOG}
                    onChange={e => setTargetOG(parseFloat(e.target.value) || 1.050)}
                    step="0.001"
                    min="1.020"
                    max="1.150"
                    className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-lg text-center focus:border-amber-500 focus:outline-none"
                  />
                </div>
                
                {/* Quick presets */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-zinc-500">Quick:</span>
                  {[1.045, 1.055, 1.065, 1.075, 1.085].map(og => (
                    <button
                      key={og}
                      onClick={() => setTargetOG(og)}
                      className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                        Math.abs(targetOG - og) < 0.001
                          ? "bg-amber-500 text-black"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {og.toFixed(3)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Current OG:</span>
                  <span className="font-mono text-zinc-300">{currentOG.toFixed(3)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-zinc-400">Target OG:</span>
                  <span className="font-mono text-amber-400">{targetOG.toFixed(3)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1 pt-1 border-t border-zinc-700">
                  <span className="text-zinc-400">Scale factor:</span>
                  <span className={`font-mono ${
                    targetOG > currentOG ? "text-green-400" : targetOG < currentOG ? "text-red-400" : "text-zinc-300"
                  }`}>
                    {currentOG > 1 ? (((targetOG - 1) / (currentOG - 1)) * 100).toFixed(0) : 100}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 font-mono text-sm transition-colors"
                >
                  CANCEL
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleScale}
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 rounded-lg text-black font-mono text-sm font-bold transition-colors"
                >
                  SCALE_GRAINS
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Scale hops to hit target IBU while maintaining ratios
export function ScaleToIBU({ currentIBU, hops, onScale }: ScaleToIBUProps) {
  const [showModal, setShowModal] = useState(false);
  const [targetIBU, setTargetIBU] = useState(currentIBU);
  
  const handleScale = () => {
    if (currentIBU <= 0 || targetIBU <= 0) return;
    
    // Calculate scale factor
    const scaleFactor = targetIBU / currentIBU;
    
    // Scale all hops (except dry hops which don't contribute to IBU)
    const newHops = hops.map(h => ({
      ...h,
      amount: h.use === 'Dry Hop' 
        ? h.amount  // Don't scale dry hops
        : Math.round(h.amount * scaleFactor * 100) / 100,
    }));
    
    onScale(newHops);
    setShowModal(false);
  };
  
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setTargetIBU(Math.round(currentIBU));
          setShowModal(true);
        }}
        className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs font-mono font-bold transition-colors"
      >
        IBU
      </motion.button>
      
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-6 max-w-sm w-full shadow-2xl shadow-cyan-500/10"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-cyan-400 mb-2 font-mono flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                SCALE_TO_IBU
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                Adjust bittering/aroma hop amounts proportionally to hit your target IBU. Dry hop amounts stay the same.
              </p>
              
              <div className="mb-4">
                <label className="block text-xs text-zinc-500 uppercase mb-1 font-mono">Target IBU</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={targetIBU}
                    onChange={e => setTargetIBU(parseInt(e.target.value) || 40)}
                    min="5"
                    max="150"
                    className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-lg text-center focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                
                {/* Quick presets */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-zinc-500">Quick:</span>
                  {[30, 40, 50, 60, 70, 80].map(ibu => (
                    <button
                      key={ibu}
                      onClick={() => setTargetIBU(ibu)}
                      className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                        targetIBU === ibu
                          ? "bg-cyan-500 text-black"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {ibu}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Current IBU:</span>
                  <span className="font-mono text-zinc-300">{Math.round(currentIBU)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-zinc-400">Target IBU:</span>
                  <span className="font-mono text-cyan-400">{targetIBU}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1 pt-1 border-t border-zinc-700">
                  <span className="text-zinc-400">Scale factor:</span>
                  <span className={`font-mono ${
                    targetIBU > currentIBU ? "text-green-400" : targetIBU < currentIBU ? "text-red-400" : "text-zinc-300"
                  }`}>
                    {currentIBU > 0 ? ((targetIBU / currentIBU) * 100).toFixed(0) : 100}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 font-mono text-sm transition-colors"
                >
                  CANCEL
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleScale}
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-black font-mono text-sm font-bold transition-colors"
                >
                  SCALE_HOPS
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Scale fermentables to hit target ABV while maintaining ratios
interface ScaleToABVProps {
  currentABV: number;
  currentOG: number;
  yeastAttenuation: number;
  fermentables: Fermentable[];
  onScale: (newFermentables: Fermentable[]) => void;
}

export function ScaleToABV({ currentABV, currentOG, yeastAttenuation, fermentables, onScale }: ScaleToABVProps) {
  const [showModal, setShowModal] = useState(false);
  const [targetABV, setTargetABV] = useState(currentABV);
  
  // Calculate what OG we need for target ABV
  // ABV = (OG - 1) × attenuation × 131.25
  // OG = 1 + ABV / (attenuation × 131.25)
  const calculateRequiredOG = (abv: number): number => {
    const att = (yeastAttenuation || 75) / 100;
    return 1 + (abv / (att * 131.25));
  };
  
  const targetOG = calculateRequiredOG(targetABV);
  
  const handleScale = () => {
    if (currentOG <= 1 || targetOG <= 1) return;
    
    // Calculate scale factor based on OG
    const currentGU = (currentOG - 1) * 1000;
    const targetGU = (targetOG - 1) * 1000;
    const scaleFactor = targetGU / currentGU;
    
    // Scale all fermentables
    const newFermentables = fermentables.map(f => ({
      ...f,
      amount: Math.round(f.amount * scaleFactor * 100) / 100,
    }));
    
    onScale(newFermentables);
    setShowModal(false);
  };
  
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setTargetABV(Math.round(currentABV * 10) / 10);
          setShowModal(true);
        }}
        className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 text-xs font-mono font-bold transition-colors"
      >
        %
      </motion.button>
      
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-green-500/30 rounded-xl p-6 max-w-sm w-full shadow-2xl shadow-green-500/10"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-green-400 mb-2 font-mono flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                SCALE_TO_ABV
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                Adjust all grain amounts to hit your target ABV while maintaining ratios. Uses yeast attenuation ({yeastAttenuation || 75}%) to calculate required OG.
              </p>
              
              <div className="mb-4">
                <label className="block text-xs text-zinc-500 uppercase mb-1 font-mono">Target ABV %</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={targetABV}
                    onChange={e => setTargetABV(parseFloat(e.target.value) || 5.0)}
                    step="0.1"
                    min="2.0"
                    max="15.0"
                    className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-lg text-center focus:border-green-500 focus:outline-none"
                  />
                  <span className="text-xl text-zinc-400">%</span>
                </div>
                
                {/* Quick presets */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-zinc-500">Quick:</span>
                  {[4.5, 5.5, 6.5, 7.5, 8.5].map(abv => (
                    <button
                      key={abv}
                      onClick={() => setTargetABV(abv)}
                      className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                        Math.abs(targetABV - abv) < 0.05
                          ? "bg-green-500 text-black"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {abv}%
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Current ABV:</span>
                  <span className="font-mono text-zinc-300">{currentABV.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-zinc-400">Target ABV:</span>
                  <span className="font-mono text-green-400">{targetABV.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1 pt-1 border-t border-zinc-700">
                  <span className="text-zinc-400">Required OG:</span>
                  <span className="font-mono text-amber-400">{targetOG.toFixed(3)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-zinc-400">Scale factor:</span>
                  <span className={`font-mono ${
                    targetABV > currentABV ? "text-green-400" : targetABV < currentABV ? "text-red-400" : "text-zinc-300"
                  }`}>
                    {currentOG > 1 ? (((targetOG - 1) / (currentOG - 1)) * 100).toFixed(0) : 100}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 font-mono text-sm transition-colors"
                >
                  CANCEL
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleScale}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-400 rounded-lg text-black font-mono text-sm font-bold transition-colors"
                >
                  SCALE_GRAINS
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Simple percentage toggle for display
export function PercentageToggle({ 
  showPercentage, 
  onToggle 
}: { 
  showPercentage: boolean; 
  onToggle: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      title="Toggle percentage display"
      className={`px-2 py-1.5 rounded-lg text-xs font-mono transition-colors ${
        showPercentage
          ? "bg-orange-500/30 border border-orange-500/50 text-orange-400"
          : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white"
      }`}
    >
      👁
    </motion.button>
  );
}
