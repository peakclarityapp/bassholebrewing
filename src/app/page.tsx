"use client";

import { useQuery } from "convex/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { TapCard } from "@/components/TapCard";
import { PipelineCard } from "@/components/PipelineCard";
import { CosmicBackground } from "@/components/CosmicBackground";
import { BeerBubbles } from "@/components/BeerBubbles";
import { AnimatedCounter } from "@/components/AnimatedCounter";
// import { FloatingSkippy } from "@/components/FloatingSkippy"; // Removed - too much

export default function Home() {
  const brewery = useQuery(api.brewery.getBrewery);
  const taps = useQuery(api.brewery.getTaps);
  const pipeline = useQuery(api.brewery.getPipeline);
  const archive = useQuery(api.brewery.getArchive);
  
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Loading state - cosmic style
  if (!brewery || !taps || !pipeline || !archive) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center overflow-hidden">
        <CosmicBackground />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity }
            }}
            className="text-7xl mb-6"
          >
            🦘
          </motion.div>
          <motion.p 
            className="text-amber-500 text-xl font-mono"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            INITIALIZING BREW SYSTEMS...
          </motion.p>
          <div className="flex justify-center gap-1 mt-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-amber-500 rounded-full"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      </main>
    );
  }

  const totalBatches = (archive?.length || 0) + (pipeline?.length || 0);
  const uniqueStyles = new Set(archive?.map((b) => b.style) || []).size;

  // Enhanced beer data
  const enhancedTaps = taps.map(tap => ({
    ...tap,
    beer: tap.beer ? {
      ...tap.beer,
      id: tap.beer._id,
      flavorTags: getFlavorTags(tap.beer.style),
      hops: getHops(tap.beer.name),
    } : null
  }));

  return (
    <main className="min-h-screen bg-zinc-950 overflow-hidden">
      {/* Cosmic Background */}
      <CosmicBackground />
      <BeerBubbles />

      {/* Hero */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center px-4 py-20"
      >
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Logo with cosmic glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="relative inline-block mb-10"
          >
            {/* Glow rings */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              animate={{
                boxShadow: [
                  '0 0 60px rgba(245, 158, 11, 0.3), 0 0 100px rgba(168, 85, 247, 0.2)',
                  '0 0 80px rgba(168, 85, 247, 0.3), 0 0 120px rgba(14, 165, 233, 0.2)',
                  '0 0 60px rgba(14, 165, 233, 0.3), 0 0 100px rgba(245, 158, 11, 0.2)',
                  '0 0 60px rgba(245, 158, 11, 0.3), 0 0 100px rgba(168, 85, 247, 0.2)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.img
              src="/logo.jpg"
              alt="Bass Hole Brewing"
              className="w-64 h-64 md:w-80 md:h-80 rounded-3xl object-cover relative z-10 border-2 border-amber-500/30"
              whileHover={{ scale: 1.05, rotate: 2 }}
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-6"
          >
            <span className="block text-6xl md:text-8xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                Bass Hole
              </span>
            </span>
            <span className="block text-4xl md:text-6xl font-bold mt-2">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Brewing
              </span>
            </span>
          </motion.h1>

          {/* Tagline with typing effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <p className="text-xl md:text-2xl text-zinc-300 font-mono">
              <span className="text-amber-500">&gt;</span> {brewery.tagline}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-amber-500"
              >
                _
              </motion.span>
            </p>
          </motion.div>

          {/* Location badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2"
          >
            <span className="text-zinc-400">📍</span>
            <span className="text-zinc-300 font-mono text-sm">{brewery.location}</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400 font-mono text-sm">EST. {brewery.established}</span>
          </motion.div>

          {/* Head Brewer credit */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-zinc-500 text-sm"
          >
            Head Brewer: <span className="text-amber-500/70">Skippy</span> <span className="text-zinc-600">(Space Kangaroo AI 🦘)</span>
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-zinc-600 text-xs font-mono uppercase tracking-wider">Enter the brewery</span>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg className="w-6 h-6 text-amber-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* What's On Tap */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.span 
              className="inline-block text-amber-500 font-mono text-sm mb-4 tracking-wider"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              [ LIVE TAP STATUS ]
            </motion.span>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              What&apos;s On Tap
            </h2>
            <p className="text-zinc-400 text-lg max-w-md mx-auto">
              Real-time brewery telemetry from the basement
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {enhancedTaps.map((tap, index) => (
              <TapCard
                key={tap.number}
                number={tap.number}
                status={tap.status}
                beer={tap.beer}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      {pipeline.length > 0 && (
        <section className="relative py-32 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <span className="inline-block text-purple-400 font-mono text-sm mb-4 tracking-wider">
                [ FERMENTATION BAY ]
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
                In The Pipeline
              </h2>
              <p className="text-zinc-400 text-lg max-w-md mx-auto">
                Beers currently in development
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pipeline.map((item, index) => (
                <PipelineCard
                  key={item._id}
                  item={{
                    id: item._id,
                    name: item.name,
                    style: item.style,
                    status: item.status as any,
                    brewDate: item.brewDate,
                    batchNo: item.batchNo,
                    daysIn: item.daysIn,
                    notes: item.notes,
                  }}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="relative py-32 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-cyan-400 font-mono text-sm mb-4 tracking-wider">
              [ BREWERY METRICS ]
            </span>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <AnimatedCounter value={totalBatches} label="Batches Brewed" />
            <AnimatedCounter value={4} label="Active Taps" />
            <AnimatedCounter value={brewery.batchSize} label="Batch Size" />
            <AnimatedCounter value={uniqueStyles} label="Styles Explored" />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-20 px-4 border-t border-zinc-800/30">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.img
            src="/logo.jpg"
            alt="Bass Hole Brewing"
            className="w-20 h-20 mx-auto mb-6 rounded-xl opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500"
            whileHover={{ scale: 1.1, rotate: 5 }}
          />
          <p className="text-zinc-500 text-sm mb-2 font-mono">
            {brewery.name} · {brewery.location}
          </p>
          <p className="text-zinc-600 text-xs">
            {brewery.system} · {brewery.philosophy}
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 text-zinc-700 text-xs">
            <span>Brewed with</span>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🦘
            </motion.span>
            <span>by a slightly chaotic AI</span>
          </div>
          <p className="text-zinc-800 text-xs mt-4 font-mono">
            © {new Date().getFullYear()} Bass Hole Brewing · All hops reserved
          </p>
        </motion.div>
      </footer>
    </main>
  );
}

// Helper functions
function getFlavorTags(style: string): string[] {
  const styleMap: Record<string, string[]> = {
    'Hazy IPA': ['tropical', 'juicy', 'citrus'],
    'American IPA': ['citrus', 'pine', 'hoppy'],
    'West Coast IPA': ['pine', 'citrus', 'dank'],
    'New Zealand IPA': ['tropical', 'fruity', 'floral'],
    'Black IPA': ['roasty', 'pine', 'hoppy'],
    'Blonde Ale': ['crisp', 'malty', 'floral'],
    'Czech Pilsner': ['crisp', 'malty', 'floral'],
    'Belgian Tripel': ['fruity', 'spicy', 'malty'],
  };
  return styleMap[style] || ['hoppy'];
}

function getHops(name: string): string[] {
  const hopsMap: Record<string, string[]> = {
    'American IPA': ['Centennial', 'Cascade', 'Simcoe'],
    'New Job IPA': ['Citra', 'Mosaic', 'Simcoe'],
    'Riwaka Haka': ['Riwaka', 'Nelson Sauvin', 'Motueka'],
    'Skippy\'s "A Bit Much"': ['Galaxy', 'Citra', 'El Dorado', 'Mosaic'],
  };
  return hopsMap[name] || [];
}
