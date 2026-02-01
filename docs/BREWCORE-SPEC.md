# BrewCore: AI-Powered Brewery Management

> *"Your brewing AI. Calculating hops while you crush them."*

**Codename:** BrewCore  
**Platform:** Bass Hole Brewing (bassholebrewing.vercel.app)  
**Stack:** Next.js + Convex + Skippy AI  
**Theme:** Cyberpunk / Neon Noir  

---

## Vision

Replace Brewfather with an AI-native brewing platform that doesn't just calculate — it thinks, suggests, and assists in real-time.

**The difference:**
- Brewfather = Calculator with a database
- BrewCore = AI brewing partner that happens to do math

---

## Core Principles

1. **Real-time everything** — Convex gives us live updates, use them
2. **AI-first UX** — Natural language input, smart suggestions
3. **Brew day focused** — Optimize for phone use while brewing
4. **Cyberpunk aesthetic** — Neon accents, dark theme, glowing data
5. **Wayne's water** — Hardcoded for Riverside tap water (can expand later)

---

## Features

### 1. Recipe Builder 🧪

**Create recipes visually or via AI:**
```
"Create a West Coast IPA, 6.5%, super bitter, all Citra"
     ↓
[AI generates recipe, shows calculations in real-time]
```

**Recipe Editor UI:**
- Drag-drop ingredient cards
- Real-time calculation updates as you type
- Side panel showing: OG, FG, ABV, IBU, SRM, BU:GU
- Color preview (actual beer color gradient)
- Hop timeline visualization (boil → whirlpool → dry hop)

**Calculations (all live):**
| Metric | Formula |
|--------|---------|
| OG | PPG × lbs × efficiency ÷ volume |
| FG | OG - (OG - 1) × attenuation |
| ABV | (OG - FG) × 131.25 |
| IBU | Tinseth: utilization × alpha × mass ÷ volume |
| SRM | MCU → Morey equation |
| BU:GU | IBU ÷ (OG - 1) × 1000 |

**Mash Calculator:**
- Strike water temp
- Mash volume
- Sparge volume (if applicable)
- Water:grain ratio

**Water Chemistry:**
| Source | Wayne's Riverside Tap |
|--------|----------------------|
| Ca | 35.8 ppm |
| Mg | 12.7 ppm |
| Na | 10 ppm |
| SO₄ | 26.6 ppm |
| Cl | 15.5 ppm |
| HCO₃ | 130 ppm |

**Style Targets (pre-loaded):**
- West Coast IPA: High sulfate (300), low chloride (50)
- NEIPA: Balanced/high chloride (150:100)
- Pilsner: Soft water
- Stout: High bicarbonate

**Auto-additions per style:**
- Gypsum, CaCl₂, Lactic Acid 85%
- Displayed in recipe with amounts

---

### 2. Ingredient Database 🌾

**Bootstrap from:**
- Wayne's Brewfather inventory (one-time import)
- Expand with community ingredients

**Ingredient Properties:**

**Fermentables:**
- Name, type, origin, supplier
- PPG (potential), color (Lovibond/SRM)
- Diastatic power, max %

**Hops:**
- Name, origin, type (pellet/leaf/cryo)
- Alpha acid %, beta acid %
- Oil content, flavor descriptors
- Substitutes

**Yeast:**
- Name, lab, strain ID
- Attenuation range, flocculation
- Temp range, flavor profile
- Alcohol tolerance

**Water Agents:**
- Name, mineral contributions per gram

---

### 3. Batch Tracking 📊

**Batch States:**
```
Planning → Brewing → Fermenting → Conditioning → On-Tap → Kicked
```

**Brew Day Mode (mobile-optimized):**

```
┌─────────────────────────────────┐
│  🔥 BREWING: West Coast Ripper  │
│  ═══════════════════════════════│
│                                 │
│  Step: MASH                     │
│  Timer: 45:23 remaining         │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Log Measurement         │    │
│  │ Pre-Boil Gravity: [____]│    │
│  │ Pre-Boil Volume:  [____]│    │
│  └─────────────────────────┘    │
│                                 │
│  Estimated vs Actual:           │
│  OG: 1.065 → [calculating...]   │
│  ABV: 6.8% → [calculating...]   │
│                                 │
│  [Next Step →]                  │
└─────────────────────────────────┘
```

**Measured Values → Live Recalculation:**

| You Input | System Recalculates |
|-----------|---------------------|
| Mash pH | Guidance (no math needed) |
| Pre-boil volume | OG, efficiency |
| Pre-boil gravity | OG, ABV, efficiency |
| Post-boil volume | OG, actual batch size |
| OG | ABV, efficiency |
| Pitch temp | Guidance only |
| Gravity readings | Attenuation %, ABV, fermentation % |
| FG | Final ABV, attenuation |
| Package volume | Yield efficiency |

**What-If Mode:**
```
Current: Pre-boil gravity 1.038 (expected 1.042)

Options:
├─ Do nothing → OG: 1.052 (was 1.058), ABV: 5.4% (was 6.0%)
├─ Boil 15 min longer → OG: 1.056, ABV: 5.8%
├─ Add 8 oz DME → OG: 1.058, ABV: 6.0%
└─ Add 4 oz table sugar → OG: 1.056, ABV: 5.8% (thinner body)

AI Recommendation: "Add 6 oz light DME - you have some in inventory"
```

---

### 4. Fermentation Tracking 🧫

**Log entries:**
- Date/time
- Gravity reading
- Temperature
- Notes (dry hop added, etc.)

**Visualization:**
```
Gravity Over Time (Cyberpunk style)
     
1.065 ┤●━━━━━━━━━━━●
      │             ╲
1.040 ┤              ●━━●━━●
      │                     ╲
1.015 ┤                      ●━━●━━●━━●
      │
1.000 ┼─────────────────────────────────
      Day 1  3   5   7   10  14  21
      
      🟢 Active fermentation
      🟡 Slowing
      ⚪ Complete (3 days stable)
```

**Alerts:**
- "Fermentation stalled - 3 days no change at 1.028"
- "Target FG reached - ready for dry hop?"
- "Day 14 - consider cold crash?"

---

### 5. Tap Management 🍺

**Already built!** Integrate with existing tap system:
- 4 taps with fill levels
- Current beers on tap
- Keg volume tracking

**Add:**
- Days on tap
- Estimated remaining pours
- "Tap this batch" workflow

---

### 6. Skippy API 🤖

**Design Principle:** UI for Wayne, API for Skippy. Same Convex functions power both.

**Recipe Operations:**
```typescript
// Convex actions Skippy can call
recipes.create({ name, style, hops, grains, yeast, ... })
recipes.update({ id, changes })
recipes.clone({ id, newName, modifications })
recipes.delete({ id })
recipes.calculate({ ingredients }) // Returns OG/FG/ABV/IBU/SRM
recipes.getByName({ name })
recipes.list({ filter? })
```

**Batch Operations:**
```typescript
batches.create({ recipeId, batchNo?, brewDate? })
batches.updateStatus({ id, status })
batches.logMeasurement({ id, type, value })
  // types: preBoilGravity, preBoilVolume, og, fg, mashPh, etc.
batches.whatIf({ id, measurement, value })
  // Returns: recalculated values + adjustment options
batches.addFermentationLog({ id, gravity, temp, notes? })
batches.getActive()
batches.getByStatus({ status })
```

**Inventory Operations:**
```typescript
inventory.add({ type, name, amount, properties })
inventory.update({ id, amount }) // Adjust stock
inventory.deduct({ id, amount }) // Use in batch
inventory.getAll({ type? })
inventory.getLowStock()
inventory.search({ query }) // Fuzzy match
```

**Calculation Utilities:**
```typescript
calc.ibu({ hops, og, batchSize, boilTime })
calc.og({ fermentables, efficiency, batchSize })
calc.abv({ og, fg })
calc.srm({ fermentables, batchSize })
calc.waterSalts({ sourceProfile, targetProfile, volume })
calc.strikeTemp({ grainWeight, grainTemp, mashTemp, waterRatio })
calc.yeastViability({ productionDate, cellCount })
```

**CLI Wrapper:**
```bash
# Skippy calls this CLI which wraps Convex
brewcore recipe create "Name" --style "ipa" --hops "..." --grains "..."
brewcore recipe list
brewcore batch create <recipe-id>
brewcore batch log <batch-id> --og 1.052
brewcore batch what-if <batch-id> --pre-boil-gravity 1.038
brewcore inventory list hops
brewcore inventory deduct <id> --amount 56
brewcore calc ibu --hops "2oz Citra 60min" --og 1.060 --volume 2.5gal
```

**Example Skippy Workflow:**
```
Wayne: "Create a session IPA with Galaxy and Mosaic, around 4.5%"

Skippy:
1. brewcore recipe create "Galaxy Mosaic Session" \
     --style "session ipa" \
     --target-abv 4.5 \
     --hops "1oz Galaxy 60min, 1oz Mosaic 15min, 2oz Galaxy dryhop" \
     --grains "6lb Pale Malt, 0.5lb Crystal 20"
2. Returns: { id, og: 1.044, fg: 1.010, abv: 4.5%, ibu: 42 }
3. "Done! 'Galaxy Mosaic Session' - 4.5% ABV, 42 IBU. Ready to brew?"
```

**Example Brew Day:**
```
Wayne: "Starting brew. Pre-boil gravity is 1.038, expected 1.042"

Skippy:
1. brewcore batch what-if <id> --pre-boil-gravity 1.038
2. Returns: {
     current: { og: 1.050, abv: 5.2% },
     expected: { og: 1.054, abv: 5.6% },
     options: [
       { action: "none", og: 1.050, abv: 5.2% },
       { action: "boil +15min", og: 1.053, abv: 5.5% },
       { action: "add 6oz DME", og: 1.054, abv: 5.6% }
     ]
   }
3. "You're 4 points under. Do nothing and you'll hit 5.2% ABV.
    Or add 6oz DME to get back to 5.6%. Your call."
```

---

### 7. Inventory Management 📦

**Track:**
- Hops (with purchase date, alpha degradation calc)
- Grains
- Yeast (viability calculator based on age)
- Water salts
- Other (finings, nutrients, etc.)

**Auto-deduct from inventory when batch starts**

**Low stock alerts:**
```
"Running low on Citra (2 oz remaining)
 You use ~4 oz per batch. Reorder?"
```

---

## UI/UX Design

### Theme: Cyberpunk Brewery

**Colors:**
- Background: `#0a0a0a` (near black)
- Primary: `#f59e0b` (amber/beer gold)
- Accent: `#06b6d4` (cyan neon)
- Success: `#10b981` (green)
- Danger: `#ef4444` (red)
- Text: `#ffffff` / `#a1a1aa` (white/zinc)

**Effects:**
- Subtle glow on interactive elements
- Data "pulses" when updating
- Gradient beer color previews
- Neon borders on cards

**Typography:**
- Headers: Bold, slightly condensed
- Data: Monospace for numbers
- Labels: Small caps, zinc-400

**Mobile-First:**
- Brew day mode optimized for one-handed use
- Large touch targets for measurements
- Swipe between brew steps

---

## Data Model (Convex)

```typescript
// recipes table
{
  _id: Id<"recipes">,
  name: string,
  style: string,
  type: "all-grain" | "extract" | "biab",
  batchSize: number,        // liters
  boilTime: number,         // minutes
  efficiency: number,       // percent
  
  // Ingredients (embedded)
  fermentables: Fermentable[],
  hops: HopAddition[],
  yeast: Yeast,
  water: WaterProfile,
  miscs: MiscAddition[],
  
  // Calculated (stored for quick access)
  og: number,
  fg: number,
  abv: number,
  ibu: number,
  srm: number,
  
  // Meta
  teaser?: string,
  notes?: string,
  createdBy: "user" | "skippy",
  createdAt: number,
}

// batches table  
{
  _id: Id<"batches">,
  recipeId: Id<"recipes">,
  batchNo: number,
  status: BatchStatus,
  brewDate: string,
  
  // Measured values
  measuredPreBoilGravity?: number,
  measuredPreBoilVolume?: number,
  measuredOg?: number,
  measuredFg?: number,
  measuredAbv?: number,
  measuredBatchSize?: number,
  
  // Fermentation log
  fermentationLog: FermentationEntry[],
  
  // Calculated from measured
  actualEfficiency?: number,
  actualAttenuation?: number,
}

// inventory table
{
  _id: Id<"inventory">,
  type: "hop" | "fermentable" | "yeast" | "misc",
  name: string,
  amount: number,
  unit: string,
  properties: Record<string, any>,
  purchaseDate?: string,
  bestBefore?: string,
}
```

---

## Implementation Phases

### Phase 1: Recipe Calculator (1 weekend)
- [ ] Recipe data model in Convex
- [ ] OG/FG/ABV/IBU/SRM calculations
- [ ] Basic recipe editor UI
- [ ] Import Wayne's BF inventory

### Phase 2: Batch Tracking (1 weekend)
- [ ] Batch creation from recipe
- [ ] Brew day mode UI
- [ ] Measured value input
- [ ] Live recalculation
- [ ] What-if mode

### Phase 3: Fermentation & Inventory (1 week)
- [ ] Fermentation logging
- [ ] Gravity chart
- [ ] Inventory management
- [ ] Auto-deduction

### Phase 4: Skippy API (1 week)
- [ ] Full CRUD for recipes via Convex actions
- [ ] Batch operations (create, update status, log measurements)
- [ ] Inventory management endpoints
- [ ] CLI tool: `brewcore` for Skippy to call
- [ ] Real-time calculation endpoints (what-if queries)

### Phase 5: Polish (ongoing)
- [ ] Mobile optimization
- [ ] Notifications
- [ ] Data export
- [ ] Recipe sharing (maybe)

---

## Why This Will Be Better Than Brewfather

| Feature | Brewfather | BrewCore |
|---------|------------|----------|
| Recipe creation | Manual only | UI + Skippy API |
| Calculations | On change | Real-time streaming |
| Brew day | Basic logging | Interactive what-if |
| Mobile UX | Adequate | Brew day optimized |
| Skippy integration | Hacky Firebase | Native API |
| Data ownership | Their servers | Your database |
| Customization | Limited | Full control |
| Price | $3/month | Free (self-hosted) |
| Theme | Generic | Cyberpunk 🔥 |
| What-if modeling | Limited | Full with options |

---

## The Tagline

> **BrewCore**  
> *Calculate. Brew. Evolve.*

---

*Spec created: February 1, 2026*  
*By: Skippy 🦘 + Wayne*
