# Bass Hole Brewing — Product Spec

*A personal homebrew website for Wayne's basement brewery*

**Created:** 2026-01-31  
**Author:** Sage (Skippy's strategic mode)  
**Status:** Ready to Build

---

## 1. Vision & Goals

### What is this?

A simple, beautiful website that shows what's on tap at Bass Hole Brewing — Wayne's basement brewery in Riverside, IL. It's a digital taproom menu, a batch archive, and a love letter to the hobby.

### Who's the audience?

1. **Wayne** — Primary user. Quick reference for what's ready, what's fermenting
2. **Friends & family** — "Come over, here's what I've got on tap"
3. **Fellow homebrewers** — Recipe sharing, inspiration
4. **Future Wayne** — Archive of everything brewed

### Goals

- **Fun to build** — This is a weekend project, not work
- **Fun to show off** — Something Wayne's proud to share
- **Low maintenance** — Update data, not code
- **Fast** — Static where possible, edge where it matters

### Non-Goals

- Ecommerce (not selling beer)
- User accounts / authentication
- Social features (comments, ratings from public)
- Complexity

---

## 2. Core Features (MVP)

### 2.1 What's On Tap

The hero feature. Four taps, each showing:

| Field | Display |
|-------|---------|
| Tap # | "TAP 1" through "TAP 4" |
| Beer name | "Skippy's A Bit Much" |
| Style | "Tropical IPA" |
| ABV | "7.2%" |
| Status | Full / Half / Low / Kicked |
| One-liner | "Pineapple chaos in a glass" |

Empty taps show as "Coming Soon" or stylized empty tap handle.

**Visual:** Tap handle icons or illustrations. Status shown as fill level (think gas gauge or battery).

### 2.2 What's Coming

Pipeline section showing beers in progress:

| Status | Example |
|--------|---------|
| Fermenting | "Czech Pils — 6 days in" |
| Conditioning | "Blonde — Cold crashing" |
| Next up | "Planning: Black IPA" |

Simple cards, maybe with a subtle progress indicator.

### 2.3 The Archive

All past batches. Sortable/filterable list:

- Beer name & style
- Brew date
- ABV / IBU
- Brief notes
- Link to full recipe (optional)

This is where Wayne can look back at what he's made.

### 2.4 About

Simple page:
- The brewery name & tagline
- The setup (Anvil Foundry, 2.5 gal batches, 4-tap kegerator)
- Location (Riverside, IL)
- Wayne's brewing philosophy ("Hoppy, 6%+, US-05 workhorse")
- Optional: photo of the setup

### 2.5 Recipe Detail (Stretch for MVP)

Click through from archive to see:
- Full grain bill
- Hop schedule
- Fermentation notes
- Tasting notes
- Brew day photos (if available)

---

## 3. Data Architecture

### 3.1 The Core Question: Brewfather API vs Static JSON?

**Brewfather API:**
| Pro | Con |
|-----|-----|
| Auto-sync from existing workflow | API key management |
| Real-time status | Rate limits |
| Less duplicate data entry | Dependency on external service |
| | Brewfather may not expose all needed fields |

**Static JSON:**
| Pro | Con |
|-----|-----|
| Full control | Manual updates |
| No API dependencies | Duplicate entry if also using Brewfather |
| Works offline | |
| Simple | |

**Recommendation: Hybrid**

1. **Taps & Pipeline** — Static JSON in repo (or simple CMS)
   - Changes infrequently
   - Wayne controls exactly what displays
   - Updates when kegging anyway

2. **Archive** — Start static, add Brewfather sync later
   - MVP: `batches.json` with all past brews
   - v2: Pull batch history from Brewfather API

### 3.2 Data Schema

**Tap:**
```typescript
interface Tap {
  number: 1 | 2 | 3 | 4;
  status: 'full' | 'half' | 'low' | 'kicked' | 'empty';
  beer: Beer | null;
}
```

**Beer:**
```typescript
interface Beer {
  id: string;                    // "skippys-a-bit-much-2026-01"
  name: string;                  // "Skippy's A Bit Much"
  style: string;                 // "Tropical IPA"
  tagline?: string;              // "Pineapple chaos in a glass"
  abv: number;                   // 7.2
  ibu?: number;                  // 50
  srm?: number;                  // 6
  og?: number;                   // 1.072
  fg?: number;                   // 1.012
  brewDate: string;              // "2026-01-12"
  status: BeerStatus;
  tastingNotes?: string;
  recipe?: Recipe;               // Full recipe for detail view
  photos?: string[];             // URLs
}

type BeerStatus = 
  | 'planning'
  | 'brewing'
  | 'fermenting'
  | 'conditioning'
  | 'carbonating'
  | 'on-tap'
  | 'kicked'
  | 'archived';
```

**Recipe (optional detail):**
```typescript
interface Recipe {
  batchSize: number;             // 2.5
  fermentables: Ingredient[];
  hops: HopAddition[];
  yeast: string;
  mashTemp: number;
  notes?: string;
}
```

### 3.3 Data Files

```
/data
  taps.json          # Current tap status
  pipeline.json      # What's fermenting/conditioning
  batches.json       # Archive of all batches
```

Or single `brewery.json` with all sections. Keep it simple.

---

## 4. Design Direction

### 4.1 Mood Options

**Option A: Craft Taproom**
- Dark background (almost black)
- Warm amber/gold accents
- Chalkboard-style typography for tap names
- Feels like a brewery taproom menu board

**Option B: Modern Minimal**
- Clean white/cream background
- Sharp typography
- Cards with subtle shadows
- Professional, like a Vercel product page

**Option C: Playful Homebrew**
- Warm background (cream or light wood texture)
- Hand-drawn feel to icons
- Personality in the copy
- Matches Skippy's "A Bit Much" energy

**Recommendation:** Option A (Craft Taproom) with Option C's personality

- Dark, moody, looks great on a phone
- Tap handles or keg icons with amber glow
- Fun copy throughout
- Wayne works at Vercel — ship something beautiful

### 4.2 Key UI Components

| Component | Purpose |
|-----------|---------|
| TapCard | Shows single tap with beer info + fill level |
| TapRack | 4 taps in a row (or 2x2 on mobile) |
| PipelineCard | Beer in progress with status badge |
| BatchCard | Archive entry, clickable for detail |
| SRMStrip | Color band showing beer color |
| FillGauge | Visual keg level indicator |

### 4.3 Mobile Considerations

- Mobile-first. Friends will pull this up on their phones
- Taps should be 2x2 grid on small screens
- Large touch targets
- Hero section shouldn't require scrolling to see all 4 taps

### 4.4 Typography

- Display: Something with personality (Playfair Display, Libre Baskerville, or custom beer-themed)
- Body: Clean sans-serif (Inter, System UI)
- Numbers: Tabular for stats alignment

---

## 5. Tech Stack

### 5.1 Framework

**Next.js 14+ (App Router)**
- Wayne knows it (works at Vercel)
- Static generation for speed
- Easy to add dynamic features later

### 5.2 Styling

**Tailwind CSS + shadcn/ui**
- Rapid development
- Great defaults
- shadcn for any complex components (dialogs, tooltips)
- Custom color palette for brewery brand

### 5.3 Data

**Phase 1: JSON files in `/data`**
- Commit to repo
- Change data = push to GitHub = auto-deploy
- Zero infrastructure

**Phase 2 (optional): Simple CMS**
- Vercel KV or Upstash
- Or Notion database → API
- Update taps from phone

### 5.4 Deployment

**Vercel** (obviously)
- Auto-deploy from GitHub
- Free tier is plenty
- Custom domain: `bassholebrewing.com` (check availability)

### 5.5 Optional APIs

| API | Purpose | Priority |
|-----|---------|----------|
| Brewfather | Sync batch data | v2 |
| Unsplash | Stock beer photos | Never (use real photos) |
| OpenAI | Generate tasting notes | Fun but unnecessary |

---

## 6. Future Ideas (v2+)

### Near-term additions
- **Batch photos** — Grid gallery for each brew
- **Brewfather sync** — Auto-populate archive
- **Brewing schedule** — Upcoming brew days
- **OG/FG tracking** — Show fermentation progress

### Fun features
- **Guest ratings** — QR code at kegerator, quick 1-5 rating
- **Most popular** — Track which beers got re-brewed
- **Seasonal calendar** — What to brew when
- **Random beer generator** — "What should Wayne brew next?"

### Sharing
- **OG/Twitter cards** — Pretty previews when sharing
- **Recipe PDF export** — Shareable recipe sheets
- **"I made this" variant** — If others want to brew your recipe

### Analytics (optional)
- Track which beers get the most views
- See what styles are popular

---

## 7. Weekend Build Plan

### What can we ship TODAY?

**Saturday Afternoon (3-4 hours):**

1. **Setup** (30 min)
   - `create-next-app` with App Router
   - Add Tailwind + shadcn/ui
   - Deploy empty shell to Vercel

2. **Data** (30 min)
   - Create `data/brewery.json` with current taps
   - Add 3-4 archived batches from Obsidian notes

3. **Homepage** (2 hours)
   - Hero: "Bass Hole Brewing" with tagline
   - TapRack: 4 taps with current status
   - Pipeline: What's fermenting
   - Footer: Riverside, IL + established date

4. **Styling** (1 hour)
   - Dark theme
   - Custom amber/gold palette
   - Mobile responsive

**Sunday Morning (2-3 hours):**

5. **Archive page** (1 hour)
   - List all batches
   - Sortable by date/style

6. **About page** (30 min)
   - The setup
   - Philosophy
   - Optional setup photo

7. **Polish** (1 hour)
   - Meta tags / OG image
   - Favicon (beer/hop icon)
   - Final responsive tweaks

8. **Ship it** (15 min)
   - Custom domain if available
   - Share with friends

### Phased Roadmap

| Phase | Focus | Timeframe |
|-------|-------|-----------|
| **MVP** | Taps + Pipeline + Archive + About | This weekend |
| **v1.1** | Recipe detail pages | Next weekend |
| **v1.2** | Better photos, OG images | When brewing |
| **v2** | Brewfather sync | When motivated |
| **v3** | Guest ratings | Someday maybe |

---

## 8. Open Questions

1. **Domain:** Is `bassholebrewing.com` available? Alternatives?
2. **Logo:** Does Wayne have one? Want to make one?
3. **Photos:** Any photos of the setup/beers to include?
4. **Brewfather API:** Worth exploring now or defer to v2?
5. **Privacy:** Is location (Riverside, IL) okay to publish?

---

## 9. Success Criteria

This project is successful if:

- [ ] Wayne is proud to share the link
- [ ] It's actually used to show friends what's on tap
- [ ] Updates take < 5 minutes
- [ ] It was fun to build

---

*"Four taps in the basement. One website to show them off."*

🍺 Bass Hole Brewing — Est. 2024, Riverside IL
