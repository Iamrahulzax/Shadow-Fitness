# 🌌 Shadow Fitness — Solo Leveling–Themed Gamified Gym Tracker

> *"The System has selected you as a Player. Every rep, step, and drop of water shapes your destiny."*

**Shadow Fitness** is a mobile-first, production-quality gamified workout, health, and habit tracker inspired by the iconic **"Player System"** from *Solo Leveling*. It bridges real-world physical training with dark fantasy RPG progression, transforming workouts into dungeon raids, hydration into mana replenishment, and physical feats into shadow army extractions.

---

## ⚡ Core Systems & Features

### 1. 🛡️ Player Status Window (Home / Dashboard)
- **Player License**: Shows Player Name, Hunter Rank (`E` → `D` → `C` → `B` → `A` → `S` → `National Level`), Level, and glowing XP Gauge.
- **Hero 5-Stat Radar Visualizer**: Custom SVG spider chart displaying the 5 core attributes (**STR**, **VIT**, **AGI**, **INT**, **PER**).
- **Ability Points (AP)**: Leveling up awards free Ability Points that can be allocated to any stat.
- **Gate Clearance Streak Flame**: Tiered visual aura (Blue Gate Aura → Monarch Violet Void → Sovereign Solar Flame) with **Gate Aegis Key** protection and non-punishing rest messaging (*"The Gate remains open — return when ready"*).
- **Rapid Directives Bar**: Quick one-tap logging for workout raids, mana intake, step traversal, and protein elixirs.

### 2. ⚔️ Dungeon Raids (Workout Tracker)
- **Active Gate Raid Logger**:
  - Track exercises, sets, reps, weight (kg), and completion checkboxes.
  - Built-in Rest Timer (30s / 60s / 90s) with audio cues.
  - Quick-add library with common compound movements (Squat, Bench Press, Deadlift, Pull-ups, OHP, etc.).
- **Dungeon Cleared Victory Cinematic**:
  - Calculates aggregate tonnage lifted ($Volume = \sum Reps \times Weight$).
  - Awards scaled XP ($200 + \frac{Volume}{30}$).
  - Triggers a **Randomized Spoil / Loot Drop** (Rare Runes, Epic Gate Keys, Legendary Titles).
- **Hunter Raid Log**: History of past cleared gates, tonnage, and extracted armaments.

### 3. 🧪 Mana & Nutrition (Calories, Protein, Hydration)
- **MP Energy Gauge**: Daily caloric intake tracked as bodily mana reserves.
- **STR Potion Synthesis**: Protein progress ring with instant infusion chips (`+20g`, `+30g`, `+45g`).
- **Mana Flask Hydration**: Visual droplet fill meter with tap chips (`+250ml`, `+500ml`, `+750ml`).
- **Food Extraction Log**: Searchable ration presets + custom meal logging with timestamps.

### 4. 📜 System Quests & Weekly Red Gate
- **Iconic Daily System Mandate**:
  - 100 Push-ups, 100 Sit-ups, 100 Squats, 10km Run / Cardio Traversal.
- **Daily Habit Quests**: Hydration (2.5L), STR Elixir (140g+ Protein), Cryo-Sleep Chamber (7+ Hours).
- **Weekly Red Gate Boss Raid**: Battle an Ice Elf Warlord where every kilogram of workout volume chips down the boss's HP bar for monumental XP payouts.

### 5. 👥 The Shadow Army & Achievements
- **Shadow Vault**: Extract powerful shadow soldiers based on monumental training feats:
  - **Igris** (Bloodred Commander): 50,000kg cumulative volume.
  - **Iron** (Unyielding Vanguard): 10-day Gate streak.
  - **Tank** (Glacial Beast): 70,000 total steps.
  - **Beru** (The Ant King): Reach Rank S & 50 Raids.
  - **Tusk** (High Orc Sovereign): 7-day optimal nutrition.
  - **Kaisel** (Sky Wyvern): Reach Level 30.
- **Title Equipper**: Equip unlocked titles (e.g. *"The Bloodred Knight"*, *"Iron Will"*) directly to your player status license.

### 6. 📈 Telemetry & Analytics
- Progressive Overload trend chart showing Hunter Power Level growth over time.
- Steps Dungeon Traversal across 100 floors of the Shadow Gate with unlockable lore snippets.
- Vitality Sleep Chamber with recovery rating and fatigue debuff detection.

---

## 📊 Stat-Mapping Logic & Gamification Formulas

| RPG Attribute | Real-World Fitness Metric | Progression Formula | Real-Life Impact |
| :--- | :--- | :--- | :--- |
| **STR (Strength)** | Workout volume & resistance training | $+1$ per completed raid; $+2$ if volume $> 5,000\text{kg}$; $+1$ upon hitting protein goal | Drives total lifting capacity & power level |
| **VIT (Vitality)** | Sleep duration & recovery score | $+1$ when sleep $\ge 7\text{h}$; $-2$ Fatigue Debuff if sleep $< 6\text{h}$ | Determines HP (Health Pool) & resistance |
| **AGI (Agility)** | Daily step count & cardio distance | $+1$ per $2,000$ steps logged; advances dungeon floors | Enhances stamina & traversal speed |
| **INT (Intelligence)** | Hydration & nutritional balance | $+1$ when 100% hydration goal ($3,000\text{ml}$) is met | Determines MP (Calorie Energy capacity) |
| **PER (Perception)** | Gate clearance streak & quest completion | $+1$ per consecutive gate cleared & completed daily mandate | Boosts critical XP yields & discipline aura |

### 📈 Level & Rank Progression Curve

$$\text{XP Required for Level } L = \lfloor 1000 \times 1.15^{L-1} \rfloor$$

- **E-Rank**: Level $1 - 9$
- **D-Rank**: Level $10 - 19$
- **C-Rank**: Level $20 - 29$
- **B-Rank**: Level $30 - 39$
- **A-Rank**: Level $40 - 49$
- **S-Rank**: Level $50 - 69$
- **National Level Hunter**: Level $70+$

Every level-up grants **+3 Ability Points (AP)** and triggers a full-screen cinematic overlay with sound fanfare and particle bursts.

---

## 🎨 Design Tokens & Aesthetic Identity

- **Backgrounds**: Deep charcoal/black (`#07070B`, `#0A0A0F`, `#0E0F17`) with radial violet and cyan light wells.
- **Accent Glows**: Electric Cyan (`#00D4FF`), Void Indigo (`#5B7FFF`), Monarch Violet (`#7B5CFF`), S-Rank Gold (`#FFC94A`), Danger Red (`#FF3B5C`).
- **Typography**: 
  - Header/Readouts: `Orbitron` (Google Fonts)
  - Tech Labels: `Rajdhani` (Google Fonts)
  - Body Text: `Inter` (Google Fonts)
- **Cut Corners**: Custom polygonal clip paths (`clip-corner-tl`, `clip-corner-br`, `clip-hex-btn`).
- **Sound Engine**: Procedural Web Audio API synthesizer (`soundFx.ts`) generating crystalline quest chimes, ascending level-up fanfares, and loot rattles without external audio asset lag.
- **Accessibility**: One-click **Reduced Glow / Motion** toggle on top header.

---

## 🚀 Running Locally

```bash
# Clone or navigate to the workspace
cd "c:/Users/RAHUL/Desktop/gym tracking"

# Install dependencies
npm install

# Start Vite Development Server
npm run dev

# Build production bundle
npm run build
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in your browser.
