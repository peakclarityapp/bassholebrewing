// BJCP 2021 Style Guidelines
// Key styles for Bass Hole Brewing

export interface BJCPStyle {
  id: string;
  name: string;
  category: string;
  abvMin: number;
  abvMax: number;
  ogMin: number;
  ogMax: number;
  fgMin: number;
  fgMax: number;
  ibuMin: number;
  ibuMax: number;
  srmMin: number;
  srmMax: number;
}

export const BJCP_STYLES: BJCPStyle[] = [
  // American IPAs
  {
    id: "21A",
    name: "American IPA",
    category: "IPA",
    abvMin: 5.5, abvMax: 7.5,
    ogMin: 1.056, ogMax: 1.070,
    fgMin: 1.008, fgMax: 1.014,
    ibuMin: 40, ibuMax: 70,
    srmMin: 6, srmMax: 14,
  },
  {
    id: "21B",
    name: "Specialty IPA: Belgian IPA",
    category: "IPA",
    abvMin: 6.2, abvMax: 9.5,
    ogMin: 1.058, ogMax: 1.080,
    fgMin: 1.008, fgMax: 1.016,
    ibuMin: 50, ibuMax: 100,
    srmMin: 5, srmMax: 8,
  },
  {
    id: "21B",
    name: "Specialty IPA: Black IPA",
    category: "IPA",
    abvMin: 5.5, abvMax: 9.0,
    ogMin: 1.050, ogMax: 1.085,
    fgMin: 1.010, fgMax: 1.018,
    ibuMin: 50, ibuMax: 90,
    srmMin: 25, srmMax: 40,
  },
  {
    id: "21B",
    name: "Specialty IPA: West Coast IPA",
    category: "IPA",
    abvMin: 6.0, abvMax: 7.5,
    ogMin: 1.056, ogMax: 1.070,
    fgMin: 1.008, fgMax: 1.014,
    ibuMin: 50, ibuMax: 75,
    srmMin: 4, srmMax: 8,
  },
  {
    id: "21B",
    name: "Specialty IPA: NEIPA",
    category: "IPA",
    abvMin: 6.0, abvMax: 9.0,
    ogMin: 1.060, ogMax: 1.085,
    fgMin: 1.010, fgMax: 1.018,
    ibuMin: 25, ibuMax: 60,
    srmMin: 3, srmMax: 7,
  },
  {
    id: "22A",
    name: "Double IPA",
    category: "IPA",
    abvMin: 7.5, abvMax: 10.0,
    ogMin: 1.065, ogMax: 1.100,
    fgMin: 1.008, fgMax: 1.018,
    ibuMin: 60, ibuMax: 100,
    srmMin: 6, srmMax: 14,
  },
  {
    id: "18B",
    name: "American Pale Ale",
    category: "Pale Ale",
    abvMin: 4.5, abvMax: 6.2,
    ogMin: 1.045, ogMax: 1.060,
    fgMin: 1.010, fgMax: 1.015,
    ibuMin: 30, ibuMax: 50,
    srmMin: 5, srmMax: 10,
  },
  {
    id: "19A",
    name: "American Amber Ale",
    category: "Amber",
    abvMin: 4.5, abvMax: 6.2,
    ogMin: 1.045, ogMax: 1.060,
    fgMin: 1.010, fgMax: 1.015,
    ibuMin: 25, ibuMax: 40,
    srmMin: 10, srmMax: 17,
  },
  // Lagers
  {
    id: "5D",
    name: "German Pils",
    category: "Lager",
    abvMin: 4.4, abvMax: 5.2,
    ogMin: 1.044, ogMax: 1.050,
    fgMin: 1.008, fgMax: 1.013,
    ibuMin: 22, ibuMax: 40,
    srmMin: 2, srmMax: 5,
  },
  {
    id: "3A",
    name: "Czech Pale Lager",
    category: "Lager",
    abvMin: 3.0, abvMax: 4.1,
    ogMin: 1.028, ogMax: 1.044,
    fgMin: 1.008, fgMax: 1.014,
    ibuMin: 20, ibuMax: 35,
    srmMin: 3, srmMax: 6,
  },
  // Belgian
  {
    id: "26C",
    name: "Belgian Tripel",
    category: "Belgian",
    abvMin: 7.5, abvMax: 9.5,
    ogMin: 1.075, ogMax: 1.085,
    fgMin: 1.008, fgMax: 1.014,
    ibuMin: 20, ibuMax: 40,
    srmMin: 4.5, srmMax: 7,
  },
  {
    id: "25B",
    name: "Belgian Saison",
    category: "Belgian",
    abvMin: 5.0, abvMax: 7.0,
    ogMin: 1.048, ogMax: 1.065,
    fgMin: 1.002, fgMax: 1.008,
    ibuMin: 20, ibuMax: 35,
    srmMin: 5, srmMax: 14,
  },
  // Light/Easy
  {
    id: "18A",
    name: "Blonde Ale",
    category: "Pale Ale",
    abvMin: 3.8, abvMax: 5.5,
    ogMin: 1.038, ogMax: 1.054,
    fgMin: 1.008, fgMax: 1.013,
    ibuMin: 15, ibuMax: 28,
    srmMin: 3, srmMax: 6,
  },
  {
    id: "1C",
    name: "Cream Ale",
    category: "Light",
    abvMin: 4.2, abvMax: 5.6,
    ogMin: 1.042, ogMax: 1.055,
    fgMin: 1.006, fgMax: 1.012,
    ibuMin: 8, ibuMax: 20,
    srmMin: 2, srmMax: 5,
  },
  // Dark
  {
    id: "13B",
    name: "British Brown Ale",
    category: "Brown",
    abvMin: 4.2, abvMax: 5.9,
    ogMin: 1.040, ogMax: 1.052,
    fgMin: 1.008, fgMax: 1.013,
    ibuMin: 20, ibuMax: 30,
    srmMin: 12, srmMax: 22,
  },
  {
    id: "20A",
    name: "American Porter",
    category: "Porter",
    abvMin: 4.8, abvMax: 6.5,
    ogMin: 1.050, ogMax: 1.070,
    fgMin: 1.012, fgMax: 1.018,
    ibuMin: 25, ibuMax: 50,
    srmMin: 22, srmMax: 40,
  },
  {
    id: "15B",
    name: "Irish Stout",
    category: "Stout",
    abvMin: 4.0, abvMax: 4.5,
    ogMin: 1.036, ogMax: 1.044,
    fgMin: 1.007, fgMax: 1.011,
    ibuMin: 25, ibuMax: 45,
    srmMin: 25, srmMax: 40,
  },
  {
    id: "20C",
    name: "Imperial Stout",
    category: "Stout",
    abvMin: 8.0, abvMax: 12.0,
    ogMin: 1.075, ogMax: 1.115,
    fgMin: 1.018, fgMax: 1.030,
    ibuMin: 50, ibuMax: 90,
    srmMin: 30, srmMax: 40,
  },
  // Wheat
  {
    id: "10A",
    name: "German Weissbier",
    category: "Wheat",
    abvMin: 4.3, abvMax: 5.6,
    ogMin: 1.044, ogMax: 1.053,
    fgMin: 1.008, fgMax: 1.014,
    ibuMin: 8, ibuMax: 15,
    srmMin: 2, srmMax: 6,
  },
  {
    id: "1D",
    name: "American Wheat Beer",
    category: "Wheat",
    abvMin: 4.0, abvMax: 5.5,
    ogMin: 1.040, ogMax: 1.055,
    fgMin: 1.008, fgMax: 1.013,
    ibuMin: 15, ibuMax: 30,
    srmMin: 3, srmMax: 6,
  },
  // Sour
  {
    id: "27A",
    name: "Gose",
    category: "Sour",
    abvMin: 4.2, abvMax: 4.8,
    ogMin: 1.036, ogMax: 1.056,
    fgMin: 1.006, fgMax: 1.010,
    ibuMin: 5, ibuMax: 12,
    srmMin: 3, srmMax: 4,
  },
  {
    id: "23A",
    name: "Berliner Weisse",
    category: "Sour",
    abvMin: 2.8, abvMax: 3.8,
    ogMin: 1.028, ogMax: 1.032,
    fgMin: 1.003, fgMax: 1.006,
    ibuMin: 3, ibuMax: 8,
    srmMin: 2, srmMax: 3,
  },
  // Session
  {
    id: "21B",
    name: "Session IPA",
    category: "IPA",
    abvMin: 3.0, abvMax: 5.0,
    ogMin: 1.034, ogMax: 1.050,
    fgMin: 1.006, fgMax: 1.012,
    ibuMin: 30, ibuMax: 50,
    srmMin: 4, srmMax: 8,
  },
];

// Get style by name (fuzzy match)
export function findStyle(styleName: string): BJCPStyle | undefined {
  const lower = styleName.toLowerCase();
  
  // Exact match first
  let match = BJCP_STYLES.find(s => s.name.toLowerCase() === lower);
  if (match) return match;
  
  // Contains match
  match = BJCP_STYLES.find(s => s.name.toLowerCase().includes(lower) || lower.includes(s.name.toLowerCase()));
  if (match) return match;
  
  // Try common aliases
  const aliases: Record<string, string> = {
    "ipa": "American IPA",
    "west coast ipa": "Specialty IPA: West Coast IPA",
    "neipa": "Specialty IPA: NEIPA",
    "hazy ipa": "Specialty IPA: NEIPA",
    "black ipa": "Specialty IPA: Black IPA",
    "dipa": "Double IPA",
    "double ipa": "Double IPA",
    "imperial ipa": "Double IPA",
    "pale ale": "American Pale Ale",
    "amber": "American Amber Ale",
    "amber ale": "American Amber Ale",
    "pilsner": "German Pils",
    "pils": "German Pils",
    "german pilsner": "German Pils",
    "tripel": "Belgian Tripel",
    "blonde": "Blonde Ale",
    "wheat": "American Wheat Beer",
    "hefeweizen": "German Weissbier",
    "weizen": "German Weissbier",
    "stout": "Irish Stout",
    "porter": "American Porter",
    "saison": "Belgian Saison",
    "gose": "Gose",
    "sour": "Berliner Weisse",
  };
  
  const aliasMatch = aliases[lower];
  if (aliasMatch) {
    return BJCP_STYLES.find(s => s.name === aliasMatch);
  }
  
  return undefined;
}

// Calculate BU:GU ratio
export function calculateBuGu(ibu: number, og: number): number {
  const gu = (og - 1) * 1000;
  if (gu <= 0) return 0;
  return Math.round((ibu / gu) * 100) / 100;
}

// Get BU:GU range for a style (approximated)
export function getBuGuRange(style: BJCPStyle): { min: number; max: number } {
  const minBuGu = calculateBuGu(style.ibuMin, style.ogMax);
  const maxBuGu = calculateBuGu(style.ibuMax, style.ogMin);
  return { min: Math.round(minBuGu * 100) / 100, max: Math.round(maxBuGu * 100) / 100 };
}
