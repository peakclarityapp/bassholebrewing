'use client';

import { useEffect, useRef } from 'react';

// Cosmic starfield + aurora + nebula - space kangaroo energy
export function CosmicBackground() {
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
      canvas.height = window.innerHeight * 3; // Taller for scroll
    };

    resize();
    window.addEventListener('resize', resize);

    // Stars
    const stars: { x: number; y: number; size: number; speed: number; brightness: number }[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        brightness: Math.random(),
      });
    }

    // Nebula blobs - beer-colored cosmic clouds
    const nebulae = [
      { x: 0.2, y: 0.15, color: { r: 245, g: 158, b: 11 }, size: 400 },   // amber
      { x: 0.8, y: 0.25, color: { r: 217, g: 119, b: 6 }, size: 350 },    // deep amber
      { x: 0.5, y: 0.45, color: { r: 168, g: 85, b: 247 }, size: 300 },   // purple (space!)
      { x: 0.3, y: 0.65, color: { r: 14, g: 165, b: 233 }, size: 350 },   // cyan
      { x: 0.7, y: 0.75, color: { r: 251, g: 146, b: 60 }, size: 400 },   // orange
      { x: 0.2, y: 0.9, color: { r: 236, g: 72, b: 153 }, size: 300 },    // pink
    ];

    const animate = () => {
      time += 0.003;
      
      // Deep space background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgb(2, 6, 23)');      // Very dark blue
      gradient.addColorStop(0.5, 'rgb(9, 9, 11)');    // zinc-950
      gradient.addColorStop(1, 'rgb(15, 5, 20)');     // Dark purple
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebulae
      nebulae.forEach((nebula, i) => {
        const x = nebula.x * canvas.width + Math.sin(time + i) * 50;
        const y = nebula.y * canvas.height + Math.cos(time * 0.7 + i) * 30;
        
        const grad = ctx.createRadialGradient(x, y, 0, x, y, nebula.size);
        const { r, g, b } = nebula.color;
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`);
        grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.05)`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Draw stars
      stars.forEach((star) => {
        const twinkle = Math.sin(time * 3 + star.brightness * 10) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`;
        ctx.fill();

        // Move stars slightly
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
      });

      // Aurora effect at top
      for (let i = 0; i < 5; i++) {
        const auroraGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        const offset = Math.sin(time + i * 0.5) * 0.2;
        auroraGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
        auroraGrad.addColorStop(0.3 + offset, 'rgba(245, 158, 11, 0.1)');
        auroraGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.08)');
        auroraGrad.addColorStop(0.7 - offset, 'rgba(14, 165, 233, 0.1)');
        auroraGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
        
        ctx.fillStyle = auroraGrad;
        ctx.fillRect(0, i * 30, canvas.width, 150 + Math.sin(time) * 50);
      }

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
      className="fixed inset-0 -z-10"
      style={{ filter: 'blur(1px)' }}
    />
  );
}
