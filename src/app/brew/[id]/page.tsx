"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface BrewStep {
  id: string;
  name: string;
  type: "prep" | "mash" | "boil" | "hop" | "whirlpool" | "chill" | "transfer" | "cleanup";
  duration?: number; // minutes
  temperature?: number; // °F
  notes?: string;
  ingredients?: string[];
}

interface HopAddition {
  name: string;
  amount: number;
  time: number; // minutes from end of boil
  use: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// BREW STEP TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

function generateBrewSteps(batch: {
  og?: number;
  hopsDetailed?: HopAddition[];
  mashTemp?: number;
  mashTime?: number;
  boilTime?: number;
}): BrewStep[] {
  const steps: BrewStep[] = [];
  const boilTime = batch.boilTime || 60;
  const mashTemp = batch.mashTemp || 152;
  const mashTime = batch.mashTime || 60;
  
  // Prep
  steps.push({
    id: "prep",
    name: "Prep & Setup",
    type: "prep",
    duration: 15,
    notes: "Gather ingredients, sanitize equipment, measure water",
  });
  
  // Heat strike water
  steps.push({
    id: "heat-strike",
    name: "Heat Strike Water",
    type: "prep",
    duration: 20,
    temperature: mashTemp + 12, // Strike temp ~12°F higher
    notes: `Heat to ${mashTemp + 12}°F for ${mashTemp}°F mash`,
  });
  
  // Mash in
  steps.push({
    id: "mash-in",
    name: "Mash In",
    type: "mash",
    duration: 5,
    temperature: mashTemp,
    notes: "Slowly add grain while stirring. Check temp.",
  });
  
  // Mash rest
  steps.push({
    id: "mash",
    name: "Mash Rest",
    type: "mash",
    duration: mashTime,
    temperature: mashTemp,
    notes: `Hold at ${mashTemp}°F. Stir occasionally.`,
  });
  
  // Mash out (optional)
  steps.push({
    id: "mash-out",
    name: "Mash Out",
    type: "mash",
    duration: 10,
    temperature: 168,
    notes: "Raise to 168°F to stop enzyme activity",
  });
  
  // Remove grain / start boil
  steps.push({
    id: "remove-grain",
    name: "Remove Grain Bag",
    type: "prep",
    duration: 5,
    notes: "Let drain. Squeeze gently for extra wort.",
  });
  
  // Heat to boil
  steps.push({
    id: "heat-boil",
    name: "Heat to Boil",
    type: "prep",
    duration: 15,
    notes: "Take pre-boil gravity sample!",
  });
  
  // Generate hop addition steps
  const hops = batch.hopsDetailed || [];
  const boilHops = hops.filter(h => h.use === "Boil" && h.time > 0).sort((a, b) => b.time - a.time);
  const whirlpoolHops = hops.filter(h => h.use === "Whirlpool");
  
  // Start boil step
  steps.push({
    id: "boil-start",
    name: "Start Boil Timer",
    type: "boil",
    duration: 0,
    notes: `${boilTime} minute boil. Watch for boil-over!`,
  });
  
  // Hop additions during boil
  let lastTime = boilTime;
  for (const hop of boilHops) {
    const waitTime = lastTime - hop.time;
    if (waitTime > 0) {
      steps.push({
        id: `boil-wait-${hop.time}`,
        name: `Boil (${hop.time} min remaining)`,
        type: "boil",
        duration: waitTime,
        notes: `Wait for ${hop.time} minute mark`,
      });
    }
    steps.push({
      id: `hop-${hop.time}-${hop.name}`,
      name: `Add ${hop.name}`,
      type: "hop",
      duration: 1,
      ingredients: [`${hop.amount} oz ${hop.name}`],
      notes: `${hop.time} minute addition`,
    });
    lastTime = hop.time;
  }
  
  // Final boil stretch to 0
  if (lastTime > 0) {
    steps.push({
      id: "boil-final",
      name: "Final Boil",
      type: "boil",
      duration: lastTime,
      notes: "Almost done! Prepare chiller.",
    });
  }
  
  // Flame out
  steps.push({
    id: "flame-out",
    name: "Flame Out",
    type: "boil",
    duration: 0,
    notes: "Kill the heat. Start whirlpool or chill.",
  });
  
  // Whirlpool hops
  if (whirlpoolHops.length > 0) {
    steps.push({
      id: "whirlpool",
      name: "Whirlpool Hops",
      type: "whirlpool",
      duration: 15,
      ingredients: whirlpoolHops.map(h => `${h.amount} oz ${h.name}`),
      notes: "Add hops, let steep 15 min around 180°F",
    });
  }
  
  // Chill
  steps.push({
    id: "chill",
    name: "Chill Wort",
    type: "chill",
    duration: 20,
    temperature: 68,
    notes: "Chill to pitching temp. Take OG reading!",
  });
  
  // Transfer
  steps.push({
    id: "transfer",
    name: "Transfer to Fermenter",
    type: "transfer",
    duration: 10,
    notes: "Leave trub behind. Aerate wort.",
  });
  
  // Pitch yeast
  steps.push({
    id: "pitch",
    name: "Pitch Yeast",
    type: "transfer",
    duration: 5,
    notes: "Pitch yeast. Seal fermenter. Attach airlock.",
  });
  
  // Cleanup
  steps.push({
    id: "cleanup",
    name: "Cleanup",
    type: "cleanup",
    duration: 30,
    notes: "Clean and sanitize all equipment. You did it! 🍺",
  });
  
  return steps;
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function Timer({ 
  duration, 
  isRunning, 
  onComplete,
  onTick,
}: { 
  duration: number; // seconds
  isRunning: boolean;
  onComplete: () => void;
  onTick?: (remaining: number) => void;
}) {
  const [remaining, setRemaining] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    setRemaining(duration);
  }, [duration]);
  
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1;
        if (onTick) onTick(next);
        if (next <= 0) {
          clearInterval(interval);
          // Play alarm sound
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
          // Browser notification
          if (Notification.permission === "granted") {
            new Notification("⏰ Timer Complete!", { body: "Time for the next step!" });
          }
          onComplete();
          return 0;
        }
        return next;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, onComplete, onTick]);
  
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;
  
  return (
    <div className="relative">
      {/* Audio element for alarm */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+ZjHhwaG10g5GZmoyBd3N5g42UlI6FeXR3f4mRko+JgXt4e4KKjo+MhoF8en2Ch4qLiYaCfnx+goaIiYeEgH59f4KFh4aEgn9+foCChISDgYB/fn+AgYKCgYGAf39/gIGBgYGAf39/f4CAgICAf39/f4CAgIB/f39/f4CAgH9/f39/f4B/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/fw==" type="audio/wav" />
      </audio>
      
      {/* Progress ring */}
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="#27272a"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke={remaining <= 60 ? "#ef4444" : "#f59e0b"}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 88}
            strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
            className="transition-all duration-1000"
          />
        </svg>
        
        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-5xl font-mono font-bold ${remaining <= 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-sm text-zinc-500 mt-1">
            {isRunning ? "RUNNING" : "PAUSED"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function BrewDayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const batch = useQuery(api.batches.get, { id: id as Id<"beers"> });
  const recipe = useQuery(api.recipes.get, { 
    id: batch?.recipeId as Id<"recipes"> 
  }, { enabled: !!batch?.recipeId });
  const logMeasurement = useMutation(api.batches.logMeasurement);
  const updateStatus = useMutation(api.batches.updateStatus);
  
  // State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0); // Force timer reset
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [measurements, setMeasurements] = useState({
    preBoilGravity: "",
    preBoilVolume: "",
    og: "",
    mashPh: "",
  });
  
  // Request notification permission on mount
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);
  
  // Generate brew steps from recipe
  const brewSteps = recipe ? generateBrewSteps({
    og: recipe.calculatedOg,
    hopsDetailed: recipe.hopsDetailed as HopAddition[],
    mashTemp: recipe.mashTemp,
    mashTime: recipe.mashTime,
    boilTime: recipe.boilTime,
  }) : [];
  
  const currentStep = brewSteps[currentStepIndex];
  const progress = brewSteps.length > 0 ? ((currentStepIndex + 1) / brewSteps.length) * 100 : 0;
  
  // Navigation
  const goToNextStep = useCallback(() => {
    if (currentStepIndex < brewSteps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep?.id]));
      setCurrentStepIndex(prev => prev + 1);
      setTimerRunning(false);
      setTimerKey(prev => prev + 1);
    }
  }, [currentStepIndex, brewSteps.length, currentStep?.id]);
  
  const goToPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setTimerRunning(false);
      setTimerKey(prev => prev + 1);
    }
  }, [currentStepIndex]);
  
  const handleTimerComplete = useCallback(() => {
    setTimerRunning(false);
    // Auto-advance after short delay
    setTimeout(() => {
      goToNextStep();
    }, 2000);
  }, [goToNextStep]);
  
  // Log measurement
  const handleLogMeasurement = async (type: "preBoilGravity" | "preBoilVolume" | "og" | "mashPh", value: string) => {
    if (!value || !batch) return;
    await logMeasurement({
      id: id as Id<"beers">,
      type,
      value: parseFloat(value),
    });
    setMeasurements(prev => ({ ...prev, [type]: "" }));
  };
  
  // Start brewing
  const handleStartBrewing = async () => {
    if (batch?.status === "planning") {
      await updateStatus({
        id: id as Id<"beers">,
        status: "brewing",
      });
    }
  };
  
  // Loading state
  if (!batch || !recipe) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🍺
        </motion.div>
      </main>
    );
  }
  
  // Step type colors
  const stepColors: Record<string, { bg: string; border: string; text: string }> = {
    prep: { bg: "bg-zinc-500/20", border: "border-zinc-500/50", text: "text-zinc-400" },
    mash: { bg: "bg-amber-500/20", border: "border-amber-500/50", text: "text-amber-400" },
    boil: { bg: "bg-red-500/20", border: "border-red-500/50", text: "text-red-400" },
    hop: { bg: "bg-green-500/20", border: "border-green-500/50", text: "text-green-400" },
    whirlpool: { bg: "bg-cyan-500/20", border: "border-cyan-500/50", text: "text-cyan-400" },
    chill: { bg: "bg-blue-500/20", border: "border-blue-500/50", text: "text-blue-400" },
    transfer: { bg: "bg-purple-500/20", border: "border-purple-500/50", text: "text-purple-400" },
    cleanup: { bg: "bg-green-500/20", border: "border-green-500/50", text: "text-green-400" },
  };
  
  const colors = currentStep ? stepColors[currentStep.type] : stepColors.prep;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href={`/batches/${id}`} className="text-zinc-400 hover:text-white">
              ← Exit
            </Link>
            <div className="text-center">
              <h1 className="font-bold text-amber-500">{batch.name}</h1>
              <p className="text-xs text-zinc-500">Batch #{batch.batchNo}</p>
            </div>
            <div className="text-right text-xs text-zinc-500">
              {currentStepIndex + 1} / {brewSteps.length}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        
        {/* Current Step Card */}
        <AnimatePresence mode="wait">
          {currentStep && (
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className={`${colors.bg} border ${colors.border} rounded-2xl p-6 mb-6`}
            >
              {/* Step Type Badge */}
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${colors.bg} ${colors.text} border ${colors.border} mb-4`}>
                {currentStep.type}
              </div>
              
              {/* Step Name */}
              <h2 className="text-3xl font-bold text-white mb-2">{currentStep.name}</h2>
              
              {/* Temperature if applicable */}
              {currentStep.temperature && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-4xl">🌡️</span>
                  <span className="text-3xl font-mono font-bold text-amber-400">
                    {currentStep.temperature}°F
                  </span>
                </div>
              )}
              
              {/* Notes */}
              {currentStep.notes && (
                <p className="text-zinc-300 text-lg mb-4">{currentStep.notes}</p>
              )}
              
              {/* Ingredients */}
              {currentStep.ingredients && currentStep.ingredients.length > 0 && (
                <div className="bg-zinc-900/50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-bold text-zinc-500 uppercase mb-2">Add Now:</h3>
                  <ul className="space-y-1">
                    {currentStep.ingredients.map((ing, i) => (
                      <li key={i} className="text-lg text-green-400 font-mono">
                        🌿 {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Timer */}
              {currentStep.duration && currentStep.duration > 0 && (
                <div className="mt-6">
                  <Timer
                    key={timerKey}
                    duration={currentStep.duration * 60}
                    isRunning={timerRunning}
                    onComplete={handleTimerComplete}
                  />
                  
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
                        timerRunning
                          ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-black'
                      }`}
                    >
                      {timerRunning ? "⏸ PAUSE" : "▶ START"}
                    </button>
                    <button
                      onClick={() => {
                        setTimerRunning(false);
                        setTimerKey(prev => prev + 1);
                      }}
                      className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold"
                    >
                      ↺ RESET
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Quick Measurements */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-bold text-zinc-500 uppercase mb-3">Quick Log</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500">Pre-Boil SG</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.001"
                  value={measurements.preBoilGravity}
                  onChange={e => setMeasurements(prev => ({ ...prev, preBoilGravity: e.target.value }))}
                  placeholder="1.045"
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm"
                />
                <button
                  onClick={() => handleLogMeasurement("preBoilGravity", measurements.preBoilGravity)}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-bold text-sm"
                >
                  Log
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500">OG</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.001"
                  value={measurements.og}
                  onChange={e => setMeasurements(prev => ({ ...prev, og: e.target.value }))}
                  placeholder="1.055"
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm"
                />
                <button
                  onClick={() => handleLogMeasurement("og", measurements.og)}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-bold text-sm"
                >
                  Log
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Step Timeline */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-bold text-zinc-500 uppercase mb-3">Steps</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {brewSteps.map((step, i) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = i === currentStepIndex;
              const stepColor = stepColors[step.type];
              
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setCurrentStepIndex(i);
                    setTimerRunning(false);
                    setTimerKey(prev => prev + 1);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                    isCurrent 
                      ? `${stepColor.bg} ${stepColor.border} border` 
                      : 'bg-zinc-800/50 hover:bg-zinc-800'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted 
                      ? 'bg-green-500 text-black' 
                      : isCurrent 
                        ? `${stepColor.bg} ${stepColor.text} border ${stepColor.border}` 
                        : 'bg-zinc-700 text-zinc-400'
                  }`}>
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${isCurrent ? 'text-white' : 'text-zinc-400'}`}>
                      {step.name}
                    </div>
                    {step.duration && (
                      <div className="text-xs text-zinc-500">{step.duration} min</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={goToPrevStep}
            disabled={currentStepIndex === 0}
            className="flex-1 py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 font-bold text-lg transition-all"
          >
            ← Previous
          </button>
          <button
            onClick={goToNextStep}
            disabled={currentStepIndex === brewSteps.length - 1}
            className="flex-1 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-900 disabled:text-zinc-600 text-black font-bold text-lg transition-all"
          >
            Next →
          </button>
        </div>
        
        {/* Complete Session */}
        {currentStepIndex === brewSteps.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Link
              href={`/batches/${id}`}
              onClick={() => updateStatus({ id: id as Id<"beers">, status: "fermenting" })}
              className="block w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-lg text-center transition-all"
            >
              🍺 Complete Brew Day
            </Link>
          </motion.div>
        )}
        
      </div>
    </main>
  );
}
