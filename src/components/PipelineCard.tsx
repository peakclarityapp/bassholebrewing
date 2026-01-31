'use client';

import { motion } from 'framer-motion';
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
  index?: number;
}

const statusConfig = {
  planning: { 
    label: 'Planning', 
    color: 'from-blue-500/20 to-blue-600/10', 
    border: 'border-blue-500/30',
    icon: '📝',
    glow: 'hover:shadow-blue-500/10'
  },
  brewing: { 
    label: 'Brew Day', 
    color: 'from-yellow-500/20 to-yellow-600/10', 
    border: 'border-yellow-500/30',
    icon: '🔥',
    glow: 'hover:shadow-yellow-500/10'
  },
  fermenting: { 
    label: 'Fermenting', 
    color: 'from-purple-500/20 to-purple-600/10', 
    border: 'border-purple-500/30',
    icon: '🫧',
    glow: 'hover:shadow-purple-500/10'
  },
  conditioning: { 
    label: 'Conditioning', 
    color: 'from-cyan-500/20 to-cyan-600/10', 
    border: 'border-cyan-500/30',
    icon: '❄️',
    glow: 'hover:shadow-cyan-500/10'
  },
  carbonating: { 
    label: 'Carbonating', 
    color: 'from-green-500/20 to-green-600/10', 
    border: 'border-green-500/30',
    icon: '✨',
    glow: 'hover:shadow-green-500/10'
  },
};

export function PipelineCard({ item, index = 0 }: PipelineCardProps) {
  const config = statusConfig[item.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        'relative overflow-hidden rounded-xl p-5 border backdrop-blur-sm',
        'bg-gradient-to-br',
        config.color,
        config.border,
        config.glow,
        'hover:shadow-xl transition-shadow duration-300'
      )}
    >
      {/* Animated background bubbles for fermenting */}
      {item.status === 'fermenting' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
              style={{ left: `${20 + i * 15}%`, bottom: 0 }}
              animate={{
                y: [0, -100],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <motion.span 
              className="text-2xl"
              animate={{ 
                rotate: item.status === 'fermenting' ? [0, 5, -5, 0] : 0,
                scale: item.status === 'brewing' ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {config.icon}
            </motion.span>
            <div>
              <h4 className="font-bold text-white text-lg">{item.name}</h4>
              <p className="text-sm text-zinc-400">{item.style}</p>
            </div>
          </div>
          
          <div className="text-right">
            <span className={cn(
              'inline-block text-xs px-3 py-1 rounded-full font-medium',
              'bg-white/10 text-white'
            )}>
              {config.label}
            </span>
            {item.daysIn && (
              <motion.p 
                className="text-xs text-zinc-400 mt-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Day {item.daysIn}
              </motion.p>
            )}
          </div>
        </div>

        {item.notes && (
          <motion.p 
            className="text-sm text-zinc-300/80 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {item.notes}
          </motion.p>
        )}

        {/* Progress indicator for fermenting/conditioning */}
        {(item.status === 'fermenting' || item.status === 'conditioning') && item.daysIn && (
          <div className="mt-4">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/30 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((item.daysIn / 14) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              ~{14 - item.daysIn} days remaining
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
