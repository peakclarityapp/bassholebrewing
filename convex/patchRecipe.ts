import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const patchByName = mutation({
  args: {
    name: v.string(),
    coreHops: v.optional(v.array(v.string())),
    coreMalts: v.optional(v.array(v.string())),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const recipe = await ctx.db
      .query("recipes")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    
    if (!recipe) {
      throw new Error(`Recipe "${args.name}" not found`);
    }
    
    const updates: any = {};
    if (args.coreHops) updates.coreHops = args.coreHops;
    if (args.coreMalts) updates.coreMalts = args.coreMalts;
    if (args.tagline) updates.tagline = args.tagline;
    if (args.description) updates.description = args.description;
    
    await ctx.db.patch(recipe._id, updates);
    
    return { updated: args.name, fields: Object.keys(updates) };
  },
});
