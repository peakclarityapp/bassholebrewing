'use client';

import { motion } from 'framer-motion';

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
  const config = statusConfig[status] || statusConfig.empty;
  const isEmpty = !beer || status === 'empty';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.bg}`} />
          <span className="font-mono text-xs text-zinc-400">TAP {number}</span>
        </div>
        <span className={`font-mono text-xs ${config.color}`}>
          {config.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {isEmpty ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2 opacity-30">🍺</div>
            <p className="text-zinc-600 font-mono text-sm">AWAITING BEER</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-white mb-1">{beer.name}</h3>
            <p className="text-amber-500 text-sm mb-3">{beer.style}</p>
            
            {/* Stats */}
            <div className="flex gap-4 mb-4">
              <div>
                <div className="text-lg font-bold text-white">{beer.abv}%</div>
                <div className="text-xs text-zinc-500">ABV</div>
              </div>
              {beer.ibu && (
                <div>
                  <div className="text-lg font-bold text-white">{beer.ibu}</div>
                  <div className="text-xs text-zinc-500">IBU</div>
                </div>
              )}
              <div>
                <div className="text-lg font-bold text-white">#{beer.batchNo}</div>
                <div className="text-xs text-zinc-500">Batch</div>
              </div>
            </div>

            {/* Hops */}
            {beer.hops && beer.hops.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-zinc-500 mb-1">🌿 Hops</div>
                <div className="flex flex-wrap gap-1">
                  {beer.hops.slice(0, 4).map((hop, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-zinc-800 text-green-400 rounded-full">
                      {hop.replace('Columbus/Tomahawk/Zeus (CTZ)', 'CTZ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Malts */}
            {beer.malts && beer.malts.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-zinc-500 mb-1">🌾 Malt</div>
                <div className="flex flex-wrap gap-1">
                  {beer.malts.slice(0, 3).map((malt, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-zinc-800 text-amber-400 rounded-full">
                      {malt.replace(/ Malt.*$/, '').substring(0, 15)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Yeast */}
            {beer.yeast && (
              <div className="mb-3">
                <div className="text-xs text-zinc-500 mb-1">🧬 Yeast</div>
                <span className="text-xs px-2 py-0.5 bg-zinc-800 text-purple-400 rounded-full">
                  {beer.yeast.replace(/ Yeast$/, '')}
                </span>
              </div>
            )}

            {/* Fill level */}
            <div className="mt-4 pt-3 border-t border-zinc-800">
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Keg Level</span>
                <span>{config.percent}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${config.bg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${config.percent}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
