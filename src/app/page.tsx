"use client";

import { useQuery } from "convex/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { TapCard } from "@/components/TapCard";
import { PipelineCard } from "@/components/PipelineCard";
import { CosmicBackground } from "@/components/CosmicBackground";
import { BeerBubbles } from "@/components/BeerBubbles";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { StatPill } from "@/components/StatPill";

export default function Home() {
  const breweryData = useQuery(api.brewery.getBrewery);
  const taps = useQuery(api.brewery.getTaps);
  const pipeline = useQuery(api.brewery.getPipeline);
  const archive = useQuery(api.brewery.getArchive);
  
  // Fallback brewery data if query doesn't return
  const brewery = breweryData || {
    name: "Bass Hole Brewing",
    tagline: "Basement brews with attitude", 
    location: "Riverside, IL",
    established: 2024,
    system: "Anvil Foundry 4 gal",
    batchSize: "2.5 gal",
    philosophy: "Hoppy, sessionable, and made with love"
  };
  
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Loading state - only wait for taps (brewery has fallback)
  if (!taps) {
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
          {/* Debug info */}
          <div className="mt-8 text-xs text-zinc-600 font-mono">
            <p>brewery: {brewery ? '✓' : '×'}</p>
            <p>taps: {taps ? '✓' : '×'}</p>
            <p>pipeline: {pipeline ? '✓' : '×'}</p>
            <p>archive: {archive ? '✓' : '×'}</p>
          </div>
        </motion.div>
      </main>
    );
  }

  // Get highest batch number for true count (some batches may not be in DB)
  const allBeers = [...(archive || []), ...(pipeline || [])];
  const highestBatchNo = Math.max(...allBeers.map(b => b.batchNo || 0), 0);
  const totalBatches = highestBatchNo || (archive?.length || 0) + (pipeline?.length || 0);
  const uniqueStyles = new Set(allBeers.map((b) => b.style).filter(Boolean)).size;

  // Calculate dynamic stats
  const allHops = allBeers.flatMap(b => b.hops || []);
  const hopCounts = allHops.reduce((acc, hop) => {
    const name = hop.replace('Columbus/Tomahawk/Zeus (CTZ)', 'CTZ').split(' ')[0];
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topHop = Object.entries(hopCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Citra';
  
  const styleCounts = allBeers.reduce((acc, b) => {
    if (b.style) acc[b.style] = (acc[b.style] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'IPA';
  
  const avgAbv = allBeers.length > 0 
    ? (allBeers.reduce((sum, b) => sum + (b.abv || 0), 0) / allBeers.length).toFixed(1)
    : '6.5';
    
  const yeasts = allBeers.map(b => b.yeast).filter(Boolean);
  const yeastCounts = yeasts.reduce((acc, y) => {
    const name = (y as string).replace('Safale American', 'US-05').replace('Windsor Yeast', 'Windsor');
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topYeast = Object.entries(yeastCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'US-05';

  // Use real data from Convex
  const enhancedTaps = taps.map(tap => ({
    ...tap,
    beer: tap.beer ? {
      id: tap.beer._id,
      name: tap.beer.name,
      style: tap.beer.style || 'Craft Beer',
      tagline: tap.beer.tagline,
      description: tap.beer.description,
      abv: tap.beer.abv,
      ibu: tap.beer.ibu,
      srm: tap.beer.srm,
      batchNo: tap.beer.batchNo,
      hops: tap.beer.hops || [],
      malts: tap.beer.malts || [],
      yeast: tap.beer.yeast,
      flavorTags: tap.beer.flavorTags || deriveFlavorTags(tap.beer.style || ''),
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
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Logo with psychedelic glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            className="relative inline-block mb-8"
          >
            {/* Animated glow behind logo */}
            <motion.div
              className="absolute inset-0 blur-3xl opacity-50"
              style={{
                background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(245,158,11,0.3) 30%, rgba(14,165,233,0.2) 60%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.img
              src="/logo-transparent.png"
              alt="Bass Hole Brewing"
              className="w-72 h-72 md:w-96 md:h-96 object-contain relative z-10 drop-shadow-2xl"
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-zinc-300 mb-8 max-w-xl mx-auto leading-relaxed"
          >
            {brewery.tagline}
          </motion.p>

          {/* Info row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm mb-10"
          >
            <div className="flex items-center gap-2 text-zinc-400">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{brewery.location}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              <span>Est. {brewery.established}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span>{brewery.system}</span>
            </div>
          </motion.div>

          {/* Credits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="space-y-2"
          >
            <p className="text-zinc-600 text-sm">
              <span className="text-zinc-500">Meat Suit:</span>{' '}
              <span className="text-zinc-400">Wayne</span>
            </p>
            <p className="text-zinc-600 text-sm">
              <span className="text-zinc-500">Head Brewer & Digital Overlord:</span>{' '}
              <span className="bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent font-medium">Skippy</span>
              <span className="text-zinc-600 ml-1">(Space Kangaroo AI)</span>
            </p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-zinc-700 flex justify-center pt-2">
              <motion.div
                className="w-1 h-2 bg-amber-500 rounded-full"
                animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* What's On Tap */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.span 
              className="inline-block text-amber-500 font-display text-sm mb-4 tracking-[0.3em] uppercase"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              [ LIVE TAP STATUS ]
            </motion.span>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4 font-display">
              What&apos;s On Tap
            </h2>
            <p className="text-zinc-400 text-lg max-w-md mx-auto">
              Real-time brewery telemetry from the basement
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Debug: show tap count */}
            {enhancedTaps.length === 0 && (
              <p className="text-red-500 col-span-4">No taps found!</p>
            )}
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
      {pipeline && pipeline.length > 0 && (
        <section className="relative py-32 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <span className="inline-block text-purple-400 font-display text-sm mb-4 tracking-[0.3em] uppercase">
                [ FERMENTATION BAY ]
              </span>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-4 font-display">
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
            className="text-center mb-12"
          >
            <motion.span 
              className="inline-block text-cyan-400 font-display text-sm mb-4 tracking-[0.3em] uppercase"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              [ BREWERY METRICS ]
            </motion.span>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4 font-display">
              By The Numbers
            </h2>
            <p className="text-zinc-400 text-lg max-w-md mx-auto">
              Live stats from the basement
            </p>
          </motion.div>
          
          {/* Main stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            <AnimatedCounter value={totalBatches} label="Batches Brewed" color="amber" />
            <AnimatedCounter value={Math.round(totalBatches * 2.5)} label="Gallons Brewed" color="cyan" />
            <AnimatedCounter value={Math.round(totalBatches * 2.5 * 8)} label="Pints Poured" color="green" />
            <AnimatedCounter value={uniqueStyles} label="Styles Explored" color="purple" />
          </div>

          {/* Fun stats - now dynamic! */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 md:gap-4"
          >
            <StatPill label="Top Hop" value={topHop} color="green" />
            <StatPill label="House Yeast" value={topYeast} color="purple" />
            <StatPill label="Most Brewed" value={topStyle} color="amber" />
            <StatPill label="Avg ABV" value={`${avgAbv}%`} color="cyan" />
            <StatPill label="Days Active" value={getDaysSince(2024)} color="pink" />
          </motion.div>
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

// Fallback helper - derives flavor tags from style when not set in DB
function deriveFlavorTags(style: string): string[] {
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

function getDaysSince(year: number): string {
  const start = new Date(year, 0, 1); // Jan 1 of that year
  const now = new Date();
  const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return days.toString();
}
