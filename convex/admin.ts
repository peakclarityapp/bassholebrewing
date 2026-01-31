import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Check admin password
export const checkPassword = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const correctPassword = process.env.ADMIN_PASSWORD || "bassholeadmin";
    return args.password === correctPassword;
  },
});

// Get all beers for admin
export const getAllBeers = query({
  args: {},
  handler: async (ctx) => {
    const beers = await ctx.db.query("beers").collect();
    return beers.sort((a, b) => (b.batchNo || 0) - (a.batchNo || 0));
  },
});

// Get all taps with beer details
export const getAllTaps = query({
  args: {},
  handler: async (ctx) => {
    const taps = await ctx.db.query("taps").collect();
    const tapsWithBeers = await Promise.all(
      taps.map(async (tap) => {
        const beer = tap.beerId ? await ctx.db.get(tap.beerId) : null;
        return { ...tap, beer };
      })
    );
    return tapsWithBeers.sort((a, b) => a.number - b.number);
  },
});

// Assign beer to tap
export const assignToTap = mutation({
  args: {
    tapNumber: v.number(),
    beerId: v.optional(v.id("beers")),
    status: v.union(
      v.literal("full"),
      v.literal("half"),
      v.literal("low"),
      v.literal("kicked"),
      v.literal("empty")
    ),
  },
  handler: async (ctx, args) => {
    // Find the tap
    const tap = await ctx.db
      .query("taps")
      .filter((q) => q.eq(q.field("number"), args.tapNumber))
      .first();

    if (!tap) {
      throw new Error(`Tap ${args.tapNumber} not found`);
    }

    // If there was a previous beer on this tap, update its status
    if (tap.beerId && tap.beerId !== args.beerId) {
      await ctx.db.patch(tap.beerId, { status: "kicked" });
    }

    // Update the tap
    await ctx.db.patch(tap._id, {
      beerId: args.beerId,
      status: args.status,
    });

    // If assigning a beer, update its status to on-tap
    if (args.beerId) {
      await ctx.db.patch(args.beerId, { status: "on-tap" });
    }

    return { success: true };
  },
});

// Update tap fill level
export const updateTapLevel = mutation({
  args: {
    tapNumber: v.number(),
    status: v.union(
      v.literal("full"),
      v.literal("half"),
      v.literal("low"),
      v.literal("kicked"),
      v.literal("empty")
    ),
  },
  handler: async (ctx, args) => {
    const tap = await ctx.db
      .query("taps")
      .filter((q) => q.eq(q.field("number"), args.tapNumber))
      .first();

    if (!tap) {
      throw new Error(`Tap ${args.tapNumber} not found`);
    }

    await ctx.db.patch(tap._id, { status: args.status });

    // If kicked/empty, update beer status too
    if ((args.status === "kicked" || args.status === "empty") && tap.beerId) {
      await ctx.db.patch(tap.beerId, { status: "kicked" });
    }

    return { success: true };
  },
});

// Update beer status directly
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
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.beerId, { status: args.status });
    return { success: true };
  },
});

// Update beer description and flavor info
export const updateBeerDescription = mutation({
  args: {
    beerId: v.id("beers"),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    flavorTags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { beerId, ...updates } = args;
    await ctx.db.patch(beerId, updates);
    return { success: true };
  },
});
