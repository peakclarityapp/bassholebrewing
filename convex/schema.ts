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
      v.literal("conditioning")
    ),
    beerId: v.optional(v.id("beers")),
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // RECIPES - Full recipe data with calculations
  // ═══════════════════════════════════════════════════════════════════════════
  recipes: defineTable({
    // Identity
    name: v.string(),
    style: v.string(),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    
    // Recipe type & settings
    type: v.optional(v.string()),              // "all-grain" | "extract" | "biab"
    batchSize: v.optional(v.number()),         // gallons
    boilTime: v.optional(v.number()),          // minutes
    efficiency: v.optional(v.number()),        // percent (e.g., 72)
    
    // Full fermentables list
    fermentables: v.optional(v.array(v.object({
      name: v.string(),
      amount: v.number(),          // lbs
      type: v.string(),            // "Grain" | "Extract" | "Sugar" | "Adjunct"
      color: v.optional(v.number()),   // Lovibond
      potential: v.optional(v.number()), // PPG (e.g., 37 for 2-row)
      percentage: v.optional(v.number()),
    }))),
    
    // Full hops list
    hopsDetailed: v.optional(v.array(v.object({
      name: v.string(),
      amount: v.number(),          // oz
      alpha: v.number(),           // AA%
      time: v.number(),            // minutes (0 for dry hop)
      use: v.string(),             // "Boil" | "Whirlpool" | "Dry Hop"
    }))),
    
    // Yeast
    yeastDetailed: v.optional(v.object({
      name: v.string(),
      attenuation: v.optional(v.number()),  // percent
      tempRange: v.optional(v.string()),
    })),
    
    // Water chemistry
    waterProfile: v.optional(v.object({
      gypsum: v.optional(v.number()),        // grams
      cacl2: v.optional(v.number()),         // grams
      lacticAcid: v.optional(v.number()),    // ml
      notes: v.optional(v.string()),
    })),
    
    // Mash schedule
    mashTemp: v.optional(v.number()),         // °F
    mashTime: v.optional(v.number()),         // minutes
    mashoutTime: v.optional(v.number()),      // minutes (optional mashout rest)
    hopstandTime: v.optional(v.number()),     // minutes (optional whirlpool/hopstand)
    
    // Calculated values (stored for quick display)
    calculatedOg: v.optional(v.number()),
    calculatedFg: v.optional(v.number()),
    calculatedAbv: v.optional(v.number()),
    calculatedIbu: v.optional(v.number()),
    calculatedSrm: v.optional(v.number()),
    
    // Legacy fields for simple display (keep for backwards compat)
    coreHops: v.optional(v.array(v.string())),
    coreMalts: v.optional(v.array(v.string())),
    
    // Aggregate ratings (computed)
    aggregateRating: v.optional(v.number()),
    totalRatings: v.optional(v.number()),
    batchCount: v.optional(v.number()),
    
    // Meta
    createdBy: v.optional(v.string()),        // "user" | "skippy"
    brewfatherRecipeId: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    
    // Hero image for recipe page
    heroImage: v.optional(v.string()),        // URL or storage ID
  }).index("by_name", ["name"])
    .index("by_style", ["style"])
    .index("by_brewfatherId", ["brewfatherRecipeId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // BEERS/BATCHES - Individual brew instances
  // ═══════════════════════════════════════════════════════════════════════════
  beers: defineTable({
    recipeId: v.optional(v.id("recipes")),
    
    name: v.string(),
    style: v.string(),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    abv: v.number(),
    ibu: v.optional(v.number()),
    og: v.optional(v.number()),
    fg: v.optional(v.number()),
    srm: v.optional(v.number()),
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
    
    // Ingredients (batch-specific, may differ from recipe)
    hops: v.optional(v.array(v.string())),
    malts: v.optional(v.array(v.string())),
    yeast: v.optional(v.string()),
    flavorTags: v.optional(v.array(v.string())),
    
    // Full recipe data (copied from master, editable per-batch)
    batchSize: v.optional(v.number()),
    boilTime: v.optional(v.number()),
    efficiency: v.optional(v.number()),
    fermentables: v.optional(v.array(v.object({
      name: v.string(),
      amount: v.number(),
      type: v.string(),
      color: v.optional(v.number()),
      potential: v.optional(v.number()),
      percentage: v.optional(v.number()),
    }))),
    hopsDetailed: v.optional(v.array(v.object({
      name: v.string(),
      amount: v.number(),
      alpha: v.number(),
      time: v.number(),
      use: v.string(),
    }))),
    yeastDetailed: v.optional(v.object({
      name: v.string(),
      attenuation: v.optional(v.number()),
      tempRange: v.optional(v.string()),
    })),
    waterProfile: v.optional(v.object({
      gypsum: v.optional(v.number()),
      cacl2: v.optional(v.number()),
      lacticAcid: v.optional(v.number()),
      notes: v.optional(v.string()),
    })),
    mashTemp: v.optional(v.number()),
    mashTime: v.optional(v.number()),
    mashoutTime: v.optional(v.number()),
    hopstandTime: v.optional(v.number()),
    
    // Brew day measurements
    measuredMashPh: v.optional(v.number()),
    measuredPreBoilGravity: v.optional(v.number()),
    measuredPreBoilVolume: v.optional(v.number()),
    measuredPostBoilVolume: v.optional(v.number()),
    measuredOg: v.optional(v.number()),
    measuredFg: v.optional(v.number()),
    actualEfficiency: v.optional(v.number()),
    
    // Fermentation tracking
    pitchDate: v.optional(v.string()),
    pitchTemp: v.optional(v.number()),
    dryHopDate: v.optional(v.string()),
    packageDate: v.optional(v.string()),
    packageVolume: v.optional(v.number()),
  }).index("by_status", ["status"])
    .index("by_batchNo", ["batchNo"])
    .index("by_brewfatherId", ["brewfatherId"])
    .index("by_recipeId", ["recipeId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // FERMENTATION LOGS - Time-series gravity/temp readings
  // ═══════════════════════════════════════════════════════════════════════════
  fermentationLogs: defineTable({
    beerId: v.id("beers"),
    timestamp: v.number(),
    gravity: v.optional(v.number()),
    temperature: v.optional(v.number()),
    ph: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("by_beer", ["beerId"])
    .index("by_beer_time", ["beerId", "timestamp"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // INVENTORY - Hops, grains, yeast, misc
  // ═══════════════════════════════════════════════════════════════════════════
  inventory: defineTable({
    type: v.string(),              // "hop" | "fermentable" | "yeast" | "misc"
    name: v.string(),
    amount: v.number(),
    unit: v.string(),              // "g" | "kg" | "oz" | "lb" | "pkg"
    
    // Type-specific properties
    alpha: v.optional(v.number()),           // hops - AA%
    color: v.optional(v.number()),           // fermentables - Lovibond
    potential: v.optional(v.number()),       // fermentables - PPG
    attenuation: v.optional(v.number()),     // yeast - %
    
    // Tracking
    purchaseDate: v.optional(v.string()),
    bestBefore: v.optional(v.string()),
    lotNumber: v.optional(v.string()),
    supplier: v.optional(v.string()),
    
    // For matching with Brewfather
    brewfatherId: v.optional(v.string()),
  }).index("by_type", ["type"])
    .index("by_name", ["name"])
    .index("by_brewfatherId", ["brewfatherId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // WATER PROFILES - Source and target profiles
  // ═══════════════════════════════════════════════════════════════════════════
  waterProfiles: defineTable({
    name: v.string(),
    calcium: v.number(),
    magnesium: v.number(),
    sodium: v.number(),
    sulfate: v.number(),
    chloride: v.number(),
    bicarbonate: v.number(),
    ph: v.optional(v.number()),
    isSource: v.boolean(),         // true = tap water, false = target
  }).index("by_name", ["name"]),
});
