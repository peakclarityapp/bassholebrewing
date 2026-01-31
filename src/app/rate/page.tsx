"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Id } from "../../../convex/_generated/dataModel";

export default function RatePage() {
  const [raterName, setRaterName] = useState<string>("");
  const [raterId, setRaterId] = useState<Id<"raters"> | null>(null);
  const [selectedBeer, setSelectedBeer] = useState<any>(null);
  const [score, setScore] = useState<number>(3.0);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);

  const beers = useQuery(api.ratings.getBeersToRate);
  const getOrCreateRater = useMutation(api.ratings.getOrCreateRater);
  const submitRating = useMutation(api.ratings.submitRating);

  // Check localStorage for existing rater
  useEffect(() => {
    const stored = localStorage.getItem("basshole_rater");
    if (stored) {
      const { name, id } = JSON.parse(stored);
      setRaterName(name);
      setRaterId(id);
    } else {
      setShowNameInput(true);
    }
  }, []);

  const handleNameSubmit = async () => {
    if (!raterName.trim()) return;
    const id = await getOrCreateRater({ name: raterName.trim() });
    setRaterId(id);
    localStorage.setItem("basshole_rater", JSON.stringify({ name: raterName.trim(), id }));
    setShowNameInput(false);
  };

  const handleSubmitRating = async () => {
    if (!selectedBeer || !raterId) return;
    await submitRating({
      beerId: selectedBeer._id,
      raterId,
      score,
      note: note.trim() || undefined,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedBeer(null);
      setScore(3.0);
      setNote("");
    }, 2000);
  };

  const changeRater = () => {
    localStorage.removeItem("basshole_rater");
    setRaterId(null);
    setRaterName("");
    setShowNameInput(true);
  };

  // Name input screen
  if (showNameInput) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 rounded-2xl p-8 max-w-md w-full border border-zinc-800 text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-2">🍺 Who&apos;s Drinking?</h1>
          <p className="text-zinc-400 text-sm mb-6">Enter your name to start rating</p>
          
          <input
            type="text"
            value={raterName}
            onChange={(e) => setRaterName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 text-white text-lg text-center placeholder-zinc-500 focus:outline-none focus:border-amber-500 mb-4"
            onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
            autoFocus
          />
          
          <button
            onClick={handleNameSubmit}
            disabled={!raterName.trim()}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-6 py-4 rounded-xl transition-colors text-lg"
          >
            Let&apos;s Go!
          </button>
        </motion.div>
      </main>
    );
  }

  // Main rating screen
  return (
    <main className="min-h-screen bg-zinc-950 p-4 pb-20">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold text-white mb-1">Rate a Beer</h1>
          <p className="text-zinc-400 text-sm">
            Rating as <span className="text-amber-500">{raterName}</span>
            <button onClick={changeRater} className="text-zinc-600 hover:text-zinc-400 ml-2 text-xs">
              (change)
            </button>
          </p>
        </div>

        {/* Success message */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
            >
              <div className="bg-zinc-900 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-white text-xl font-bold">Rating Submitted!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Beer selection */}
        {!selectedBeer ? (
          <div className="space-y-3">
            <p className="text-zinc-500 text-sm mb-4">Select a beer to rate:</p>
            {beers?.map((beer) => (
              <motion.button
                key={beer._id}
                onClick={() => setSelectedBeer(beer)}
                className="w-full text-left bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-amber-500/50 transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">{beer.name}</h3>
                    <p className="text-zinc-400 text-sm">{beer.style} · {beer.abv}%</p>
                  </div>
                  <div className="text-zinc-600 text-sm">
                    #{beer.batchNo}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          /* Rating UI */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800"
          >
            {/* Selected beer */}
            <div className="text-center mb-6">
              <button 
                onClick={() => setSelectedBeer(null)}
                className="text-zinc-500 text-sm hover:text-zinc-300 mb-4 block mx-auto"
              >
                ← Pick different beer
              </button>
              <h2 className="text-2xl font-bold text-white">{selectedBeer.name}</h2>
              <p className="text-amber-500">{selectedBeer.style}</p>
            </div>

            {/* Score slider */}
            <div className="mb-8">
              <div className="text-center mb-4">
                <span className="text-6xl font-black text-amber-500">{score.toFixed(1)}</span>
                <span className="text-2xl text-zinc-500">/5</span>
              </div>
              
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={score}
                onChange={(e) => setScore(parseFloat(e.target.value))}
                className="w-full h-3 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-amber-500"
              />
              
              <div className="flex justify-between text-xs text-zinc-600 mt-2">
                <span>Drain pour</span>
                <span>Decent</span>
                <span>Outstanding</span>
              </div>
            </div>

            {/* Optional note */}
            <div className="mb-6">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Quick note (optional)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmitRating}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-4 rounded-xl transition-colors text-lg"
            >
              Submit Rating
            </button>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur border-t border-zinc-800 p-4">
          <div className="max-w-lg mx-auto flex gap-3">
            <a href="/" className="flex-1 text-center py-3 text-zinc-400 hover:text-white transition-colors">
              Home
            </a>
            <a href="/rate" className="flex-1 text-center py-3 text-amber-500 font-medium">
              Rate
            </a>
            <a href="/leaderboard" className="flex-1 text-center py-3 text-zinc-400 hover:text-white transition-colors">
              Leaderboard
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
