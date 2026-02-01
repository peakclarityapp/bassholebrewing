import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES (matching schema)
// ═══════════════════════════════════════════════════════════════════════════

const fermentableValidator = v.object({
  name: v.string(),
  amount: v.number(),
  type: v.string(),
  color: v.optional(v.number()),
  potential: v.optional(v.number()),
  percentage: v.optional(v.number()),
});

const hopValidator = v.object({
  name: v.string(),
  amount: v.number(),
  alpha: v.number(),
  time: v.number(),
  use: v.string(),
});

const yeastValidator = v.object({
  name: v.string(),
  attenuation: v.optional(v.number()),
  tempRange: v.optional(v.string()),
});

const waterProfileValidator = v.object({
  gypsum: v.optional(v.number()),
  cacl2: v.optional(v.number()),
  lacticAcid: v.optional(v.number()),
  notes: v.optional(v.string()),
});

// ═══════════════════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all recipes
 */
export const list = query({
  args: {
    style: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.style) {
      return await ctx.db
        .query("recipes")
        .withIndex("by_style", (q) => q.eq("style", args.style!))
        .collect();
    }
    return await ctx.db.query("recipes").collect();
  },
});

/**
 * Get a recipe by ID
 */
export const get = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get a recipe by name (fuzzy match)
 */
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("recipes").collect();
    const lower = args.name.toLowerCase();
    
    // Exact match first
    let match = all.find(r => r.name.toLowerCase() === lower);
    if (match) return match;
    
    // Contains match
    match = all.find(r => r.name.toLowerCase().includes(lower));
    return match || null;
  },
});

/**
 * Get recipe with batches
 */
export const getWithBatches = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id);
    if (!recipe) return null;
    
    const batches = await ctx.db
      .query("beers")
      .withIndex("by_recipeId", (q) => q.eq("recipeId", args.id))
      .collect();
    
    return { ...recipe, batches };
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a new recipe
 */
export const create = mutation({
  args: {
    name: v.string(),
    style: v.string(),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
    batchSize: v.optional(v.number()),
    boilTime: v.optional(v.number()),
    efficiency: v.optional(v.number()),
    fermentables: v.optional(v.array(fermentableValidator)),
    hopsDetailed: v.optional(v.array(hopValidator)),
    yeastDetailed: v.optional(yeastValidator),
    waterProfile: v.optional(waterProfileValidator),
    mashTemp: v.optional(v.number()),
    mashTime: v.optional(v.number()),
    calculatedOg: v.optional(v.number()),
    calculatedFg: v.optional(v.number()),
    calculatedAbv: v.optional(v.number()),
    calculatedIbu: v.optional(v.number()),
    calculatedSrm: v.optional(v.number()),
    createdBy: v.optional(v.string()),
    brewfatherRecipeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Extract hop/malt names for legacy fields
    const coreHops = args.hopsDetailed?.map(h => h.name) || [];
    const coreMalts = args.fermentables?.map(f => f.name) || [];
    
    const id = await ctx.db.insert("recipes", {
      ...args,
      coreHops: [...new Set(coreHops)],
      coreMalts: [...new Set(coreMalts)],
      batchCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return id;
  },
});

/**
 * Update a recipe
 */
export const update = mutation({
  args: {
    id: v.id("recipes"),
    name: v.optional(v.string()),
    style: v.optional(v.string()),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
    batchSize: v.optional(v.number()),
    boilTime: v.optional(v.number()),
    efficiency: v.optional(v.number()),
    fermentables: v.optional(v.array(fermentableValidator)),
    hopsDetailed: v.optional(v.array(hopValidator)),
    yeastDetailed: v.optional(yeastValidator),
    waterProfile: v.optional(waterProfileValidator),
    mashTemp: v.optional(v.number()),
    mashTime: v.optional(v.number()),
    calculatedOg: v.optional(v.number()),
    calculatedFg: v.optional(v.number()),
    calculatedAbv: v.optional(v.number()),
    calculatedIbu: v.optional(v.number()),
    calculatedSrm: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Update legacy fields if ingredients changed
    if (updates.hopsDetailed) {
      (updates as any).coreHops = [...new Set(updates.hopsDetailed.map(h => h.name))];
    }
    if (updates.fermentables) {
      (updates as any).coreMalts = [...new Set(updates.fermentables.map(f => f.name))];
    }
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    return id;
  },
});

/**
 * Delete a recipe
 */
export const remove = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    // Check if there are batches linked
    const batches = await ctx.db
      .query("beers")
      .withIndex("by_recipeId", (q) => q.eq("recipeId", args.id))
      .first();
    
    if (batches) {
      throw new Error("Cannot delete recipe with linked batches. Delete batches first.");
    }
    
    await ctx.db.delete(args.id);
  },
});

/**
 * Clone a recipe with optional modifications
 */
export const clone = mutation({
  args: {
    id: v.id("recipes"),
    newName: v.string(),
    modifications: v.optional(v.object({
      tagline: v.optional(v.string()),
      fermentables: v.optional(v.array(fermentableValidator)),
      hopsDetailed: v.optional(v.array(hopValidator)),
      yeastDetailed: v.optional(yeastValidator),
    })),
  },
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.id);
    if (!original) throw new Error("Recipe not found");
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, _creationTime, aggregateRating, totalRatings, batchCount, ...rest } = original;
    
    const newRecipe = {
      ...rest,
      ...args.modifications,
      name: args.newName,
      batchCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Update legacy fields if ingredients changed
    if (args.modifications?.hopsDetailed) {
      newRecipe.coreHops = [...new Set(args.modifications.hopsDetailed.map(h => h.name))];
    }
    if (args.modifications?.fermentables) {
      newRecipe.coreMalts = [...new Set(args.modifications.fermentables.map(f => f.name))];
    }
    
    return await ctx.db.insert("recipes", newRecipe);
  },
});

/**
 * Update recipe calculations (call after ingredient changes)
 */
export const updateCalculations = mutation({
  args: {
    id: v.id("recipes"),
    og: v.number(),
    fg: v.number(),
    abv: v.number(),
    ibu: v.number(),
    srm: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      calculatedOg: args.og,
      calculatedFg: args.fg,
      calculatedAbv: args.abv,
      calculatedIbu: args.ibu,
      calculatedSrm: args.srm,
      updatedAt: Date.now(),
    });
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// ACTIONS (for complex operations)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a recipe and calculate values
 * This is the main entry point for Skippy
 */
export const createWithCalculations = action({
  args: {
    name: v.string(),
    style: v.string(),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
    batchSize: v.number(),
    boilTime: v.optional(v.number()),
    efficiency: v.number(),
    fermentables: v.array(fermentableValidator),
    hopsDetailed: v.array(hopValidator),
    yeastDetailed: v.optional(yeastValidator),
    waterProfile: v.optional(waterProfileValidator),
    mashTemp: v.optional(v.number()),
    mashTime: v.optional(v.number()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    id: string;
    og: number;
    fg: number;
    abv: number;
    ibu: number;
    srm: number;
    buGu: number;
    waterProfile: {
      gypsum?: number;
      cacl2?: number;
      lacticAcid?: number;
      notes?: string;
    };
  }> => {
    // Import brewmath dynamically (can't import at top level in Convex actions)
    const { calculateRecipe, calculateWaterSalts } = await import("../lib/brewmath");
    
    // Calculate recipe values
    const calculations = calculateRecipe({
      fermentables: args.fermentables,
      hops: args.hopsDetailed,
      yeast: args.yeastDetailed,
      batchSize: args.batchSize,
      efficiency: args.efficiency,
      boilTime: args.boilTime,
    });
    
    // Calculate water salts if not provided
    let waterProfile = args.waterProfile;
    if (!waterProfile) {
      const salts = calculateWaterSalts(args.style, args.batchSize);
      waterProfile = {
        gypsum: salts.gypsum,
        cacl2: salts.cacl2,
        lacticAcid: salts.lacticAcid,
        notes: salts.notes,
      };
    }
    
    // Create the recipe
    const id = await ctx.runMutation(api.recipes.create, {
      ...args,
      waterProfile,
      calculatedOg: calculations.og,
      calculatedFg: calculations.fg,
      calculatedAbv: calculations.abv,
      calculatedIbu: calculations.ibu,
      calculatedSrm: calculations.srm,
    });
    
    return {
      id,
      ...calculations,
      waterProfile,
    };
  },
});
