import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Raters (people who rate beers)
  raters: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  // Ratings (attached to batches/beers, roll up to recipes)
  ratings: defineTable({
    beerId: v.id("beers"),
    raterId: v.id("raters"),
    score: v.number(), // 1.0 - 5.0 with decimals
    note: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_beer", ["beerId"])
    .index("by_rater", ["raterId"])
    .index("by_beer_rater", ["beerId", "raterId"]),

  // Brewery info (singleton)
  brewery: defineTable({
    name: v.string(),
    tagline: v.string(),
    location: v.string(),
    established: v.number(),
    system: v.string(),
    batchSize: v.string(),
    philosophy: v.string(),
  }),

  // Individual taps
  taps: defineTable({
    number: v.number(), // 1-4
    status: v.union(
      v.literal("full"),
      v.literal("half"),
      v.literal("low"),
      v.literal("kicked"),
      v.literal("empty"),
      v.literal("conditioning")  // Beer on tap but not ready to pour yet
    ),
    beerId: v.optional(v.id("beers")),
  }),

  // NEW: Recipes (parent entity for beers/batches)
  recipes: defineTable({
    name: v.string(),                           // "CASS IPA"
    style: v.string(),                          // "American IPA"
    tagline: v.optional(v.string()),            // Best tagline for this recipe
    description: v.optional(v.string()),        // Longer description
    coreHops: v.optional(v.array(v.string())),  // Signature hops
    coreMalts: v.optional(v.array(v.string())), // Signature malts
    // Computed/cached aggregates (updated when ratings change)
    aggregateRating: v.optional(v.number()),    // Average across all batches
    totalRatings: v.optional(v.number()),       // Total ratings across all batches
    batchCount: v.optional(v.number()),         // Number of batches
  }).index("by_name", ["name"]),

  // Beers/Batches (can be on tap, in pipeline, or archived)
  beers: defineTable({
    // NEW: Link to parent recipe (null = standalone beer)
    recipeId: v.optional(v.id("recipes")),
    
    name: v.string(),                           // Batch nickname or recipe name
    style: v.string(),
    tagline: v.optional(v.string()),            // Batch-specific tagline (optional)
    description: v.optional(v.string()),        // Longer flavor description
    abv: v.number(),
    ibu: v.optional(v.number()),
    og: v.optional(v.number()),                 // Original gravity
    fg: v.optional(v.number()),                 // Final gravity
    srm: v.optional(v.number()),                // Color
    brewDate: v.optional(v.string()),
    batchNo: v.number(),
    status: v.union(
      v.literal("planning"),
      v.literal("brewing"),
      v.literal("fermenting"),
      v.literal("conditioning"),
      v.literal("carbonating"),
      v.literal("on-tap"),
      v.literal("kicked"),
      v.literal("archived")
    ),
    daysIn: v.optional(v.number()),
    notes: v.optional(v.string()),
    brewfatherId: v.optional(v.string()),
    // Recipe details from Brewfather (batch-specific)
    hops: v.optional(v.array(v.string())),      // ["Citra", "Mosaic", "Galaxy"]
    malts: v.optional(v.array(v.string())),     // ["Pale Malt", "Crystal 40"]
    yeast: v.optional(v.string()),              // "US-05"
    flavorTags: v.optional(v.array(v.string())), // ["tropical", "citrus", "juicy"]
  }).index("by_status", ["status"])
    .index("by_batchNo", ["batchNo"])
    .index("by_brewfatherId", ["brewfatherId"])
    .index("by_recipeId", ["recipeId"]),        // NEW: Find batches by recipe
});
