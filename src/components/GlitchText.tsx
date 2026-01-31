'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface GlitchTextProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export function GlitchText({ children, className = '', as: Tag = 'span' }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);
      }
    }, 100);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <Tag className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      
      {/* Glitch layers */}
      {isGlitching && (
        <>
          <motion.span
            className="absolute inset-0 text-cyan-400 z-20"
            initial={{ x: -2 }}
            animate={{ x: [−2, 2, -1, 0] }}
            transition={{ duration: 0.1 }}
            style={{ clipPath: 'inset(10% 0 60% 0)' }}
          >
            {children}
          </motion.span>
          <motion.span
            className="absolute inset-0 text-pink-500 z-20"
            initial={{ x: 2 }}
            animate={{ x: [2, -2, 1, 0] }}
            transition={{ duration: 0.1 }}
            style={{ clipPath: 'inset(50% 0 20% 0)' }}
          >
            {children}
          </motion.span>
        </>
      )}
    </Tag>
  );
}
