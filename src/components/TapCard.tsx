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
  hops?: string[];
  malts?: string[];
  yeast?: string;
  flavorTags?: string[];
}

interface TapCardProps {
  number: number;
  status: 'full' | 'half' | 'low' | 'kicked' | 'empty';
  beer: Beer | null;
  index?: number;
}

const statusConfig = {
  full: { label: 'POURING', color: 'text-green-400', bg: 'bg-green-500', gradient: 'from-green-500 to-emerald-500', percent: 100 },
  half: { label: 'HALF FULL', color: 'text-amber-400', bg: 'bg-amber-500', gradient: 'from-amber-500 to-yellow-500', percent: 50 },
  low: { label: 'RUNNING LOW', color: 'text-orange-400', bg: 'bg-orange-500', gradient: 'from-orange-500 to-red-500', percent: 25 },
  kicked: { label: 'KICKED', color: 'text-red-400', bg: 'bg-red-500', gradient: 'from-red-500 to-rose-500', percent: 0 },
  empty: { label: 'STANDBY', color: 'text-zinc-500', bg: 'bg-zinc-600', gradient: 'from-zinc-600 to-zinc-700', percent: 0 },
};

// Clean up ingredient names for display
function formatIngredient(name: string): string {
  return name
    .replace('Columbus/Tomahawk/Zeus (CTZ)', 'CTZ')
    .replace('Pale Ale Malt 2-Row', '2-Row Pale')
    .replace('Pale Malt 2-Row', '2-Row Pale')
    .replace('Caramel Malt 60L', 'Crystal 60L')
    .replace('Caramel Malt', 'Crystal')
    .replace('Wheat Soft Red, Flaked', 'Flaked Wheat')
    .replace('American Honey Malt', 'Honey Malt')
    .replace('Midnight Wheat Malt', 'Midnight Wheat')
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
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 400, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 400, damping: 30 });

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
  const borderColors = {
    full: 'from-green-500 via-cyan-500 to-green-500',
    half: 'from-amber-500 via-orange-500 to-amber-500',
    low: 'from-orange-500 via-red-500 to-orange-500',
    kicked: 'from-red-500 via-rose-500 to-red-500',
    empty: 'from-purple-500/50 via-cyan-500/50 to-purple-500/50',
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.15,
        type: "spring",
        stiffness: 80,
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
      className="relative group cursor-pointer"
    >
      {/* Animated gradient border */}
      <motion.div 
        className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-r ${borderColors[status]} opacity-60 blur-sm`}
        animate={{
          opacity: isHovered ? 1 : 0.4,
        }}
        style={{
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 3s ease infinite',
        }}
      />
      
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-4 rounded-3xl opacity-0"
        style={{
          background: `radial-gradient(circle, ${status === 'empty' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(251, 191, 36, 0.15)'} 0%, transparent 70%)`,
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />
      
      {/* Card body */}
      <div className="relative bg-zinc-950/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/5">
        
        {/* Scan line effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
            backgroundSize: '100% 8px',
          }}
        />
        
        {/* Header */}
        <div className="relative px-5 py-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Status indicator with pulse */}
              <div className="relative">
                <motion.div 
                  className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${config.gradient}`}
                  animate={!isEmpty ? {
                    boxShadow: [
                      '0 0 0 0 currentColor',
                      '0 0 0 8px transparent',
                    ]
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                {!isEmpty && (
                  <motion.div 
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient}`}
                    animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
              <span className="font-mono text-xs tracking-[0.3em] text-zinc-400">
                TAP::{String(number).padStart(2, '0')}
              </span>
            </div>
            <motion.span 
              className={`font-mono text-xs tracking-wider ${config.color} font-bold`}
              animate={!isEmpty ? { opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              [{config.label}]
            </motion.span>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-6" style={{ transform: 'translateZ(20px)' }}>
          {isEmpty ? (
            /* Empty state - space kangaroo vibes */
            <div className="text-center py-8">
              <motion.div
                className="relative inline-block"
                animate={{ 
                  y: [0, -8, 0],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Gear icon with glow */}
                <motion.div
                  className="text-5xl opacity-30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  ⚙️
                </motion.div>
              </motion.div>
              <motion.p 
                className="mt-4 font-mono text-xs tracking-[0.2em] text-zinc-600"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AWAITING INPUT
              </motion.p>
              <p className="mt-2 text-xs text-zinc-700">
                Assign beer in admin
              </p>
            </div>
          ) : (
            /* Beer details */
            <>
              {/* Beer name with gradient */}
              <motion.h3 
                className="text-2xl font-bold mb-1 bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent"
                style={{ transform: 'translateZ(40px)' }}
              >
                {beer.name}
              </motion.h3>
              
              {/* Style */}
              <p className="text-amber-500/90 text-sm font-medium tracking-wide mb-4">
                {beer.style || 'Craft Beer'}
              </p>

              {/* Tagline - the story */}
              {beer.tagline && (
                <motion.div 
                  className="mb-5 p-3 rounded-lg bg-gradient-to-r from-amber-500/5 to-transparent border-l-2 border-amber-500/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <p className="text-zinc-300 text-sm italic leading-relaxed">
                    "{beer.tagline}"
                  </p>
                </motion.div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-white/5">
                <motion.div 
                  className="text-center p-2 rounded-lg bg-white/5"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <div className="text-xl font-bold text-white">{beer.abv || '?'}%</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">ABV</div>
                </motion.div>
                <motion.div 
                  className="text-center p-2 rounded-lg bg-white/5"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <div className="text-xl font-bold text-white">{beer.ibu || '—'}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">IBU</div>
                </motion.div>
                <motion.div 
                  className="text-center p-2 rounded-lg bg-white/5"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <div className="text-xl font-bold text-zinc-400">#{beer.batchNo}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Batch</div>
                </motion.div>
              </div>

              {/* THE RECIPE - beautifully displayed */}
              <div className="space-y-4">
                {/* Hops Section */}
                {beer.hops && beer.hops.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🌿</span>
                      <span className="text-xs font-bold text-green-400/80 uppercase tracking-[0.2em]">Hops</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-green-500/30 to-transparent" />
                    </div>
                    <div className="flex flex-wrap gap-2 pl-7">
                      {beer.hops.map((hop, i) => (
                        <motion.span 
                          key={i}
                          className="px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-400 rounded-full border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 transition-all cursor-default"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {formatIngredient(hop)}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Malt Section */}
                {beer.malts && beer.malts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🌾</span>
                      <span className="text-xs font-bold text-amber-400/80 uppercase tracking-[0.2em]">Malt Bill</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
                    </div>
                    <div className="flex flex-wrap gap-2 pl-7">
                      {beer.malts.map((malt, i) => (
                        <motion.span 
                          key={i}
                          className="px-3 py-1.5 text-xs font-medium bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all cursor-default"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + i * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {formatIngredient(malt)}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Yeast Section */}
                {beer.yeast && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🧬</span>
                      <span className="text-xs font-bold text-purple-400/80 uppercase tracking-[0.2em]">Yeast</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent" />
                    </div>
                    <div className="pl-7">
                      <motion.span 
                        className="px-3 py-1.5 text-xs font-medium bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all cursor-default inline-block"
                        whileHover={{ scale: 1.05 }}
                      >
                        {formatIngredient(beer.yeast)}
                      </motion.span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Keg Level - beautiful gauge */}
              <motion.div 
                className="mt-6 pt-4 border-t border-white/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Keg Level</span>
                  <span className={`text-xs font-mono font-bold ${config.color}`}>
                    {config.percent}%
                  </span>
                </div>
                <div className="h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${config.gradient} relative`}
                    initial={{ width: 0 }}
                    animate={{ width: `${config.percent}%` }}
                    transition={{ duration: 1.5, delay: 0.5 + index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    {/* Animated shine */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                      }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
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
