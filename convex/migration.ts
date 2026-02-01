import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Recipe definitions with their batch mappings
const RECIPE_DEFINITIONS = [
  {
    name: "CASS IPA",
    style: "American IPA",
    tagline: "Cast for bass. Crack a CASS.",
    description: "Named for the hops (Centennial, Amarillo, Simcoe, Strata) and Cass Lake, MN — where the bass bite and summer never ends.",
    coreHops: ["Centennial", "Amarillo", "Simcoe", "Strata"],
    // Match batches by name pattern
    batchPatterns: ["cass"],
  },
  {
    name: "Riwaka Haka",
    style: "Black IPA",
    tagline: "Dark as a moonless night in the Pacific. Tropical hops crash against roasted waves. The haka before the storm.",
    description: "A Black IPA featuring New Zealand Riwaka hops. Dark and roasty with bright tropical notes.",
    coreHops: ["Riwaka", "Citra", "Amarillo"],
    batchPatterns: ["riwaka"],
  },
  {
    name: "Czech Pilsner",
    style: "German Pils",
    tagline: "Proof that I can show restraint. Crisp, clean, dangerously drinkable.",
    description: "A crisp, clean lager with noble Saaz hops. Proof that not everything needs to be hopped to oblivion.",
    coreHops: ["Saaz"],
    batchPatterns: ["czech", "pilsner"],
  },
];

// Step 1: Create recipes
export const createRecipes = mutation({
  args: {},
  handler: async (ctx) => {
    const results: { name: string; id: Id<"recipes"> | string }[] = [];
    
    for (const recipe of RECIPE_DEFINITIONS) {
      // Check if recipe already exists
      const existing = await ctx.db
        .query("recipes")
        .withIndex("by_name", (q) => q.eq("name", recipe.name))
        .first();
      
      if (existing) {
        results.push({ name: recipe.name, id: `exists: ${existing._id}` });
        continue;
      }
      
      const id = await ctx.db.insert("recipes", {
        name: recipe.name,
        style: recipe.style,
        tagline: recipe.tagline,
        description: recipe.description,
        coreHops: recipe.coreHops,
        aggregateRating: undefined,
        totalRatings: 0,
        batchCount: 0,
      });
      
      results.push({ name: recipe.name, id });
    }
    
    return results;
  },
});

// Step 2: Link batches to recipes
export const linkBatchesToRecipes = mutation({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db.query("recipes").collect();
    const beers = await ctx.db.query("beers").collect();
    
    const links: { batch: string; recipe: string }[] = [];
    
    for (const beer of beers) {
      const beerNameLower = beer.name.toLowerCase();
      
      for (const recipeDef of RECIPE_DEFINITIONS) {
        const matches = recipeDef.batchPatterns.some(pattern => 
          beerNameLower.includes(pattern)
        );
        
        if (matches) {
          const recipe = recipes.find(r => r.name === recipeDef.name);
          if (recipe && !beer.recipeId) {
            await ctx.db.patch(beer._id, { recipeId: recipe._id });
            links.push({ 
              batch: `#${beer.batchNo} ${beer.name}`, 
              recipe: recipe.name 
            });
          }
          break;
        }
      }
    }
    
    return links;
  },
});

// Step 3: Deduplicate beers (merge ratings, keep Brewfather-synced version)
export const deduplicateBeers = mutation({
  args: {},
  handler: async (ctx) => {
    const beers = await ctx.db.query("beers").collect();
    
    // Group by batchNo
    const byBatchNo: Record<number, typeof beers> = {};
    for (const beer of beers) {
      if (!byBatchNo[beer.batchNo]) {
        byBatchNo[beer.batchNo] = [];
      }
      byBatchNo[beer.batchNo].push(beer);
    }
    
    const actions: string[] = [];
    
    for (const [batchNo, dupes] of Object.entries(byBatchNo)) {
      if (dupes.length > 1) {
        // Keep the one with brewfatherId, or the first one
        const keeper = dupes.find(d => d.brewfatherId) || dupes[0];
        const toDelete = dupes.filter(d => d._id !== keeper._id);
        
        for (const dup of toDelete) {
          // Move ratings to keeper
          const ratings = await ctx.db
            .query("ratings")
            .withIndex("by_beer", (q) => q.eq("beerId", dup._id))
            .collect();
          
          for (const rating of ratings) {
            // Check if keeper already has rating from this rater
            const existing = await ctx.db
              .query("ratings")
              .withIndex("by_beer_rater", (q) => 
                q.eq("beerId", keeper._id).eq("raterId", rating.raterId)
              )
              .first();
            
            if (!existing) {
              // Move rating to keeper
              await ctx.db.patch(rating._id, { beerId: keeper._id });
            } else {
              // Delete duplicate rating
              await ctx.db.delete(rating._id);
            }
          }
          
          // Delete duplicate beer
          await ctx.db.delete(dup._id);
          actions.push(`Merged #${batchNo}: deleted "${dup.name}", kept "${keeper.name}"`);
        }
      }
    }
    
    return actions.length > 0 ? actions : ["No duplicates found"];
  },
});

// Step 4: Update recipe aggregates
export const updateRecipeAggregates = mutation({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db.query("recipes").collect();
    const results: { recipe: string; batchCount: number; totalRatings: number; avgRating: number | null }[] = [];
    
    for (const recipe of recipes) {
      // Get all batches for this recipe
      const batches = await ctx.db
        .query("beers")
        .withIndex("by_recipeId", (q) => q.eq("recipeId", recipe._id))
        .collect();
      
      // Get all ratings for those batches
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
      
      const avgRating = ratingCount > 0 ? totalScore / ratingCount : null;
      
      await ctx.db.patch(recipe._id, {
        batchCount: batches.length,
        totalRatings: ratingCount,
        aggregateRating: avgRating ?? undefined,
      });
      
      results.push({
        recipe: recipe.name,
        batchCount: batches.length,
        totalRatings: ratingCount,
        avgRating,
      });
    }
    
    return results;
  },
});

// Run full migration
export const runFullMigration = mutation({
  args: {},
  handler: async (ctx) => {
    // This is a convenience function - run the steps individually in production
    // to verify each step
    return {
      message: "Run these mutations in order:",
      steps: [
        "1. migration:createRecipes",
        "2. migration:linkBatchesToRecipes", 
        "3. migration:deduplicateBeers",
        "4. migration:updateRecipeAggregates",
      ],
    };
  },
});
