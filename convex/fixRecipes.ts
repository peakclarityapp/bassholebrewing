import { mutation } from "./_generated/server";

// Fix recipes to match actual batch data
export const fixRecipeData = mutation({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db.query("recipes").collect();
    const results: string[] = [];
    
    for (const recipe of recipes) {
      if (recipe.name === "CASS IPA") {
        // Based on batch #12 - the hops are actually Simcoe, Amarillo, Citra (not CASS acronym)
        // The name comes from Cass Lake, MN - the acronym was a happy coincidence
        await ctx.db.patch(recipe._id, {
          coreHops: ["Simcoe", "Amarillo", "Citra"],
          coreMalts: ["Pale Ale Malt 2-Row", "Carapils", "Caramel Malt 10L", "Munich I"],
          description: "Named for Cass Lake, MN — where summer memories are made and the bass are always biting. A West Coast-style IPA with Simcoe, Amarillo, and Citra hops.",
        });
        results.push("Updated CASS IPA with batch #12 data");
      }
      
      if (recipe.name === "Riwaka Haka") {
        // Based on batch #20
        await ctx.db.patch(recipe._id, {
          coreHops: ["CTZ", "Citra", "Amarillo", "Riwaka"],
          coreMalts: ["Pale Malt 2-Row", "Caramel Malt 60L", "Midnight Wheat Malt"],
          description: "A Black IPA featuring New Zealand Riwaka hops. Dark and roasty with bright tropical notes — like a haka performed at midnight.",
        });
        results.push("Updated Riwaka Haka with batch #20 data");
      }
      
      if (recipe.name === "Czech Pilsner") {
        // Based on batch #6
        await ctx.db.patch(recipe._id, {
          coreHops: ["Saaz"],
          coreMalts: ["Pilsner Zero", "Carapils"],
          description: "A crisp, clean lager with noble Saaz hops. Sometimes restraint is the flex.",
        });
        results.push("Updated Czech Pilsner with batch #6 data");
      }
    }
    
    return results;
  },
});
