'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  label: string;
  suffix?: string;
  duration?: number;
  color?: 'amber' | 'green' | 'purple' | 'cyan';
}

export function AnimatedCounter({ 
  value, 
  label, 
  suffix = '', 
  duration = 2,
  color = 'amber'
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState(0);
  
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

  const gradients = {
    amber: 'from-amber-400 via-orange-400 to-amber-500',
    green: 'from-emerald-400 via-green-400 to-teal-400',
    purple: 'from-purple-400 via-violet-400 to-purple-500',
    cyan: 'from-cyan-400 via-sky-400 to-blue-400',
  };

  const glows = {
    amber: 'group-hover:shadow-amber-500/20',
    green: 'group-hover:shadow-emerald-500/20',
    purple: 'group-hover:shadow-purple-500/20',
    cyan: 'group-hover:shadow-cyan-500/20',
  };

  const borders = {
    amber: 'border-amber-500/20',
    green: 'border-emerald-500/20',
    purple: 'border-purple-500/20',
    cyan: 'border-cyan-500/20',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, type: "spring" }}
      className="group"
    >
      <div className={`relative bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-8 border ${borders[color]} overflow-hidden transition-all duration-500 hover:shadow-2xl ${glows[color]}`}>
        {/* Subtle gradient line at top */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradients[color]} opacity-60`} />
        
        {/* Number */}
        <div className="text-center">
          <motion.div 
            className={`text-6xl md:text-7xl font-black bg-gradient-to-r ${gradients[color]} bg-clip-text text-transparent leading-none`}
            animate={isInView ? { scale: [0.8, 1.02, 1] } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {isNumeric ? displayValue.toLocaleString() : value}
            {suffix && <span className="text-4xl md:text-5xl opacity-60">{suffix}</span>}
          </motion.div>
          
          {/* Label */}
          <motion.p 
            className="text-zinc-500 text-xs mt-4 uppercase tracking-[0.2em] font-medium"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          >
            {label}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
