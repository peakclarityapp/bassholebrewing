"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Id } from "../../convex/_generated/dataModel";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  beer: {
    id: string;
    name: string;
    style: string;
  } | null;
}

export function RatingModal({ isOpen, onClose, beer }: RatingModalProps) {
  const [raterName, setRaterName] = useState<string>("");
  const [raterId, setRaterId] = useState<Id<"raters"> | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [score, setScore] = useState<number>(3.5);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const getOrCreateRater = useMutation(api.ratings.getOrCreateRater);
  const submitRating = useMutation(api.ratings.submitRating);

  // Check localStorage for existing rater
  useEffect(() => {
    const stored = localStorage.getItem("basshole_rater");
    if (stored) {
      const { name, id } = JSON.parse(stored);
      setRaterName(name);
      setRaterId(id);
      setShowNameInput(false);
    } else {
      setShowNameInput(true);
    }
  }, []);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setScore(3.5);
      setNote("");
      setSubmitted(false);
    }
  }, [isOpen]);

  const handleNameSubmit = async () => {
    if (!raterName.trim()) return;
    const id = await getOrCreateRater({ name: raterName.trim() });
    setRaterId(id);
    localStorage.setItem("basshole_rater", JSON.stringify({ name: raterName.trim(), id }));
    setShowNameInput(false);
  };

  const handleSubmitRating = async () => {
    if (!beer || !raterId) return;
    await submitRating({
      beerId: beer.id as Id<"beers">,
      raterId,
      score,
      note: note.trim() || undefined,
    });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, rotateX: -10 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-zinc-900 rounded-2xl p-6 max-w-md w-full border border-amber-500/20 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500" />

          {/* Success state */}
          {submitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-white text-xl font-bold">Thanks, {raterName}!</p>
              <p className="text-zinc-400 mt-2">Rating submitted</p>
            </motion.div>
          ) : showNameInput ? (
            /* Name input */
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Who&apos;s Rating?</h2>
              <p className="text-zinc-400 text-sm mb-6">Enter your name to continue</p>
              
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
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold px-6 py-4 rounded-xl transition-colors"
              >
                Continue
              </button>
            </div>
          ) : (
            /* Rating UI */
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{beer?.name}</h2>
                  <p className="text-amber-500 text-sm">{beer?.style}</p>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-white text-2xl">
                  ×
                </button>
              </div>

              <p className="text-zinc-500 text-sm mb-2 text-center">
                Rating as <span className="text-amber-400">{raterName}</span>
              </p>

              {/* Score display */}
              <div className="text-center mb-4">
                <span className="text-6xl font-black bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">
                  {score.toFixed(1)}
                </span>
                <span className="text-2xl text-zinc-500">/5</span>
              </div>

              {/* Score slider */}
              <div className="mb-6">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={score}
                  onChange={(e) => setScore(parseFloat(e.target.value))}
                  className="w-full h-3 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f59e0b ${((score - 1) / 4) * 100}%, #27272a ${((score - 1) / 4) * 100}%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-zinc-600 mt-2">
                  <span>Drain pour</span>
                  <span>Outstanding</span>
                </div>
              </div>

              {/* Note */}
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Quick note (optional)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 mb-6"
              />

              {/* Submit */}
              <motion.button
                onClick={handleSubmitRating}
                className="w-full bg-gradient-to-r from-amber-500 to-pink-500 text-black font-bold px-6 py-4 rounded-xl text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit Rating
              </motion.button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
