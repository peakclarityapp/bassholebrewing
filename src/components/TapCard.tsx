'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

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

interface RatingData {
  avgRating: number | null;
  ratingCount: number;
}

function getSrmColor(srm?: number): string {
  if (!srm) return 'rgb(255, 209, 72)';
  if (srm <= 2) return 'rgb(255, 230, 153)';
  if (srm <= 4) return 'rgb(255, 209, 72)';
  if (srm <= 6) return 'rgb(255, 191, 0)';
  if (srm <= 9) return 'rgb(234, 170, 0)';
  if (srm <= 12) return 'rgb(213, 145, 0)';
  if (srm <= 15) return 'rgb(189, 119, 0)';
  if (srm <= 18) return 'rgb(166, 94, 0)';
  if (srm <= 22) return 'rgb(143, 68, 0)';
  if (srm <= 30) return 'rgb(102, 51, 0)';
  return 'rgb(51, 25, 0)';
}

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
  chocolate: 'bg-amber-800/20 text-amber-700 border-amber-800/30',
  light: 'bg-yellow-200/20 text-yellow-300 border-yellow-200/30',
};

interface TapCardProps {
  number: number;
  status: 'full' | 'half' | 'low' | 'kicked' | 'empty' | 'conditioning';
  beer: Beer | null;
  index?: number;
  rating?: RatingData;
  onRate?: (beerId: string) => void;
}

const statusConfig = {
  full: { label: 'POURING', color: 'text-cyan-400', gradient: 'from-cyan-400 to-cyan-600', glow: 'rgba(6, 182, 212, 0.6)', percent: 100 },
  conditioning: { label: 'CONDITIONING', color: 'text-purple-400', gradient: 'from-purple-400 to-purple-600', glow: 'rgba(168, 85, 247, 0.6)', percent: 100 },
  half: { label: 'HALF FULL', color: 'text-amber-400', gradient: 'from-amber-400 to-orange-500', glow: 'rgba(245, 158, 11, 0.6)', percent: 50 },
  low: { label: 'RUNNING LOW', color: 'text-pink-400', gradient: 'from-pink-400 to-pink-600', glow: 'rgba(236, 72, 153, 0.6)', percent: 25 },
  kicked: { label: 'KICKED', color: 'text-zinc-500', gradient: 'from-zinc-600 to-zinc-800', glow: 'rgba(113, 113, 122, 0.3)', percent: 0 },
  empty: { label: 'STANDBY', color: 'text-zinc-600', gradient: 'from-zinc-700 to-zinc-800', glow: 'rgba(113, 113, 122, 0.2)', percent: 0 },
};

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

export function TapCard({ number, status, beer, index = 0, rating, onRate }: TapCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  
  const config = statusConfig[status] || statusConfig.empty;
  const isEmpty = !beer || status === 'empty';
  
  const borderColors: Record<string, string> = {
    full: 'from-cyan-500 via-cyan-400 to-cyan-500',
    conditioning: 'from-purple-500 via-purple-400 to-purple-500',
    half: 'from-amber-500 via-orange-400 to-amber-500',
    low: 'from-pink-500 via-pink-400 to-pink-500',
    kicked: 'from-zinc-600 via-zinc-500 to-zinc-600',
    empty: 'from-purple-500/30 via-cyan-500/30 to-purple-500/30',
  };

  const WRAPPER_HEIGHT = 480;

  const handleClick = () => {
    if (!isEmpty) {
      // Glitch FIRST, then flip AFTER glitch completes (smoother on mobile)
      setIsGlitching(true);
      setTimeout(() => {
        setIsGlitching(false);
        // Small delay then flip
        setTimeout(() => setIsFlipped(!isFlipped), 50);
      }, 200);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 100, damping: 15 }}
      style={{ height: WRAPPER_HEIGHT, perspective: 1000 }}
      className={`relative group ${isEmpty ? 'flex items-center justify-center' : 'cursor-pointer'}`}
      onClick={handleClick}
    >
      {/* Glitch overlay - runs BEFORE flip for smooth mobile */}
      <AnimatePresence>
        {isGlitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-2xl"
          >
            {/* Single scan line */}
            <motion.div
              className="absolute left-0 right-0 h-[2px] bg-cyan-400"
              style={{ boxShadow: '0 0 15px 3px rgba(6, 182, 212, 0.6)' }}
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 0.18, ease: 'linear' }}
            />
            {/* Flash overlay */}
            <motion.div
              className="absolute inset-0 bg-cyan-500/30"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card flipper container */}
      <motion.div
        className="relative w-full h-full"
        style={{ 
          transformStyle: 'preserve-3d', 
          WebkitTransformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* FRONT SIDE */}
        <div 
          className="absolute inset-0"
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            WebkitTransform: 'rotateY(0deg)',
          }}
        >
          {/* Animated gradient border */}
          <motion.div 
            className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${borderColors[status]} ${isEmpty ? 'opacity-40' : 'opacity-60'} blur-sm`}
          />
          
          {/* Card body */}
          <div 
            className={`relative bg-zinc-950/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/5 flex ${isEmpty ? 'h-[280px]' : 'h-full'} w-full`}
          >
            {/* CYBER KEG GAUGE */}
            <div className="relative w-4 flex-shrink-0 bg-black/80 border-r border-zinc-800">
              {/* Background segments */}
              <div className="absolute inset-0 flex flex-col justify-end">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex-1 border-t border-zinc-800/50" />
                ))}
              </div>
              
              {/* Fill level */}
              <motion.div
                className={`absolute inset-x-0 bottom-0 bg-gradient-to-t ${config.gradient}`}
                initial={{ height: 0 }}
                animate={{ height: `${config.percent}%` }}
                transition={{ duration: 1.5, delay: 0.3 + index * 0.1 }}
                style={{ boxShadow: `0 0 15px ${config.glow}, inset 0 0 10px ${config.glow}` }}
              >
                {/* Animated scan line */}
                <motion.div
                  className="absolute inset-x-0 h-[2px] bg-white/60"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {/* Segment overlay */}
                <div className="absolute inset-0 flex flex-col justify-end">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex-1 border-t border-black/30" />
                  ))}
                </div>
                {/* Glow pulse */}
                <motion.div
                  className="absolute inset-0"
                  style={{ backgroundColor: config.glow }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
              
              {/* Top indicator */}
              {config.percent > 0 && (
                <motion.div
                  className="absolute left-0 right-0 h-[3px]"
                  style={{ 
                    bottom: `${config.percent}%`,
                    backgroundColor: config.glow,
                    boxShadow: `0 0 10px ${config.glow}`
                  }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
              {/* HEADER */}
              <div className="h-11 px-4 flex items-center border-b border-white/5 flex-shrink-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient}`}
                      animate={!isEmpty ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="font-display text-sm tracking-[0.2em] text-zinc-400 font-bold">
                      TAP {String(number).padStart(2, '0')}
                    </span>
                  </div>
                  <span className={`font-display text-sm tracking-wider ${config.color} font-bold`}>
                    {config.label}
                  </span>
                </div>
              </div>

              {/* CONTENT */}
              <div className="flex-1 p-4 flex flex-col">
                {isEmpty ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="text-4xl opacity-20 mb-3"
                    >
                      ⚙️
                    </motion.div>
                    <p className="font-mono text-[10px] tracking-[0.15em] text-zinc-600">
                      AWAITING ASSIGNMENT
                    </p>
                  </div>
                ) : (
                  <>
                    {/* SECTION 1: Name + Style */}
                    <div className="h-[52px] flex-shrink-0 overflow-hidden">
                      <h3 className="text-xl font-black leading-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent font-display line-clamp-1">
                        {beer.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs">🍺</span>
                        <p className="text-amber-500/90 text-sm font-semibold tracking-wide">
                          {beer.style || 'Craft Beer'}
                        </p>
                      </div>
                    </div>

                    {/* SECTION 2: Tagline */}
                    <div className="h-[48px] flex-shrink-0 overflow-hidden mb-3">
                      {beer.tagline ? (
                        <p className="text-zinc-400 text-xs italic leading-snug line-clamp-3 border-l-2 border-amber-500/30 pl-2">
                          {beer.tagline}
                        </p>
                      ) : (
                        <div className="h-full" /> 
                      )}
                    </div>

                    {/* SECTION 3: Stats */}
                    <div className="h-[72px] flex-shrink-0 flex gap-2 mb-3">
                      <div className="flex-1 flex flex-col items-center justify-center rounded-lg bg-white/5 border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-15" style={{ backgroundColor: getSrmColor(beer.srm) }} />
                        <div className="relative text-2xl font-black text-white">{beer.abv ? beer.abv.toFixed(1) : '?'}%</div>
                        <div className="relative text-[9px] text-zinc-500 uppercase tracking-wider">ABV</div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center rounded-lg bg-white/5 border border-white/5">
                        <div className="text-2xl font-black text-white">{beer.ibu ? Math.round(beer.ibu) : '—'}</div>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-wider">IBU</div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center rounded-lg bg-white/5 border border-white/5">
                        <div className="text-2xl font-black text-amber-400">#{beer.batchNo}</div>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Batch</div>
                      </div>
                    </div>

                    {/* SECTION 4: Flavor Tags */}
                    <div className="h-[28px] flex-shrink-0 flex flex-wrap gap-1 items-start overflow-hidden mb-3">
                      {beer.flavorTags && beer.flavorTags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className={`text-[9px] px-2 py-0.5 rounded-full border ${
                            flavorColors[tag.toLowerCase()] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* SECTION 5: Recipe */}
                    <div className="flex-1 overflow-hidden">
                      <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-2 font-medium">Recipe</div>
                      <div className="space-y-1.5 text-[11px]">
                        {beer.hops && beer.hops.length > 0 && (
                          <div className="flex items-center gap-2 p-2 rounded bg-green-500/5 border border-green-500/10">
                            <span className="text-green-500">🌿</span>
                            <span className="text-zinc-300 truncate">
                              {beer.hops.map(h => formatIngredient(h)).join(' · ')}
                            </span>
                          </div>
                        )}
                        {beer.malts && beer.malts.length > 0 && (
                          <div className="flex items-center gap-2 p-2 rounded bg-amber-500/5 border border-amber-500/10">
                            <span className="text-amber-500">🌾</span>
                            <span className="text-zinc-300 truncate">
                              {beer.malts.map(m => formatIngredient(m)).join(' · ')}
                            </span>
                          </div>
                        )}
                        {beer.yeast && (
                          <div className="flex items-center gap-2 p-2 rounded bg-purple-500/5 border border-purple-500/10">
                            <span className="text-purple-500">🧬</span>
                            <span className="text-zinc-300">{formatIngredient(beer.yeast)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tap to flip hint */}
                    <div className="text-center mt-2">
                      <span className="text-[10px] text-zinc-600">tap to rate</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BACK SIDE - Rating */}
        <div 
          className="absolute inset-0"
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)',
            WebkitTransform: 'rotateY(180deg)',
          }}
        >
          {/* Animated gradient border */}
          <motion.div 
            className={`absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500 via-pink-500 to-purple-500 opacity-60 blur-sm`}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Card body */}
          <div className="relative h-full bg-zinc-950/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-amber-500/20 flex flex-col">
            {/* Header */}
            <div className="h-11 px-4 flex items-center border-b border-amber-500/10 flex-shrink-0 bg-amber-500/5">
              <div className="flex items-center justify-between w-full">
                <span className="font-display text-sm tracking-[0.2em] text-amber-400 font-bold">
                  RATE THIS BEER
                </span>
                <span className="text-zinc-500 text-xs">tap to flip back</span>
              </div>
            </div>

            {/* Content */}
            {beer && (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                {/* Beer name */}
                <h3 className="text-2xl font-black text-white mb-2">{beer.name}</h3>
                <p className="text-amber-500 mb-8">{beer.style}</p>

                {/* Current rating */}
                <div className="mb-8">
                  {rating && rating.avgRating !== null ? (
                    <>
                      <div className="text-7xl font-black bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">
                        {rating.avgRating.toFixed(1)}
                      </div>
                      <div className="text-zinc-500 text-sm mt-2">
                        from {rating.ratingCount} rating{rating.ratingCount !== 1 ? 's' : ''}
                      </div>
                      {/* Stars visualization */}
                      <div className="flex justify-center gap-1 mt-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-2xl ${
                              star <= Math.round(rating.avgRating || 0)
                                ? 'text-amber-400'
                                : 'text-zinc-700'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl mb-4 opacity-30">🍺</div>
                      <p className="text-zinc-500">No ratings yet</p>
                      <p className="text-zinc-600 text-sm">Be the first!</p>
                    </>
                  )}
                </div>

                {/* Rate button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onRate && beer) onRate(beer.id);
                  }}
                  className="bg-gradient-to-r from-amber-500 to-pink-500 text-black font-bold px-8 py-4 rounded-xl text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Rate This Beer
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
