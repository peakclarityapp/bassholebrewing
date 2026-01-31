'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Beer {
  id: string;
  name: string;
  style: string;
  tagline?: string;
  abv: number;
  ibu?: number;
  batchNo: number;
  hops?: string[];
  flavorTags?: string[];
}

interface TapCardProps {
  number: number;
  status: 'full' | 'half' | 'low' | 'kicked' | 'empty';
  beer: Beer | null;
  index?: number;
}

const statusConfig = {
  full: { label: 'ONLINE', color: 'text-green-400', bg: 'bg-green-500', percent: 100, pulse: false },
  half: { label: 'NOMINAL', color: 'text-amber-400', bg: 'bg-amber-500', percent: 50, pulse: false },
  low: { label: 'LOW', color: 'text-orange-400', bg: 'bg-orange-500', percent: 25, pulse: true },
  kicked: { label: 'OFFLINE', color: 'text-red-400', bg: 'bg-red-500', percent: 0, pulse: false },
  empty: { label: 'STANDBY', color: 'text-zinc-500', bg: 'bg-zinc-600', percent: 0, pulse: false },
};

const flavorEmojis: Record<string, string> = {
  tropical: '🥭',
  citrus: '🍊',
  pine: '🌲',
  dank: '🌿',
  floral: '🌸',
  spicy: '🌶️',
  malty: '🍞',
  roasty: '☕',
  fruity: '🍇',
  hoppy: '🍃',
  crisp: '❄️',
  juicy: '🧃',
};

export function TapCard({ number, status, beer, index = 0 }: TapCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });
  
  const config = statusConfig[status];
  const isEmpty = !beer || status === 'empty';

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

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.23, 1, 0.32, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative perspective-1000"
    >
      {/* Holographic border gradient */}
      <div className={cn(
        'absolute -inset-[1px] rounded-2xl opacity-50 blur-sm transition-opacity duration-300',
        isHovered ? 'opacity-100' : 'opacity-30',
        'bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500'
      )} />
      
      {/* Main card */}
      <div className={cn(
        'relative bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-6 border border-zinc-700/50',
        'overflow-hidden transition-all duration-300',
        isHovered && 'border-transparent',
        config.pulse && 'animate-pulse-subtle'
      )}>
        {/* Scan line effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.1) 50%)',
            backgroundSize: '100% 4px',
          }}
        />
        
        {/* Holographic shimmer on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: isHovered
              ? [
                  'linear-gradient(45deg, transparent 40%, rgba(168, 85, 247, 0.1) 50%, transparent 60%)',
                  'linear-gradient(45deg, transparent 40%, rgba(14, 165, 233, 0.1) 50%, transparent 60%)',
                  'linear-gradient(45deg, transparent 40%, rgba(245, 158, 11, 0.1) 50%, transparent 60%)',
                ]
              : 'none',
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            {/* Tap number with tech styling */}
            <div className="flex items-center gap-1">
              <motion.div 
                className={cn('w-2 h-2 rounded-full', config.bg)}
                animate={config.pulse ? { opacity: [1, 0.3, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="font-mono text-xs text-zinc-400">TAP::{number.toString().padStart(2, '0')}</span>
            </div>
          </div>
          
          <motion.span
            className={cn('font-mono text-xs tracking-wider', config.color)}
            animate={isHovered ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
          >
            [{config.label}]
          </motion.span>
        </div>

        {isEmpty ? (
          <motion.div 
            className="text-center py-12 relative z-10"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="font-mono text-zinc-600 text-sm mb-2">AWAITING INPUT</div>
            <motion.div 
              className="text-4xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              ⚙️
            </motion.div>
            <div className="font-mono text-zinc-700 text-xs mt-2">NEXT BATCH LOADING...</div>
          </motion.div>
        ) : (
          <div className="relative z-10">
            {/* Beer Name - glowing effect */}
            <motion.h3 
              className="text-2xl font-bold text-white mb-1"
              style={{
                textShadow: isHovered ? '0 0 20px rgba(245, 158, 11, 0.5)' : 'none',
              }}
            >
              {beer.name}
            </motion.h3>
            
            {/* Data readout style */}
            <div className="font-mono text-xs space-y-1 mb-4">
              <div className="flex justify-between text-zinc-400">
                <span>STYLE:</span>
                <span className="text-amber-400">{beer.style}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>ABV:</span>
                <span className="text-green-400">{beer.abv}%</span>
              </div>
              {beer.ibu && (
                <div className="flex justify-between text-zinc-400">
                  <span>IBU:</span>
                  <span className="text-cyan-400">{beer.ibu}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>BATCH:</span>
                <span className="text-purple-400">#{beer.batchNo}</span>
              </div>
            </div>

            {/* Flavor Tags */}
            {beer.flavorTags && beer.flavorTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {beer.flavorTags.map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="inline-flex items-center gap-1 text-xs bg-white/5 text-zinc-300 px-2 py-0.5 rounded border border-white/10"
                  >
                    <span>{flavorEmojis[tag.toLowerCase()] || '✨'}</span>
                    <span className="uppercase tracking-wide">{tag}</span>
                  </motion.span>
                ))}
              </div>
            )}

            {/* Tagline */}
            {beer.tagline && (
              <p className="text-zinc-400 text-sm italic mb-4 border-l-2 border-amber-500/30 pl-3">
                "{beer.tagline}"
              </p>
            )}

            {/* Hops */}
            {beer.hops && beer.hops.length > 0 && (
              <div className="mb-4 font-mono text-xs">
                <span className="text-zinc-500">HOPS: </span>
                <span className="text-emerald-400">{beer.hops.join(' · ')}</span>
              </div>
            )}

            {/* Fill Gauge - sci-fi style */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-xs text-zinc-500">
                <span>VOLUME</span>
                <span>{config.percent}%</span>
              </div>
              <div className="relative h-2 bg-zinc-800 rounded overflow-hidden">
                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex-1 border-r border-zinc-700/50 last:border-0" />
                  ))}
                </div>
                
                {/* Fill */}
                <motion.div
                  className={cn('h-full rounded relative', config.bg)}
                  initial={{ width: 0 }}
                  animate={{ width: `${config.percent}%` }}
                  transition={{ duration: 1.5, delay: 0.5 + index * 0.1, ease: [0.23, 1, 0.32, 1] }}
                >
                  {/* Glow */}
                  <div className="absolute inset-0 blur-sm opacity-50" style={{ background: 'inherit' }} />
                  
                  {/* Moving highlight */}
                  <motion.div
                    className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '400%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-zinc-600/50" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-zinc-600/50" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-zinc-600/50" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-zinc-600/50" />
      </div>
    </motion.div>
  );
}
