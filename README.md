# The One Ring · Character Builder

A browser-based character creation tool for **The One Ring Roleplaying Game, Second Edition**. No account, no installation, no server — everything runs in your browser and saves locally.

🔗 **Live app:** [sidherun.github.io/one-ring-character-builder](https://sidherun.github.io/one-ring-character-builder/)

---

## Features

### Character Creation Wizard
A guided 10-step wizard walks you through the full TOR2E character creation process:

| Step | Description |
|------|-------------|
| 1 | Welcome & overview |
| 2 | Choose Heroic Culture |
| 3 | Choose Calling & Favoured Skills |
| 4 | Assign Attributes (Strength / Heart / Wits) |
| 5 | Allocate Skill & Combat Proficiency pips |
| 6 | Choose Virtues |
| 7 | Select Distinctive Features |
| 8 | Equip your hero (weapons, armour, helm, shield) |
| 9 | Write your backstory & identity |
| 10 | Review character sheet & export |

**Heroic Cultures:** Bardings of Dale · Dwarves of Durin's Folk · Elves of Lindon · Hobbits of the Shire · Men of Bree · Rangers of the North

**Callings:** Captain · Champion · Messenger · Scholar · Treasure Hunter · Warden

**Attribute Sets:** Each culture offers multiple fixed-value sets (e.g. 5/4/3) plus a free-assign **7/6/5** option where you distribute the values yourself across Strength, Heart, and Wits.

### Character Sheet
The final step renders a full formatted character sheet with:
- Derived stats (Endurance, Hope, Parry, Wound Threshold, Weary Threshold)
- Skill pip display with favoured skill indicators (★)
- Combat Proficiencies
- Cultural Blessing, Virtues, and Distinctive Features
- Equipment summary with ratings and load
- Backstory

### In-Play Tracking
At the bottom of the character sheet, six live tracking fields let you manage your character's state during a session:
- **Current Endurance** (pre-filled from derived max)
- **Current Hope** (pre-filled from derived max)
- **Current Shadow** · **Fellowship Points** · **Adventure Points** · **Treasure Points**

Values auto-save to the roster whenever a character has been saved there — no button needed.

### Character Roster
A secondary page (accessible from the welcome screen or the review page) stores all your saved characters in browser localStorage. From the roster you can:
- Browse all saved characters with culture, calling, and last-saved date
- See an **In Progress** badge on characters who haven't reached the review step
- **Load** a character back into the wizard
- **Delete** a character

### Export Options
From the character sheet you can:
- **Print / Save as PDF** via the browser print dialog
- **Download HTML** — a self-contained snapshot of the rendered sheet
- **Save as JSON** — the full character object for backup or import
- **Copy Share URL** — a compressed URL that encodes the character; anyone with the link can view the sheet
- **Save to Roster** — persists the character to browser localStorage

---

## Running Locally

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/sidherun/one-ring-character-builder.git
cd one-ring-character-builder
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

**Build for production:**
```bash
npm run build        # outputs to dist/
npm run preview      # preview the production build locally
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 7 |
| Styling | CSS Modules with custom properties |
| Routing | Hash-based (`#roster`, `#char=…`) — no router library |
| Persistence | `localStorage` (auto-save draft + roster) |
| Deployment | GitHub Pages via GitHub Actions |
| Fonts | Cinzel · Cinzel Decorative (Google Fonts) |

All game data (cultures, callings, skills, virtues, features, equipment) lives in JSON files under `src/data/`.

---

## Project Structure

```
src/
├── components/
│   ├── steps/          # Step1Welcome … Step10Review
│   ├── CharacterCard   # Roster card component
│   ├── PipControl      # Skill pip input control
│   ├── StepIndicator   # Progress indicator
│   └── WizardNav       # Prev / Next navigation bar
├── data/               # cultures.json, callings.json, etc.
├── pages/
│   └── RosterPage      # Character roster page
├── utils/
│   ├── characterDerived.js   # Derived stat calculations
│   ├── defaultCharacter.js   # Fresh character factory
│   ├── rosterStorage.js      # localStorage roster CRUD
│   └── urlState.js           # Save/load + share URL encoding
├── App.jsx             # Main wizard shell
└── Router.jsx          # Hash-based page router
```

---

## Deployment

The app deploys automatically to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`.

---

---

See [CHANGELOG.md](CHANGELOG.md) for a full history of releases and changes.

---

*This is an unofficial fan tool. The One Ring is © Sophisticated Games Ltd & Free League Publishing. No copyrighted game text is reproduced.*
