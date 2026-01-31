import { mutation } from "./_generated/server";

// Force create taps (always runs, no check)
export const createTaps = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if taps exist
    const existingTaps = await ctx.db.query("taps").collect();
    
    if (existingTaps.length > 0) {
      return { status: "taps_exist", count: existingTaps.length };
    }
    
    // Create 4 taps
    for (let i = 1; i <= 4; i++) {
      await ctx.db.insert("taps", {
        number: i,
        status: i <= 2 ? "full" : (i === 3 ? "kicked" : "empty"),
        beerId: undefined,
      });
    }
    
    return { status: "created", count: 4 };
  },
});
