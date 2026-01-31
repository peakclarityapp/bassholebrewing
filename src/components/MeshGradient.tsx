'use client';

import { useEffect, useRef } from 'react';

// Stripe-style mesh gradient adapted for beer colors (amber, gold, copper)
export function MeshGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Beer-themed colors: amber, gold, copper, deep brown
    const colors = [
      { r: 245, g: 158, b: 11 },   // amber-500
      { r: 217, g: 119, b: 6 },    // amber-600
      { r: 180, g: 83, b: 9 },     // amber-700
      { r: 251, g: 191, b: 36 },   // amber-400
      { r: 161, g: 98, b: 7 },     // amber-800
    ];

    const blobs = colors.map((color, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: 300 + Math.random() * 200,
      color,
    }));

    const animate = () => {
      time += 0.005;
      
      // Clear with dark background
      ctx.fillStyle = 'rgb(9, 9, 11)'; // zinc-950
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw blobs
      blobs.forEach((blob, i) => {
        // Organic movement
        blob.x += blob.vx + Math.sin(time + i) * 0.3;
        blob.y += blob.vy + Math.cos(time + i * 0.7) * 0.3;

        // Bounce off edges
        if (blob.x < -blob.radius) blob.x = canvas.width + blob.radius;
        if (blob.x > canvas.width + blob.radius) blob.x = -blob.radius;
        if (blob.y < -blob.radius) blob.y = canvas.height + blob.radius;
        if (blob.y > canvas.height + blob.radius) blob.y = -blob.radius;

        // Draw gradient blob
        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        );
        
        const { r, g, b } = blob.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.1)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 opacity-60"
      style={{ filter: 'blur(60px)' }}
    />
  );
}
