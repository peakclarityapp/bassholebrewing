import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all inventory
 */
export const list = query({
  args: {
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("inventory")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    }
    return await ctx.db.query("inventory").collect();
  },
});

/**
 * Get hops inventory
 */
export const getHops = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("inventory")
      .withIndex("by_type", (q) => q.eq("type", "hop"))
      .collect();
  },
});

/**
 * Get fermentables inventory
 */
export const getFermentables = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("inventory")
      .withIndex("by_type", (q) => q.eq("type", "fermentable"))
      .collect();
  },
});

/**
 * Get yeast inventory
 */
export const getYeast = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("inventory")
      .withIndex("by_type", (q) => q.eq("type", "yeast"))
      .collect();
  },
});

/**
 * Search inventory by name
 */
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("inventory").collect();
    const lower = args.query.toLowerCase();
    
    return all.filter(item => 
      item.name.toLowerCase().includes(lower)
    );
  },
});

/**
 * Get low stock items
 */
export const getLowStock = query({
  args: {
    hopThresholdOz: v.optional(v.number()),
    grainThresholdLbs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hopThreshold = args.hopThresholdOz || 2; // oz
    const grainThreshold = args.grainThresholdLbs || 2; // lbs
    
    const all = await ctx.db.query("inventory").collect();
    
    return all.filter(item => {
      if (item.type === "hop") {
        const oz = item.unit === "oz" ? item.amount : item.amount * 35.274;
        return oz < hopThreshold;
      }
      if (item.type === "fermentable") {
        const lbs = item.unit === "lb" ? item.amount : item.amount * 2.205;
        return lbs < grainThreshold;
      }
      if (item.type === "yeast") {
        return item.amount < 1;
      }
      return false;
    });
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Add inventory item
 */
export const add = mutation({
  args: {
    type: v.string(),
    name: v.string(),
    amount: v.number(),
    unit: v.string(),
    alpha: v.optional(v.number()),
    color: v.optional(v.number()),
    potential: v.optional(v.number()),
    attenuation: v.optional(v.number()),
    purchaseDate: v.optional(v.string()),
    bestBefore: v.optional(v.string()),
    lotNumber: v.optional(v.string()),
    supplier: v.optional(v.string()),
    brewfatherId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inventory", args);
  },
});

/**
 * Update inventory amount
 */
export const updateAmount = mutation({
  args: {
    id: v.id("inventory"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { amount: args.amount });
    return args.id;
  },
});

/**
 * Deduct from inventory
 */
export const deduct = mutation({
  args: {
    id: v.id("inventory"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Inventory item not found");
    
    const newAmount = Math.max(0, item.amount - args.amount);
    await ctx.db.patch(args.id, { amount: newAmount });
    
    return { id: args.id, newAmount };
  },
});

/**
 * Delete inventory item
 */
export const remove = mutation({
  args: { id: v.id("inventory") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Bulk import from Brewfather
 */
export const bulkImport = mutation({
  args: {
    items: v.array(v.object({
      type: v.string(),
      name: v.string(),
      amount: v.number(),
      unit: v.string(),
      alpha: v.optional(v.number()),
      color: v.optional(v.number()),
      potential: v.optional(v.number()),
      attenuation: v.optional(v.number()),
      brewfatherId: v.optional(v.string()),
    })),
    clearExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Clear existing if requested
    if (args.clearExisting) {
      const existing = await ctx.db.query("inventory").collect();
      for (const item of existing) {
        await ctx.db.delete(item._id);
      }
    }
    
    // Import new items
    const ids = [];
    for (const item of args.items) {
      const id = await ctx.db.insert("inventory", item);
      ids.push(id);
    }
    
    return { imported: ids.length };
  },
});
