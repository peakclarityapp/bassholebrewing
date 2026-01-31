import { mutation, query } from "./_generated/server";

// Debug: check what's in the taps table
export const debugTaps = query({
  args: {},
  handler: async (ctx) => {
    const taps = await ctx.db.query("taps").collect();
    return {
      count: taps.length,
      raw: taps,
    };
  },
});

// Delete all taps and recreate them
export const recreateTaps = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete existing taps
    const existingTaps = await ctx.db.query("taps").collect();
    for (const tap of existingTaps) {
      await ctx.db.delete(tap._id);
    }
    
    // Create 4 fresh taps
    const created = [];
    for (let i = 1; i <= 4; i++) {
      const id = await ctx.db.insert("taps", {
        number: i,
        status: "empty",
        beerId: undefined,
      });
      created.push({ number: i, id });
    }
    
    return { 
      deleted: existingTaps.length, 
      created: created.length,
      taps: created 
    };
  },
});
