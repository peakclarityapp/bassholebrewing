'use client';

import { motion } from 'framer-motion';

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
  full: { label: 'FULL', color: 'text-green-400', bg: 'bg-green-500', percent: 100 },
  half: { label: 'HALF', color: 'text-amber-400', bg: 'bg-amber-500', percent: 50 },
  low: { label: 'LOW', color: 'text-orange-400', bg: 'bg-orange-500', percent: 25 },
  kicked: { label: 'KICKED', color: 'text-red-400', bg: 'bg-red-500', percent: 0 },
  empty: { label: 'EMPTY', color: 'text-zinc-500', bg: 'bg-zinc-600', percent: 0 },
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
  const config = statusConfig[status] || statusConfig.empty;
  const isEmpty = !beer || status === 'empty';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Card */}
      <div className="relative bg-zinc-900/90 backdrop-blur rounded-2xl border border-zinc-800 overflow-hidden hover:border-amber-500/30 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${config.bg} ${status === 'low' ? 'animate-pulse' : ''}`} />
            <span className="font-mono text-sm text-zinc-400 tracking-wider">TAP {number}</span>
          </div>
          <span className={`font-mono text-xs font-bold tracking-wider ${config.color}`}>
            {config.label}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          {isEmpty ? (
            <div className="text-center py-8">
              <motion.div 
                className="text-5xl mb-3 opacity-20"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                🍺
              </motion.div>
              <p className="text-zinc-600 font-mono text-sm">AWAITING BEER</p>
            </div>
          ) : (
            <>
              {/* Beer Name & Style */}
              <h3 className="text-xl font-bold text-white mb-1 leading-tight">{beer.name}</h3>
              <p className="text-amber-500 text-sm font-medium mb-4">{beer.style}</p>

              {/* Tagline */}
              {beer.tagline && (
                <p className="text-zinc-400 text-sm italic mb-4 border-l-2 border-amber-500/50 pl-3">
                  "{beer.tagline}"
                </p>
              )}

              {/* Stats Row */}
              <div className="flex items-center gap-6 mb-5 pb-4 border-b border-zinc-800/50">
                <div>
                  <div className="text-2xl font-bold text-white">{beer.abv || '?'}%</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">ABV</div>
                </div>
                {beer.ibu && (
                  <div>
                    <div className="text-2xl font-bold text-white">{beer.ibu}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">IBU</div>
                  </div>
                )}
                <div className="ml-auto">
                  <div className="text-lg font-bold text-zinc-400">#{beer.batchNo}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">Batch</div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-3">
                {/* Hops */}
                {beer.hops && beer.hops.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">🌿</span>
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Hops</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {beer.hops.slice(0, 5).map((hop, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                          {shorten(hop)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Malts */}
                {beer.malts && beer.malts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">🌾</span>
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Malt</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {beer.malts.slice(0, 4).map((malt, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                          {shorten(malt)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Yeast */}
                {beer.yeast && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">🧬</span>
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Yeast</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
                      {shorten(beer.yeast)}
                    </span>
                  </div>
                )}
              </div>

              {/* Keg Level */}
              <div className="mt-5 pt-4 border-t border-zinc-800/50">
                <div className="flex justify-between text-xs text-zinc-500 mb-2">
                  <span className="uppercase tracking-wider">Keg Level</span>
                  <span className="font-mono">{config.percent}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${config.bg}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${config.percent}%` }}
                    transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
