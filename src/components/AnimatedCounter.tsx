'use client';

import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  label: string;
  suffix?: string;
  duration?: number;
}

export function AnimatedCounter({ value, label, suffix = '', duration = 2 }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  const isNumeric = !isNaN(numValue) && typeof value === 'number';
  
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (current) => 
    isNumeric ? Math.round(current) : value
  );

  useEffect(() => {
    if (isInView && isNumeric) {
      spring.set(numValue);
    }
  }, [isInView, numValue, spring, isNumeric]);

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
          <motion.span className="text-5xl md:text-6xl font-bold text-amber-500">
            {display}
          </motion.span>
        ) : (
          <span className="text-4xl md:text-5xl font-bold text-amber-500">{value}</span>
        )}
        {suffix && (
          <span className="text-2xl md:text-3xl font-bold text-amber-500/70 ml-1">{suffix}</span>
        )}
      </div>
      <motion.p 
        className="text-zinc-400 text-sm mt-2 uppercase tracking-wider"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3 }}
      >
        {label}
      </motion.p>
    </motion.div>
  );
}
