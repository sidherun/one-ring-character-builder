# Changelog

All notable changes to the TOR2E Character Builder are documented here.

---

## [Unreleased]

---

## 2026-02-23 — Hide export buttons in Play mode; fix restore completedSteps

### Changed
- **Play mode now hides all four export buttons** — Print / Save as PDF, Download HTML, Save as JSON, and Copy Share URL are no longer rendered when Play mode is active. Save to Roster and View Roster → remain visible. This reduces visual clutter while at the table.

### Fixed
- **Play button disabled after restoring an auto-saved character** — `handleRestore` was not setting `completedSteps`, so the Play button stayed permanently disabled even for a fully completed character. It now populates `completedSteps` from the restored `wizardStep` value.

---

## 2026-02-21 — Redoubtable encumbrance fix

### Fixed
- **Dwarves of Durin's Folk (Redoubtable blessing)** — Total Load on the character sheet and HTML export now correctly halves armour and helm load (rounding fractions up) per TOR2E rules. Shields and weapons are unaffected.
- Added `computeTotalLoad(equipment, culture)` to `characterDerived.js` as the single source of truth for this calculation, consumed by both `Step10Review.jsx` and `generateCharacterHTML.js`.

---

## 2026-02-21 — Hope Current greyed out in Play mode

### Changed
- **Hope panel Current field** is disabled and visually greyed out when Play mode is active — it reflects the In-Play Tracking value but cannot be edited directly; updates must come through the tracking grid
- Re-enables fully when Play is paused

---

## 2026-02-21 — Hope Current panel synced to In-Play Tracking

### Fixed
- **Hope panel Current field** now reads and writes the same `_tracking.currentHope` key as the In-Play Tracking grid — editing either input immediately reflects in the other.
- **Stale closure bug in tracking handlers** — `handleTrackingChange` and `handleTrackingBlur` previously spread a closed-over snapshot of `_tracking`, which could drop concurrent writes. Both handlers now use a functional updater (`onChange(prev => …)`) so they always merge against the freshest state.
- **`updateCharacter` in App.jsx** extended to accept a function updater form, threading it correctly through to `setCharacter`.

---

## 2026-02-21 — Semantic load status on Armour & Load panel

### Added
- **Total Load now shows a contextual badge** based on TOR2E rules: a character becomes **Weary** when their current Endurance falls to or below their Load. The badge reads:
  - **Weary** (red) — current tracked Endurance ≤ Load
  - **Weary on next hit** (amber) — current Endurance is exactly 1 above Load
  - No badge — character is safely above the threshold
- Current Endurance is read from the in-play tracking value if set, falling back to the derived maximum.

---

## 2026-02-21 — Fix tracking input editing

### Fixed
- **Tracking fields could not be edited freely** — controlled inputs coerced empty strings to `0` on every keystroke, so clearing a field to type a new number snapped it straight back to `0`. Fixed by adding a local `trackingDisplay` state that holds the raw string while the user is typing, committing the number to character state on each valid keystroke and cleaning up on blur (empty/invalid values default to `0`). All 9 tracking inputs (6 in the grid + 3 in the Hope/Shadow panel) share this behaviour.

---

## 2026-02-21 — Uniform In-Play Tracking display

### Changed
- **All 6 In-Play Tracking fields** now show a `/ max` suffix beside the input, matching the style of Current Endurance. Current Shadow shows `/ {miserableThreshold}` (the character's Shadow threshold), while Fellowship Points, Adventure Points, and Treasure Points show `/ —` since they have no fixed cap. The three Hope / Shadow panel fields (hopeCurrent, shadowTotal, shadowPermanent) were moved into a separate `HOPE_SHADOW_FIELDS` constant to prevent them appearing twice in the tracking grid.

---

## 2026-02-21 — Interactive Hope / Shadow fields

### Changed
- **Hope Current** and **Shadow Total / Permanent** are now editable number inputs, consistent with the In-Play Tracking section. Hope Current pre-fills from the derived Hope max. All three persist to the roster via the existing `_tracking` auto-save mechanism. The HTML export renders their saved values as static styled numbers.

---

## 2026-02-21 — HTML export fix (v2)

### Fixed
- **Download HTML was still unstyled** — the previous fix tried reading `document.styleSheets`, but in production the bundled CSS is served from GitHub Pages CDN, making it cross-origin. `cssRules` throws a security error which the `try/catch` silently swallowed, leaving the embedded stylesheet empty. Replaced the entire approach with `generateCharacterHTML.js` — a utility that builds the complete HTML document from character data using 100% inline styles. No class names, no external stylesheets, no DOM capture. The file now renders correctly in any browser, online or offline.

---

## 2026-02-21 — Play / Pause mode

### Added
- **Play / Pause toggle in the top bar** — the `▶ Play` button (gold) jumps to the character sheet and enters Play mode: the StepIndicator and WizardNav are hidden entirely, locking navigation to prevent accidental edits during a session. The button turns green and reads `⏸ Pause`; clicking it re-enables navigation and returns to normal editing mode. The button is disabled until step 9 is complete. Play mode is session-only and resets on reload.

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
