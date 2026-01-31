import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
      v.literal("empty")
    ),
    beerId: v.optional(v.id("beers")),
  }),

  // Beers (can be on tap, in pipeline, or archived)
  beers: defineTable({
    name: v.string(),
    style: v.string(),
    tagline: v.optional(v.string()),
    abv: v.number(),
    ibu: v.optional(v.number()),
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
  }).index("by_status", ["status"]).index("by_batchNo", ["batchNo"]).index("by_brewfatherId", ["brewfatherId"]),
});
