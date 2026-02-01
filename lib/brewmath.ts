/**
 * BrewCore Brewing Calculations
 * 
 * All the math for OG, FG, ABV, IBU, SRM, and water chemistry.
 * Formulas are industry-standard and validated against Brewfather.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Fermentable {
  name: string;
  amount: number;      // lbs
  type: string;        // "Grain" | "Extract" | "Sugar" | "Adjunct"
  color?: number;      // Lovibond
  potential?: number;  // PPG (points per pound per gallon)
}

export interface Hop {
  name: string;
  amount: number;      // oz
  alpha: number;       // AA%
  time: number;        // minutes (0 for dry hop)
  use: string;         // "Boil" | "Whirlpool" | "Dry Hop"
}

export interface Yeast {
  name: string;
  attenuation?: number;  // percent
}

export interface RecipeParams {
  fermentables: Fermentable[];
  hops: Hop[];
  yeast?: Yeast;
  batchSize: number;     // gallons
  efficiency: number;    // percent (e.g., 72)
  boilTime?: number;     // minutes
}

export interface Calculations {
  og: number;
  fg: number;
  abv: number;
  ibu: number;
  srm: number;
  buGu: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

// Common grain PPG values (points per pound per gallon)
export const GRAIN_PPG: Record<string, number> = {
  // Base malts
  'pale malt': 37,
  'pale ale malt': 37,
  '2-row': 37,
  'pilsner malt': 37,
  'maris otter': 38,
  'munich malt': 37,
  'vienna malt': 36,
  
  // Specialty malts
  'crystal 10': 35,
  'crystal 20': 35,
  'crystal 40': 34,
  'crystal 60': 34,
  'crystal 80': 33,
  'crystal 120': 32,
  'caramel': 34,
  'chocolate malt': 28,
  'black malt': 25,
  'roasted barley': 25,
  'flaked oats': 33,
  'flaked wheat': 36,
  'wheat malt': 37,
  
  // Extracts (100% efficiency)
  'dme': 44,
  'dry malt extract': 44,
  'lme': 36,
  'liquid malt extract': 36,
  
  // Sugars (100% efficiency)
  'table sugar': 46,
  'corn sugar': 46,
  'dextrose': 46,
  'honey': 35,
};

// Common grain colors (Lovibond)
export const GRAIN_COLOR: Record<string, number> = {
  'pale malt': 2,
  'pale ale malt': 3,
  '2-row': 2,
  'pilsner malt': 1.5,
  'maris otter': 3,
  'munich malt': 10,
  'vienna malt': 4,
  'crystal 10': 10,
  'crystal 20': 20,
  'crystal 40': 40,
  'crystal 60': 60,
  'crystal 80': 80,
  'crystal 120': 120,
  'chocolate malt': 350,
  'black malt': 500,
  'roasted barley': 300,
  'flaked oats': 1,
  'flaked wheat': 2,
  'wheat malt': 2,
};

// Common hop alpha acids
export const HOP_ALPHA: Record<string, number> = {
  'amarillo': 9.5,
  'cascade': 6.0,
  'centennial': 10.0,
  'chinook': 13.0,
  'citra': 12.0,
  'columbus': 15.0,
  'galaxy': 14.0,
  'mosaic': 12.5,
  'simcoe': 13.0,
  'el dorado': 15.0,
  'sabro': 15.0,
  'strata': 11.5,
  'idaho 7': 13.0,
  'nelson sauvin': 12.0,
  'motueka': 7.0,
  'hallertau': 4.5,
  'saaz': 3.5,
  'fuggle': 5.0,
  'east kent goldings': 5.0,
  'magnum': 14.0,
  'warrior': 16.0,
};

// Default yeast attenuation
export const YEAST_ATTENUATION: Record<string, number> = {
  'safale american': 77,
  'us-05': 77,
  'safale english': 75,
  's-04': 75,
  'nottingham': 77,
  'safale belgian': 78,
  'wlp001': 76,
  'california ale': 76,
  'wyeast 1056': 75,
  'imperial yeast a38': 77,
  'juice': 77,
};

// ═══════════════════════════════════════════════════════════════════════════
// GRAVITY CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get PPG for a fermentable (lookup or use provided value)
 */
function getPPG(fermentable: Fermentable): number {
  if (fermentable.potential) return fermentable.potential;
  
  const key = fermentable.name.toLowerCase();
  for (const [name, ppg] of Object.entries(GRAIN_PPG)) {
    if (key.includes(name)) return ppg;
  }
  
  // Default based on type
  if (fermentable.type === 'Extract') return 36;
  if (fermentable.type === 'Sugar') return 46;
  return 36; // Default grain
}

/**
 * Calculate Original Gravity
 * 
 * Formula: OG = 1 + (Σ(PPG × lbs × efficiency)) / (volume × 1000)
 * 
 * Extracts and sugars use 100% efficiency.
 */
export function calculateOG(
  fermentables: Fermentable[],
  batchSize: number,
  efficiency: number
): number {
  let totalPoints = 0;
  
  for (const f of fermentables) {
    const ppg = getPPG(f);
    // Extracts and sugars are 100% efficient
    const eff = (f.type === 'Extract' || f.type === 'Sugar') ? 100 : efficiency;
    totalPoints += ppg * f.amount * (eff / 100);
  }
  
  const og = 1 + (totalPoints / batchSize / 1000);
  return Math.round(og * 1000) / 1000; // Round to 3 decimals
}

/**
 * Calculate Final Gravity
 * 
 * Formula: FG = OG - (OG - 1) × (attenuation / 100)
 */
export function calculateFG(og: number, attenuation: number): number {
  const fg = og - (og - 1) * (attenuation / 100);
  return Math.round(fg * 1000) / 1000;
}

/**
 * Calculate ABV
 * 
 * Formula: ABV = (OG - FG) × 131.25
 */
export function calculateABV(og: number, fg: number): number {
  const abv = (og - fg) * 131.25;
  return Math.round(abv * 10) / 10; // Round to 1 decimal
}

// ═══════════════════════════════════════════════════════════════════════════
// IBU CALCULATIONS (Tinseth)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate hop utilization (Tinseth formula)
 * 
 * Utilization = f(G) × f(T)
 * f(G) = 1.65 × 0.000125^(OG - 1)
 * f(T) = (1 - e^(-0.04 × time)) / 4.15
 */
function hopUtilization(og: number, boilTime: number): number {
  const fG = 1.65 * Math.pow(0.000125, og - 1);
  const fT = (1 - Math.exp(-0.04 * boilTime)) / 4.15;
  return fG * fT;
}

/**
 * Calculate IBU for a single hop addition (Tinseth)
 * 
 * IBU = (alpha × oz × 7490) / volume × utilization
 */
function calculateHopIBU(
  hop: Hop,
  og: number,
  batchSize: number
): number {
  // Dry hops contribute no IBU
  if (hop.use === 'Dry Hop' || hop.time <= 0) return 0;
  
  // Whirlpool hops have reduced utilization (roughly 50%)
  const timeMultiplier = hop.use === 'Whirlpool' ? 0.5 : 1;
  const effectiveTime = hop.time * timeMultiplier;
  
  const util = hopUtilization(og, effectiveTime);
  const ibu = (hop.alpha / 100) * hop.amount * 7490 / batchSize * util;
  
  return ibu;
}

/**
 * Calculate total IBU for all hop additions
 */
export function calculateIBU(
  hops: Hop[],
  og: number,
  batchSize: number
): number {
  let totalIBU = 0;
  
  for (const hop of hops) {
    totalIBU += calculateHopIBU(hop, og, batchSize);
  }
  
  return Math.round(totalIBU);
}

// ═══════════════════════════════════════════════════════════════════════════
// COLOR CALCULATIONS (SRM)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get Lovibond color for a fermentable
 */
function getColor(fermentable: Fermentable): number {
  if (fermentable.color) return fermentable.color;
  
  const key = fermentable.name.toLowerCase();
  for (const [name, color] of Object.entries(GRAIN_COLOR)) {
    if (key.includes(name)) return color;
  }
  
  return 3; // Default light grain
}

/**
 * Calculate SRM color (Morey equation)
 * 
 * MCU = Σ(color × lbs) / volume
 * SRM = 1.4922 × MCU^0.6859
 */
export function calculateSRM(
  fermentables: Fermentable[],
  batchSize: number
): number {
  let mcu = 0;
  
  for (const f of fermentables) {
    const color = getColor(f);
    mcu += (color * f.amount) / batchSize;
  }
  
  const srm = 1.4922 * Math.pow(mcu, 0.6859);
  return Math.round(srm * 10) / 10;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CALCULATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate all values for a recipe
 */
export function calculateRecipe(params: RecipeParams): Calculations {
  const { fermentables, hops, yeast, batchSize, efficiency } = params;
  
  // Get yeast attenuation
  let attenuation = 75; // Default
  if (yeast?.attenuation) {
    attenuation = yeast.attenuation;
  } else if (yeast?.name) {
    const key = yeast.name.toLowerCase();
    for (const [name, att] of Object.entries(YEAST_ATTENUATION)) {
      if (key.includes(name)) {
        attenuation = att;
        break;
      }
    }
  }
  
  // Calculate
  const og = calculateOG(fermentables, batchSize, efficiency);
  const fg = calculateFG(og, attenuation);
  const abv = calculateABV(og, fg);
  const ibu = calculateIBU(hops, og, batchSize);
  const srm = calculateSRM(fermentables, batchSize);
  
  // BU:GU ratio (bitterness to gravity units)
  const gu = (og - 1) * 1000;
  const buGu = gu > 0 ? Math.round((ibu / gu) * 100) / 100 : 0;
  
  return { og, fg, abv, ibu, srm, buGu };
}

// ═══════════════════════════════════════════════════════════════════════════
// WATER CHEMISTRY
// ═══════════════════════════════════════════════════════════════════════════

// Wayne's Riverside tap water (ppm)
export const WAYNE_TAP_WATER = {
  calcium: 35.8,
  magnesium: 12.7,
  sodium: 10,
  sulfate: 26.6,
  chloride: 15.5,
  bicarbonate: 130,
};

// Water salt contributions (ppm per gram per gallon)
export const SALT_CONTRIBUTIONS = {
  gypsum: {        // CaSO4
    calcium: 61.5,
    sulfate: 147.4,
  },
  cacl2: {         // CaCl2
    calcium: 72.0,
    chloride: 127.4,
  },
  epsom: {         // MgSO4
    magnesium: 26.1,
    sulfate: 103.0,
  },
  bakingSoda: {    // NaHCO3
    sodium: 72.3,
    bicarbonate: 191.9,
  },
  chalk: {         // CaCO3
    calcium: 105.8,
    bicarbonate: 158.4,
  },
};

// Style targets for water profiles (sulfate:chloride ratio and range)
export interface WaterTarget {
  sulfate: { min: number; max: number };
  chloride: { min: number; max: number };
  description: string;
}

export const STYLE_WATER_TARGETS: Record<string, WaterTarget> = {
  'west coast ipa': {
    sulfate: { min: 200, max: 350 },
    chloride: { min: 50, max: 75 },
    description: 'High sulfate for hop bite, low chloride for crispness',
  },
  'neipa': {
    sulfate: { min: 100, max: 150 },
    chloride: { min: 150, max: 200 },
    description: 'Balanced to chloride-forward for soft, round mouthfeel',
  },
  'american ipa': {
    sulfate: { min: 150, max: 250 },
    chloride: { min: 50, max: 100 },
    description: 'Sulfate-forward for hop emphasis',
  },
  'pale ale': {
    sulfate: { min: 100, max: 200 },
    chloride: { min: 50, max: 100 },
    description: 'Moderate sulfate, balanced',
  },
  'amber ale': {
    sulfate: { min: 75, max: 150 },
    chloride: { min: 75, max: 125 },
    description: 'Balanced for malt/hop interplay',
  },
  'stout': {
    sulfate: { min: 50, max: 100 },
    chloride: { min: 100, max: 175 },
    description: 'Lower sulfate, higher chloride for smooth roast',
  },
  'porter': {
    sulfate: { min: 50, max: 100 },
    chloride: { min: 100, max: 150 },
    description: 'Balanced with slight chloride emphasis',
  },
  'pilsner': {
    sulfate: { min: 25, max: 75 },
    chloride: { min: 25, max: 50 },
    description: 'Soft water, minimal minerals',
  },
  'wheat beer': {
    sulfate: { min: 50, max: 100 },
    chloride: { min: 50, max: 100 },
    description: 'Balanced, soft profile',
  },
  'session ipa': {
    sulfate: { min: 150, max: 250 },
    chloride: { min: 50, max: 75 },
    description: 'Similar to West Coast, sulfate-forward',
  },
};

/**
 * Calculate water salt additions for a target style
 * 
 * Returns grams of Gypsum and CaCl2 needed for Wayne's water + volume
 */
export function calculateWaterSalts(
  style: string,
  batchVolume: number // gallons
): { gypsum: number; cacl2: number; lacticAcid: number; notes: string } {
  // Normalize style name
  const normalizedStyle = style.toLowerCase();
  
  // Find matching target
  let target = STYLE_WATER_TARGETS['pale ale']; // Default
  for (const [styleName, styleTarget] of Object.entries(STYLE_WATER_TARGETS)) {
    if (normalizedStyle.includes(styleName) || styleName.includes(normalizedStyle)) {
      target = styleTarget;
      break;
    }
  }
  
  // Target mid-range values
  const targetSulfate = (target.sulfate.min + target.sulfate.max) / 2;
  const targetChloride = (target.chloride.min + target.chloride.max) / 2;
  
  // Current levels
  const currentSulfate = WAYNE_TAP_WATER.sulfate;
  const currentChloride = WAYNE_TAP_WATER.chloride;
  
  // Calculate additions needed
  const sulfateNeeded = Math.max(0, targetSulfate - currentSulfate);
  const chlorideNeeded = Math.max(0, targetChloride - currentChloride);
  
  // Gypsum adds sulfate (and calcium)
  // CaCl2 adds chloride (and calcium)
  const gypsumGrams = (sulfateNeeded / SALT_CONTRIBUTIONS.gypsum.sulfate) * batchVolume;
  const cacl2Grams = (chlorideNeeded / SALT_CONTRIBUTIONS.cacl2.chloride) * batchVolume;
  
  // Lactic acid for mash pH (standard 3ml for Wayne's water with moderate bicarbonate)
  const lacticAcid = 3;
  
  return {
    gypsum: Math.round(gypsumGrams * 10) / 10,
    cacl2: Math.round(cacl2Grams * 10) / 10,
    lacticAcid,
    notes: target.description,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MASH CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate strike water temperature
 * 
 * Formula: Tw = (0.2 / R) × (T2 - T1) + T2
 * where:
 *   R = water to grain ratio (qt/lb)
 *   T1 = grain temperature (usually ~68°F)
 *   T2 = target mash temperature
 *   Tw = strike water temperature
 */
export function calculateStrikeTemp(
  mashTemp: number,       // °F target
  grainTemp: number = 68, // °F (room temp default)
  waterRatio: number = 1.5 // qt/lb
): number {
  const Tw = (0.2 / waterRatio) * (mashTemp - grainTemp) + mashTemp;
  return Math.round(Tw);
}

/**
 * Calculate mash water volume
 * 
 * Volume = grain weight × water:grain ratio
 */
export function calculateMashVolume(
  grainWeight: number,    // lbs
  waterRatio: number = 1.5 // qt/lb
): { quarts: number; gallons: number } {
  const quarts = grainWeight * waterRatio;
  return {
    quarts: Math.round(quarts * 10) / 10,
    gallons: Math.round(quarts / 4 * 10) / 10,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// WHAT-IF CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Recalculate based on measured pre-boil gravity
 * 
 * Returns actual efficiency and projected OG
 */
export function whatIfPreBoilGravity(
  measuredGravity: number,
  expectedGravity: number,
  expectedOG: number,
  targetEfficiency: number
): {
  actualEfficiency: number;
  projectedOG: number;
  projectedAbv: number;
  difference: number;
} {
  // Ratio of measured to expected tells us actual efficiency
  const ratio = (measuredGravity - 1) / (expectedGravity - 1);
  const actualEfficiency = Math.round(targetEfficiency * ratio);
  
  // Apply same ratio to expected OG
  const projectedOG = 1 + (expectedOG - 1) * ratio;
  const projectedFG = calculateFG(projectedOG, 75); // Assume 75% attenuation
  const projectedAbv = calculateABV(projectedOG, projectedFG);
  
  return {
    actualEfficiency,
    projectedOG: Math.round(projectedOG * 1000) / 1000,
    projectedAbv,
    difference: measuredGravity - expectedGravity,
  };
}

/**
 * Calculate DME needed to boost gravity
 * 
 * DME PPG is 44
 */
export function calculateDMEBoost(
  currentGravity: number,
  targetGravity: number,
  volume: number // gallons
): { ounces: number; lbs: number } {
  const pointsNeeded = (targetGravity - currentGravity) * 1000;
  const totalPoints = pointsNeeded * volume;
  const lbsNeeded = totalPoints / 44; // DME PPG
  
  return {
    ounces: Math.round(lbsNeeded * 16 * 10) / 10,
    lbs: Math.round(lbsNeeded * 100) / 100,
  };
}
