"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BJCPStyle, calculateBuGu, getBuGuRange } from "@/lib/bjcp-styles";

interface StyleGuidelinesProps {
  style: BJCPStyle;
  og: number;
  fg: number;
  abv: number;
  ibu: number;
  srm: number;
  animated?: boolean;
}

// Get position within range (0-100), clamped
function getPosition(value: number, min: number, max: number): number {
  if (max === min) return 50;
  const pos = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, pos));
}

// Check if value is within range
function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// Get color based on position
function getIndicatorColor(inRange: boolean): string {
  return inRange ? "#22c55e" : "#ef4444"; // green or red
}

// Individual stat bar
function StatBar({ 
  label, 
  value, 
  min, 
  max, 
  unit = "",
  precision = 0,
  animated = true,
  glowColor = "#22c55e"
}: { 
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  precision?: number;
  animated?: boolean;
  glowColor?: string;
}) {
  // Extend range slightly for display (20% padding on each side)
  const rangePadding = (max - min) * 0.3;
  const displayMin = min - rangePadding;
  const displayMax = max + rangePadding;
  
  const position = getPosition(value, displayMin, displayMax);
  const rangeStartPos = getPosition(min, displayMin, displayMax);
  const rangeEndPos = getPosition(max, displayMin, displayMax);
  const rangeWidth = rangeEndPos - rangeStartPos;
  const inRange = isInRange(value, min, max);
  const indicatorColor = getIndicatorColor(inRange);
  
  const formattedValue = precision > 0 ? value.toFixed(precision) : Math.round(value);
  
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-mono">{min.toFixed(precision)}</span>
          <span className="text-xs text-zinc-600">—</span>
          <span className="text-xs text-zinc-500 font-mono">{max.toFixed(precision)}</span>
        </div>
      </div>
      
      <div className="relative h-6 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800/50 to-zinc-900" />
        
        {/* Valid range highlight */}
        <motion.div
          initial={animated ? { opacity: 0, scaleX: 0 } : false}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute top-0 bottom-0 bg-gradient-to-r from-green-500/10 via-green-500/20 to-green-500/10 border-l border-r border-green-500/30"
          style={{
            left: `${rangeStartPos}%`,
            width: `${rangeWidth}%`,
          }}
        />
        
        {/* Range boundary lines */}
        <div 
          className="absolute top-0 bottom-0 w-px bg-green-500/50"
          style={{ left: `${rangeStartPos}%` }}
        />
        <div 
          className="absolute top-0 bottom-0 w-px bg-green-500/50"
          style={{ left: `${rangeEndPos}%` }}
        />
        
        {/* Value indicator */}
        <motion.div
          initial={animated ? { left: "0%", opacity: 0 } : false}
          animate={{ left: `${position}%`, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            delay: animated ? 0.2 : 0
          }}
          className="absolute top-0 bottom-0 flex items-center"
          style={{ transform: "translateX(-50%)" }}
        >
          {/* Glow effect */}
          <motion.div
            animate={inRange ? {
              boxShadow: [
                `0 0 10px ${indicatorColor}40`,
                `0 0 20px ${indicatorColor}60`,
                `0 0 10px ${indicatorColor}40`,
              ],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-5 rounded-sm"
            style={{ backgroundColor: indicatorColor }}
          />
        </motion.div>
        
        {/* Value label */}
        <motion.div
          initial={animated ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"
        >
          <span 
            className="text-sm font-mono font-bold"
            style={{ color: indicatorColor }}
          >
            {formattedValue}
          </span>
          {unit && <span className="text-xs text-zinc-500">{unit}</span>}
        </motion.div>
      </div>
    </div>
  );
}

export function StyleGuidelines({ style, og, fg, abv, ibu, srm, animated = true }: StyleGuidelinesProps) {
  const buGu = calculateBuGu(ibu, og);
  const buGuRange = getBuGuRange(style);
  
  // Count how many stats are in range
  const stats = [
    isInRange(abv, style.abvMin, style.abvMax),
    isInRange(og, style.ogMin, style.ogMax),
    isInRange(fg, style.fgMin, style.fgMax),
    isInRange(ibu, style.ibuMin, style.ibuMax),
    isInRange(srm, style.srmMin, style.srmMax),
  ];
  const inRangeCount = stats.filter(Boolean).length;
  const allInRange = inRangeCount === 5;
  
  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-xl">📖</div>
          <div>
            <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">BJCP {style.id}</div>
            <div className="font-bold text-white">{style.name}</div>
          </div>
        </div>
        
        {/* Score indicator */}
        <motion.div
          initial={animated ? { scale: 0 } : false}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.5 }}
          className={`px-3 py-1 rounded-full font-mono text-sm font-bold ${
            allInRange 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : inRangeCount >= 3
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {inRangeCount}/5 IN_SPEC
        </motion.div>
      </div>
      
      {/* All in range celebration */}
      <AnimatePresence>
        {allInRange && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2 text-green-400">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                ✨
              </motion.span>
              <span className="text-sm font-mono">RECIPE_WITHIN_STYLE_GUIDELINES</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Stats */}
      <div className="space-y-1">
        <StatBar 
          label="ABV" 
          value={abv} 
          min={style.abvMin} 
          max={style.abvMax}
          unit="%"
          precision={1}
          animated={animated}
        />
        <StatBar 
          label="OG" 
          value={og} 
          min={style.ogMin} 
          max={style.ogMax}
          precision={3}
          animated={animated}
        />
        <StatBar 
          label="FG" 
          value={fg} 
          min={style.fgMin} 
          max={style.fgMax}
          precision={3}
          animated={animated}
        />
        <StatBar 
          label="IBU" 
          value={ibu} 
          min={style.ibuMin} 
          max={style.ibuMax}
          animated={animated}
        />
        <StatBar 
          label="SRM" 
          value={srm} 
          min={style.srmMin} 
          max={style.srmMax}
          precision={1}
          animated={animated}
        />
        <StatBar 
          label="BU:GU" 
          value={buGu} 
          min={buGuRange.min} 
          max={buGuRange.max}
          precision={2}
          animated={animated}
        />
      </div>
    </motion.div>
  );
}

// Compact version for inline display
export function StyleGuidelinesCompact({ style, og, fg, abv, ibu, srm }: Omit<StyleGuidelinesProps, 'animated'>) {
  const stats = [
    { label: "ABV", value: abv, min: style.abvMin, max: style.abvMax, unit: "%" },
    { label: "OG", value: og, min: style.ogMin, max: style.ogMax },
    { label: "FG", value: fg, min: style.fgMin, max: style.fgMax },
    { label: "IBU", value: ibu, min: style.ibuMin, max: style.ibuMax },
    { label: "SRM", value: srm, min: style.srmMin, max: style.srmMax },
  ];
  
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {stats.map(({ label, value, min, max }) => {
        const inRange = isInRange(value, min, max);
        return (
          <span 
            key={label}
            className={`px-2 py-0.5 rounded text-xs font-mono ${
              inRange 
                ? "bg-green-500/20 text-green-400" 
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
