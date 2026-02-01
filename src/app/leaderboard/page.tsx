"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
  const data = useQuery(api.ratings.getLeaderboard);

  if (!data) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-amber-500 text-xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-black text-white mb-2">🏆 Leaderboard</h1>
          <p className="text-zinc-400">
            {data.totalRatings} ratings · {data.recipeCount} recipes · {data.raters.length} drinkers
          </p>
        </div>

        {/* Top Recipes */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-amber-500">★</span> Top Rated Recipes
          </h2>
          
          {data.topRecipes.length === 0 ? (
            <div className="bg-zinc-900 rounded-xl p-8 text-center border border-zinc-800">
              <p className="text-zinc-500">No ratings yet! Be the first.</p>
              <a href="/rate" className="text-amber-500 hover:underline mt-2 inline-block">
                Rate a beer →
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {data.topRecipes.map((item: any, index: number) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-zinc-900 rounded-xl p-4 border border-zinc-800"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                      index === 0 ? 'bg-amber-500 text-black' :
                      index === 1 ? 'bg-zinc-400 text-black' :
                      index === 2 ? 'bg-amber-700 text-white' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {index + 1}
                    </div>
                    
                    {/* Recipe info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold truncate">{item.name}</h3>
                      <p className="text-zinc-500 text-sm">
                        {item.style}
                        {item.batchCount > 1 && (
                          <span className="text-zinc-600"> · {item.batchCount} batches</span>
                        )}
                      </p>
                      {item.tagline && (
                        <p className="text-zinc-600 text-xs italic mt-1 truncate">{item.tagline}</p>
                      )}
                    </div>
                    
                    {/* Rating */}
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-amber-500">{item.avgRating.toFixed(1)}</div>
                      <div className="text-xs text-zinc-500">{item.ratingCount} rating{item.ratingCount !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  
                  {/* Batch breakdown for multi-batch recipes */}
                  {item.type === 'recipe' && item.batches && item.batches.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-zinc-800">
                      <div className="text-xs text-zinc-500 mb-2">Batches:</div>
                      <div className="flex flex-wrap gap-2">
                        {item.batches.slice(0, 4).map((batch: any) => (
                          <div 
                            key={batch._id} 
                            className="text-xs bg-zinc-800 rounded px-2 py-1"
                          >
                            <span className="text-zinc-400">#{batch.batchNo}</span>
                            {batch.avgRating && (
                              <span className="text-amber-500 ml-1">★{batch.avgRating.toFixed(1)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Drinker Stats */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-pink-500">👥</span> Drinker Stats
          </h2>
          
          {data.raters.length === 0 ? (
            <div className="bg-zinc-900 rounded-xl p-8 text-center border border-zinc-800">
              <p className="text-zinc-500">No ratings yet!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {data.raters.map((item: any, index: number) => (
                <motion.div
                  key={item.rater._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-zinc-900 rounded-xl p-4 border border-zinc-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-lg">{item.rater.name}</h3>
                    <span className="text-zinc-400 text-sm">{item.ratingCount} ratings</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-zinc-500">
                      Avg given: <span className="text-amber-500 font-medium">{item.avgGiven.toFixed(1)}</span>
                    </div>
                    {item.favoriteBeer && (
                      <div className="text-zinc-500 truncate ml-4">
                        Favorite: <span className="text-pink-400">
                          {item.favoriteRecipe ? item.favoriteRecipe.name : item.favoriteBeer.name}
                        </span>
                        <span className="text-zinc-600 ml-1">({item.favoriteScore.toFixed(1)})</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Superlatives */}
        {data.raters.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-500">🎯</span> Superlatives
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Most Active */}
              {data.raters[0] && (
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Most Active</div>
                  <div className="text-white font-bold">{data.raters[0].rater.name}</div>
                  <div className="text-amber-500 text-sm">{data.raters[0].ratingCount} ratings</div>
                </div>
              )}
              
              {/* Toughest Critic */}
              {(() => {
                const toughest = [...data.raters].sort((a: any, b: any) => a.avgGiven - b.avgGiven)[0];
                return toughest ? (
                  <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                    <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Toughest Critic</div>
                    <div className="text-white font-bold">{toughest.rater.name}</div>
                    <div className="text-red-400 text-sm">Avg: {toughest.avgGiven.toFixed(1)}</div>
                  </div>
                ) : null;
              })()}
              
              {/* Biggest Fan */}
              {(() => {
                const fan = [...data.raters].sort((a: any, b: any) => b.avgGiven - a.avgGiven)[0];
                return fan ? (
                  <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                    <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Biggest Fan</div>
                    <div className="text-white font-bold">{fan.rater.name}</div>
                    <div className="text-green-400 text-sm">Avg: {fan.avgGiven.toFixed(1)}</div>
                  </div>
                ) : null;
              })()}
              
              {/* Most Rated Recipe */}
              {data.mostRated[0] && (
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Most Reviewed</div>
                  <div className="text-white font-bold truncate">{data.mostRated[0].name}</div>
                  <div className="text-purple-400 text-sm">{data.mostRated[0].ratingCount} ratings</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur border-t border-zinc-800 p-4">
          <div className="max-w-lg mx-auto flex gap-3">
            <a href="/" className="flex-1 text-center py-3 text-zinc-400 hover:text-white transition-colors">
              Home
            </a>
            <a href="/rate" className="flex-1 text-center py-3 text-zinc-400 hover:text-white transition-colors">
              Rate
            </a>
            <a href="/leaderboard" className="flex-1 text-center py-3 text-amber-500 font-medium">
              Leaderboard
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
