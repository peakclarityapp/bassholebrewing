"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { TapCard } from "@/components/TapCard";
import { PipelineCard } from "@/components/PipelineCard";
import { CosmicBackground } from "@/components/CosmicBackground";
import { BeerBubbles } from "@/components/BeerBubbles";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { StatPill } from "@/components/StatPill";
import { RatingModal } from "@/components/RatingModal";

// Cyberpunk loading messages
const BOOT_SEQUENCE = [
  "ESTABLISHING NEURAL LINK...",
  "LOADING HOP MATRIX...",
  "CALIBRATING FERMENTATION SENSORS...",
  "SYNCING BASEMENT TELEMETRY...",
  "BREWING CONSCIOUSNESS ONLINE...",
];

export default function Home() {
  const [ratingBeer, setRatingBeer] = useState<{ id: string; name: string; style: string } | null>(null);
  const [minLoadComplete, setMinLoadComplete] = useState(false);
  const [bootMessage, setBootMessage] = useState(0);
  const [hackedText, setHackedText] = useState(false);
  const [scrollReady, setScrollReady] = useState(false);
  
  const breweryData = useQuery(api.brewery.getBrewery);
  const taps = useQuery(api.brewery.getTaps);
  const pipeline = useQuery(api.brewery.getPipeline);
  const archive = useQuery(api.brewery.getArchive);
  const beerRatings = useQuery(api.ratings.getAllBeerRatings);
  const leaderboard = useQuery(api.ratings.getLeaderboard);
  
  // Minimum loading time for the cyberpunk effect
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadComplete(true), 2500);
    return () => clearTimeout(timer);
  }, []);
  
  // Cycle through boot messages
  useEffect(() => {
    const interval = setInterval(() => {
      setBootMessage(prev => (prev + 1) % BOOT_SEQUENCE.length);
    }, 500);
    return () => clearInterval(interval);
  }, []);
  
  // Random "hacker" glitch - LaundBrew easter egg
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      // ~15% chance every 4 seconds to trigger glitch
      if (Math.random() < 0.15) {
        setHackedText(true);
        // Glitch stays for 1.5-3 seconds
        setTimeout(() => setHackedText(false), 1500 + Math.random() * 1500);
      }
    }, 4000);
    return () => clearInterval(glitchInterval);
  }, []);
  
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

  const dataReady = taps && minLoadComplete;
  
  // Delay scroll effects until after entrance animation
  useEffect(() => {
    if (dataReady) {
      const timer = setTimeout(() => setScrollReady(true), 800);
      return () => clearTimeout(timer);
    }
  }, [dataReady]);

  // Loading state - cyberpunk boot sequence
  if (!dataReady) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
        {/* Scan lines overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />
        
        {/* CRT flicker effect */}
        <motion.div
          className="absolute inset-0 bg-cyan-500/5 pointer-events-none z-10"
          animate={{ opacity: [0, 0.1, 0, 0.05, 0] }}
          transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 2 }}
        />
        
        {/* Glitch bars */}
        <motion.div
          className="absolute left-0 right-0 h-1 bg-cyan-500/50 pointer-events-none z-30"
          animate={{ 
            top: ['0%', '100%', '30%', '80%', '10%'],
            opacity: [0, 1, 0, 0.5, 0],
            scaleY: [1, 2, 1, 3, 1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <CosmicBackground />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center relative z-10 px-4"
        >
          {/* Glitchy logo */}
          <motion.div className="relative mb-8">
            <motion.div
              animate={{ 
                scale: [1, 1.02, 1],
                x: [0, -2, 2, 0],
              }}
              transition={{ 
                duration: 0.2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="text-8xl relative"
            >
              {/* Glitch layers */}
              <span className="absolute inset-0 text-cyan-400 opacity-70" style={{ clipPath: 'inset(10% 0 60% 0)', transform: 'translate(-2px, 0)' }}>🦘</span>
              <span className="absolute inset-0 text-pink-500 opacity-70" style={{ clipPath: 'inset(40% 0 20% 0)', transform: 'translate(2px, 0)' }}>🦘</span>
              <span>🦘</span>
            </motion.div>
            
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 -m-4 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(236, 72, 153, 0.2)',
                  '0 0 40px rgba(236, 72, 153, 0.3), 0 0 60px rgba(6, 182, 212, 0.2)',
                  '0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(236, 72, 153, 0.2)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          
          {/* Title with glitch */}
          <motion.h1 
            className="text-3xl md:text-4xl font-black mb-6 font-mono tracking-wider"
            animate={{ x: [0, -1, 1, 0] }}
            transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 2 }}
          >
            <span className="text-cyan-400">BASS</span>
            <span className="text-white">HOLE</span>
            <span className="text-pink-500">_</span>
            <span className="text-amber-500">BREWING</span>
          </motion.h1>
          
          {/* Terminal box */}
          <div className="bg-black/80 border border-cyan-500/50 rounded-lg p-4 max-w-md mx-auto mb-6 font-mono text-sm">
            <div className="flex items-center gap-2 mb-3 border-b border-cyan-500/30 pb-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-cyan-500/70 text-xs ml-2">basement_terminal_v2.1</span>
            </div>
            
            <div className="text-left space-y-1">
              <p className="text-green-400">$ ./boot_brewery.sh</p>
              <motion.p 
                className="text-cyan-400"
                key={bootMessage}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                &gt; {BOOT_SEQUENCE[bootMessage]}
              </motion.p>
              
              {/* Progress indicators */}
              <div className="flex items-center gap-2 mt-3 text-xs">
                <span className={taps ? 'text-green-400' : 'text-zinc-600'}>[TAP_DATA]</span>
                <span className={pipeline ? 'text-green-400' : 'text-zinc-600'}>[PIPELINE]</span>
                <span className={archive ? 'text-green-400' : 'text-zinc-600'}>[ARCHIVE]</span>
                <span className={leaderboard ? 'text-green-400' : 'text-zinc-600'}>[RATINGS]</span>
              </div>
            </div>
          </div>
          
          {/* Loading bar */}
          <div className="w-64 mx-auto">
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
              />
            </div>
            <motion.p 
              className="text-zinc-600 text-xs mt-2 font-mono"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              BREWING CONSCIOUSNESS...
            </motion.p>
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
    <motion.main 
      className="min-h-screen bg-zinc-950 overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Cyberpunk entrance scan line */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-50"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <motion.div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          initial={{ top: '0%' }}
          animate={{ top: '100%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{ boxShadow: '0 0 30px 10px rgba(6, 182, 212, 0.5)' }}
        />
      </motion.div>

      {/* Initial glitch overlay */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-40 bg-cyan-500/10"
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 0, 0.5, 0, 0.3, 0] }}
        transition={{ duration: 0.5, times: [0, 0.2, 0.3, 0.5, 0.6, 1] }}
      />

      {/* Cosmic Background */}
      <CosmicBackground />
      <BeerBubbles />

      {/* Hero */}
      <motion.section 
        style={scrollReady ? { y: heroY } : undefined}
        className="relative min-h-screen flex items-center justify-center px-4 pt-32 pb-20"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          {/* Logo with cyberpunk glitch effect */}
          <motion.div
            initial={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="relative inline-block mb-10"
          >
            {/* Glitch RGB layers */}
            <motion.div
              className="absolute inset-0 rounded-3xl overflow-hidden"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.img
                src="/logo.jpg"
                alt=""
                className="w-64 h-64 md:w-80 md:h-80 rounded-3xl object-cover opacity-70"
                style={{ filter: 'hue-rotate(90deg)' }}
                initial={{ x: -8, y: 4 }}
                animate={{ x: 0, y: 0 }}
                transition={{ duration: 0.4 }}
              />
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-3xl overflow-hidden"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.img
                src="/logo.jpg"
                alt=""
                className="w-64 h-64 md:w-80 md:h-80 rounded-3xl object-cover opacity-70"
                style={{ filter: 'hue-rotate(-90deg)' }}
                initial={{ x: 8, y: -4 }}
                animate={{ x: 0, y: 0 }}
                transition={{ duration: 0.4 }}
              />
            </motion.div>
            
            {/* Glow rings */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                boxShadow: [
                  '0 0 60px rgba(245, 158, 11, 0.3), 0 0 100px rgba(168, 85, 247, 0.2)',
                  '0 0 80px rgba(168, 85, 247, 0.3), 0 0 120px rgba(14, 165, 233, 0.2)',
                  '0 0 60px rgba(14, 165, 233, 0.3), 0 0 100px rgba(245, 158, 11, 0.2)',
                  '0 0 60px rgba(245, 158, 11, 0.3), 0 0 100px rgba(168, 85, 247, 0.2)',
                ],
              }}
              transition={{ 
                opacity: { duration: 0.5, delay: 0.3 },
                boxShadow: { duration: 4, repeat: Infinity, delay: 0.5 }
              }}
            />
            <motion.img
              src="/logo.jpg"
              alt="Bass Hole Brewing"
              className="w-64 h-64 md:w-80 md:h-80 rounded-3xl object-cover relative z-10 border-2 border-amber-500/30"
              whileHover={{ scale: 1.05, rotate: 2 }}
            />
          </motion.div>

          {/* Title with glitch entrance */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1, delay: 0.4 }}
            className="mb-6 relative"
          >
            <motion.span 
              className="block text-6xl md:text-8xl font-black tracking-tight font-display relative"
              initial={{ x: -20, skewX: -10 }}
              animate={{ x: 0, skewX: 0 }}
              transition={{ duration: 0.3, delay: 0.4, type: 'spring', stiffness: 200 }}
            >
              {/* Glitch text layers */}
              <motion.span 
                className="absolute inset-0 text-cyan-400 opacity-80"
                initial={{ x: -4, opacity: 0.8 }}
                animate={{ x: 0, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                style={{ clipPath: 'inset(10% 0 60% 0)' }}
              >
                Bass Hole
              </motion.span>
              <motion.span 
                className="absolute inset-0 text-pink-500 opacity-80"
                initial={{ x: 4, opacity: 0.8 }}
                animate={{ x: 0, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                style={{ clipPath: 'inset(40% 0 20% 0)' }}
              >
                Bass Hole
              </motion.span>
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                Bass Hole
              </span>
            </motion.span>
            <motion.span 
              className="block text-4xl md:text-6xl font-black mt-2 font-display"
              initial={{ x: 20, skewX: 10 }}
              animate={{ x: 0, skewX: 0 }}
              transition={{ duration: 0.3, delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Brewing
              </span>
            </motion.span>
          </motion.h1>

          {/* Tagline with terminal effect */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mb-6"
          >
            <motion.p 
              className="text-xl md:text-2xl text-zinc-300 font-mono"
              initial={{ filter: 'blur(4px)' }}
              animate={{ filter: 'blur(0px)' }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              <motion.span 
                className="text-cyan-400"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                $
              </motion.span>
              <span className="text-amber-500"> &gt;</span> {brewery.tagline}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-amber-500"
              >
                _
              </motion.span>
            </motion.p>
          </motion.div>

          {/* Location badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-cyan-500/30 rounded-full px-4 py-2"
          >
            <motion.span 
              className="text-cyan-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ◉
            </motion.span>
            <span className="text-zinc-300 font-mono text-sm">{brewery.location}</span>
            <span className="text-cyan-500/50">|</span>
            <span className="text-zinc-400 font-mono text-sm">EST. {brewery.established}</span>
          </motion.div>

          {/* Credits */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-zinc-600 text-sm"
          >
            <span className="text-amber-500/80">Wayne</span> + <span className="text-amber-500/80">Skippy</span> <span className="text-zinc-700">(meat suit + space kangaroo)</span>
          </motion.p>
        </motion.div>

        {/* Scroll indicator - moved outside the centered content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
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
            <p className="text-zinc-400 text-lg max-w-md mx-auto relative">
              Real-time brewery telemetry from the{' '}
              <span className="relative inline-block min-w-[100px]">
                <motion.span 
                  className={hackedText ? 'opacity-0' : 'opacity-100'}
                  animate={hackedText ? { opacity: [1, 0.3, 0] } : { opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  basement
                </motion.span>
                {hackedText && (
                  <motion.span
                    initial={{ opacity: 0, scaleX: 0.8 }}
                    animate={{ 
                      opacity: [0, 1, 0.7, 1],
                      scaleX: [0.8, 1.02, 1],
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 text-cyan-400 font-mono whitespace-nowrap"
                    style={{ 
                      textShadow: '0 0 10px rgba(6, 182, 212, 0.8), 0 0 20px rgba(6, 182, 212, 0.4)',
                    }}
                  >
                    LaundBrew™
                  </motion.span>
                )}
              </span>
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
                rating={tap.beer && beerRatings ? beerRatings[tap.beer.id] : undefined}
                onRate={(beerId) => {
                  const beer = tap.beer;
                  if (beer) {
                    setRatingBeer({ id: beerId, name: beer.name, style: beer.style });
                  }
                }}
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

      {/* Leaderboard */}
      {leaderboard && leaderboard.totalRatings > 0 && (
        <section className="relative py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.span 
                className="inline-block text-pink-400 font-display text-sm mb-4 tracking-[0.3em] uppercase"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                [ COMMUNITY RATINGS ]
              </motion.span>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-4 font-display">
                Leaderboard
              </h2>
              <p className="text-zinc-400 text-lg max-w-md mx-auto">
                {leaderboard.totalRatings} ratings from {leaderboard.raters.length} drinkers
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Top Rated Beers */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-amber-500">★</span> Top Rated Beers
                </h3>
                <div className="space-y-3">
                  {leaderboard.topBeers.slice(0, 5).map((item: any, index: number) => (
                    <motion.div
                      key={item.beer._id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800 flex items-center gap-4"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                        index === 0 ? 'bg-amber-500 text-black' :
                        index === 1 ? 'bg-zinc-400 text-black' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold truncate">{item.beer.name}</h4>
                        <p className="text-zinc-500 text-sm">{item.beer.style}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-black text-amber-500">{item.avgRating.toFixed(1)}</div>
                        <div className="text-xs text-zinc-600">{item.ratingCount} ratings</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Drinker Stats */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-pink-500">👥</span> Drinker Stats
                </h3>
                <div className="space-y-3">
                  {leaderboard.raters.slice(0, 5).map((item: any, index: number) => (
                    <motion.div
                      key={item.rater._id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-bold">{item.rater.name}</h4>
                        <span className="text-zinc-500 text-sm">{item.ratingCount} ratings</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600">
                          Avg: <span className="text-amber-500">{item.avgGiven.toFixed(1)}</span>
                        </span>
                        {item.favoriteBeer && (
                          <span className="text-zinc-600 truncate ml-2">
                            Fav: <span className="text-pink-400">{item.favoriteBeer.name}</span>
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Superlatives */}
            {leaderboard.raters.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-12"
              >
                <h3 className="text-xl font-bold text-white mb-4 text-center">🎯 Superlatives</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Most Active */}
                  {leaderboard.raters[0] && (
                    <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800 text-center">
                      <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Most Active</div>
                      <div className="text-white font-bold text-lg">{leaderboard.raters[0].rater.name}</div>
                      <div className="text-amber-500 text-sm">{leaderboard.raters[0].ratingCount} ratings</div>
                    </div>
                  )}
                  
                  {/* Toughest Critic */}
                  {(() => {
                    const sorted = [...leaderboard.raters].sort((a: any, b: any) => a.avgGiven - b.avgGiven);
                    const toughest = sorted[0];
                    return toughest ? (
                      <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800 text-center">
                        <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Toughest Critic</div>
                        <div className="text-white font-bold text-lg">{toughest.rater.name}</div>
                        <div className="text-red-400 text-sm">Avg: {toughest.avgGiven.toFixed(1)}</div>
                      </div>
                    ) : null;
                  })()}
                  
                  {/* Biggest Fan */}
                  {(() => {
                    const sorted = [...leaderboard.raters].sort((a: any, b: any) => b.avgGiven - a.avgGiven);
                    const fan = sorted[0];
                    return fan ? (
                      <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800 text-center">
                        <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Biggest Fan</div>
                        <div className="text-white font-bold text-lg">{fan.rater.name}</div>
                        <div className="text-green-400 text-sm">Avg: {fan.avgGiven.toFixed(1)}</div>
                      </div>
                    ) : null;
                  })()}
                  
                  {/* Most Reviewed Beer */}
                  {leaderboard.mostRated[0] && (
                    <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800 text-center">
                      <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Most Reviewed</div>
                      <div className="text-white font-bold text-lg truncate">{leaderboard.mostRated[0].beer.name}</div>
                      <div className="text-purple-400 text-sm">{leaderboard.mostRated[0].ratingCount} ratings</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
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

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingBeer !== null}
        onClose={() => setRatingBeer(null)}
        beer={ratingBeer}
      />
    </motion.main>
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
