"use client";

import { use, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminNav } from "@/components/AdminNav";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════════════════════
// SKIPPY'S PERSONALITY - Dynamic commentary
// ═══════════════════════════════════════════════════════════════════════════

const SKIPPY_MESSAGES = {
  preMash: [
    "Alright mate, let's get this grain party started.",
    "Time to make some wort magic happen.",
    "Got your ingredients lined up? Let's do this.",
    "The mash awaits. Ready when you are, legend.",
    "Everything measured out? Let's brew some liquid gold.",
  ],
  mashStart: [
    "And we're mashing! Now we wait. Science is happening.",
    "Grain's in, enzymes are doing their thing. Beautiful.",
    "The conversion begins. Starch → Sugar → Beer. Nature is wild.",
    "Mash is on! Time to let those enzymes work their magic.",
    "Locked in. The mash is where the magic starts.",
  ],
  mashMid: [
    "Looking good. Give it a stir if you're feeling anxious.",
    "Halfway there. The wort's coming together nicely.",
    "Enzymes are crushing it right now. Literally.",
    "Keep that temp steady. You're doing great.",
    "This is the part where patience pays off.",
  ],
  mashEnd: [
    "Mash is done! Time to move on.",
    "Conversion complete. You've got wort, baby.",
    "That's a wrap on the mash. Onwards!",
    "Nailed it. Ready for the next phase?",
  ],
  boilStart: [
    "Boil time! This is where hops enter the chat.",
    "Rolling boil achieved. Let's bitter this thing up.",
    "The boil is ON. Watch for the hot break.",
    "Boiling! Time to make it hoppy.",
  ],
  hopAddition: [
    "Hops in! Watch that foam.",
    "Hop drop! Smells amazing already.",
    "In they go! The aroma is gonna be unreal.",
    "Hops deployed. This beer's gonna slap.",
    "Another addition down. Building those layers.",
  ],
  boilEnd: [
    "Boil's done! Kill the heat.",
    "That's 60 minutes. Flame out!",
    "Boil complete. Time to chill... literally.",
  ],
  hopstand: [
    "Hopstand time. Let those oils infuse.",
    "Whirlpool hops going in. Maximum aroma mode.",
    "This is where NEIPAs get their juice.",
  ],
  complete: [
    "BOOM. Brew day complete. You absolute legend.",
    "And that's a wrap! Another batch in the fermenter.",
    "Nailed it. Now the yeast takes over. Great work!",
    "Done and done. Crack a cold one, you've earned it.",
    "Brew day success! Can't wait to taste this one.",
  ],
  waiting: [
    "Still got time. Maybe grab a snack?",
    "The waiting game. Classic brew day vibes.",
    "Patience, grasshopper.",
    "Time moves slow when you're watching wort.",
    "Almost there. Hang tight.",
    "You could clean something while you wait...",
    "Or just vibe. Vibing is valid.",
  ],
};

function getSkippyMessage(category: keyof typeof SKIPPY_MESSAGES): string {
  const messages = SKIPPY_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type BrewPhase = "pre-mash" | "mash" | "mashout" | "pre-boil" | "boil" | "hopstand" | "complete";

interface HopAddition {
  name: string;
  amount: number;
  alpha: number;
  time: number;
  use: string;
  done?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function BrewTimer({ 
  duration, 
  onComplete,
  label,
  sublabel,
  color = "amber"
}: { 
  duration: number; 
  onComplete: () => void;
  label: string;
  sublabel?: string;
  color?: "amber" | "cyan" | "purple";
}) {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [skipMessage, setSkipMessage] = useState(getSkippyMessage("waiting"));
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          audioRef.current?.play();
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, onComplete]);
  
  // Rotate Skippy messages every 45 seconds
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSkipMessage(getSkippyMessage("waiting"));
    }, 45000);
    return () => clearInterval(interval);
  }, [isRunning]);
  
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;
  
  const colors = {
    amber: { ring: "stroke-amber-500", bg: "bg-amber-500", text: "text-amber-400", glow: "shadow-amber-500/30" },
    cyan: { ring: "stroke-cyan-500", bg: "bg-cyan-500", text: "text-cyan-400", glow: "shadow-cyan-500/30" },
    purple: { ring: "stroke-purple-500", bg: "bg-purple-500", text: "text-purple-400", glow: "shadow-purple-500/30" },
  };
  const c = colors[color];
  
  return (
    <div className="flex flex-col items-center">
      {/* Alarm audio */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+ZjHhwaG10g5GZmoyBd3N5g42UlI6FeXR3f4mRko+JgXt4e4KKjo+MhoF8en2Ch4qLiYaCfnx+goaIiYeEgH59f4KFh4aEgn9+foCChISDgYB/fn+AgYKCgYGAf39/gIGBgYGAf39/f4CAgICAf39/f4CAgH9/f39/f4B/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/fw==" type="audio/wav" />
      </audio>
      
      {/* Label */}
      <div className="mb-6 text-center">
        <h2 className={`text-2xl font-mono font-bold ${c.text} tracking-wider`}>{label}</h2>
        {sublabel && <p className="text-zinc-500 text-sm mt-1">{sublabel}</p>}
      </div>
      
      {/* Timer Ring */}
      <div className="relative w-56 h-56 mb-6">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background ring */}
          <circle
            cx="112"
            cy="112"
            r="100"
            stroke="#27272a"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress ring */}
          <circle
            cx="112"
            cy="112"
            r="100"
            className={c.ring}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={628}
            strokeDashoffset={628 - (628 * progress) / 100}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        
        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-5xl font-mono font-bold ${c.text} tabular-nums`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <div className="text-zinc-600 text-xs mt-2 uppercase tracking-widest">
            {isRunning ? "remaining" : "ready"}
          </div>
        </div>
      </div>
      
      {/* Control Button */}
      {!isRunning ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsRunning(true)}
          className={`px-8 py-3 ${c.bg} text-black font-bold font-mono tracking-wider rounded-lg shadow-lg ${c.glow} transition-all`}
        >
          START TIMER
        </motion.button>
      ) : (
        <div className="text-center">
          <p className="text-zinc-400 text-sm italic max-w-xs">"{skipMessage}"</p>
          <p className="text-zinc-600 text-xs mt-2">— Skippy</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOIL TRACKER - Master timer + hop countdown
// ═══════════════════════════════════════════════════════════════════════════

function BoilTracker({
  boilTime,
  hops,
  onComplete,
}: {
  boilTime: number;
  hops: HopAddition[];
  onComplete: () => void;
}) {
  const [remaining, setRemaining] = useState(boilTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedHops, setCompletedHops] = useState<Set<number>>(new Set());
  const [skipMessage, setSkipMessage] = useState(getSkippyMessage("boilStart"));
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Sort hops by time descending (60 min first)
  const sortedHops = useMemo(() => 
    [...hops].filter(h => h.use === "Boil").sort((a, b) => b.time - a.time),
    [hops]
  );
  
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          audioRef.current?.play();
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, onComplete]);
  
  // Calculate time remaining in boil
  const boilMinutesRemaining = Math.ceil(remaining / 60);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  
  // Find next hop addition
  const nextHop = useMemo(() => {
    return sortedHops.find((h, i) => !completedHops.has(i) && h.time >= boilMinutesRemaining);
  }, [sortedHops, completedHops, boilMinutesRemaining]);
  
  // Time until next addition
  const timeToNext = nextHop ? (remaining - (nextHop.time * 60)) : null;
  const nextMinutes = timeToNext !== null ? Math.floor(timeToNext / 60) : 0;
  const nextSeconds = timeToNext !== null ? timeToNext % 60 : 0;
  
  const markHopDone = (index: number) => {
    setCompletedHops(prev => new Set([...prev, index]));
    setSkipMessage(getSkippyMessage("hopAddition"));
  };
  
  // Rotate messages
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSkipMessage(getSkippyMessage("waiting"));
    }, 60000);
    return () => clearInterval(interval);
  }, [isRunning]);
  
  return (
    <div className="w-full max-w-md mx-auto">
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+ZjHhwaG10g5GZmoyBd3N5g42UlI6FeXR3f4mRko+JgXt4e4KKjo+MhoF8en2Ch4qLiYaCfnx+goaIiYeEgH59f4KFh4aEgn9+foCChISDgYB/fn+AgYKCgYGAf39/gIGBgYGAf39/f4CAgICAf39/f4CAgH9/f39/f4B/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/fw==" type="audio/wav" />
      </audio>
      
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-mono font-bold text-red-400 tracking-wider">BOIL</h2>
        <p className="text-zinc-500 text-sm">{boilTime} minute boil</p>
      </div>
      
      {/* Master Timer */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-zinc-500 text-xs uppercase tracking-widest">Master Timer</span>
          <span className="text-red-400 font-mono text-4xl font-bold tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 to-orange-500"
            initial={{ width: "0%" }}
            animate={{ width: `${((boilTime * 60 - remaining) / (boilTime * 60)) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
      
      {/* Next Addition Alert */}
      {isRunning && nextHop && timeToNext !== null && timeToNext > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-amber-400 text-xs uppercase tracking-widest">Next Addition</span>
              <p className="text-white font-bold">{nextHop.amount}oz {nextHop.name}</p>
              <p className="text-zinc-400 text-sm">@ {nextHop.time} min</p>
            </div>
            <div className="text-right">
              <span className="text-amber-400 font-mono text-3xl font-bold tabular-nums">
                {String(nextMinutes).padStart(2, "0")}:{String(nextSeconds).padStart(2, "0")}
              </span>
              <p className="text-zinc-500 text-xs">until add</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Hop Schedule */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Hop Schedule</h3>
        <div className="space-y-2">
          {sortedHops.map((hop, index) => {
            const isDone = completedHops.has(index);
            const isNext = nextHop === hop;
            const isPast = boilMinutesRemaining < hop.time;
            
            return (
              <motion.div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  isDone 
                    ? "bg-green-500/10 border border-green-500/30" 
                    : isNext 
                      ? "bg-amber-500/10 border border-amber-500/30" 
                      : "bg-zinc-800/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => markHopDone(index)}
                    disabled={isDone}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      isDone 
                        ? "bg-green-500 border-green-500 text-black" 
                        : "border-zinc-600 hover:border-amber-500"
                    }`}
                  >
                    {isDone && "✓"}
                  </button>
                  <div>
                    <span className={`font-bold ${isDone ? "text-zinc-500 line-through" : "text-white"}`}>
                      {hop.amount}oz {hop.name}
                    </span>
                    <span className="text-zinc-500 text-sm ml-2">({hop.alpha}% AA)</span>
                  </div>
                </div>
                <div className={`font-mono text-sm ${isDone ? "text-green-400" : isNext ? "text-amber-400" : "text-zinc-400"}`}>
                  {isDone ? "DONE" : `${hop.time} min`}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Start / Skippy Message */}
      <div className="mt-6 text-center">
        {!isRunning ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsRunning(true)}
            className="px-8 py-3 bg-red-500 text-white font-bold font-mono tracking-wider rounded-lg shadow-lg shadow-red-500/30 transition-all"
          >
            START BOIL
          </motion.button>
        ) : (
          <div>
            <p className="text-zinc-400 text-sm italic">"{skipMessage}"</p>
            <p className="text-zinc-600 text-xs mt-1">— Skippy</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INGREDIENT CHECKLIST
// ═══════════════════════════════════════════════════════════════════════════

function IngredientChecklist({
  title,
  subtitle,
  items,
  onComplete,
  skipMessage,
}: {
  title: string;
  subtitle?: string;
  items: Array<{ label: string; amount: string; category?: string }>;
  onComplete: () => void;
  skipMessage: string;
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  
  const allChecked = checked.size === items.length;
  
  const toggleItem = (index: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };
  
  // Group items by category
  const grouped = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    items.forEach(item => {
      const cat = item.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [items]);
  
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-mono font-bold text-cyan-400 tracking-wider">{title}</h2>
        {subtitle && <p className="text-zinc-500 text-sm mt-1">{subtitle}</p>}
      </div>
      
      {/* Skippy intro */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
        <p className="text-zinc-300 text-sm italic">"{skipMessage}"</p>
        <p className="text-zinc-600 text-xs mt-1">— Skippy</p>
      </div>
      
      {/* Grouped Items */}
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="mb-4">
          <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-2 px-1">{category}</h3>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
            {categoryItems.map((item, index) => {
              const globalIndex = items.indexOf(item);
              const isChecked = checked.has(globalIndex);
              
              return (
                <motion.button
                  key={index}
                  onClick={() => toggleItem(globalIndex)}
                  className={`w-full flex items-center gap-4 p-4 border-b border-zinc-800 last:border-0 transition-all ${
                    isChecked ? "bg-green-500/5" : "hover:bg-zinc-800/50"
                  }`}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    isChecked 
                      ? "bg-green-500 border-green-500 text-black" 
                      : "border-zinc-600"
                  }`}>
                    {isChecked && "✓"}
                  </div>
                  <span className={`flex-1 text-left font-medium ${isChecked ? "text-zinc-500 line-through" : "text-white"}`}>
                    {item.label}
                  </span>
                  <span className={`font-mono text-sm ${isChecked ? "text-zinc-600" : "text-amber-400"}`}>
                    {item.amount}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Continue Button */}
      <motion.button
        whileHover={allChecked ? { scale: 1.02 } : {}}
        whileTap={allChecked ? { scale: 0.98 } : {}}
        onClick={onComplete}
        disabled={!allChecked}
        className={`w-full mt-6 px-8 py-4 font-bold font-mono tracking-wider rounded-lg transition-all ${
          allChecked 
            ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30" 
            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
        }`}
      >
        {allChecked ? "LET'S MASH →" : `CHECK ALL ITEMS (${checked.size}/${items.length})`}
      </motion.button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN BREW DAY PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function BrewDayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const batch = useQuery(api.batches.getWithLogs, { id: id as Id<"beers"> });
  const [phase, setPhase] = useState<BrewPhase>("pre-mash");
  const [completeMessage, setCompleteMessage] = useState("");
  
  // Determine if we have optional phases
  const hasMashout = batch?.mashoutTime && batch.mashoutTime > 0;
  const hopstandHops = batch?.hopsDetailed?.filter(h => 
    h.use === "Whirlpool" || h.use === "Hopstand"
  ) || [];
  const hasHopstand = hopstandHops.length > 0 || (batch?.hopstandTime && batch.hopstandTime > 0);
  const boilHops = batch?.hopsDetailed?.filter(h => h.use === "Boil") || [];
  
  // Build checklist items for pre-mash
  const preMashItems = useMemo(() => {
    if (!batch) return [];
    
    const items: Array<{ label: string; amount: string; category: string }> = [];
    
    // Fermentables
    batch.fermentables?.forEach(f => {
      items.push({ 
        label: f.name, 
        amount: `${f.amount} lb`, 
        category: "Fermentables" 
      });
    });
    
    // Water additions
    if (batch.waterProfile?.gypsum) {
      items.push({ label: "Gypsum (CaSO₄)", amount: `${batch.waterProfile.gypsum}g`, category: "Water Chemistry" });
    }
    if (batch.waterProfile?.cacl2) {
      items.push({ label: "Calcium Chloride", amount: `${batch.waterProfile.cacl2}g`, category: "Water Chemistry" });
    }
    if (batch.waterProfile?.lacticAcid) {
      items.push({ label: "Lactic Acid 88%", amount: `${batch.waterProfile.lacticAcid}ml`, category: "Water Chemistry" });
    }
    
    return items;
  }, [batch]);
  
  if (!batch) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          🦘
        </motion.div>
      </main>
    );
  }
  
  const mashTime = batch.mashTime || 60;
  const mashoutTime = batch.mashoutTime || 10;
  const boilTime = batch.boilTime || 60;
  const hopstandTime = batch.hopstandTime || 20;
  
  const advancePhase = () => {
    switch (phase) {
      case "pre-mash":
        setPhase("mash");
        break;
      case "mash":
        setPhase(hasMashout ? "mashout" : "pre-boil");
        break;
      case "mashout":
        setPhase("pre-boil");
        break;
      case "pre-boil":
        setPhase("boil");
        break;
      case "boil":
        setPhase(hasHopstand ? "hopstand" : "complete");
        if (!hasHopstand) setCompleteMessage(getSkippyMessage("complete"));
        break;
      case "hopstand":
        setPhase("complete");
        setCompleteMessage(getSkippyMessage("complete"));
        break;
    }
  };
  
  return (
    <AdminGuard>
      <main className="min-h-screen bg-zinc-950 text-white">
        <AdminNav />
        
        {/* Brew Day Header */}
        <header className="sticky top-14 z-40 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href={`/batches/${id}`} className="text-zinc-500 hover:text-white text-sm">
                ← Exit
              </Link>
              <div className="text-center">
                <h1 className="font-bold text-amber-500 font-mono">{batch.name}</h1>
                <p className="text-xs text-zinc-500">Batch #{batch.batchNo} • {batch.style}</p>
              </div>
              <div className="text-right text-xs text-zinc-600 font-mono uppercase">
                {phase.replace("-", " ")}
              </div>
            </div>
          </div>
          
          {/* Phase indicator */}
          <div className="max-w-2xl mx-auto px-4 pb-3">
            <div className="flex gap-1">
              {["pre-mash", "mash", ...(hasMashout ? ["mashout"] : []), "boil", ...(hasHopstand ? ["hopstand"] : []), "complete"].map((p, i, arr) => (
                <div
                  key={p}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    arr.indexOf(phase) >= i ? "bg-amber-500" : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {/* PRE-MASH */}
            {phase === "pre-mash" && (
              <motion.div
                key="pre-mash"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <IngredientChecklist
                  title="PRE-MASH"
                  subtitle={`Strike water: ${batch.mashTemp ? batch.mashTemp + 12 : 164}°F → Target: ${batch.mashTemp || 152}°F`}
                  items={preMashItems}
                  onComplete={() => setPhase("mash")}
                  skipMessage={getSkippyMessage("preMash")}
                />
              </motion.div>
            )}
            
            {/* MASH */}
            {phase === "mash" && (
              <motion.div
                key="mash"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <BrewTimer
                  duration={mashTime * 60}
                  onComplete={advancePhase}
                  label="MASH"
                  sublabel={`Target: ${batch.mashTemp || 152}°F`}
                  color="amber"
                />
              </motion.div>
            )}
            
            {/* MASHOUT */}
            {phase === "mashout" && hasMashout && (
              <motion.div
                key="mashout"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <BrewTimer
                  duration={mashoutTime * 60}
                  onComplete={advancePhase}
                  label="MASHOUT"
                  sublabel="Raise to 168°F"
                  color="amber"
                />
              </motion.div>
            )}
            
            {/* PRE-BOIL */}
            {phase === "pre-boil" && (
              <motion.div
                key="pre-boil"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <h2 className="text-2xl font-mono font-bold text-red-400 tracking-wider mb-4">READY TO BOIL?</h2>
                <p className="text-zinc-400 mb-6">
                  Remove grain, bring to a rolling boil.<br/>
                  You've got {boilHops.length} hop addition{boilHops.length !== 1 ? "s" : ""} coming up.
                </p>
                
                {/* Quick hop preview */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mb-6 text-left">
                  <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Hop Schedule</h3>
                  {boilHops.sort((a, b) => b.time - a.time).map((hop, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
                      <span className="text-white">{hop.amount}oz {hop.name}</span>
                      <span className="text-amber-400 font-mono">{hop.time} min</span>
                    </div>
                  ))}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPhase("boil")}
                  className="px-8 py-4 bg-red-500 text-white font-bold font-mono tracking-wider rounded-lg shadow-lg shadow-red-500/30"
                >
                  START BOIL →
                </motion.button>
              </motion.div>
            )}
            
            {/* BOIL */}
            {phase === "boil" && (
              <motion.div
                key="boil"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <BoilTracker
                  boilTime={boilTime}
                  hops={batch.hopsDetailed || []}
                  onComplete={advancePhase}
                />
              </motion.div>
            )}
            
            {/* HOPSTAND */}
            {phase === "hopstand" && hasHopstand && (
              <motion.div
                key="hopstand"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-mono font-bold text-purple-400 tracking-wider">HOPSTAND</h2>
                  <p className="text-zinc-500 text-sm mt-1">Add whirlpool hops, let steep</p>
                </div>
                
                {hopstandHops.length > 0 && (
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mb-6">
                    <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Whirlpool Hops</h3>
                    {hopstandHops.map((hop, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
                        <span className="text-white">{hop.amount}oz {hop.name}</span>
                        <span className="text-purple-400 font-mono">{hop.alpha}% AA</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <BrewTimer
                  duration={hopstandTime * 60}
                  onComplete={advancePhase}
                  label="STEEPING"
                  sublabel="Let those aromatics shine"
                  color="purple"
                />
              </motion.div>
            )}
            
            {/* COMPLETE */}
            {phase === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="text-8xl mb-6"
                >
                  🍺
                </motion.div>
                <h2 className="text-3xl font-mono font-bold text-green-400 tracking-wider mb-4">
                  BREW DAY COMPLETE
                </h2>
                <p className="text-zinc-400 text-lg mb-2">"{completeMessage}"</p>
                <p className="text-zinc-600 text-sm mb-8">— Skippy</p>
                
                <div className="space-y-3">
                  <Link
                    href={`/batches/${id}`}
                    className="block px-8 py-3 bg-green-500 text-black font-bold font-mono tracking-wider rounded-lg"
                  >
                    VIEW BATCH →
                  </Link>
                  <Link
                    href="/batches"
                    className="block px-8 py-3 bg-zinc-800 text-zinc-300 font-mono tracking-wider rounded-lg"
                  >
                    ALL BATCHES
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </AdminGuard>
  );
}
