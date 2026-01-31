"use client";

import { useQuery } from "convex/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { TapCard } from "@/components/TapCard";
import { PipelineCard } from "@/components/PipelineCard";
import { MeshGradient } from "@/components/MeshGradient";
import { BeerBubbles } from "@/components/BeerBubbles";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export default function Home() {
  const brewery = useQuery(api.brewery.getBrewery);
  const taps = useQuery(api.brewery.getTaps);
  const pipeline = useQuery(api.brewery.getPipeline);
  const archive = useQuery(api.brewery.getArchive);
  
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Loading state
  if (!brewery || !taps || !pipeline || !archive) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🍺
          </motion.div>
          <p className="text-amber-500 text-xl font-medium">Pouring...</p>
        </motion.div>
      </main>
    );
  }

  const totalBatches = (archive?.length || 0) + (pipeline?.length || 0);
  const uniqueStyles = new Set(archive?.map((b) => b.style) || []).size;

  // Add enhanced beer data for display
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
      {/* Animated Background */}
      <MeshGradient />
      <BeerBubbles />

      {/* Hero */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center px-4 py-20"
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.img
              src="/logo.jpg"
              alt="Bass Hole Brewing"
              className="w-56 h-56 md:w-72 md:h-72 mx-auto mb-8 rounded-3xl object-cover shadow-2xl shadow-amber-500/20"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight"
          >
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              {brewery.name}
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-amber-500/80 mb-4 font-medium"
          >
            {brewery.tagline}
          </motion.p>

          {/* Location */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-zinc-400"
          >
            {brewery.location} · Est. {brewery.established}
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-zinc-500 text-sm flex flex-col items-center gap-2"
            >
              <span>Scroll to explore</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* What's On Tap */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What&apos;s On Tap
            </h2>
            <p className="text-zinc-400 text-lg">Fresh pours from the basement</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <section className="relative py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                In The Pipeline
              </h2>
              <p className="text-zinc-400 text-lg">Coming soon to a tap near you</p>
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
      <section className="relative py-24 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <AnimatedCounter value={totalBatches} label="Batches Brewed" />
            <AnimatedCounter value={4} label="Taps" />
            <AnimatedCounter value={brewery.batchSize} label="Batch Size" />
            <AnimatedCounter value={uniqueStyles} label="Styles Brewed" />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-4 border-t border-zinc-800/50">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.img
            src="/logo.jpg"
            alt="Bass Hole Brewing"
            className="w-16 h-16 mx-auto mb-6 rounded-xl opacity-50"
            whileHover={{ opacity: 1, scale: 1.1 }}
          />
          <p className="text-zinc-500 text-sm mb-2">
            {brewery.name} · {brewery.location}
          </p>
          <p className="text-zinc-600 text-xs">
            {brewery.system} · {brewery.philosophy}
          </p>
          <p className="text-zinc-700 text-xs mt-4">
            Made with 🍺 and questionable decisions
          </p>
        </motion.div>
      </footer>
    </main>
  );
}

// Helper functions to derive flavor tags and hops from beer data
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
