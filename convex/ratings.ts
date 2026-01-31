import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get or create a rater by name
export const getOrCreateRater = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("raters")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    
    if (existing) return existing._id;
    
    return await ctx.db.insert("raters", {
      name: args.name,
      createdAt: Date.now(),
    });
  },
});

// Get rater by ID
export const getRater = query({
  args: { raterId: v.id("raters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.raterId);
  },
});

// Submit a rating
export const submitRating = mutation({
  args: {
    beerId: v.id("beers"),
    raterId: v.id("raters"),
    score: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if this rater already rated this beer
    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_beer_rater", (q) => 
        q.eq("beerId", args.beerId).eq("raterId", args.raterId)
      )
      .first();
    
    if (existing) {
      // Update existing rating
      await ctx.db.patch(existing._id, {
        score: args.score,
        note: args.note,
        createdAt: Date.now(),
      });
      return existing._id;
    }
    
    // Create new rating
    return await ctx.db.insert("ratings", {
      beerId: args.beerId,
      raterId: args.raterId,
      score: args.score,
      note: args.note,
      createdAt: Date.now(),
    });
  },
});

// Get all ratings for a beer
export const getBeerRatings = query({
  args: { beerId: v.id("beers") },
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_beer", (q) => q.eq("beerId", args.beerId))
      .collect();
    
    // Get rater names
    const ratingsWithNames = await Promise.all(
      ratings.map(async (r) => {
        const rater = await ctx.db.get(r.raterId);
        return { ...r, raterName: rater?.name || "Unknown" };
      })
    );
    
    return ratingsWithNames;
  },
});

// Get all ratings by a rater
export const getRaterRatings = query({
  args: { raterId: v.id("raters") },
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_rater", (q) => q.eq("raterId", args.raterId))
      .collect();
    
    // Get beer details
    const ratingsWithBeers = await Promise.all(
      ratings.map(async (r) => {
        const beer = await ctx.db.get(r.beerId);
        return { ...r, beer };
      })
    );
    
    return ratingsWithBeers;
  },
});

// Get all raters
export const getAllRaters = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("raters").collect();
  },
});

// Get leaderboard data
export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const allRatings = await ctx.db.query("ratings").collect();
    const allBeers = await ctx.db.query("beers").collect();
    const allRaters = await ctx.db.query("raters").collect();
    
    // Calculate average rating per beer
    const beerStats: Record<string, { total: number; count: number; ratings: any[] }> = {};
    for (const rating of allRatings) {
      const beerId = rating.beerId as string;
      if (!beerStats[beerId]) {
        beerStats[beerId] = { total: 0, count: 0, ratings: [] };
      }
      beerStats[beerId].total += rating.score;
      beerStats[beerId].count += 1;
      beerStats[beerId].ratings.push(rating);
    }
    
    const topBeers = allBeers
      .map((beer) => {
        const stats = beerStats[beer._id as string];
        return {
          beer,
          avgRating: stats ? stats.total / stats.count : null,
          ratingCount: stats?.count || 0,
        };
      })
      .filter((b) => b.avgRating !== null)
      .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    
    // Calculate rater stats
    const raterStats: Record<string, { total: number; count: number; ratings: any[] }> = {};
    for (const rating of allRatings) {
      const raterId = rating.raterId as string;
      if (!raterStats[raterId]) {
        raterStats[raterId] = { total: 0, count: 0, ratings: [] };
      }
      raterStats[raterId].total += rating.score;
      raterStats[raterId].count += 1;
      raterStats[raterId].ratings.push(rating);
    }
    
    const raterLeaderboard = allRaters
      .map((rater) => {
        const stats = raterStats[rater._id as string];
        if (!stats) return null;
        
        // Find their favorite beer
        const raterRatings = stats.ratings;
        const topRating = raterRatings.sort((a: any, b: any) => b.score - a.score)[0];
        const favoriteBeer = topRating ? allBeers.find((b) => b._id === topRating.beerId) : null;
        
        return {
          rater,
          avgGiven: stats.total / stats.count,
          ratingCount: stats.count,
          favoriteBeer,
          favoriteScore: topRating?.score,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.ratingCount - a.ratingCount);
    
    return {
      topBeers: topBeers.slice(0, 10),
      mostRated: [...topBeers].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 5),
      raters: raterLeaderboard,
      totalRatings: allRatings.length,
    };
  },
});

// Get beers available to rate (on-tap or archived)
export const getBeersToRate = query({
  args: {},
  handler: async (ctx) => {
    const beers = await ctx.db.query("beers").collect();
    return beers
      .filter((b) => ["on-tap", "kicked", "archived", "conditioning"].includes(b.status))
      .sort((a, b) => b.batchNo - a.batchNo);
  },
});
