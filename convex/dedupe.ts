import { mutation } from "./_generated/server";

// Remove duplicate beers, keeping the one with brewfatherId (synced) or most recent
export const dedupeBeers = mutation({
  args: {},
  handler: async (ctx) => {
    const beers = await ctx.db.query("beers").collect();
    
    // Group by name
    const byName: Record<string, typeof beers> = {};
    for (const beer of beers) {
      const name = beer.name.trim();
      if (!byName[name]) byName[name] = [];
      byName[name].push(beer);
    }
    
    let deleted = 0;
    const kept: string[] = [];
    
    for (const [name, dupes] of Object.entries(byName)) {
      if (dupes.length <= 1) {
        kept.push(name);
        continue;
      }
      
      // Sort: prefer ones with brewfatherId, then by creation time (newest first)
      dupes.sort((a, b) => {
        if (a.brewfatherId && !b.brewfatherId) return -1;
        if (!a.brewfatherId && b.brewfatherId) return 1;
        return b._creationTime - a._creationTime;
      });
      
      // Keep first, delete rest
      kept.push(dupes[0].name);
      for (let i = 1; i < dupes.length; i++) {
        await ctx.db.delete(dupes[i]._id);
        deleted++;
      }
    }
    
    return { deleted, remaining: kept.length };
  },
});
