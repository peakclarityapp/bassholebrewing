'use client';

import { motion } from 'framer-motion';

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
    label: 'PLANNING', 
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-500/30',
    icon: '📝',
    progress: 10,
  },
  brewing: { 
    label: 'BREW DAY', 
    color: 'text-yellow-400',
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-yellow-500/10 to-orange-500/5',
    border: 'border-yellow-500/30',
    icon: '🔥',
    progress: 25,
  },
  fermenting: { 
    label: 'FERMENTING', 
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-500/10 to-purple-600/5',
    border: 'border-purple-500/30',
    icon: '🫧',
    progress: 50,
  },
  conditioning: { 
    label: 'CONDITIONING', 
    color: 'text-cyan-400',
    gradient: 'from-cyan-500 to-cyan-600',
    bgGradient: 'from-cyan-500/10 to-cyan-600/5',
    border: 'border-cyan-500/30',
    icon: '❄️',
    progress: 75,
  },
  carbonating: { 
    label: 'CARBONATING', 
    color: 'text-green-400',
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/5',
    border: 'border-green-500/30',
    icon: '✨',
    progress: 90,
  },
};

export function PipelineCard({ item, index = 0 }: PipelineCardProps) {
  const config = statusConfig[item.status];
  
  // Calculate days remaining (assume 14 day ferment + 7 day carb)
  const totalDays = item.status === 'carbonating' ? 7 : 14;
  const daysRemaining = item.daysIn ? Math.max(totalDays - item.daysIn, 0) : totalDays;
  const progressPercent = item.daysIn ? Math.min((item.daysIn / totalDays) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15, type: "spring", stiffness: 100 }}
      className="relative group"
    >
      {/* Animated border glow */}
      <motion.div 
        className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-r ${config.gradient} opacity-30 blur-sm`}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Card */}
      <div className={`relative bg-zinc-950/90 backdrop-blur-xl rounded-2xl overflow-hidden border ${config.border}`}>
        {/* Top status bar */}
        <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
        
        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Animated status icon */}
              <motion.div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.bgGradient} border ${config.border} flex items-center justify-center`}
                animate={{ 
                  rotate: item.status === 'fermenting' ? [0, 5, -5, 0] : 0,
                  scale: item.status === 'brewing' ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-3xl">{config.icon}</span>
              </motion.div>
              
              <div>
                <h4 className="font-black text-xl text-white font-display">{item.name}</h4>
                <p className="text-sm text-zinc-400">{item.style} · Batch #{item.batchNo}</p>
              </div>
            </div>
            
            {/* Status badge */}
            <motion.span 
              className={`text-xs font-bold tracking-wider px-3 py-1.5 rounded-full bg-gradient-to-r ${config.bgGradient} border ${config.border} ${config.color}`}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {config.label}
            </motion.span>
          </div>

          {/* Notes */}
          {item.notes && (
            <p className="text-sm text-zinc-400 mb-4 italic border-l-2 border-zinc-700 pl-3">
              {item.notes}
            </p>
          )}

          {/* Progress section */}
          {(item.status === 'fermenting' || item.status === 'conditioning' || item.status === 'carbonating') && (
            <div className="mt-4">
              {/* Progress bar */}
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                <motion.div
                  className={`h-full bg-gradient-to-r ${config.gradient} rounded-full relative`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                >
                  {/* Animated shine */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                      backgroundSize: '50px 100%',
                    }}
                    animate={{ x: ['-50px', '200px'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
              
              {/* Stats row */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">
                  Day <span className={`font-bold ${config.color}`}>{item.daysIn || 0}</span>
                </span>
                <motion.span 
                  className="text-zinc-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ~{daysRemaining} days to go
                </motion.span>
              </div>
            </div>
          )}
          
          {/* Brew date for planning/brewing */}
          {(item.status === 'planning' || item.status === 'brewing') && item.brewDate && (
            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
              <span>📅</span>
              <span>Brew date: <span className="text-zinc-300">{item.brewDate}</span></span>
            </div>
          )}
        </div>

        {/* Bubbles animation for fermenting */}
        {item.status === 'fermenting' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-purple-400/30 rounded-full"
                style={{ left: `${10 + i * 12}%`, bottom: 0 }}
                animate={{
                  y: [0, -150],
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
