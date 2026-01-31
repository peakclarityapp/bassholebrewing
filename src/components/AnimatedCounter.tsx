'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  label: string;
  suffix?: string;
  duration?: number;
  icon?: string;
  color?: string;
}

export function AnimatedCounter({ 
  value, 
  label, 
  suffix = '', 
  duration = 2,
  icon,
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

  const colorClasses: Record<string, string> = {
    amber: 'from-amber-400 to-orange-500',
    green: 'from-green-400 to-emerald-500',
    purple: 'from-purple-400 to-pink-500',
    cyan: 'from-cyan-400 to-blue-500',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, type: "spring" }}
      className="relative group"
    >
      {/* Card background */}
      <div className="relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800/50 overflow-hidden">
        {/* Glow effect on hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />
        
        {/* Icon */}
        {icon && (
          <motion.span 
            className="text-3xl mb-3 block"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {icon}
          </motion.span>
        )}
        
        {/* Number */}
        <div className="flex items-baseline justify-center">
          {isNumeric ? (
            <motion.span 
              className={`text-5xl md:text-6xl font-black bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}
              animate={isInView ? { scale: [0.5, 1.1, 1] } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {displayValue.toLocaleString()}
            </motion.span>
          ) : (
            <span className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
              {value}
            </span>
          )}
          {suffix && (
            <span className="text-2xl md:text-3xl font-bold text-zinc-500 ml-1">{suffix}</span>
          )}
        </div>
        
        {/* Label */}
        <motion.p 
          className="text-zinc-400 text-sm mt-3 uppercase tracking-wider font-medium text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          {label}
        </motion.p>
      </div>
    </motion.div>
  );
}
