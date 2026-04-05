# The One Ring Character Builder · 2E Freedom Rules

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
- Equipment summary with ratings and load (Dwarves of Durin's Folk automatically apply the **Redoubtable** blessing: armour and helm load are halved, rounded up)
- Backstory

### Play Mode
A **▶ Play** button sits permanently in the top bar (disabled until step 9 is complete). Clicking it jumps to the character sheet and enters Play mode — the step indicator and bottom navigation bar are hidden to prevent accidental edits during a session. The button turns green and changes to **⏸ Pause**; clicking it exits Play mode and re-enables all navigation. Play mode is session-only and resets on reload.

In Play mode the following are hidden to keep the view focused on the session:
- **Print / Save as PDF**, **Download HTML**, **Save as JSON**, and **Copy Share URL** export buttons
- The step indicator and bottom wizard navigation

**Save to Roster** and **View Roster →** remain visible in Play mode. The **Hope Current** field in the Hope panel is greyed out and disabled — it mirrors the value from the In-Play Tracking grid, which remains the single point of entry for that value.

### In-Play Tracking
The character sheet has interactive fields for tracking session state:

**Hope / Shadow panel** (mid-sheet):
- **Hope Current** — mirrors `Current Hope` from the tracking grid below; the two fields share a single value. Editable in Pause mode, read-only (greyed) in Play mode. · **Shadow Total** · **Shadow Permanent**

**In-Play Tracking section** (bottom of sheet):
All 6 fields display a `/ max` suffix for quick reference:
- **Current Endurance** `/ {derived max}` · **Current Hope** `/ {derived max}` · **Current Shadow** `/ {miserable threshold}`
- **Fellowship Points** `/ —` · **Adventure Points** `/ —` · **Treasure Points** `/ —`

All values auto-save to the roster whenever a character has been saved there — no button needed.

### Session Notes
While in Play mode, a **✎ Notes** button appears in the top bar next to **⏸ Pause**. Clicking it slides in a notes panel from the right while the character sheet shifts left to make room.

Each character has their own independent set of notes, stored in `character._notes` and auto-saved to localStorage alongside all other character data.

In the notes panel you can:
- **Create** notes with a title and free-text body (click **+ New Note**)
- **Edit** any existing note by clicking its card
- **Delete** a note from within the editor
- Notes are listed newest-first, each card showing title, a body preview, and last-edited date

The panel can be closed with the **✕** button or by clicking **✎ Notes** again. It closes automatically when Pause is clicked.

### Character Roster
A secondary page (accessible from the welcome screen or the review page) stores all your saved characters in browser localStorage. From the roster you can:
- Browse all saved characters with culture, calling, and last-saved date
- See an **In Progress** badge on characters who haven't reached the review step
- **Load** a character back into the wizard
- **Delete** a character

### Export Options
From the character sheet you can:
- **Print / Save as PDF** via the browser print dialog
- **Download HTML** — a fully self-contained file with all styles, fonts, and colours embedded; opens correctly in any browser without an internet connection
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
| Validation | Zod for runtime schema validation |
| Error Handling | React Error Boundary + Toast notifications |
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
