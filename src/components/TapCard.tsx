'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Beer {
  id: string;
  name: string;
  style: string;
  tagline?: string;
  description?: string;
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
  full: { label: 'FULL', color: 'text-green-400', bg: 'bg-green-500', percent: 100 },
  half: { label: 'HALF', color: 'text-amber-400', bg: 'bg-amber-500', percent: 50 },
  low: { label: 'LOW', color: 'text-orange-400', bg: 'bg-orange-500', percent: 25 },
  kicked: { label: 'KICKED', color: 'text-red-400', bg: 'bg-red-500', percent: 0 },
  empty: { label: 'EMPTY', color: 'text-zinc-500', bg: 'bg-zinc-600', percent: 0 },
};

export function TapCard({ number, status, beer, index = 0 }: TapCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });
  
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
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => !isEmpty && setIsExpanded(!isExpanded)}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative perspective-1000 cursor-pointer"
    >
      {/* Holographic border */}
      <motion.div 
        className={cn(
          'absolute -inset-[1px] rounded-2xl opacity-30 blur-sm',
          'bg-gradient-to-br from-amber-500 via-purple-500 to-cyan-500'
        )}
        animate={{ opacity: isHovered ? 0.6 : 0.2 }}
      />
      
      {/* Main card */}
      <div className={cn(
        'relative bg-zinc-900/95 backdrop-blur-xl rounded-2xl overflow-hidden',
        'border border-zinc-800/50 transition-all duration-300',
        isHovered && 'border-amber-500/30'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            <motion.div 
              className={cn('w-2 h-2 rounded-full', config.bg)}
              animate={status === 'low' ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="font-mono text-xs text-zinc-400 tracking-wider">TAP {number}</span>
          </div>
          <span className={cn('font-mono text-xs tracking-wider', config.color)}>
            {config.label}
          </span>
        </div>

        {isEmpty ? (
          <div className="px-5 py-12 text-center">
            <motion.div 
              className="text-4xl mb-2 opacity-30"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🍺
            </motion.div>
            <p className="text-zinc-600 font-mono text-sm">AWAITING BEER</p>
          </div>
        ) : (
          <div className="px-5 py-4">
            {/* Beer Name & Style */}
            <h3 className="text-xl font-bold text-white mb-1 leading-tight">{beer.name}</h3>
            <p className="text-amber-500 text-sm font-medium mb-3">{beer.style}</p>

            {/* Key Stats Row */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-zinc-800/50">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{beer.abv}%</div>
                <div className="text-xs text-zinc-500 uppercase">ABV</div>
              </div>
              {beer.ibu && (
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{beer.ibu}</div>
                  <div className="text-xs text-zinc-500 uppercase">IBU</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-lg font-bold text-white">#{beer.batchNo}</div>
                <div className="text-xs text-zinc-500 uppercase">Batch</div>
              </div>
            </div>

            {/* Recipe Details */}
            <div className="space-y-3">
              {/* Hops */}
              {beer.hops && beer.hops.length > 0 && (
                <RecipeRow 
                  icon="🌿" 
                  label="Hops" 
                  items={beer.hops} 
                  color="text-green-400"
                />
              )}

              {/* Malts */}
              {beer.malts && beer.malts.length > 0 && (
                <RecipeRow 
                  icon="🌾" 
                  label="Malt" 
                  items={beer.malts.map(m => m.replace(/ Malt.*$/, '').replace(/,.*$/, ''))} 
                  color="text-amber-400"
                />
              )}

              {/* Yeast */}
              {beer.yeast && (
                <RecipeRow 
                  icon="🧬" 
                  label="Yeast" 
                  items={[beer.yeast.replace(/ Yeast$/, '')]} 
                  color="text-purple-400"
                />
              )}
            </div>

            {/* Tagline */}
            {beer.tagline && (
              <p className="text-zinc-400 text-sm italic mt-4 border-l-2 border-amber-500/30 pl-3">
                "{beer.tagline}"
              </p>
            )}

            {/* Fill Gauge */}
            <div className="mt-4 pt-4 border-t border-zinc-800/50">
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Keg Level</span>
                <span>{config.percent}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', config.bg)}
                  initial={{ width: 0 }}
                  animate={{ width: `${config.percent}%` }}
                  transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Recipe row component
function RecipeRow({ 
  icon, 
  label, 
  items, 
  color 
}: { 
  icon: string; 
  label: string; 
  items: string[]; 
  color: string;
}) {
  // Shorten CTZ and other long names
  const shortenName = (name: string) => {
    return name
      .replace('Columbus/Tomahawk/Zeus (CTZ)', 'CTZ')
      .replace('Pale Ale Malt 2-Row', '2-Row Pale')
      .replace('Pale Malt 2-Row', '2-Row Pale')
      .replace('Caramel Malt', 'Crystal')
      .replace('Wheat Soft Red, Flaked', 'Flaked Wheat')
      .replace('American Honey Malt', 'Honey Malt')
      .replace('Midnight Wheat Malt', 'Midnight Wheat')
      .replace('Safale American', 'US-05')
      .replace('Windsor Yeast', 'Windsor')
      .replace('Voss Kveik', 'Kveik');
  };

  return (
    <div className="flex items-start gap-2">
      <span className="text-sm mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {items.slice(0, 4).map((item, i) => (
            <span 
              key={i} 
              className={cn(
                'text-xs px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/50',
                color
              )}
            >
              {shortenName(item)}
            </span>
          ))}
          {items.length > 4 && (
            <span className="text-xs text-zinc-500">+{items.length - 4}</span>
          )}
        </div>
      </div>
    </div>
  );
}
