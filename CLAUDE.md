# One Ring Character Builder — Project Guidelines

## On Every Push
- Update `README.md` to reflect any feature additions, changes, or fixes
- Add a dated entry to `CHANGELOG.md` using Added / Changed / Fixed sections
- If the push introduces a new `localStorage` key, route, key source file, or changes the tech stack — update the relevant sections in **this file** (`CLAUDE.md`) as well

## Tech Stack
- React 19 + Vite 7, CSS Modules, hash-based routing (`window.location.hash`)
- Zod for runtime schema validation of character data
- Vitest for unit testing (`npm test` — runs `vitest run`)
- No backend — all persistence via `localStorage`
- Deploy: GitHub Actions on push to `main` → GitHub Pages
- Base path: `/one-ring-character-builder/` (production only; dev serves at `/`)

## localStorage Keys
- `tor2e_character` — current wizard draft (auto-saved on every change)
- `tor2e_roster` — roster index (`{ id, name, culture, calling, savedAt }[]`)
- `tor2e_char_${id}` — full character data per roster entry
- `tor2e_versions_${id}` — version history array per roster entry (max 50)

## Key Source Files
- `src/main.jsx` — app entry point with ErrorBoundary wrapper
- `src/App.jsx` — main wizard shell (~218 lines); stateful logic lives in hooks
- `src/hooks/usePlayMode.js` — Play/Pause mode state
- `src/hooks/useNotesPanel.js` — Notes panel open/close state
- `src/hooks/useToast.js` — toast notification state
- `src/hooks/useAutoSave.js` — auto-save character to localStorage and roster
- `src/hooks/useCharacterManagement.js` — character load, restore, and file import
- `src/Router.jsx` — hash-based routing (`#roster`, `#history`, default = wizard)
- `src/utils/characterSchema.js` — Zod schema for validating character data
- `src/utils/rosterStorage.js` — localStorage helpers with error reporting
- `src/utils/urlState.js` — localStorage draft save/load with error reporting
- `src/pages/RosterPage.jsx` — character roster list
- `src/pages/VersionHistoryPage.jsx` — version history for a single character
- `src/components/ErrorBoundary.jsx` — catches React errors and shows recovery UI
- `src/components/Toast.jsx` — toast notification component for user messages
- `src/components/CharacterCard.jsx` — roster card (Load / History / Delete)
- `src/components/NotesPanel.jsx` — per-character session notes slide-in panel
- `src/components/steps/Step10Review.jsx` — character sheet + export + tracking

## Dev Server
- Run via `preview_start` tool with name `"dev"` — starts `npm run dev` on port 5173
- Configured in `.claude/launch.json`

## Unit Tests
- `npm test` — runs `vitest run` (52 tests, ~150ms)
- Test files live in `src/utils/__tests__/`
- `characterDerived.test.js` — derived stats, skill/combat point validation, load calculations (including Redoubtable)
- `validation.test.js` — all 10 wizard steps in `validateStep`
- Tests use real data fixtures from `src/data/*.json` — no mocking of game data

## Testing a Character at Step 10
Seed localStorage then reload:
```js
localStorage.setItem('tor2e_character', JSON.stringify({
  wizardStep: 10, cultureId: 'bardings', callingId: 'scholar',
  attributes: { strength: 4, heart: 5, wits: 6 }, attributeBonus: null,
  cultureFavouredSkill: 'lore', callingFavouredSkills: ['riddle', 'insight'],
  additionalSkills: { lore: 3, riddle: 2, insight: 2 },
  additionalCombat: { swords: 2, bows: 1 },
  virtues: [], distinctiveFeatures: [],
  equipment: { weapons: [], armourId: 'none', armourRating: 0,
    helmId: 'none', helmRating: 0, shieldId: 'none', shieldParryBonus: 0 },
  identity: { name: 'Thorion of Dale', age: 28, patron: '', backstory: '' },
  valour: 1, wisdom: 1, _tracking: {}, _notes: []
}));
location.reload();
```
Then click **RESTORE AUTO-SAVED CHARACTER**.

## Valid Culture IDs
`bardings` · `dwarves` · `elves-of-lindon` · `hobbits` · `men-of-bree` · `rangers`

## Coding Conventions
- CSS Modules only — no inline styles, no global class names
- Match existing gold/dark aesthetic: `var(--gold-bright)`, `var(--gold-dim)`, `var(--text-secondary)`
- Cinzel / Cinzel Decorative for headings; Georgia for body text in notes
- Private character fields prefixed with `_` (e.g. `_tracking`, `_notes`, `_rosterId`)
- Keep changes minimal — touch only what's necessary
