import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Sync beers from Brewfather with full recipe details
export const syncFromBrewfather = action({
  args: {},
  handler: async (ctx) => {
    const userId = process.env.BREWFATHER_USER_ID;
    const apiKey = process.env.BREWFATHER_API_KEY;

    if (!userId || !apiKey) {
      throw new Error("Brewfather credentials not configured");
    }

    // Base64 encode credentials (btoa works in Convex runtime)
    const auth = btoa(`${userId}:${apiKey}`);

    // Fetch batches from Brewfather (include=recipe gets full recipe with abv, ibu, style, hops, fermentables, yeasts)
    const response = await fetch(
      "https://api.brewfather.app/v2/batches?limit=50&include=recipe",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Brewfather API error: ${response.status}`);
    }

    const batches = await response.json();

    // Transform and upsert each batch
    for (const batch of batches) {
      // Extract hop names
      const hops = batch.recipe?.hops
        ?.map((h: any) => h.name)
        ?.filter((name: string, index: number, self: string[]) => 
          self.indexOf(name) === index // unique
        ) || [];

      // Extract malt/fermentable names
      const malts = batch.recipe?.fermentables
        ?.map((f: any) => f.name)
        ?.filter((name: string, index: number, self: string[]) => 
          self.indexOf(name) === index
        ) || [];

      // Extract yeast name
      const yeast = batch.recipe?.yeasts?.[0]?.name || undefined;

      await ctx.runMutation(internal.sync.upsertBeer, {
        brewfatherId: batch._id,
        name: batch.recipe?.name?.trim() || `Batch ${batch.batchNo}`,
        style: batch.recipe?.style?.name || "Unknown",
        abv: batch.measuredAbv || batch.recipe?.abv || 0,
        ibu: batch.recipe?.ibu || undefined,
        og: batch.measuredOg || batch.recipe?.og || undefined,
        fg: batch.measuredFg || batch.recipe?.fg || undefined,
        srm: batch.recipe?.color || undefined,
        brewDate: batch.brewDate 
          ? new Date(batch.brewDate).toISOString().split("T")[0] 
          : undefined,
        batchNo: batch.batchNo,
        status: mapBrewfatherStatus(batch.status),
        hops,
        malts,
        yeast,
      });
    }

    return { synced: batches.length };
  },
});

// Map Brewfather status to our status
function mapBrewfatherStatus(bfStatus: string): string {
  const statusMap: Record<string, string> = {
    "Planning": "planning",
    "Brewing": "brewing", 
    "Fermenting": "fermenting",
    "Conditioning": "conditioning",
    "Completed": "archived",
    "Archived": "archived",
  };
  return statusMap[bfStatus] || "archived";
}

// Internal mutation to upsert a beer
export const upsertBeer = internalMutation({
  args: {
    brewfatherId: v.string(),
    name: v.string(),
    style: v.string(),
    abv: v.number(),
    ibu: v.optional(v.number()),
    og: v.optional(v.number()),
    fg: v.optional(v.number()),
    srm: v.optional(v.number()),
    brewDate: v.optional(v.string()),
    batchNo: v.number(),
    status: v.string(),
    hops: v.array(v.string()),
    malts: v.array(v.string()),
    yeast: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if beer with this brewfatherId exists
    const existing = await ctx.db
      .query("beers")
      .withIndex("by_brewfatherId", (q) => q.eq("brewfatherId", args.brewfatherId))
      .first();

    if (existing) {
      // Update existing beer (preserve on-tap status, tagline, description, flavorTags)
      const newStatus = existing.status === "on-tap" ? "on-tap" : args.status;
      await ctx.db.patch(existing._id, {
        name: args.name,
        style: args.style,
        abv: args.abv,
        ibu: args.ibu,
        og: args.og,
        fg: args.fg,
        srm: args.srm,
        brewDate: args.brewDate,
        batchNo: args.batchNo,
        status: newStatus as any,
        hops: args.hops,
        malts: args.malts,
        yeast: args.yeast,
        // Keep existing tagline, description, flavorTags if set
      });
    } else {
      // Insert new beer
      await ctx.db.insert("beers", {
        name: args.name,
        style: args.style,
        abv: args.abv,
        ibu: args.ibu,
        og: args.og,
        fg: args.fg,
        srm: args.srm,
        brewDate: args.brewDate,
        batchNo: args.batchNo,
        status: args.status as any,
        hops: args.hops,
        malts: args.malts,
        yeast: args.yeast,
        brewfatherId: args.brewfatherId,
      });
    }
  },
});
