'use client';

import { motion } from 'framer-motion';

interface StatPillProps {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}

export function StatPill({ icon, label, value, color = 'amber' }: StatPillProps) {
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  };

  const colors = colorClasses[color] || colorClasses.amber;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -3 }}
      className={`flex items-center gap-3 ${colors.bg} backdrop-blur-sm border ${colors.border} rounded-xl px-5 py-3`}
    >
      <motion.span 
        className="text-2xl"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        {icon}
      </motion.span>
      <div>
        <span className="text-zinc-500 text-[10px] uppercase tracking-wider block">{label}</span>
        <span className={`${colors.text} font-bold text-lg`}>{value}</span>
      </div>
    </motion.div>
  );
}
