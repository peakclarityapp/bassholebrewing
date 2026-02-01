import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get or create a rater by name
export const getOrCreateRater = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("raters")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    
    if (existing) return existing._id;
    
    return await ctx.db.insert("raters", {
      name: args.name,
      createdAt: Date.now(),
    });
  },
});

// Get rater by ID
export const getRater = query({
  args: { raterId: v.id("raters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.raterId);
  },
});

// Submit a rating (and update recipe aggregates)
export const submitRating = mutation({
  args: {
    beerId: v.id("beers"),
    raterId: v.id("raters"),
    score: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if this rater already rated this beer
    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_beer_rater", (q) => 
        q.eq("beerId", args.beerId).eq("raterId", args.raterId)
      )
      .first();
    
    let ratingId;
    if (existing) {
      // Update existing rating
      await ctx.db.patch(existing._id, {
        score: args.score,
        note: args.note,
        createdAt: Date.now(),
      });
      ratingId = existing._id;
    } else {
      // Create new rating
      ratingId = await ctx.db.insert("ratings", {
        beerId: args.beerId,
        raterId: args.raterId,
        score: args.score,
        note: args.note,
        createdAt: Date.now(),
      });
    }
    
    // Update recipe aggregates if this beer belongs to a recipe
    const beer = await ctx.db.get(args.beerId);
    if (beer?.recipeId) {
      const recipe = await ctx.db.get(beer.recipeId);
      if (recipe) {
        // Get all batches for this recipe
        const batches = await ctx.db
          .query("beers")
          .withIndex("by_recipeId", (q) => q.eq("recipeId", recipe._id))
          .collect();
        
        // Calculate aggregate rating
        let totalScore = 0;
        let ratingCount = 0;
        
        for (const batch of batches) {
          const ratings = await ctx.db
            .query("ratings")
            .withIndex("by_beer", (q) => q.eq("beerId", batch._id))
            .collect();
          
          for (const rating of ratings) {
            totalScore += rating.score;
            ratingCount++;
          }
        }
        
        // Update recipe
        await ctx.db.patch(recipe._id, {
          aggregateRating: ratingCount > 0 ? totalScore / ratingCount : undefined,
          totalRatings: ratingCount,
          batchCount: batches.length,
        });
      }
    }
    
    return ratingId;
  },
});

// Get all ratings for a beer
export const getBeerRatings = query({
  args: { beerId: v.id("beers") },
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_beer", (q) => q.eq("beerId", args.beerId))
      .collect();
    
    // Get rater names
    const ratingsWithNames = await Promise.all(
      ratings.map(async (r) => {
        const rater = await ctx.db.get(r.raterId);
        return { ...r, raterName: rater?.name || "Unknown" };
      })
    );
    
    return ratingsWithNames;
  },
});

// Get all ratings by a rater
export const getRaterRatings = query({
  args: { raterId: v.id("raters") },
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_rater", (q) => q.eq("raterId", args.raterId))
      .collect();
    
    // Get beer details
    const ratingsWithBeers = await Promise.all(
      ratings.map(async (r) => {
        const beer = await ctx.db.get(r.beerId);
        return { ...r, beer };
      })
    );
    
    return ratingsWithBeers;
  },
});

// Get all raters
export const getAllRaters = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("raters").collect();
  },
});

// Get leaderboard data (now with recipe rollups)
export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const allRatings = await ctx.db.query("ratings").collect();
    const allBeers = await ctx.db.query("beers").collect();
    const allRaters = await ctx.db.query("raters").collect();
    const allRecipes = await ctx.db.query("recipes").collect();
    
    // Calculate average rating per beer (for batch-level stats)
    const beerStats: Record<string, { total: number; count: number; ratings: any[] }> = {};
    for (const rating of allRatings) {
      const beerId = rating.beerId as string;
      if (!beerStats[beerId]) {
        beerStats[beerId] = { total: 0, count: 0, ratings: [] };
      }
      beerStats[beerId].total += rating.score;
      beerStats[beerId].count += 1;
      beerStats[beerId].ratings.push(rating);
    }
    
    // Build recipe leaderboard (aggregate ratings from all batches)
    const recipeLeaderboard = allRecipes.map((recipe) => {
      // Get all batches for this recipe
      const batches = allBeers.filter(b => b.recipeId === recipe._id);
      
      // Aggregate all ratings across batches
      let totalScore = 0;
      let ratingCount = 0;
      for (const batch of batches) {
        const stats = beerStats[batch._id as string];
        if (stats) {
          totalScore += stats.total;
          ratingCount += stats.count;
        }
      }
      
      return {
        type: "recipe" as const,
        recipe,
        name: recipe.name,
        style: recipe.style,
        tagline: recipe.tagline,
        avgRating: ratingCount > 0 ? totalScore / ratingCount : null,
        ratingCount,
        batchCount: batches.length,
        batches: batches.map(b => ({
          ...b,
          avgRating: beerStats[b._id as string] 
            ? beerStats[b._id as string].total / beerStats[b._id as string].count 
            : null,
          ratingCount: beerStats[b._id as string]?.count || 0,
        })),
      };
    }).filter(r => r.ratingCount > 0);
    
    // Get standalone beers (no recipe) and treat them as their own entry
    const standaloneBeers = allBeers
      .filter(b => !b.recipeId)
      .map((beer) => {
        const stats = beerStats[beer._id as string];
        return {
          type: "standalone" as const,
          beer,
          name: beer.name,
          style: beer.style,
          tagline: beer.tagline,
          avgRating: stats ? stats.total / stats.count : null,
          ratingCount: stats?.count || 0,
          batchCount: 1,
        };
      })
      .filter(b => b.avgRating !== null);
    
    // Combine and sort by rating
    const combinedLeaderboard = [
      ...recipeLeaderboard,
      ...standaloneBeers,
    ].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    
    // Calculate rater stats
    const raterStats: Record<string, { total: number; count: number; ratings: any[] }> = {};
    for (const rating of allRatings) {
      const raterId = rating.raterId as string;
      if (!raterStats[raterId]) {
        raterStats[raterId] = { total: 0, count: 0, ratings: [] };
      }
      raterStats[raterId].total += rating.score;
      raterStats[raterId].count += 1;
      raterStats[raterId].ratings.push(rating);
    }
    
    const raterLeaderboard = allRaters
      .map((rater) => {
        const stats = raterStats[rater._id as string];
        if (!stats) return null;
        
        // Find their favorite beer
        const raterRatings = stats.ratings;
        const topRating = raterRatings.sort((a: any, b: any) => b.score - a.score)[0];
        const favoriteBeer = topRating ? allBeers.find((b) => b._id === topRating.beerId) : null;
        
        // If favorite beer is part of a recipe, get the recipe name too
        const favoriteRecipe = favoriteBeer?.recipeId 
          ? allRecipes.find(r => r._id === favoriteBeer.recipeId)
          : null;
        
        return {
          rater,
          avgGiven: stats.total / stats.count,
          ratingCount: stats.count,
          favoriteBeer,
          favoriteRecipe,
          favoriteScore: topRating?.score,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.ratingCount - a.ratingCount);
    
    return {
      // NEW: Recipe-based leaderboard
      topRecipes: combinedLeaderboard.slice(0, 10),
      mostRated: [...combinedLeaderboard].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 5),
      
      // Keep batch-level for backwards compatibility
      topBeers: allBeers
        .map((beer) => {
          const stats = beerStats[beer._id as string];
          const recipe = beer.recipeId ? allRecipes.find(r => r._id === beer.recipeId) : null;
          return {
            beer,
            recipe,
            avgRating: stats ? stats.total / stats.count : null,
            ratingCount: stats?.count || 0,
          };
        })
        .filter((b) => b.avgRating !== null)
        .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
        .slice(0, 10),
      
      raters: raterLeaderboard,
      totalRatings: allRatings.length,
      recipeCount: allRecipes.length,
    };
  },
});

// Get beers available to rate (on-tap or archived) with recipe info
export const getBeersToRate = query({
  args: {},
  handler: async (ctx) => {
    const beers = await ctx.db.query("beers").collect();
    const recipes = await ctx.db.query("recipes").collect();
    
    return beers
      .filter((b) => ["on-tap", "kicked", "archived", "conditioning"].includes(b.status))
      .map((beer) => ({
        ...beer,
        recipe: beer.recipeId ? recipes.find(r => r._id === beer.recipeId) : null,
      }))
      .sort((a, b) => b.batchNo - a.batchNo);
  },
});

// Get all recipes with their batches
export const getRecipes = query({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db.query("recipes").collect();
    const beers = await ctx.db.query("beers").collect();
    const allRatings = await ctx.db.query("ratings").collect();
    
    // Build rating stats by beer
    const beerStats: Record<string, { total: number; count: number }> = {};
    for (const rating of allRatings) {
      const beerId = rating.beerId as string;
      if (!beerStats[beerId]) {
        beerStats[beerId] = { total: 0, count: 0 };
      }
      beerStats[beerId].total += rating.score;
      beerStats[beerId].count += 1;
    }
    
    return recipes.map((recipe) => {
      const batches = beers
        .filter(b => b.recipeId === recipe._id)
        .map(b => ({
          ...b,
          avgRating: beerStats[b._id as string] 
            ? beerStats[b._id as string].total / beerStats[b._id as string].count 
            : null,
          ratingCount: beerStats[b._id as string]?.count || 0,
        }))
        .sort((a, b) => b.batchNo - a.batchNo);
      
      return {
        ...recipe,
        batches,
      };
    });
  },
});

// Get a single recipe with all its batches and ratings
export const getRecipeDetails = query({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) return null;
    
    const batches = await ctx.db
      .query("beers")
      .withIndex("by_recipeId", (q) => q.eq("recipeId", args.recipeId))
      .collect();
    
    // Get ratings for all batches
    const batchesWithRatings = await Promise.all(
      batches.map(async (batch) => {
        const ratings = await ctx.db
          .query("ratings")
          .withIndex("by_beer", (q) => q.eq("beerId", batch._id))
          .collect();
        
        const ratingsWithNames = await Promise.all(
          ratings.map(async (r) => {
            const rater = await ctx.db.get(r.raterId);
            return { ...r, raterName: rater?.name || "Unknown" };
          })
        );
        
        const avgRating = ratings.length > 0
          ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length
          : null;
        
        return {
          ...batch,
          ratings: ratingsWithNames,
          avgRating,
          ratingCount: ratings.length,
        };
      })
    );
    
    // Find best batch
    const ratedBatches = batchesWithRatings.filter(b => b.avgRating !== null);
    const bestBatch = ratedBatches.length > 0
      ? ratedBatches.reduce((best, b) => 
          (b.avgRating || 0) > (best.avgRating || 0) ? b : best
        )
      : null;
    
    return {
      ...recipe,
      batches: batchesWithRatings.sort((a, b) => b.batchNo - a.batchNo),
      bestBatch,
    };
  },
});

// Get ratings summary for all beers (for tap cards display)
export const getAllBeerRatings = query({
  args: {},
  handler: async (ctx) => {
    const allRatings = await ctx.db.query("ratings").collect();
    
    // Group by beer
    const beerStats: Record<string, { total: number; count: number }> = {};
    for (const rating of allRatings) {
      const beerId = rating.beerId as string;
      if (!beerStats[beerId]) {
        beerStats[beerId] = { total: 0, count: 0 };
      }
      beerStats[beerId].total += rating.score;
      beerStats[beerId].count += 1;
    }
    
    // Convert to avg ratings
    const result: Record<string, { avgRating: number; ratingCount: number }> = {};
    for (const [beerId, stats] of Object.entries(beerStats)) {
      result[beerId] = {
        avgRating: stats.total / stats.count,
        ratingCount: stats.count,
      };
    }
    
    return result;
  },
});
