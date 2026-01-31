'use client';

import { cn } from '@/lib/utils';

interface Beer {
  id: string;
  name: string;
  style: string;
  tagline?: string;
  abv: number;
  ibu?: number;
  batchNo: number;
}

interface TapCardProps {
  number: number;
  status: 'full' | 'half' | 'low' | 'kicked' | 'empty';
  beer: Beer | null;
}

const statusColors = {
  full: 'bg-amber-500',
  half: 'bg-amber-500',
  low: 'bg-amber-600',
  kicked: 'bg-zinc-600',
  empty: 'bg-zinc-700',
};

const statusLabels = {
  full: 'Full',
  half: 'Half',
  low: 'Running Low',
  kicked: 'Kicked',
  empty: 'Empty',
};

const fillHeights = {
  full: 'h-full',
  half: 'h-1/2',
  low: 'h-1/4',
  kicked: 'h-0',
  empty: 'h-0',
};

export function TapCard({ number, status, beer }: TapCardProps) {
  const isEmpty = !beer || status === 'empty';

  return (
    <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 hover:border-amber-500/30 transition-colors">
      {/* Tap Number */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
          Tap {number}
        </span>
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            status === 'full' && 'bg-green-500/20 text-green-400',
            status === 'half' && 'bg-amber-500/20 text-amber-400',
            status === 'low' && 'bg-orange-500/20 text-orange-400',
            status === 'kicked' && 'bg-red-500/20 text-red-400',
            status === 'empty' && 'bg-zinc-700/50 text-zinc-500'
          )}
        >
          {statusLabels[status]}
        </span>
      </div>

      {isEmpty ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🍺</div>
          <p className="text-zinc-500 text-sm">Coming Soon</p>
        </div>
      ) : (
        <>
          {/* Beer Name */}
          <h3 className="text-xl font-bold text-white mb-1">{beer.name}</h3>
          <p className="text-amber-500 text-sm mb-3">{beer.style}</p>

          {/* Stats */}
          <div className="flex gap-4 mb-4 text-sm">
            <div>
              <span className="text-zinc-500">ABV</span>
              <span className="ml-1 text-white font-medium">{beer.abv}%</span>
            </div>
            {beer.ibu && (
              <div>
                <span className="text-zinc-500">IBU</span>
                <span className="ml-1 text-white font-medium">{beer.ibu}</span>
              </div>
            )}
          </div>

          {/* Fill Gauge */}
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                statusColors[status],
                fillHeights[status]
              )}
            />
          </div>

          {/* Tagline */}
          {beer.tagline && (
            <p className="text-zinc-400 text-sm italic mt-3">"{beer.tagline}"</p>
          )}
        </>
      )}
    </div>
  );
}
