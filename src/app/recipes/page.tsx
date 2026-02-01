"use client";

import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { CosmicBackground } from "@/components/CosmicBackground";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminNav } from "@/components/AdminNav";
import Link from "next/link";

// SRM to CSS color
function srmToColor(srm: number): string {
  const colors: Record<number, string> = {
    1: '#FFE699', 2: '#FFD878', 3: '#FFCA5A', 4: '#FFBF42', 5: '#FBB123',
    6: '#F8A600', 7: '#F39C00', 8: '#EA8F00', 9: '#E58500', 10: '#DE7C00',
    11: '#D77200', 12: '#CF6900', 13: '#CB6200', 14: '#C35900', 15: '#BB5100',
    20: '#8D4C32', 25: '#5D341A', 30: '#261716', 35: '#1B1212', 40: '#100B0B',
  };
  const keys = Object.keys(colors).map(Number).sort((a, b) => a - b);
  for (const key of keys) {
    if (srm <= key) return colors[key];
  }
  return colors[40];
}

export default function RecipesPage() {
  const recipes = useQuery(api.recipes.list, {});
  
  return (
    <AdminGuard>
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <CosmicBackground />
      <AdminNav />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-mono">
              <span className="text-amber-500">RECIPE</span>
              <span className="text-zinc-400">_</span>
              <span className="text-cyan-400">VAULT</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Master recipe collection</p>
          </div>
          <Link
            href="/recipes/new"
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
          >
            + NEW RECIPE
          </Link>
        </div>
        
        {/* Loading State */}
        {!recipes && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-4xl"
            >
              🦘
            </motion.div>
          </div>
        )}
        
        {/* Empty State */}
        {recipes && recipes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-zinc-400 mb-2">No recipes yet</h2>
            <p className="text-zinc-500 mb-6">Time to design your first brew!</p>
            <Link
              href="/recipes/new"
              className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
            >
              Create Recipe
            </Link>
          </motion.div>
        )}
        
        {/* Recipe Grid */}
        {recipes && recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/recipes/${recipe._id}`}>
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm hover:border-amber-500/50 transition-all group cursor-pointer">
                    
                    {/* Color Bar */}
                    <div 
                      className="h-2 rounded-full mb-4"
                      style={{ backgroundColor: srmToColor(recipe.calculatedSrm || 5) }}
                    />
                    
                    {/* Recipe Name */}
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors mb-1">
                      {recipe.name}
                    </h3>
                    
                    {/* Style */}
                    <p className="text-zinc-400 text-sm mb-3">{recipe.style}</p>
                    
                    {/* Tagline */}
                    {recipe.tagline && (
                      <p className="text-zinc-500 text-sm italic mb-4">"{recipe.tagline}"</p>
                    )}
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-500">ABV</span>
                        <span className="font-mono font-bold text-green-400">
                          {recipe.calculatedAbv?.toFixed(1) || '?'}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-500">IBU</span>
                        <span className="font-mono font-bold text-cyan-400">
                          {recipe.calculatedIbu || '?'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-500">OG</span>
                        <span className="font-mono font-bold text-amber-400">
                          {recipe.calculatedOg?.toFixed(3) || '?'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Batch Count */}
                    {(recipe.batchCount ?? 0) > 0 && (
                      <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-500">
                        {recipe.batchCount} batch{recipe.batchCount === 1 ? '' : 'es'} brewed
                        {recipe.aggregateRating && (
                          <span className="ml-2">
                            • ⭐ {recipe.aggregateRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    )}
                    
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        
      </div>
    </main>
    </AdminGuard>
  );
}
