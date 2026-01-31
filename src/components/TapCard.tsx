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
  full: { label: 'FULL', color: 'text-green-400', bg: 'bg-green-500', glow: 'shadow-green-500/20', percent: 100 },
  half: { label: 'HALF', color: 'text-amber-400', bg: 'bg-amber-500', glow: 'shadow-amber-500/20', percent: 50 },
  low: { label: 'LOW', color: 'text-orange-400', bg: 'bg-orange-500', glow: 'shadow-orange-500/20', percent: 25 },
  kicked: { label: 'KICKED', color: 'text-red-400', bg: 'bg-red-500', glow: 'shadow-red-500/20', percent: 0 },
  empty: { label: 'EMPTY', color: 'text-zinc-500', bg: 'bg-zinc-600', glow: '', percent: 0 },
};

// Shorten common ingredient names
function shorten(name: string): string {
  return name
    .replace('Columbus/Tomahawk/Zeus (CTZ)', 'CTZ')
    .replace('Pale Ale Malt 2-Row', '2-Row')
    .replace('Pale Malt 2-Row', '2-Row')
    .replace('Caramel Malt 60L', 'Crystal 60')
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
  
  // 3D tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });

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

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.15,
        type: "spring",
        stiffness: 100
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="perspective-1000 cursor-pointer"
    >
      {/* Holographic border glow */}
      <motion.div 
        className="absolute -inset-[2px] rounded-2xl opacity-0 blur-md"
        style={{
          background: 'linear-gradient(45deg, #f59e0b, #8b5cf6, #06b6d4, #f59e0b)',
          backgroundSize: '400% 400%',
        }}
        animate={{ 
          opacity: isHovered ? 0.6 : 0,
          backgroundPosition: isHovered ? ['0% 50%', '100% 50%', '0% 50%'] : '0% 50%'
        }}
        transition={{ 
          opacity: { duration: 0.3 },
          backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
        }}
      />
      
      {/* Card */}
      <motion.div 
        className={`relative bg-zinc-900/95 backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-300 ${
          isHovered ? 'border-amber-500/50 shadow-2xl ' + config.glow : 'border-zinc-800'
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 opacity-0"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
          }}
          animate={{
            opacity: isHovered ? 1 : 0,
            x: isHovered ? ['-100%', '200%'] : '-100%',
          }}
          transition={{ x: { duration: 1, ease: "easeInOut" } }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50 relative z-10">
          <div className="flex items-center gap-3">
            <motion.div 
              className={`w-3 h-3 rounded-full ${config.bg}`}
              animate={status === 'low' ? { 
                scale: [1, 1.3, 1],
                opacity: [1, 0.5, 1] 
              } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="font-mono text-sm text-zinc-400 tracking-wider">TAP {number}</span>
          </div>
          <motion.span 
            className={`font-mono text-xs font-bold tracking-wider ${config.color}`}
            animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {config.label}
          </motion.span>
        </div>

        {/* Content */}
        <div className="p-5 relative z-10" style={{ transform: 'translateZ(20px)' }}>
          {isEmpty ? (
            <div className="text-center py-8">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  y: [0, -10, 0],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: 'grayscale(0.5) opacity(0.3)' }}
              >
                🍺
              </motion.div>
              <motion.p 
                className="text-zinc-600 font-mono text-sm tracking-widest"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AWAITING BEER
              </motion.p>
            </div>
          ) : (
            <>
              {/* Beer Name & Style */}
              <motion.h3 
                className="text-xl font-bold text-white mb-1 leading-tight"
                style={{ transform: 'translateZ(30px)' }}
              >
                {beer.name}
              </motion.h3>
              <p className="text-amber-500 text-sm font-medium mb-4">{beer.style}</p>

              {/* Tagline */}
              {beer.tagline && (
                <motion.p 
                  className="text-zinc-400 text-sm italic mb-4 border-l-2 border-amber-500/50 pl-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  "{beer.tagline}"
                </motion.p>
              )}

              {/* Stats Row */}
              <div className="flex items-center gap-6 mb-5 pb-4 border-b border-zinc-800/50">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-white">{beer.abv || '?'}%</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">ABV</div>
                </motion.div>
                {beer.ibu && (
                  <motion.div whileHover={{ scale: 1.1 }} className="text-center">
                    <div className="text-2xl font-bold text-white">{beer.ibu}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">IBU</div>
                  </motion.div>
                )}
                <div className="ml-auto text-right">
                  <div className="text-lg font-bold text-zinc-400">#{beer.batchNo}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">Batch</div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-3">
                {/* Hops */}
                {beer.hops && beer.hops.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">🌿</span>
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Hops</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {beer.hops.slice(0, 5).map((hop, i) => (
                        <motion.span 
                          key={i} 
                          className="text-xs px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 hover:bg-green-500/20 transition-colors"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {shorten(hop)}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Malts */}
                {beer.malts && beer.malts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">🌾</span>
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Malt</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {beer.malts.slice(0, 4).map((malt, i) => (
                        <motion.span 
                          key={i} 
                          className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + i * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {shorten(malt)}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Yeast */}
                {beer.yeast && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">🧬</span>
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Yeast</span>
                    </div>
                    <motion.span 
                      className="text-xs px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20 hover:bg-purple-500/20 transition-colors inline-block"
                      whileHover={{ scale: 1.05 }}
                    >
                      {shorten(beer.yeast)}
                    </motion.span>
                  </motion.div>
                )}
              </div>

              {/* Keg Level */}
              <motion.div 
                className="mt-5 pt-4 border-t border-zinc-800/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className="flex justify-between text-xs text-zinc-500 mb-2">
                  <span className="uppercase tracking-wider">Keg Level</span>
                  <span className="font-mono font-bold">{config.percent}%</span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${config.bg} relative`}
                    initial={{ width: 0 }}
                    animate={{ width: `${config.percent}%` }}
                    transition={{ duration: 1.2, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                  >
                    {/* Shine effect on fill bar */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
