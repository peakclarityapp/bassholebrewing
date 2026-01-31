'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
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
  full: { label: 'Full', color: 'bg-green-500', glow: 'shadow-green-500/20', percent: 100 },
  half: { label: 'Half', color: 'bg-amber-500', glow: 'shadow-amber-500/20', percent: 50 },
  low: { label: 'Running Low', color: 'bg-orange-500', glow: 'shadow-orange-500/20', percent: 25 },
  kicked: { label: 'Kicked', color: 'bg-red-500', glow: 'shadow-red-500/20', percent: 0 },
  empty: { label: 'Empty', color: 'bg-zinc-600', glow: 'shadow-zinc-500/10', percent: 0 },
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
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const config = statusConfig[status];
  const isEmpty = !beer || status === 'empty';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg) scale(1.02)`
          : 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)',
        transition: 'transform 0.2s ease-out',
      }}
      className={cn(
        'relative bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800',
        'hover:border-amber-500/50 transition-all duration-300',
        isHovered && `shadow-2xl ${config.glow}`,
        status === 'low' && 'animate-pulse-subtle'
      )}
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 pointer-events-none"
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        style={{
          background: 'radial-gradient(circle at center, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Tap Number & Status */}
      <div className="flex items-center justify-between mb-4">
        <motion.span 
          className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase"
          animate={{ letterSpacing: isHovered ? '0.25em' : '0.2em' }}
        >
          Tap {number}
        </motion.span>
        <motion.span
          className={cn(
            'text-xs px-3 py-1 rounded-full font-medium',
            status === 'full' && 'bg-green-500/20 text-green-400',
            status === 'half' && 'bg-amber-500/20 text-amber-400',
            status === 'low' && 'bg-orange-500/20 text-orange-400',
            status === 'kicked' && 'bg-red-500/20 text-red-400',
            status === 'empty' && 'bg-zinc-700/50 text-zinc-500'
          )}
          animate={{ scale: isHovered ? 1.05 : 1 }}
        >
          {config.label}
        </motion.span>
      </div>

      {isEmpty ? (
        <motion.div 
          className="text-center py-12"
          animate={{ opacity: isHovered ? 0.8 : 0.5 }}
        >
          <motion.div 
            className="text-5xl mb-3"
            animate={{ 
              rotate: isHovered ? [0, -10, 10, 0] : 0,
              scale: isHovered ? 1.1 : 1 
            }}
            transition={{ duration: 0.5 }}
          >
            🍺
          </motion.div>
          <p className="text-zinc-500 text-sm font-medium">Coming Soon</p>
        </motion.div>
      ) : (
        <>
          {/* Beer Name */}
          <motion.h3 
            className="text-2xl font-bold text-white mb-1 leading-tight"
            animate={{ x: isHovered ? 4 : 0 }}
          >
            {beer.name}
          </motion.h3>
          
          {/* Style & ABV */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-amber-500 font-medium">{beer.style}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-white font-bold">{beer.abv}%</span>
            {beer.ibu && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">{beer.ibu} IBU</span>
              </>
            )}
          </div>

          {/* Flavor Tags */}
          {beer.flavorTags && beer.flavorTags.length > 0 && (
            <motion.div 
              className="flex flex-wrap gap-2 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {beer.flavorTags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                  className="inline-flex items-center gap-1 text-xs bg-zinc-800/80 text-zinc-300 px-2 py-1 rounded-full"
                >
                  <span>{flavorEmojis[tag.toLowerCase()] || '✨'}</span>
                  <span className="capitalize">{tag}</span>
                </motion.span>
              ))}
            </motion.div>
          )}

          {/* Tagline */}
          {beer.tagline && (
            <p className="text-zinc-400 text-sm italic mb-4 line-clamp-2">
              "{beer.tagline}"
            </p>
          )}

          {/* Hops */}
          {beer.hops && beer.hops.length > 0 && (
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: isHovered ? 1 : 0.7, height: 'auto' }}
            >
              <span className="text-xs text-zinc-500 uppercase tracking-wide">Hops: </span>
              <span className="text-xs text-amber-400/80">{beer.hops.join(', ')}</span>
            </motion.div>
          )}

          {/* Fill Gauge */}
          <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', config.color)}
              initial={{ width: 0 }}
              animate={{ width: `${config.percent}%` }}
              transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
            />
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
          </div>
        </>
      )}
    </motion.div>
  );
}
