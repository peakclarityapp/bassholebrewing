'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, useRef } from 'react';

interface Beer {
  id: string;
  name: string;
  style: string;
  tagline?: string;
  abv: number;
  ibu?: number;
  batchNo: number;
  srm?: number;
  hops?: string[];
  malts?: string[];
  yeast?: string;
  flavorTags?: string[];
}

// SRM to color mapping (beer color)
function getSrmColor(srm?: number): string {
  if (!srm) return 'rgb(255, 209, 72)'; // Default golden
  if (srm <= 2) return 'rgb(255, 230, 153)';  // Pale straw
  if (srm <= 4) return 'rgb(255, 209, 72)';   // Straw
  if (srm <= 6) return 'rgb(255, 191, 0)';    // Light gold
  if (srm <= 9) return 'rgb(234, 170, 0)';    // Gold
  if (srm <= 12) return 'rgb(213, 145, 0)';   // Amber
  if (srm <= 15) return 'rgb(189, 119, 0)';   // Light copper
  if (srm <= 18) return 'rgb(166, 94, 0)';    // Copper
  if (srm <= 22) return 'rgb(143, 68, 0)';    // Brown
  if (srm <= 30) return 'rgb(102, 51, 0)';    // Dark brown
  return 'rgb(51, 25, 0)';  // Very dark / black
}

// Flavor tag colors
const flavorColors: Record<string, string> = {
  tropical: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  citrus: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  hoppy: 'bg-green-500/20 text-green-400 border-green-500/30',
  juicy: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  pine: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  dank: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  roasty: 'bg-amber-700/20 text-amber-600 border-amber-700/30',
  malty: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  crisp: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  floral: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  fruity: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  spicy: 'bg-red-500/20 text-red-400 border-red-500/30',
};

interface TapCardProps {
  number: number;
  status: 'full' | 'half' | 'low' | 'kicked' | 'empty' | 'conditioning';
  beer: Beer | null;
  index?: number;
}

const statusConfig = {
  full: { label: 'POURING', color: 'text-green-400', bg: 'bg-green-500', gradient: 'from-green-500 to-emerald-500', percent: 100 },
  conditioning: { label: 'CONDITIONING', color: 'text-cyan-400', bg: 'bg-cyan-500', gradient: 'from-cyan-500 to-blue-500', percent: 100 },
  half: { label: 'HALF FULL', color: 'text-amber-400', bg: 'bg-amber-500', gradient: 'from-amber-500 to-yellow-500', percent: 50 },
  low: { label: 'RUNNING LOW', color: 'text-orange-400', bg: 'bg-orange-500', gradient: 'from-orange-500 to-red-500', percent: 25 },
  kicked: { label: 'KICKED', color: 'text-red-400', bg: 'bg-red-500', gradient: 'from-red-500 to-rose-500', percent: 0 },
  empty: { label: 'STANDBY', color: 'text-zinc-500', bg: 'bg-zinc-600', gradient: 'from-zinc-600 to-zinc-700', percent: 0 },
};

// Clean up ingredient names for display
function formatIngredient(name: string): string {
  return name
    .replace('Columbus/Tomahawk/Zeus (CTZ)', 'CTZ')
    .replace('Pale Ale Malt 2-Row', '2-Row')
    .replace('Pale Malt 2-Row', '2-Row')
    .replace('Caramel Malt 60L', 'C60')
    .replace('Caramel Malt', 'Crystal')
    .replace('Wheat Soft Red, Flaked', 'Wheat')
    .replace('American Honey Malt', 'Honey')
    .replace('Midnight Wheat Malt', 'Midnight')
    .replace('Munich I', 'Munich')
    .replace('Safale American', 'US-05')
    .replace('Windsor Yeast', 'Windsor')
    .replace('Voss Kveik', 'Kveik')
    .replace(/ Malt$/, '')
    .replace(/ Yeast$/, '');
}

export function TapCard({ number, status, beer, index = 0 }: TapCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 400, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { stiffness: 400, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const config = statusConfig[status] || statusConfig.empty;
  const isEmpty = !beer || status === 'empty';
  
  // Dynamic border colors based on status
  const borderColors: Record<string, string> = {
    full: 'from-green-500 via-cyan-500 to-green-500',
    conditioning: 'from-cyan-500 via-blue-500 to-cyan-500',
    half: 'from-amber-500 via-orange-500 to-amber-500',
    low: 'from-orange-500 via-red-500 to-orange-500',
    kicked: 'from-red-500 via-rose-500 to-red-500',
    empty: 'from-purple-500/30 via-cyan-500/30 to-purple-500/30',
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className="relative group cursor-pointer h-[420px]" // Fixed height!
    >
      {/* Animated gradient border */}
      <motion.div 
        className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-b ${borderColors[status]} opacity-60 blur-sm`}
        animate={{ opacity: isHovered ? 1 : 0.4 }}
        style={{
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 3s ease infinite',
        }}
      />
      
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-4 rounded-3xl opacity-0"
        style={{
          background: `radial-gradient(circle, ${status === 'empty' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(34, 197, 94, 0.15)'} 0%, transparent 70%)`,
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />
      
      {/* Card body with vertical keg gauge */}
      <div className="relative h-full bg-zinc-950/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/5 flex">
        
        {/* VERTICAL KEG GAUGE - Left side */}
        <div className="relative w-3 flex-shrink-0 bg-zinc-900/50">
          {/* Gauge background */}
          <div className="absolute inset-x-0 top-0 bottom-0 bg-zinc-800/50" />
          
          {/* Gauge fill - animated from bottom */}
          <motion.div
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t ${config.gradient}`}
            initial={{ height: 0 }}
            animate={{ height: `${config.percent}%` }}
            transition={{ duration: 1.5, delay: 0.3 + index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Animated shine moving up */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                backgroundSize: '100% 50px',
              }}
              animate={{ y: ['100%', '-100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            />
            
            {/* Bubbles effect for full kegs */}
            {config.percent >= 50 && (
              <>
                <motion.div
                  className="absolute w-1 h-1 bg-white/40 rounded-full left-0.5"
                  animate={{ y: [0, -20], opacity: [0.6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  style={{ bottom: '10%' }}
                />
                <motion.div
                  className="absolute w-0.5 h-0.5 bg-white/30 rounded-full left-1"
                  animate={{ y: [0, -15], opacity: [0.5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.5 }}
                  style={{ bottom: '30%' }}
                />
              </>
            )}
          </motion.div>
          
          {/* Gauge markings */}
          <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-full h-px bg-zinc-700/50" />
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="relative px-4 py-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Status indicator with pulse */}
                <div className="relative">
                  <motion.div 
                    className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient}`}
                    animate={!isEmpty ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {!isEmpty && (
                    <motion.div 
                      className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient}`}
                      animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
                <span className="font-display text-[10px] tracking-[0.2em] text-zinc-500">
                  TAP {String(number).padStart(2, '0')}
                </span>
              </div>
              <motion.span 
                className={`font-display text-[10px] tracking-wider ${config.color} font-bold`}
                animate={!isEmpty ? { opacity: [1, 0.6, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {config.label}
              </motion.span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative p-4 flex flex-col" style={{ transform: 'translateZ(10px)' }}>
            {isEmpty ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="text-4xl opacity-20 mb-3"
                >
                  🍺
                </motion.div>
                <motion.p 
                  className="font-mono text-[10px] tracking-[0.15em] text-zinc-600"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  AWAITING ASSIGNMENT
                </motion.p>
              </div>
            ) : (
              /* Beer details */
              <>
                {/* Beer color strip (SRM) - visual accent at top */}
                <motion.div 
                  className="absolute top-0 left-3 right-0 h-1 rounded-r-full opacity-60"
                  style={{ backgroundColor: getSrmColor(beer.srm) }}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                />

                {/* Beer name */}
                <h3 className="text-lg font-black leading-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent font-display">
                  {beer.name}
                </h3>
                
                {/* Style with beer glass icon */}
                <div className="flex items-center gap-1.5 mt-0.5 mb-1">
                  <span className="text-[10px]">🍺</span>
                  <p className="text-amber-500/90 text-xs font-semibold tracking-wide">
                    {beer.style || 'Craft Beer'}
                  </p>
                </div>

                {/* Tagline */}
                {beer.tagline && (
                  <motion.p 
                    className="text-zinc-400 text-[11px] italic leading-relaxed mb-2 line-clamp-2 border-l-2 border-amber-500/30 pl-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {beer.tagline}
                  </motion.p>
                )}

                {/* Flavor tags */}
                {beer.flavorTags && beer.flavorTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {beer.flavorTags.slice(0, 3).map((tag, i) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                          flavorColors[tag.toLowerCase()] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                        }`}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                )}

                {/* Stats row - with beer color accent */}
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 text-center py-1.5 rounded bg-white/5 relative overflow-hidden">
                    <div 
                      className="absolute inset-0 opacity-10" 
                      style={{ backgroundColor: getSrmColor(beer.srm) }}
                    />
                    <div className="relative text-sm font-bold text-white">{beer.abv ? beer.abv.toFixed(1) : '?'}%</div>
                    <div className="relative text-[8px] text-zinc-500 uppercase tracking-wider">ABV</div>
                  </div>
                  <div className="flex-1 text-center py-1.5 rounded bg-white/5">
                    <div className="text-sm font-bold text-white">{beer.ibu ? Math.round(beer.ibu) : '—'}</div>
                    <div className="text-[8px] text-zinc-500 uppercase tracking-wider">IBU</div>
                  </div>
                  <div className="flex-1 text-center py-1.5 rounded bg-white/5">
                    <div className="text-sm font-bold text-zinc-400">#{beer.batchNo}</div>
                    <div className="text-[8px] text-zinc-500 uppercase tracking-wider">Batch</div>
                  </div>
                </div>

                {/* COMPACT RECIPE - single line per category */}
                <div className="flex-1 space-y-1.5 text-[10px]">
                  {/* Hops */}
                  {beer.hops && beer.hops.length > 0 && (
                    <div className="flex items-start gap-1.5 group">
                      <span className="text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform">🌿</span>
                      <span className="text-zinc-400 leading-relaxed">
                        {beer.hops.map(h => formatIngredient(h)).join(' · ')}
                      </span>
                    </div>
                  )}
                  
                  {/* Malts */}
                  {beer.malts && beer.malts.length > 0 && (
                    <div className="flex items-start gap-1.5 group">
                      <span className="text-amber-500 flex-shrink-0 group-hover:scale-110 transition-transform">🌾</span>
                      <span className="text-zinc-400 leading-relaxed">
                        {beer.malts.map(m => formatIngredient(m)).join(' · ')}
                      </span>
                    </div>
                  )}
                  
                  {/* Yeast */}
                  {beer.yeast && (
                    <div className="flex items-start gap-1.5 group">
                      <span className="text-purple-500 flex-shrink-0 group-hover:scale-110 transition-transform">🧬</span>
                      <span className="text-zinc-400">
                        {formatIngredient(beer.yeast)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Keg percentage label at bottom */}
                <div className="mt-auto pt-2 flex items-center justify-between text-[10px]">
                  <span className="text-zinc-600 uppercase tracking-wider">Keg</span>
                  <span className={`font-mono font-bold ${config.color}`}>
                    {config.percent}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* CSS for gradient animation */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </motion.div>
  );
}
