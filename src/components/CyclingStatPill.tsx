'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Fact {
  label: string;
  value: string | number;
}

interface CyclingStatPillProps {
  facts: Fact[];
  color?: 'amber' | 'green' | 'purple' | 'cyan' | 'pink';
  interval?: number; // ms between cycles
}

export function CyclingStatPill({ facts, color = 'amber', interval = 4000 }: CyclingStatPillProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (facts.length <= 1) return;
    
    const timer = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % facts.length);
        setTimeout(() => setIsGlitching(false), 150);
      }, 150);
    }, interval);
    
    return () => clearInterval(timer);
  }, [facts.length, interval]);

  const colors = {
    amber: {
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      glow: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
      glitch: 'rgba(245, 158, 11, 0.3)',
    },
    green: {
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      glow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
      glitch: 'rgba(16, 185, 129, 0.3)',
    },
    purple: {
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      glow: 'hover:border-purple-500/40 hover:shadow-purple-500/10',
      glitch: 'rgba(168, 85, 247, 0.3)',
    },
    cyan: {
      text: 'text-cyan-400',
      border: 'border-cyan-500/20',
      glow: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
      glitch: 'rgba(6, 182, 212, 0.3)',
    },
    pink: {
      text: 'text-pink-400',
      border: 'border-pink-500/20',
      glow: 'hover:border-pink-500/40 hover:shadow-pink-500/10',
      glitch: 'rgba(236, 72, 153, 0.3)',
    },
  };

  const c = colors[color];
  const current = facts[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2 }}
      className={`relative bg-zinc-900/60 backdrop-blur-sm border ${c.border} rounded-xl px-4 py-3 transition-all duration-300 hover:shadow-xl ${c.glow} overflow-hidden w-full`}
    >
      {/* Glitch overlay */}
      <AnimatePresence>
        {isGlitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-xl"
          >
            {/* Dual scan lines */}
            <motion.div
              className="absolute left-0 right-0 h-[2px]"
              style={{ backgroundColor: c.glitch, boxShadow: `0 0 10px 2px ${c.glitch}` }}
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 0.15, ease: 'linear' }}
            />
            <motion.div
              className="absolute left-0 right-0 h-[2px] bg-white/50"
              initial={{ top: '100%' }}
              animate={{ top: '0%' }}
              transition={{ duration: 0.15, ease: 'linear' }}
            />
            {/* Flash */}
            <motion.div
              className="absolute inset-0"
              style={{ backgroundColor: c.glitch }}
              animate={{ opacity: [0, 0.4, 0, 0.2, 0] }}
              transition={{ duration: 0.15 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cycle indicator dots */}
      {facts.length > 1 && (
        <div className="absolute top-1 right-2 flex gap-0.5">
          {facts.map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-colors ${
                i === currentIndex ? c.text : 'bg-zinc-700'
              }`}
              style={i === currentIndex ? { backgroundColor: 'currentColor' } : {}}
            />
          ))}
        </div>
      )}

      {/* Content - fixed height to prevent layout shift */}
      <div className="h-[52px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -5, filter: 'blur(4px)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-zinc-600 text-[10px] uppercase tracking-[0.15em] mb-0.5 truncate">
              {current.label}
            </div>
            <div className={`${c.text} font-bold text-lg tracking-tight truncate`}>
              {current.value}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
