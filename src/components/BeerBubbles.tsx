'use client';

import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export function BeerBubbles() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!init) return null;

  return (
    <Particles
      id="beer-bubbles"
      className="fixed inset-0 -z-5 pointer-events-none"
      options={{
        fullScreen: false,
        fpsLimit: 60,
        particles: {
          number: {
            value: 15,
            density: {
              enable: true,
            },
          },
          color: {
            value: ['#fbbf24', '#f59e0b', '#d97706'],
          },
          shape: {
            type: 'circle',
          },
          opacity: {
            value: { min: 0.1, max: 0.3 },
            animation: {
              enable: true,
              speed: 0.5,
              sync: false,
            },
          },
          size: {
            value: { min: 2, max: 6 },
            animation: {
              enable: true,
              speed: 2,
              sync: false,
            },
          },
          move: {
            enable: true,
            speed: { min: 0.5, max: 1.5 },
            direction: 'top',
            random: true,
            straight: false,
            outModes: {
              default: 'out',
              bottom: 'out',
              top: 'out',
            },
          },
          wobble: {
            enable: true,
            distance: 10,
            speed: 5,
          },
        },
        detectRetina: true,
      }}
    />
  );
}
