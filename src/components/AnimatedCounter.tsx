'use client';

import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  label: string;
  suffix?: string;
  duration?: number;
}

export function AnimatedCounter({ value, label, suffix = '', duration = 2 }: AnimatedCounterProps) {
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
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(numValue * eased));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
  }, [isInView, numValue, duration, isNumeric]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="flex items-baseline justify-center">
        {isNumeric ? (
          <span className="text-5xl md:text-6xl font-bold text-amber-500">
            {displayValue}
          </span>
        ) : (
          <span className="text-4xl md:text-5xl font-bold text-amber-500">{value}</span>
        )}
        {suffix && (
          <span className="text-2xl md:text-3xl font-bold text-amber-500/70 ml-1">{suffix}</span>
        )}
      </div>
      <motion.p 
        className="text-zinc-400 text-sm mt-2 uppercase tracking-wider font-mono"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3 }}
      >
        {label}
      </motion.p>
    </motion.div>
  );
}
