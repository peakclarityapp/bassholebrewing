'use client';

import { motion } from 'framer-motion';

interface StatPillProps {
  label: string;
  value: string | number;
  color?: 'amber' | 'green' | 'purple' | 'cyan' | 'pink';
}

export function StatPill({ label, value, color = 'amber' }: StatPillProps) {
  const colors = {
    amber: {
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      glow: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
    },
    green: {
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      glow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
    },
    purple: {
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      glow: 'hover:border-purple-500/40 hover:shadow-purple-500/10',
    },
    cyan: {
      text: 'text-cyan-400',
      border: 'border-cyan-500/20',
      glow: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
    },
    pink: {
      text: 'text-pink-400',
      border: 'border-pink-500/20',
      glow: 'hover:border-pink-500/40 hover:shadow-pink-500/10',
    },
  };

  const c = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2 }}
      className={`bg-zinc-900/60 backdrop-blur-sm border ${c.border} rounded-xl px-5 py-3 transition-all duration-300 hover:shadow-xl ${c.glow}`}
    >
      <div className="text-zinc-600 text-[10px] uppercase tracking-[0.15em] mb-0.5">{label}</div>
      <div className={`${c.text} font-bold text-lg tracking-tight`}>{value}</div>
    </motion.div>
  );
}
