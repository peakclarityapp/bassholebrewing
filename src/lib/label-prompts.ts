// Bass Hole Brewing Label Prompt Generator
// Creates consistent, on-brand prompts for beer label hero images

interface RecipeData {
  name: string;
  style: string;
  abv?: number;
  ibu?: number;
  srm?: number;
  tagline?: string;
  coreHops?: string[];
  coreMalts?: string[];
}

// Color accent based on SRM (beer color)
function getColorAccent(srm: number | undefined): string {
  if (!srm || srm <= 6) return "electric cyan and bright gold";
  if (srm <= 12) return "warm amber and orange neon";
  if (srm <= 20) return "deep copper and red";
  return "deep crimson and purple";
}

// Ingredient imagery based on style
function getIngredientImagery(style: string, hops?: string[], malts?: string[]): string {
  const lowerStyle = style.toLowerCase();
  
  if (lowerStyle.includes("ipa") || lowerStyle.includes("pale ale")) {
    return "hop cone illustrations with metallic green sheen, lupulin glands glistening";
  }
  if (lowerStyle.includes("stout") || lowerStyle.includes("porter")) {
    return "roasted coffee beans, dark chocolate shards, creamy head wisps";
  }
  if (lowerStyle.includes("wheat") || lowerStyle.includes("weiss") || lowerStyle.includes("hefeweizen")) {
    return "golden wheat stalks, soft haze, citrus slice accents";
  }
  if (lowerStyle.includes("pilsner") || lowerStyle.includes("lager") || lowerStyle.includes("pils")) {
    return "crisp water droplets, noble hop flowers, clean barley";
  }
  if (lowerStyle.includes("belgian") || lowerStyle.includes("tripel") || lowerStyle.includes("saison")) {
    return "Belgian abbey silhouette, spice elements, golden chalice";
  }
  if (lowerStyle.includes("gose") || lowerStyle.includes("sour") || lowerStyle.includes("berliner")) {
    return "salt crystals, citrus zest, tart fruit splashes";
  }
  if (lowerStyle.includes("amber") || lowerStyle.includes("red")) {
    return "caramel swirls, toasted grain, autumn leaf accents";
  }
  if (lowerStyle.includes("blonde") || lowerStyle.includes("cream")) {
    return "soft golden glow, light grain, subtle honey tones";
  }
  
  // Default for unknown styles
  return "craft brewing elements, artisan grain and hops";
}

// Style mood/energy
function getStyleMood(style: string, abv?: number): string {
  const lowerStyle = style.toLowerCase();
  
  if (lowerStyle.includes("double") || lowerStyle.includes("imperial") || (abv && abv > 8)) {
    return "aggressive, powerful, intense";
  }
  if (lowerStyle.includes("session") || (abv && abv < 5)) {
    return "approachable, refreshing, easy-going";
  }
  if (lowerStyle.includes("black") || lowerStyle.includes("stout") || lowerStyle.includes("porter")) {
    return "bold, mysterious, rich";
  }
  if (lowerStyle.includes("neipa") || lowerStyle.includes("hazy")) {
    return "soft, juicy, modern";
  }
  if (lowerStyle.includes("west coast")) {
    return "crisp, aggressive, piney";
  }
  if (lowerStyle.includes("belgian") || lowerStyle.includes("tripel")) {
    return "elegant, complex, monastic";
  }
  if (lowerStyle.includes("sour") || lowerStyle.includes("gose")) {
    return "playful, tart, refreshing";
  }
  
  return "balanced, crafted, premium";
}

/**
 * Generate a consistent Bass Hole Brewing label prompt
 */
export function generateLabelPrompt(recipe: RecipeData): string {
  const colorAccent = getColorAccent(recipe.srm);
  const ingredientImagery = getIngredientImagery(recipe.style, recipe.coreHops, recipe.coreMalts);
  const mood = getStyleMood(recipe.style, recipe.abv);
  
  // Build the prompt with consistent brand elements
  const prompt = [
    // Brand identity (ALWAYS SAME)
    `Bass Hole Brewing craft beer label hero banner`,
    `cyberpunk brewery aesthetic`,
    `dark matte black background`,
    
    // Beer-specific elements
    `"${recipe.name}" ${recipe.style}`,
    `${colorAccent} neon accent lighting`,
    `${ingredientImagery}`,
    `${mood} mood and energy`,
    
    // Visual style (ALWAYS SAME)
    `aggressive stylized bass fish silhouette watermark`,
    `bold industrial sans-serif typography`,
    `16:9 wide hero banner composition`,
    `high contrast dramatic lighting`,
    `premium craft brewery branding`,
    `cinematic depth of field`,
    `photorealistic textures with illustrated elements`,
    
    // Technical specs
    `4K resolution, professional product photography style`,
  ].join(", ");
  
  return prompt;
}

/**
 * Generate prompts for multiple recipes
 */
export function generateLabelPrompts(recipes: RecipeData[]): { name: string; prompt: string }[] {
  return recipes.map(recipe => ({
    name: recipe.name,
    prompt: generateLabelPrompt(recipe),
  }));
}

// Example usage:
// const prompt = generateLabelPrompt({
//   name: "West Coast Ripper",
//   style: "West Coast IPA", 
//   abv: 6.8,
//   ibu: 65,
//   srm: 6,
//   coreHops: ["Citra", "Simcoe", "Mosaic"]
// });
