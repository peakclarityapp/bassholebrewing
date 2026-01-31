import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get brewery info
export const getBrewery = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("brewery").first();
  },
});

// Get all taps with their beers
export const getTaps = query({
  args: {},
  handler: async (ctx) => {
    const taps = await ctx.db.query("taps").collect();
    
    // Fetch beer details for each tap
    const tapsWithBeers = await Promise.all(
      taps.map(async (tap) => {
        const beer = tap.beerId 
          ? await ctx.db.get(tap.beerId)
          : null;
        return { ...tap, beer };
      })
    );
    
    // Sort by tap number
    return tapsWithBeers.sort((a, b) => a.number - b.number);
  },
});

// Get pipeline (fermenting, conditioning, planning)
export const getPipeline = query({
  args: {},
  handler: async (ctx) => {
    const beers = await ctx.db.query("beers").collect();
    return beers.filter(b => 
      ["planning", "brewing", "fermenting", "conditioning", "carbonating"].includes(b.status)
    ).sort((a, b) => {
      const order = ["fermenting", "conditioning", "carbonating", "brewing", "planning"];
      return order.indexOf(a.status) - order.indexOf(b.status);
    });
  },
});

// Get archive (completed/kicked beers)
export const getArchive = query({
  args: {},
  handler: async (ctx) => {
    const beers = await ctx.db.query("beers").collect();
    return beers
      .filter(b => ["on-tap", "kicked", "archived"].includes(b.status))
      .sort((a, b) => b.batchNo - a.batchNo);
  },
});

// Update tap status
export const updateTapStatus = mutation({
  args: {
    tapNumber: v.number(),
    status: v.union(
      v.literal("full"),
      v.literal("half"),
      v.literal("low"),
      v.literal("kicked"),
      v.literal("empty"),
      v.literal("conditioning")
    ),
  },
  handler: async (ctx, args) => {
    const tap = await ctx.db
      .query("taps")
      .filter((q) => q.eq(q.field("number"), args.tapNumber))
      .first();
    
    if (tap) {
      await ctx.db.patch(tap._id, { status: args.status });
    }
  },
});

// Assign beer to tap
export const assignBeerToTap = mutation({
  args: {
    tapNumber: v.number(),
    beerId: v.optional(v.id("beers")),
    status: v.optional(v.union(
      v.literal("full"),
      v.literal("half"),
      v.literal("low"),
      v.literal("kicked"),
      v.literal("empty"),
      v.literal("conditioning")
    )),
  },
  handler: async (ctx, args) => {
    const tap = await ctx.db
      .query("taps")
      .filter((q) => q.eq(q.field("number"), args.tapNumber))
      .first();
    
    if (tap) {
      await ctx.db.patch(tap._id, { 
        beerId: args.beerId,
        status: args.status ?? (args.beerId ? "full" : "empty")
      });
      
      // If assigning a beer, update its status to on-tap
      if (args.beerId) {
        await ctx.db.patch(args.beerId, { status: "on-tap" });
      }
    }
  },
});

// Add a new beer
export const addBeer = mutation({
  args: {
    name: v.string(),
    style: v.string(),
    tagline: v.optional(v.string()),
    abv: v.number(),
    ibu: v.optional(v.number()),
    brewDate: v.optional(v.string()),
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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("beers", args);
  },
});

// Update beer status
export const updateBeerStatus = mutation({
  args: {
    beerId: v.id("beers"),
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
    daysIn: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { beerId, ...updates } = args;
    await ctx.db.patch(beerId, updates);
  },
});
