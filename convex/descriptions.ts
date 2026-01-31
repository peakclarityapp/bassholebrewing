import { mutation } from "./_generated/server";

// Add Skippy's descriptions to beers
export const addDescriptions = mutation({
  args: {},
  handler: async (ctx) => {
    const beers = await ctx.db.query("beers").collect();
    
    // Normalize name for matching (handle curly vs straight quotes)
    const normalize = (name: string) => name.replace(/[""]/g, '"').replace(/'/g, "'").toLowerCase().trim();
    
    const descriptions: Record<string, { tagline: string; flavorTags: string[] }> = {
      "skippy's \"a bit much\"": {
        tagline: "Heavy tropical chaos. A bit much? Maybe. Worth it? Absolutely.",
        flavorTags: ["tropical", "citrus", "juicy", "hazy"],
      },
      "american ipa": {
        tagline: "The OG. West coast vibes with citrus and pine.",
        flavorTags: ["citrus", "pine", "hoppy"],
      },
      "new job ipa": {
        tagline: "Celebrating new beginnings with a bitter-sweet send-off.",
        flavorTags: ["citrus", "dank", "piney"],
      },
      "riwaka haka": {
        tagline: "Tropical warfare from across the Pacific. The Kiwis know what's up.",
        flavorTags: ["tropical", "fruity", "floral"],
      },
      "riwaka haka (batch #13)": {
        tagline: "Tropical warfare redux. Even more Pacific punch.",
        flavorTags: ["tropical", "fruity", "floral"],
      },
      "cass ipa": {
        tagline: "Dedicated to the crew. Crisp, aggressive, sessionably dangerous.",
        flavorTags: ["citrus", "pine", "balanced"],
      },
      "bass hole black ipa": {
        tagline: "The dark side of hops. Roasty meets dank in the basement depths.",
        flavorTags: ["roasty", "pine", "hoppy"],
      },
      "czech pilsner": {
        tagline: "Proof that I can show restraint. Crisp, clean, dangerously drinkable.",
        flavorTags: ["crisp", "malty", "floral"],
      },
      "belgian tripel": {
        tagline: "Monastic vibes, basement chaos. Fruity, spicy, and sneakily strong.",
        flavorTags: ["fruity", "spicy", "boozy"],
      },
      "windsor blonde ale": {
        tagline: "Light, easy drinking. Perfect for guests who fear flavor.",
        flavorTags: ["crisp", "malty", "light"],
      },
      "iceman ipa": {
        tagline: "Brewed the day after Caleb's ice-cold comeback vs the Pack. Bear Down. 🐻⬇️",
        flavorTags: ["tropical", "citrus", "smooth"],
      },
      "bs ipa": {
        tagline: "No BS here. Just pure hoppy goodness.",
        flavorTags: ["hoppy", "citrus", "dank"],
      },
      "blonde ale": {
        tagline: "Easy going. The beer equivalent of a chill weekend.",
        flavorTags: ["light", "crisp", "refreshing"],
      },
    };
    
    let updated = 0;
    for (const beer of beers) {
      const normalizedName = normalize(beer.name);
      const desc = descriptions[normalizedName];
      if (desc && !beer.tagline) {
        await ctx.db.patch(beer._id, {
          tagline: desc.tagline,
          flavorTags: desc.flavorTags,
        });
        updated++;
      }
    }
    
    return { updated, total: beers.length };
  },
});
