# One Ring Character Builder — Project Guidelines

## On Every Push
- Update `README.md` to reflect any feature additions, changes, or fixes
- Add a dated entry to `CHANGELOG.md` using Added / Changed / Fixed sections
- If the push introduces a new `localStorage` key, route, key source file, or changes the tech stack — update the relevant sections in **this file** (`CLAUDE.md`) as well

## Tech Stack
- React 19 + Vite 7, CSS Modules, hash-based routing (`window.location.hash`)
- No backend — all persistence via `localStorage`
- Deploy: GitHub Actions on push to `main` → GitHub Pages
- Base path: `/one-ring-character-builder/` (production only; dev serves at `/`)

## localStorage Keys
- `tor2e_character` — current wizard draft (auto-saved on every change)
- `tor2e_roster` — roster index (`{ id, name, culture, calling, savedAt }[]`)
- `tor2e_char_${id}` — full character data per roster entry
- `tor2e_versions_${id}` — version history array per roster entry (max 50)

## Key Source Files
- `src/App.jsx` — main app state, wizard logic, Play mode, Notes panel
- `src/Router.jsx` — hash-based routing (`#roster`, `#history`, default = wizard)
- `src/utils/rosterStorage.js` — localStorage helpers incl. `saveVersion`, `getVersions`
- `src/pages/RosterPage.jsx` — character roster list
- `src/pages/VersionHistoryPage.jsx` — version history for a single character
- `src/components/CharacterCard.jsx` — roster card (Load / History / Delete)
- `src/components/NotesPanel.jsx` — per-character session notes slide-in panel
- `src/components/steps/Step10Review.jsx` — character sheet + export + tracking

## Dev Server
- Run via `preview_start` tool with name `"dev"` — starts `npm run dev` on port 5173
- Configured in `.claude/launch.json`

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
