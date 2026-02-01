import { v } from "convex/values";
import { action } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════════════════
// CALCULATION ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

const fermentableValidator = v.object({
  name: v.string(),
  amount: v.number(),
  type: v.string(),
  color: v.optional(v.number()),
  potential: v.optional(v.number()),
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
});

/**
 * Calculate full recipe values
 */
export const recipe = action({
  args: {
    fermentables: v.array(fermentableValidator),
    hops: v.array(hopValidator),
    yeast: v.optional(yeastValidator),
    batchSize: v.number(),
    efficiency: v.number(),
    boilTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { calculateRecipe } = await import("../lib/brewmath");
    
    return calculateRecipe({
      fermentables: args.fermentables,
      hops: args.hops,
      yeast: args.yeast,
      batchSize: args.batchSize,
      efficiency: args.efficiency,
      boilTime: args.boilTime,
    });
  },
});

/**
 * Calculate IBU for hop additions
 */
export const ibu = action({
  args: {
    hops: v.array(hopValidator),
    og: v.number(),
    batchSize: v.number(),
  },
  handler: async (ctx, args) => {
    const { calculateIBU } = await import("../lib/brewmath");
    return { ibu: calculateIBU(args.hops, args.og, args.batchSize) };
  },
});

/**
 * Calculate OG from fermentables
 */
export const og = action({
  args: {
    fermentables: v.array(fermentableValidator),
    batchSize: v.number(),
    efficiency: v.number(),
  },
  handler: async (ctx, args) => {
    const { calculateOG } = await import("../lib/brewmath");
    return { og: calculateOG(args.fermentables, args.batchSize, args.efficiency) };
  },
});

/**
 * Calculate ABV from OG and FG
 */
export const abv = action({
  args: {
    og: v.number(),
    fg: v.number(),
  },
  handler: async (ctx, args) => {
    const { calculateABV } = await import("../lib/brewmath");
    return { abv: calculateABV(args.og, args.fg) };
  },
});

/**
 * Calculate SRM color
 */
export const srm = action({
  args: {
    fermentables: v.array(fermentableValidator),
    batchSize: v.number(),
  },
  handler: async (ctx, args) => {
    const { calculateSRM } = await import("../lib/brewmath");
    return { srm: calculateSRM(args.fermentables, args.batchSize) };
  },
});

/**
 * Calculate water salt additions for a style
 */
export const waterSalts = action({
  args: {
    style: v.string(),
    batchSize: v.number(),
  },
  handler: async (ctx, args) => {
    const { calculateWaterSalts } = await import("../lib/brewmath");
    return calculateWaterSalts(args.style, args.batchSize);
  },
});

/**
 * Calculate strike water temperature
 */
export const strikeTemp = action({
  args: {
    mashTemp: v.number(),
    grainTemp: v.optional(v.number()),
    waterRatio: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { calculateStrikeTemp } = await import("../lib/brewmath");
    return { 
      strikeTemp: calculateStrikeTemp(
        args.mashTemp, 
        args.grainTemp || 68, 
        args.waterRatio || 1.5
      ) 
    };
  },
});

/**
 * Calculate mash water volume
 */
export const mashVolume = action({
  args: {
    grainWeight: v.number(),
    waterRatio: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { calculateMashVolume } = await import("../lib/brewmath");
    return calculateMashVolume(args.grainWeight, args.waterRatio || 1.5);
  },
});

/**
 * What-if for pre-boil gravity
 */
export const whatIfPreBoil = action({
  args: {
    measuredGravity: v.number(),
    expectedGravity: v.number(),
    expectedOG: v.number(),
    targetEfficiency: v.number(),
  },
  handler: async (ctx, args) => {
    const { whatIfPreBoilGravity } = await import("../lib/brewmath");
    return whatIfPreBoilGravity(
      args.measuredGravity,
      args.expectedGravity,
      args.expectedOG,
      args.targetEfficiency
    );
  },
});

/**
 * Calculate DME needed to boost gravity
 */
export const dmeBoost = action({
  args: {
    currentGravity: v.number(),
    targetGravity: v.number(),
    volume: v.number(),
  },
  handler: async (ctx, args) => {
    const { calculateDMEBoost } = await import("../lib/brewmath");
    return calculateDMEBoost(args.currentGravity, args.targetGravity, args.volume);
  },
});
