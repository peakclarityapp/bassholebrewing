# Bass Hole Brewing - Keg Monitor Parts List

## Overview
WiFi-connected weight sensors under each keg, reporting to the website in real-time.

**System:** 4 kegs → 4 load cells → 1 ESP32 → WiFi → API → Website gauges

---

## Core Components

### 1. Microcontroller
| Part | Qty | Price | Notes |
|------|-----|-------|-------|
| **ESP32-WROOM-32 Dev Board** | 1 | $8-12 | [Amazon](https://www.amazon.com/s?k=esp32+wroom+32+dev+board) - Get one with USB-C |

### 2. Load Cells (per keg)
**Option A: Single 50kg Load Cell (Recommended)**
| Part | Qty | Price | Notes |
|------|-----|-------|-------|
| **50kg Load Cell** | 4 | $3-5 each | [Amazon](https://www.amazon.com/s?k=50kg+load+cell) - Bar style |
| **HX711 Amplifier** | 4 | $2-3 each | [Amazon](https://www.amazon.com/s?k=hx711+load+cell+amplifier) - One per cell |

**Option B: 4-Cell Platform Kit (More Stable)**
| Part | Qty | Price | Notes |
|------|-----|-------|-------|
| **50kg Load Cell Kit (4 cells + HX711)** | 4 kits | $10-15 each | [Amazon](https://www.amazon.com/s?k=50kg+load+cell+kit+hx711) - Makes a proper scale platform |

### 3. Power Supply
| Part | Qty | Price | Notes |
|------|-----|-------|-------|
| **5V 2A USB Power Adapter** | 1 | $8 | Any decent USB charger works |
| **USB-C Cable** | 1 | $5 | For ESP32 |

---

## Platform Materials (per keg)

### Simple Single-Cell Mount
| Part | Qty | Price | Notes |
|------|-----|-------|-------|
| **3/4" Plywood** | 2 pcs 8"x8" | ~$5 | Top and bottom plates |
| **M4 or M5 Screws** | 8 | ~$3 | Mount load cell between plates |
| **Rubber Feet** | 4 | ~$3 | Anti-slip, vibration dampening |

### Or: Pre-made Option
| Part | Qty | Price | Notes |
|------|-----|-------|-------|
| **Digital Scale Platform (gutted)** | 4 | $15-20 each | Buy cheap bathroom scales, remove electronics, use the load cells + platform |

---

## Wiring & Enclosure

| Part | Qty | Price | Notes |
|------|-----|-------|-------|
| **22 AWG Wire (4 colors)** | 1 spool | $8 | For load cell connections |
| **JST Connectors** | 1 kit | $8 | Clean connections, easy disconnect |
| **Project Box** | 1 | $8 | For ESP32 + HX711s |
| **Terminal Block** | 1 | $5 | Optional - easier wiring |

---

## Total Cost Estimate

### Budget Build (Single cells)
| Component | Cost |
|-----------|------|
| ESP32 | $10 |
| 4x Load Cells | $15 |
| 4x HX711 | $10 |
| Wiring/Connectors | $15 |
| Platform materials | $20 |
| Power supply | $10 |
| **Total** | **~$80** |

### Better Build (4-cell platforms)
| Component | Cost |
|-----------|------|
| ESP32 | $10 |
| 4x Load Cell Kits | $50 |
| Wiring/Connectors | $15 |
| Platform materials | $30 |
| Power supply | $10 |
| **Total** | **~$115** |

### Lazy Build (Pre-made scales)
| Component | Cost |
|-----------|------|
| ESP32 | $10 |
| 4x Cheap Digital Scales | $60 |
| Wiring/Connectors | $15 |
| Power supply | $10 |
| **Total** | **~$95** |

---

## Shopping List (Amazon Cart Ready)

### Essentials - ~$50
1. ESP32-WROOM-32 DevKit (~$10)
   - Search: "ESP32 WROOM 32 development board USB-C"

2. 4x 50kg Load Cell + HX711 Kit (~$25)
   - Search: "50kg load cell HX711 kit" (buy 4, or get 2x 2-packs)

3. Jumper Wires Assortment (~$8)
   - Search: "dupont jumper wires kit"

4. JST Connector Kit (~$8)
   - Search: "JST XH connector kit"

### Platform Materials - Home Depot/Lowes
- 2' x 2' sheet of 3/4" plywood (~$15)
- M4 x 20mm screws (pack of 50) (~$5)
- Rubber furniture pads (~$5)

---

## Calibration Data Needed

For each keg type, we need:
| Keg Type | Empty Weight | Full Weight | Volume |
|----------|--------------|-------------|--------|
| 2.5 gal Corny | ~9 lbs | ~30 lbs | 2.5 gal |
| 3 gal Corny | ~9.5 lbs | ~35 lbs | 3 gal |
| 5 gal Corny | ~10.5 lbs | ~52 lbs | 5 gal |

*Beer ≈ 8.5 lbs/gallon*

---

## Next Steps

1. **Order parts** (links above)
2. **Build platforms** while waiting for delivery
3. **Wire it up** - I'll write the ESP32 firmware
4. **Calibrate** - Weigh empty kegs, full kegs
5. **Deploy** - Mount in kegerator, connect to WiFi
6. **API endpoint** - Add to Bass Hole site
7. **Real-time gauges** - Update website to poll API

---

## Wiring Diagram

```
                    ESP32
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
   HX711-1          HX711-2          HX711-3          HX711-4
    │                 │                 │                 │
 Load Cell 1      Load Cell 2      Load Cell 3      Load Cell 4
   (Tap 1)          (Tap 2)          (Tap 3)          (Tap 4)

ESP32 Pins:
- HX711-1: GPIO 16 (DT), GPIO 17 (SCK)
- HX711-2: GPIO 18 (DT), GPIO 19 (SCK)  
- HX711-3: GPIO 21 (DT), GPIO 22 (SCK)
- HX711-4: GPIO 23 (DT), GPIO 25 (SCK)
- All HX711 VCC → 3.3V
- All HX711 GND → GND
```

---

*Let's automate that kegerator! 🍺*
