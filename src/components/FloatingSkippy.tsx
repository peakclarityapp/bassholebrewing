'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function FloatingSkippy() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [message, setMessage] = useState('');

  const messages = [
    "G'day! 🍺",
    "A bit much? Maybe!",
    "Hoppy vibes only",
    "*bounces excitedly*",
    "Brewing chaos...",
    "🦘💫",
    "Space hops!",
    "Trust the process",
  ];

  useEffect(() => {
    const showSkippy = () => {
      if (Math.random() > 0.7) {
        setPosition({
          x: Math.random() * (window.innerWidth - 100),
          y: Math.random() * (window.innerHeight - 100),
        });
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 3000);
      }
    };

    const interval = setInterval(showSkippy, 15000);
    // Show once on load after delay
    setTimeout(showSkippy, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            rotate: 0,
            y: [0, -20, 0, -10, 0],
          }}
          exit={{ opacity: 0, scale: 0, rotate: 180 }}
          transition={{ 
            duration: 0.5,
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="fixed z-50 pointer-events-none"
          style={{ left: position.x, top: position.y }}
        >
          <div className="relative">
            {/* Skippy */}
            <motion.div 
              className="text-6xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🦘
            </motion.div>
            
            {/* Speech bubble */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <div className="bg-zinc-800/90 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full border border-amber-500/30 shadow-lg shadow-amber-500/10">
                {message}
              </div>
            </motion.div>

            {/* Sparkles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-amber-400 text-xs"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos(i * 72 * Math.PI / 180) * 40,
                  y: Math.sin(i * 72 * Math.PI / 180) * 40,
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                style={{ left: '50%', top: '50%' }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
