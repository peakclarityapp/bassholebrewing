'use client';

import { motion } from 'framer-motion';

interface StatPillProps {
  icon: string;
  label: string;
  value: string | number;
}

export function StatPill({ icon, label, value }: StatPillProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className="flex items-center gap-3 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-full px-4 py-2"
    >
      <span className="text-lg">{icon}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-zinc-500 text-xs uppercase tracking-wider">{label}:</span>
        <span className="text-amber-400 font-mono font-medium">{value}</span>
      </div>
    </motion.div>
  );
}
