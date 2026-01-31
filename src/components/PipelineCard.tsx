'use client';

import { cn } from '@/lib/utils';

interface PipelineItem {
  id: string;
  name: string;
  style: string;
  status: 'planning' | 'brewing' | 'fermenting' | 'conditioning' | 'carbonating';
  brewDate?: string;
  batchNo: number;
  daysIn?: number;
  notes?: string;
}

interface PipelineCardProps {
  item: PipelineItem;
}

const statusConfig = {
  planning: { label: 'Planning', color: 'bg-blue-500/20 text-blue-400', icon: '📝' },
  brewing: { label: 'Brew Day', color: 'bg-yellow-500/20 text-yellow-400', icon: '🔥' },
  fermenting: { label: 'Fermenting', color: 'bg-purple-500/20 text-purple-400', icon: '🫧' },
  conditioning: { label: 'Conditioning', color: 'bg-cyan-500/20 text-cyan-400', icon: '❄️' },
  carbonating: { label: 'Carbonating', color: 'bg-green-500/20 text-green-400', icon: '✨' },
};

export function PipelineCard({ item }: PipelineCardProps) {
  const config = statusConfig[item.status];

  return (
    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <div>
            <h4 className="font-semibold text-white">{item.name}</h4>
            <p className="text-sm text-zinc-400">{item.style}</p>
          </div>
        </div>
        <span className={cn('text-xs px-2 py-1 rounded-full', config.color)}>
          {config.label}
          {item.daysIn && ` · Day ${item.daysIn}`}
        </span>
      </div>
      {item.notes && (
        <p className="text-sm text-zinc-500 mt-2">{item.notes}</p>
      )}
    </div>
  );
}
