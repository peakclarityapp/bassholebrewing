import { v } from "convex/values";
import { mutation, query, action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// ═══════════════════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all batches
 */
export const list = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results;
    
    if (args.status) {
      results = await ctx.db
        .query("beers")
        .withIndex("by_status", (qb) => qb.eq("status", args.status as "planning" | "brewing" | "fermenting" | "conditioning" | "carbonating" | "on-tap" | "kicked" | "archived"))
        .collect();
    } else {
      results = await ctx.db.query("beers").collect();
    }
    
    // Sort by batch number descending
    results.sort((a, b) => b.batchNo - a.batchNo);
    
    if (args.limit) {
      results = results.slice(0, args.limit);
    }
    
    return results;
  },
});

/**
 * Get active batches (not archived or kicked)
 */
export const getActive = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("beers").collect();
    return all.filter(b => 
      b.status !== "archived" && b.status !== "kicked"
    ).sort((a, b) => b.batchNo - a.batchNo);
  },
});

/**
 * Get a batch by ID
 */
export const get = query({
  args: { id: v.id("beers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Internal: Get a batch by ID (for use in actions)
 */
export const _get = internalQuery({
  args: { id: v.id("beers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Internal: Get a recipe by ID (for use in actions)
 */
export const _getRecipe = internalQuery({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get a batch by batch number
 */
export const getByBatchNo = query({
  args: { batchNo: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("beers")
      .withIndex("by_batchNo", (q) => q.eq("batchNo", args.batchNo))
      .first();
  },
});

/**
 * Get batch with fermentation logs
 */
export const getWithLogs = query({
  args: { id: v.id("beers") },
  handler: async (ctx, args) => {
    const batch = await ctx.db.get(args.id);
    if (!batch) return null;
    
    const logs = await ctx.db
      .query("fermentationLogs")
      .withIndex("by_beer", (q) => q.eq("beerId", args.id))
      .collect();
    
    // Sort by timestamp
    logs.sort((a, b) => a.timestamp - b.timestamp);
    
    return { ...batch, fermentationLogs: logs };
  },
});

/**
 * Get next batch number
 */
export const getNextBatchNo = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("beers").collect();
    if (all.length === 0) return 1;
    
    const maxBatch = Math.max(...all.map(b => b.batchNo));
    return maxBatch + 1;
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a batch from a recipe
 */
export const create = mutation({
  args: {
    recipeId: v.id("recipes"),
    batchNo: v.optional(v.number()),
    brewDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) throw new Error("Recipe not found");
    
    // Get next batch number if not provided
    let batchNo = args.batchNo;
    if (!batchNo) {
      const all = await ctx.db.query("beers").collect();
      batchNo = all.length > 0 ? Math.max(...all.map(b => b.batchNo)) + 1 : 1;
    }
    
    // Create the batch with full recipe copy (Brewfather-style batch recipes)
    const id = await ctx.db.insert("beers", {
      recipeId: args.recipeId,
      name: recipe.name,
      style: recipe.style,
      tagline: recipe.tagline,
      description: recipe.description,
      abv: recipe.calculatedAbv || 0,
      ibu: recipe.calculatedIbu,
      og: recipe.calculatedOg,
      fg: recipe.calculatedFg,
      srm: recipe.calculatedSrm,
      batchNo,
      status: "planning",
      brewDate: args.brewDate || new Date().toISOString().split('T')[0],
      notes: args.notes,
      // Legacy simple fields
      hops: recipe.coreHops,
      malts: recipe.coreMalts,
      yeast: recipe.yeastDetailed?.name,
      // Full recipe copy (editable per-batch)
      batchSize: recipe.batchSize,
      boilTime: recipe.boilTime,
      efficiency: recipe.efficiency,
      fermentables: recipe.fermentables,
      hopsDetailed: recipe.hopsDetailed,
      yeastDetailed: recipe.yeastDetailed,
      waterProfile: recipe.waterProfile,
      mashTemp: recipe.mashTemp,
      mashTime: recipe.mashTime,
    });
    
    // Update recipe batch count
    await ctx.db.patch(args.recipeId, {
      batchCount: (recipe.batchCount || 0) + 1,
    });
    
    return id;
  },
});

/**
 * Update batch status
 */
export const updateStatus = mutation({
  args: {
    id: v.id("beers"),
    status: v.union(
      v.literal("planning"),
      v.literal("brewing"),
      v.literal("fermenting"),
      v.literal("conditioning"),
      v.literal("carbonating"),
      v.literal("on-tap"),
      v.literal("kicked"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    return args.id;
  },
});

/**
 * Log a measurement (brew day)
 */
export const logMeasurement = mutation({
  args: {
    id: v.id("beers"),
    type: v.union(
      v.literal("mashPh"),
      v.literal("preBoilGravity"),
      v.literal("preBoilVolume"),
      v.literal("postBoilVolume"),
      v.literal("og"),
      v.literal("fg"),
      v.literal("pitchTemp"),
      v.literal("packageVolume")
    ),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, number> = {};
    
    switch (args.type) {
      case "mashPh":
        updates.measuredMashPh = args.value;
        break;
      case "preBoilGravity":
        updates.measuredPreBoilGravity = args.value;
        break;
      case "preBoilVolume":
        updates.measuredPreBoilVolume = args.value;
        break;
      case "postBoilVolume":
        updates.measuredPostBoilVolume = args.value;
        break;
      case "og":
        updates.measuredOg = args.value;
        break;
      case "fg":
        updates.measuredFg = args.value;
        break;
      case "pitchTemp":
        updates.pitchTemp = args.value;
        break;
      case "packageVolume":
        updates.packageVolume = args.value;
        break;
    }
    
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Add fermentation log entry
 */
export const addFermentationLog = mutation({
  args: {
    beerId: v.id("beers"),
    gravity: v.optional(v.number()),
    temperature: v.optional(v.number()),
    ph: v.optional(v.number()),
    notes: v.optional(v.string()),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("fermentationLogs", {
      beerId: args.beerId,
      timestamp: args.timestamp || Date.now(),
      gravity: args.gravity,
      temperature: args.temperature,
      ph: args.ph,
      notes: args.notes,
    });
    
    // If gravity is provided, update batch FG
    if (args.gravity) {
      const batch = await ctx.db.get(args.beerId);
      if (batch) {
        // Recalculate ABV with new FG
        const abv = batch.og 
          ? Math.round((batch.og - args.gravity) * 131.25 * 10) / 10
          : batch.abv;
        
        await ctx.db.patch(args.beerId, {
          measuredFg: args.gravity,
          abv,
        });
      }
    }
    
    return logId;
  },
});

/**
 * Update batch details
 */
export const update = mutation({
  args: {
    id: v.id("beers"),
    name: v.optional(v.string()),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    brewDate: v.optional(v.string()),
    pitchDate: v.optional(v.string()),
    dryHopDate: v.optional(v.string()),
    packageDate: v.optional(v.string()),
    flavorTags: v.optional(v.array(v.string())),
    recipeId: v.optional(v.id("recipes")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

/**
 * Delete a batch
 */
export const remove = mutation({
  args: { id: v.id("beers") },
  handler: async (ctx, args) => {
    // Delete fermentation logs first
    const logs = await ctx.db
      .query("fermentationLogs")
      .withIndex("by_beer", (q) => q.eq("beerId", args.id))
      .collect();
    
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }
    
    // Get batch to update recipe count
    const batch = await ctx.db.get(args.id);
    if (batch?.recipeId) {
      const recipe = await ctx.db.get(batch.recipeId);
      if (recipe) {
        await ctx.db.patch(batch.recipeId, {
          batchCount: Math.max(0, (recipe.batchCount || 1) - 1),
        });
      }
    }
    
    // Delete batch
    await ctx.db.delete(args.id);
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * What-if calculation for pre-boil gravity
 */
export const whatIfPreBoilGravity = action({
  args: {
    id: v.id("beers"),
    measuredGravity: v.number(),
  },
  handler: async (ctx, args): Promise<{
    actualEfficiency: number;
    projectedOG: number;
    projectedAbv: number;
    difference: number;
    expectedPreBoil: number;
    expectedOG: number;
    dmeBoost: { ounces: number; lbs: number } | null;
    options: Array<{ action: string; projectedOg: number; projectedAbv: number }>;
  }> => {
    const { whatIfPreBoilGravity: whatIfCalc, calculateDMEBoost } = await import("../lib/brewmath");
    
    const batch = await ctx.runQuery(internal.batches._get, { id: args.id });
    if (!batch) throw new Error("Batch not found");
    if (!batch.recipeId) throw new Error("Batch has no linked recipe");
    
    const recipe = await ctx.runQuery(internal.batches._getRecipe, { id: batch.recipeId });
    if (!recipe) throw new Error("Recipe not found");
    
    // Estimate expected pre-boil gravity (roughly OG - 10 points due to concentration)
    const expectedPreBoil = (recipe.calculatedOg || 1.050) - 0.010;
    const expectedOG = recipe.calculatedOg || 1.050;
    const targetEfficiency = recipe.efficiency || 72;
    
    const result = whatIfCalc(
      args.measuredGravity,
      expectedPreBoil,
      expectedOG,
      targetEfficiency
    );
    
    // Calculate DME boost options if under target
    let dmeBoost: { ounces: number; lbs: number } | null = null;
    if (result.difference < 0) {
      const batchSize = recipe.batchSize || 2.5;
      dmeBoost = calculateDMEBoost(
        result.projectedOG,
        expectedOG,
        batchSize
      );
    }
    
    return {
      ...result,
      expectedPreBoil,
      expectedOG,
      dmeBoost,
      options: [
        {
          action: "Do nothing",
          projectedOg: result.projectedOG,
          projectedAbv: result.projectedAbv,
        },
        ...(result.difference < -0.003 ? [{
          action: "Boil 15 minutes longer",
          projectedOg: Math.round((result.projectedOG + 0.004) * 1000) / 1000,
          projectedAbv: Math.round((result.projectedAbv + 0.5) * 10) / 10,
        }] : []),
        ...(dmeBoost ? [{
          action: `Add ${dmeBoost.ounces} oz DME`,
          projectedOg: expectedOG,
          projectedAbv: recipe.calculatedAbv || 0,
        }] : []),
      ],
    };
  },
});

/**
 * Start brew day (update status and record start time)
 */
export const startBrewDay = mutation({
  args: {
    id: v.id("beers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "brewing",
      brewDate: new Date().toISOString().split('T')[0],
    });
    return args.id;
  },
});

/**
 * Finish brew day (move to fermenting, set pitch date)
 */
export const finishBrewDay = mutation({
  args: {
    id: v.id("beers"),
    og: v.optional(v.number()),
    pitchTemp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {
      status: "fermenting",
      pitchDate: new Date().toISOString().split('T')[0],
    };
    
    if (args.og) {
      updates.measuredOg = args.og;
      updates.og = args.og;
    }
    if (args.pitchTemp) {
      updates.pitchTemp = args.pitchTemp;
    }
    
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// BATCH RECIPE EDITING (Brewfather-style batch recipes)
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

/**
 * Update batch recipe ingredients
 */
export const updateIngredients = mutation({
  args: {
    id: v.id("beers"),
    fermentables: v.optional(v.array(fermentableValidator)),
    hopsDetailed: v.optional(v.array(hopValidator)),
    yeastDetailed: v.optional(yeastValidator),
    waterProfile: v.optional(waterProfileValidator),
    batchSize: v.optional(v.number()),
    boilTime: v.optional(v.number()),
    efficiency: v.optional(v.number()),
    mashTemp: v.optional(v.number()),
    mashTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Update legacy fields for display
    if (updates.hopsDetailed) {
      (updates as Record<string, unknown>).hops = [...new Set(updates.hopsDetailed.map(h => h.name))];
    }
    if (updates.fermentables) {
      (updates as Record<string, unknown>).malts = [...new Set(updates.fermentables.map(f => f.name))];
    }
    if (updates.yeastDetailed) {
      (updates as Record<string, unknown>).yeast = updates.yeastDetailed.name;
    }
    
    await ctx.db.patch(id, updates);
    return id;
  },
});

/**
 * Save batch recipe as a new master recipe
 */
export const saveAsNewRecipe = mutation({
  args: {
    id: v.id("beers"),
    name: v.string(),
    tagline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const batch = await ctx.db.get(args.id);
    if (!batch) throw new Error("Batch not found");
    
    // Create new recipe from batch data
    const recipeId = await ctx.db.insert("recipes", {
      name: args.name,
      style: batch.style,
      tagline: args.tagline || batch.tagline,
      description: batch.description,
      type: "all-grain",
      batchSize: batch.batchSize,
      boilTime: batch.boilTime,
      efficiency: batch.efficiency,
      fermentables: batch.fermentables,
      hopsDetailed: batch.hopsDetailed,
      yeastDetailed: batch.yeastDetailed,
      waterProfile: batch.waterProfile,
      mashTemp: batch.mashTemp,
      mashTime: batch.mashTime,
      calculatedOg: batch.og,
      calculatedFg: batch.fg,
      calculatedAbv: batch.abv,
      calculatedIbu: batch.ibu,
      calculatedSrm: batch.srm,
      coreHops: batch.hops,
      coreMalts: batch.malts,
      batchCount: 1,
      createdBy: "user",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Link batch to new recipe
    await ctx.db.patch(args.id, { recipeId });
    
    return recipeId;
  },
});

/**
 * Update the master recipe with batch recipe changes
 */
export const updateMasterRecipe = mutation({
  args: {
    id: v.id("beers"),
  },
  handler: async (ctx, args) => {
    const batch = await ctx.db.get(args.id);
    if (!batch) throw new Error("Batch not found");
    if (!batch.recipeId) throw new Error("Batch has no linked master recipe");
    
    // Update the master recipe with batch data
    await ctx.db.patch(batch.recipeId, {
      batchSize: batch.batchSize,
      boilTime: batch.boilTime,
      efficiency: batch.efficiency,
      fermentables: batch.fermentables,
      hopsDetailed: batch.hopsDetailed,
      yeastDetailed: batch.yeastDetailed,
      waterProfile: batch.waterProfile,
      mashTemp: batch.mashTemp,
      mashTime: batch.mashTime,
      calculatedOg: batch.og,
      calculatedFg: batch.fg,
      calculatedAbv: batch.abv,
      calculatedIbu: batch.ibu,
      calculatedSrm: batch.srm,
      coreHops: batch.hops,
      coreMalts: batch.malts,
      updatedAt: Date.now(),
    });
    
    return batch.recipeId;
  },
});

/**
 * Recalculate batch values from ingredients
 */
export const recalculateBatch = action({
  args: {
    id: v.id("beers"),
  },
  handler: async (ctx, args): Promise<{
    og: number;
    fg: number;
    abv: number;
    ibu: number;
    srm: number;
  }> => {
    const { calculateRecipe } = await import("../lib/brewmath");
    
    const batch = await ctx.runQuery(internal.batches._get, { id: args.id });
    if (!batch) throw new Error("Batch not found");
    
    const calculations = calculateRecipe({
      fermentables: batch.fermentables || [],
      hops: batch.hopsDetailed || [],
      yeast: batch.yeastDetailed,
      batchSize: batch.batchSize || 2.5,
      efficiency: batch.efficiency || 72,
      boilTime: batch.boilTime,
    });
    
    // Update batch with new calculations
    await ctx.runMutation(internal.batches._updateCalculations, {
      id: args.id,
      og: calculations.og,
      fg: calculations.fg,
      abv: calculations.abv,
      ibu: calculations.ibu,
      srm: calculations.srm,
    });
    
    return calculations;
  },
});

/**
 * Internal: Update batch calculations
 */
export const _updateCalculations = internalMutation({
  args: {
    id: v.id("beers"),
    og: v.number(),
    fg: v.number(),
    abv: v.number(),
    ibu: v.number(),
    srm: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, ...calcs } = args;
    await ctx.db.patch(id, calcs);
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT (for Brewfather sync)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Import a batch from Brewfather (creates directly without requiring recipeId)
 */
export const importFromBrewfather = mutation({
  args: {
    name: v.string(),
    style: v.string(),
    batchNo: v.number(),
    status: v.union(
      v.literal("planning"),
      v.literal("brewing"),
      v.literal("fermenting"),
      v.literal("conditioning"),
      v.literal("carbonating"),
      v.literal("on-tap"),
      v.literal("kicked"),
      v.literal("archived")
    ),
    abv: v.optional(v.number()),
    ibu: v.optional(v.number()),
    og: v.optional(v.number()),
    fg: v.optional(v.number()),
    srm: v.optional(v.number()),
    brewDate: v.optional(v.string()),
    brewfatherId: v.string(),
    recipeId: v.optional(v.id("recipes")),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already exists
    const existing = await ctx.db
      .query("beers")
      .withIndex("by_brewfatherId", (q) => q.eq("brewfatherId", args.brewfatherId))
      .first();
    
    if (existing) {
      return existing._id;
    }
    
    const id = await ctx.db.insert("beers", {
      name: args.name,
      style: args.style,
      batchNo: args.batchNo,
      status: args.status,
      abv: args.abv || 0,
      ibu: args.ibu,
      og: args.og,
      fg: args.fg,
      srm: args.srm,
      brewDate: args.brewDate,
      brewfatherId: args.brewfatherId,
      recipeId: args.recipeId,
      tagline: args.tagline,
      description: args.description,
      notes: args.notes,
    });
    
    return id;
  },
});
