import { mutation } from "./_generated/server";

// Seed the database with initial data
export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingBrewery = await ctx.db.query("brewery").first();
    if (existingBrewery) {
      return { status: "already seeded" };
    }

    // Create brewery info
    await ctx.db.insert("brewery", {
      name: "Bass Hole Brewing",
      tagline: "Basement brews with attitude",
      location: "Riverside, IL",
      established: 2024,
      system: "Anvil Foundry 4 gal",
      batchSize: "2.5 gal",
      philosophy: "Hoppy, sessionable, and made with love",
    });

    // Create beers
    const americanIpa = await ctx.db.insert("beers", {
      name: "American IPA",
      style: "American IPA",
      tagline: "The classic. Citrus and pine.",
      abv: 6.8,
      ibu: 60,
      brewDate: "2025-11-30",
      batchNo: 16,
      status: "on-tap",
    });

    const newJobIpa = await ctx.db.insert("beers", {
      name: "New Job IPA",
      style: "West Coast IPA",
      tagline: "Celebrating new beginnings",
      abv: 7.2,
      ibu: 65,
      brewDate: "2025-11-22",
      batchNo: 15,
      status: "on-tap",
    });

    const riwakaHaka = await ctx.db.insert("beers", {
      name: "Riwaka Haka",
      style: "New Zealand IPA",
      tagline: "Tropical vibes from down under",
      abv: 6.5,
      ibu: 50,
      brewDate: "2025-10-19",
      batchNo: 13,
      status: "on-tap",
    });

    const skippysBeer = await ctx.db.insert("beers", {
      name: "Skippy's \"A Bit Much\"",
      style: "Hazy IPA",
      tagline: "Heavy tropical hops. A bit much? Maybe. Worth it? Absolutely.",
      abv: 7.0,
      ibu: 55,
      brewDate: "2026-01-11",
      batchNo: 19,
      status: "fermenting",
      daysIn: 20,
      notes: "Heavy tropical hops. A bit much? Maybe. Worth it? Absolutely.",
    });

    await ctx.db.insert("beers", {
      name: "Windsor Blonde Ale",
      style: "Blonde Ale",
      abv: 5.0,
      batchNo: 21,
      status: "planning",
      notes: "Light, easy drinking. Perfect for guests.",
    });

    // Archived beers
    await ctx.db.insert("beers", {
      name: "CASS IPA",
      style: "American IPA",
      abv: 6.9,
      ibu: 55,
      brewDate: "2025-10-18",
      batchNo: 12,
      status: "kicked",
    });

    await ctx.db.insert("beers", {
      name: "Bass Hole Black IPA",
      style: "Black IPA",
      abv: 7.0,
      ibu: 70,
      brewDate: "2024-11-01",
      batchNo: 11,
      status: "kicked",
    });

    await ctx.db.insert("beers", {
      name: "Czech Pilsner",
      style: "Czech Pilsner",
      abv: 5.2,
      ibu: 35,
      brewDate: "2024-04-05",
      batchNo: 6,
      status: "kicked",
    });

    await ctx.db.insert("beers", {
      name: "Belgian Tripel",
      style: "Belgian Tripel",
      abv: 9.5,
      ibu: 25,
      brewDate: "2024-03-14",
      batchNo: 4,
      status: "kicked",
    });

    // Create taps
    await ctx.db.insert("taps", { number: 1, status: "full", beerId: americanIpa });
    await ctx.db.insert("taps", { number: 2, status: "half", beerId: newJobIpa });
    await ctx.db.insert("taps", { number: 3, status: "low", beerId: riwakaHaka });
    await ctx.db.insert("taps", { number: 4, status: "empty", beerId: undefined });

    return { status: "seeded successfully" };
  },
});
