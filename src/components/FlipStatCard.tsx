'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface FlipStatCardProps {
  value: number | string;
  label: string;
  suffix?: string;
  duration?: number;
  color?: 'amber' | 'green' | 'purple' | 'cyan';
  breakdown?: { label: string; value: number | string }[];
}

export function FlipStatCard({ 
  value, 
  label, 
  suffix = '', 
  duration = 2,
  color = 'amber',
  breakdown = []
}: FlipStatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  const isNumeric = !isNaN(numValue) && typeof value === 'number';

  useEffect(() => {
    if (isInView && isNumeric) {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(numValue * eased));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
  }, [isInView, numValue, duration, isNumeric]);

  const handleFlip = () => {
    if (breakdown.length === 0) return;
    setIsGlitching(true);
    setTimeout(() => {
      setIsFlipped(!isFlipped);
      setTimeout(() => setIsGlitching(false), 300);
    }, 150);
  };

  const gradients = {
    amber: 'from-amber-400 via-orange-400 to-amber-500',
    green: 'from-emerald-400 via-green-400 to-teal-400',
    purple: 'from-purple-400 via-violet-400 to-purple-500',
    cyan: 'from-cyan-400 via-sky-400 to-blue-400',
  };

  const glows = {
    amber: 'hover:shadow-amber-500/30',
    green: 'hover:shadow-emerald-500/30',
    purple: 'hover:shadow-purple-500/30',
    cyan: 'hover:shadow-cyan-500/30',
  };

  const borders = {
    amber: 'border-amber-500/20',
    green: 'border-emerald-500/20',
    purple: 'border-purple-500/20',
    cyan: 'border-cyan-500/20',
  };

  const solidColors = {
    amber: 'text-amber-400',
    green: 'text-emerald-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
  };

  const bgGlows = {
    amber: 'rgba(245, 158, 11, 0.1)',
    green: 'rgba(16, 185, 129, 0.1)',
    purple: 'rgba(168, 85, 247, 0.1)',
    cyan: 'rgba(6, 182, 212, 0.1)',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, type: "spring" }}
      className="group perspective-1000"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className={`relative cursor-pointer transition-all duration-500 ${glows[color]} hover:shadow-2xl`}
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={handleFlip}
      >
        {/* Glitch overlay during flip */}
        {isGlitching && (
          <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-2xl">
            <motion.div 
              className="absolute inset-0 bg-cyan-500/20"
              animate={{ opacity: [0, 1, 0, 1, 0] }}
              transition={{ duration: 0.15 }}
            />
            <motion.div 
              className="absolute h-[2px] w-full bg-cyan-400"
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 0.15 }}
            />
            <motion.div 
              className="absolute h-[2px] w-full bg-pink-400"
              animate={{ top: ['100%', '0%'] }}
              transition={{ duration: 0.15 }}
            />
          </div>
        )}

        {/* FRONT SIDE */}
        <div 
          className={`relative bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border ${borders[color]} overflow-hidden`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Subtle gradient line at top */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradients[color]} opacity-60`} />
          
          {/* Tap hint */}
          {breakdown.length > 0 && (
            <div className={`absolute top-2 right-2 ${solidColors[color]} opacity-40 text-xs font-mono`}>
              [TAP]
            </div>
          )}
          
          {/* Number */}
          <div className="text-center">
            <motion.div 
              className={`text-5xl md:text-7xl font-black bg-gradient-to-r ${gradients[color]} bg-clip-text text-transparent leading-none`}
              animate={isInView ? { scale: [0.8, 1.02, 1] } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {isNumeric ? displayValue.toLocaleString() : value}
              {suffix && <span className="text-3xl md:text-5xl opacity-60">{suffix}</span>}
            </motion.div>
            
            {/* Label */}
            <motion.p 
              className="text-zinc-500 text-xs mt-3 md:mt-4 uppercase tracking-[0.2em] font-medium"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              {label}
            </motion.p>
          </div>
        </div>

        {/* BACK SIDE */}
        <div 
          className={`absolute inset-0 bg-zinc-900/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 border ${borders[color]} overflow-hidden`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Scan lines effect */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            }}
          />
          
          {/* Top gradient line */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradients[color]} opacity-80`} />
          
          {/* Back hint */}
          <div className={`absolute top-2 right-2 ${solidColors[color]} opacity-40 text-xs font-mono`}>
            [BACK]
          </div>
          
          {/* Header */}
          <div className={`text-xs font-mono ${solidColors[color]} mb-3 uppercase tracking-wider opacity-80`}>
            {label} Breakdown
          </div>
          
          {/* Breakdown list */}
          <div className="space-y-2 max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
            {breakdown.map((item, i) => (
              <motion.div 
                key={item.label}
                className="flex justify-between items-center text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={isFlipped ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                transition={{ delay: i * 0.05 + 0.2 }}
              >
                <span className="text-zinc-400 font-mono text-xs">{item.label}</span>
                <span className={`font-bold ${solidColors[color]}`}>{item.value}</span>
              </motion.div>
            ))}
          </div>
          
          {/* Bottom glow */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{ 
              background: `linear-gradient(to top, ${bgGlows[color]}, transparent)` 
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
