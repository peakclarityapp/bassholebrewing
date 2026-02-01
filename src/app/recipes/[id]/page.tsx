"use client";

import { use } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { CosmicBackground } from "@/components/CosmicBackground";
import { AdminGuard, LogoutButton } from "@/components/AdminGuard";
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

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const recipe = useQuery(api.recipes.getWithBatches, { id: id as Id<"recipes"> });
  const deleteRecipe = useMutation(api.recipes.remove);
  const createBatch = useMutation(api.batches.create);
  
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    try {
      await deleteRecipe({ id: id as Id<"recipes"> });
      router.push("/recipes");
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to delete recipe");
    }
  };
  
  const handleStartBatch = async () => {
    if (!recipe) return;
    try {
      const batchId = await createBatch({
        recipeId: id as Id<"recipes">,
      });
      router.push(`/batches/${batchId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create batch");
    }
  };
  
  if (!recipe) {
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
  
  const totalGrain = recipe.fermentables?.reduce((sum, f) => sum + f.amount, 0) || 0;
  
  return (
    <AdminGuard>
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <CosmicBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/recipes" className="text-zinc-400 hover:text-white transition-colors">
              ← Recipes
            </Link>
            <h1 className="text-xl font-bold font-mono">
              <span className="text-amber-500">RECIPE</span>
              <span className="text-zinc-400">_</span>
              <span className="text-cyan-400">VIEW</span>
            </h1>
            <LogoutButton />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-zinc-800 hover:bg-red-900/50 border border-zinc-700 hover:border-red-500/50 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
            >
              Delete
            </button>
            <button
              onClick={handleStartBatch}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
            >
              🍺 START BATCH
            </button>
          </div>
        </div>
      </header>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
            >
              {/* Color Bar */}
              <div 
                className="h-3 rounded-full mb-6"
                style={{ backgroundColor: srmToColor(recipe.calculatedSrm || 5) }}
              />
              
              <h1 className="text-3xl font-bold text-white mb-2">{recipe.name}</h1>
              <p className="text-lg text-amber-500 mb-2">{recipe.style}</p>
              {recipe.tagline && (
                <p className="text-zinc-400 italic">"{recipe.tagline}"</p>
              )}
              
              {/* Quick Stats */}
              <div className="flex items-center gap-6 mt-6 pt-6 border-t border-zinc-800">
                <div>
                  <div className="text-xs text-zinc-500 uppercase">ABV</div>
                  <div className="text-2xl font-mono font-bold text-green-400">{recipe.calculatedAbv?.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase">IBU</div>
                  <div className="text-2xl font-mono font-bold text-cyan-400">{recipe.calculatedIbu}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase">OG</div>
                  <div className="text-2xl font-mono font-bold text-amber-400">{recipe.calculatedOg?.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase">FG</div>
                  <div className="text-2xl font-mono font-bold text-amber-400">{recipe.calculatedFg?.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase">SRM</div>
                  <div className="text-2xl font-mono font-bold text-orange-400">{recipe.calculatedSrm}</div>
                </div>
              </div>
            </motion.div>
            
            {/* Fermentables */}
            {recipe.fermentables && recipe.fermentables.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
              >
                <h2 className="text-lg font-bold text-orange-500 mb-4 font-mono">FERMENTABLES</h2>
                <div className="space-y-3">
                  {recipe.fermentables.map((grain, i) => {
                    const pct = totalGrain > 0 ? Math.round((grain.amount / totalGrain) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-zinc-600"
                          style={{ backgroundColor: srmToColor(grain.color || 3) }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{grain.name}</div>
                          <div className="text-xs text-zinc-500">{grain.type} • {grain.color}°L</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold">{grain.amount} lbs</div>
                          <div className="text-xs text-zinc-500">{pct}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-700 text-sm text-zinc-400">
                  Total: {totalGrain.toFixed(2)} lbs
                </div>
              </motion.div>
            )}
            
            {/* Hops */}
            {recipe.hopsDetailed && recipe.hopsDetailed.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
              >
                <h2 className="text-lg font-bold text-green-500 mb-4 font-mono">HOPS</h2>
                <div className="space-y-3">
                  {recipe.hopsDetailed.map((hop, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-600/30 border-2 border-green-600 flex items-center justify-center">
                        🌿
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{hop.name}</div>
                        <div className="text-xs text-zinc-500">{hop.alpha}% AA</div>
                      </div>
                      <div className="px-2 py-1 bg-zinc-700 rounded text-xs">
                        {hop.use}
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">{hop.amount} oz</div>
                        <div className="text-xs text-zinc-500">{hop.time} min</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Yeast */}
            {recipe.yeastDetailed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
              >
                <h2 className="text-lg font-bold text-purple-500 mb-4 font-mono">YEAST</h2>
                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-purple-600/30 border-2 border-purple-600 flex items-center justify-center">
                    🧫
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{recipe.yeastDetailed.name}</div>
                    <div className="text-xs text-zinc-500">
                      {recipe.yeastDetailed.attenuation}% attenuation
                      {recipe.yeastDetailed.tempRange && ` • ${recipe.yeastDetailed.tempRange}`}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Water Chemistry */}
            {recipe.waterProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
              >
                <h2 className="text-lg font-bold text-blue-400 mb-4 font-mono">WATER_SALTS</h2>
                <div className="space-y-3">
                  {recipe.waterProfile.gypsum && (
                    <div className="flex justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-400">Gypsum (CaSO₄)</span>
                      <span className="font-mono font-bold">{recipe.waterProfile.gypsum}g</span>
                    </div>
                  )}
                  {recipe.waterProfile.cacl2 && (
                    <div className="flex justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-400">CaCl₂</span>
                      <span className="font-mono font-bold">{recipe.waterProfile.cacl2}g</span>
                    </div>
                  )}
                  {recipe.waterProfile.lacticAcid && (
                    <div className="flex justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-400">Lactic Acid 85%</span>
                      <span className="font-mono font-bold">{recipe.waterProfile.lacticAcid}ml</span>
                    </div>
                  )}
                </div>
                {recipe.waterProfile.notes && (
                  <p className="mt-4 text-xs text-zinc-500 italic">{recipe.waterProfile.notes}</p>
                )}
              </motion.div>
            )}
            
            {/* Brew Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
            >
              <h2 className="text-lg font-bold text-cyan-400 mb-4 font-mono">BREW_SETTINGS</h2>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-400">Batch Size</span>
                  <span className="font-mono font-bold">{recipe.batchSize} gal</span>
                </div>
                <div className="flex justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-400">Efficiency</span>
                  <span className="font-mono font-bold">{recipe.efficiency}%</span>
                </div>
                <div className="flex justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-400">Boil Time</span>
                  <span className="font-mono font-bold">{recipe.boilTime} min</span>
                </div>
                {recipe.mashTemp && (
                  <div className="flex justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <span className="text-zinc-400">Mash Temp</span>
                    <span className="font-mono font-bold">{recipe.mashTemp}°F</span>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Batch History */}
            {recipe.batches && recipe.batches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm"
              >
                <h2 className="text-lg font-bold text-amber-500 mb-4 font-mono">BATCH_HISTORY</h2>
                <div className="space-y-2">
                  {recipe.batches.map((batch) => (
                    <Link
                      key={batch._id}
                      href={`/batches/${batch._id}`}
                      className="block p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Batch #{batch.batchNo}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          batch.status === 'on-tap' ? 'bg-green-500/20 text-green-400' :
                          batch.status === 'fermenting' ? 'bg-purple-500/20 text-purple-400' :
                          batch.status === 'conditioning' ? 'bg-cyan-500/20 text-cyan-400' :
                          batch.status === 'kicked' ? 'bg-zinc-500/20 text-zinc-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {batch.status}
                        </span>
                      </div>
                      {batch.brewDate && (
                        <div className="text-xs text-zinc-500 mt-1">{batch.brewDate}</div>
                      )}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
            
          </div>
        </div>
      </div>
    </main>
    </AdminGuard>
  );
}
