# Changelog

All notable changes to the TOR2E Character Builder are documented here.

---

## [Unreleased]

---

## 2026-02-21 (patch)

### Fixed
- **Roster overwrites second character with first** — `handleSaveToRoster` was not writing the generated `_rosterId` back into React state after the first save. Each subsequent "Save to Roster" click on the same character generated a fresh UUID, creating duplicate index entries and orphaning earlier ones. The returned ID is now immediately stored back into character state, so all future saves (including tracking auto-saves) correctly upsert the same roster slot.

---

## 2026-02-21

### Added
- **Interactive in-play tracking** — the six tracking fields (Current Endurance, Current Hope, Current Shadow, Fellowship Points, Adventure Points, Treasure Points) are now editable number inputs. Current Endurance and Current Hope pre-fill from derived stats and display a `/max` suffix. Values auto-save to the roster whenever the character has a roster entry.
- **Character Roster page** — a secondary page (hash route `#roster`) listing all saved characters with culture, calling, save date, and an "In Progress" badge. Supports Load and Delete per character.
- **Save to Roster button** on the Step 10 review page, with a brief "✓ Saved to Roster" confirmation state.
- **View Roster button** on the welcome screen and review page.

### Changed
- `main.jsx` now renders `Router` instead of `App` directly to support hash-based page routing.
- `App.jsx` accepts `onNavigateToRoster`, `characterToLoad`, and `onCharacterLoaded` props from the Router.

---

## 2026-02-20

### Added
- **Free-assign attribute set (7 / 6 / 5)** — all six cultures now include an optional Set 7 entry. Selecting it reveals three dropdowns to freely assign 7, 6, and 5 across Strength, Heart, and Wits. Duplicate values are prevented automatically.
- **GitHub Pages deployment** — `vite.config.js` base path set to `/one-ring-character-builder/`; GitHub Actions workflow (`.github/workflows/deploy.yml`) auto-deploys on every push to `main`.

### Changed
- All skill and combat proficiency pips now start at **zero** — the full 20-point skill pool and 3-point combat pool are assigned freely from scratch. Culture base skills no longer pre-populate pips.
- Step 10 Review page is now the terminal destination; the "Finish" button has been removed (the Next button is hidden on step 10).
- Accessibility pass: boosted font sizes (no text below 12 px), raised contrast on dim text colours (`--label-text`, `--text-secondary`, `--gold-dim`), and reduced excessive letter-spacing across all step components.

### Fixed
- Layout bug where `WizardNav` was pushed off-screen due to `max-height` overflow on `.content`; fixed to `height: 100vh` with `min-height: 0`.
- Equipment names on the review page were showing raw ID strings (e.g. `leather-corslet`); now look up the proper `.name` from `equipmentData`.
- Duplicate `grim` entry removed from `features.json`.

---

## 2026-02-19 — Initial build

### Added
- 10-step character creation wizard (Welcome → Culture → Calling → Attributes → Skills → Virtues → Features → Equipment → Identity → Review).
- All six Heroic Cultures with attribute sets, favoured skills, cultural blessings, and combat proficiencies.
- All six Callings with favoured skill counts, shadow paths, and additional features.
- Full skill pip allocation (18 common skills + 5 combat proficiencies).
- Virtue and Distinctive Feature selection from complete data sets.
- Equipment step: weapons (custom or from catalogue), armour, helm, shield with ratings and load tracking.
- Identity step: name, age, patron, height/weight, appearance, backstory.
- Derived stat calculation (Endurance, Hope, Parry, Wound Threshold, Weary Threshold, Miserable Threshold).
- Step 10 character sheet with export options: Print/PDF, Download HTML, Save as JSON, Copy Share URL (compressed hash).
- Auto-save draft to `localStorage`; restore-on-return prompt.
- Step indicator with completed-step navigation.
