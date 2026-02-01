/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as batches from "../batches.js";
import type * as brewery from "../brewery.js";
import type * as calc from "../calc.js";
import type * as dedupe from "../dedupe.js";
import type * as descriptions from "../descriptions.js";
import type * as fixRecipes from "../fixRecipes.js";
import type * as fixTaps from "../fixTaps.js";
import type * as forceSeed from "../forceSeed.js";
import type * as inventory from "../inventory.js";
import type * as migration from "../migration.js";
import type * as patchRecipe from "../patchRecipe.js";
import type * as ratings from "../ratings.js";
import type * as recipes from "../recipes.js";
import type * as seed from "../seed.js";
import type * as sync from "../sync.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  batches: typeof batches;
  brewery: typeof brewery;
  calc: typeof calc;
  dedupe: typeof dedupe;
  descriptions: typeof descriptions;
  fixRecipes: typeof fixRecipes;
  fixTaps: typeof fixTaps;
  forceSeed: typeof forceSeed;
  inventory: typeof inventory;
  migration: typeof migration;
  patchRecipe: typeof patchRecipe;
  ratings: typeof ratings;
  recipes: typeof recipes;
  seed: typeof seed;
  sync: typeof sync;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
