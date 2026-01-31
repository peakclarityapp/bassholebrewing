import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Sync beers from Brewfather
export const syncFromBrewfather = action({
  args: {},
  handler: async (ctx) => {
    const userId = process.env.BREWFATHER_USER_ID;
    const apiKey = process.env.BREWFATHER_API_KEY;

    if (!userId || !apiKey) {
      throw new Error("Brewfather credentials not configured");
    }

    const auth = Buffer.from(`${userId}:${apiKey}`).toString("base64");

    // Fetch batches from Brewfather
    const response = await fetch("https://api.brewfather.app/v2/batches?limit=50", {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Brewfather API error: ${response.status}`);
    }

    const batches = await response.json();

    // Transform and upsert each batch
    for (const batch of batches) {
      await ctx.runMutation(internal.sync.upsertBeer, {
        brewfatherId: batch._id,
        name: batch.recipe?.name?.trim() || `Batch ${batch.batchNo}`,
        style: batch.recipe?.style?.name || "Unknown",
        abv: batch.measuredAbv || batch.recipe?.abv || 0,
        ibu: batch.recipe?.ibu || undefined,
        brewDate: batch.brewDate ? new Date(batch.brewDate).toISOString().split("T")[0] : undefined,
        batchNo: batch.batchNo,
        status: mapBrewfatherStatus(batch.status),
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
    brewDate: v.optional(v.string()),
    batchNo: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if beer with this brewfatherId exists
    const existing = await ctx.db
      .query("beers")
      .filter((q) => q.eq(q.field("brewfatherId"), args.brewfatherId))
      .first();

    if (existing) {
      // Update existing beer (but preserve on-tap status if set)
      const newStatus = existing.status === "on-tap" ? "on-tap" : args.status;
      await ctx.db.patch(existing._id, {
        name: args.name,
        style: args.style,
        abv: args.abv,
        ibu: args.ibu,
        brewDate: args.brewDate,
        batchNo: args.batchNo,
        status: newStatus as any,
      });
    } else {
      // Insert new beer
      await ctx.db.insert("beers", {
        name: args.name,
        style: args.style,
        abv: args.abv,
        ibu: args.ibu,
        brewDate: args.brewDate,
        batchNo: args.batchNo,
        status: args.status as any,
        brewfatherId: args.brewfatherId,
      });
    }
  },
});
