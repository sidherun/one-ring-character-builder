/**
 * Generates a fully self-contained HTML export of the character sheet.
 * All styles are inlined — no CSS class names, no external stylesheets required.
 * Only Google Fonts needs an internet connection; layout and colours are offline-safe.
 */

import { deriveStats } from './characterDerived.js';
import cultures from '../data/cultures.json';
import callings from '../data/callings.json';
import virtues from '../data/virtues.json';
import features from '../data/features.json';
import equipmentData from '../data/equipment.json';

// ─── Colour palette (mirrors index.css :root) ────────────────────────────────
const C = {
  stoneDark:    '#1a1714',
  stoneMid:     '#2d2820',
  goldBright:   '#c9a84c',
  goldDim:      '#a88a45',
  textPrimary:  '#e8dcc8',
  textSecondary:'#c8ad88',
  labelText:    '#b0a080',
  borderOrnate: '#6b5530',
  bodyTint:     'rgba(40,30,12,0.85)',
  heartTint:    'rgba(35,15,15,0.85)',
  witsTint:     'rgba(15,20,30,0.85)',
  panelBg:      'linear-gradient(135deg,rgba(45,40,32,0.95),rgba(35,30,22,0.98))',
};

// ─── Skill / combat data ──────────────────────────────────────────────────────
const SKILL_LABELS = {
  awe:'Awe', athletics:'Athletics', awareness:'Awareness', hunting:'Hunting',
  song:'Song', craft:'Craft', travel:'Travel', enhearten:'Enhearten',
  battle:'Battle', persuade:'Persuade', stealth:'Stealth', scan:'Scan',
  insight:'Insight', explore:'Explore', healing:'Healing', riddle:'Riddle',
  lore:'Lore', courtesy:'Courtesy',
};
const SKILL_GROUPS = {
  Body:  ['awe','athletics','awareness','hunting','song','craft'],
  Heart: ['enhearten','battle','travel','courtesy','insight','healing'],
  Wits:  ['persuade','stealth','scan','explore','riddle','lore'],
};
const COMBAT_LABELS = { axes:'Axes', bows:'Bows', spears:'Spears', swords:'Swords', knives:'Knives' };

const TRACKING_FIELDS = [
  { key:'currentEndurance', label:'Current Endurance', defaultFn: d => d.endurance, showMax:true },
  { key:'currentHope',      label:'Current Hope',      defaultFn: d => d.hope,      showMax:true },
  { key:'currentShadow',    label:'Current Shadow',    defaultFn: () => 0 },
  { key:'fellowshipPoints', label:'Fellowship Points', defaultFn: () => 0 },
  { key:'adventurePoints',  label:'Adventure Points',  defaultFn: () => 0 },
  { key:'treasurePoints',   label:'Treasure Points',   defaultFn: () => 0 },
];

// ─── Small HTML helpers ───────────────────────────────────────────────────────
const s = (obj) => Object.entries(obj).map(([k,v]) => `${k}:${v}`).join(';');

function pips(value, max = 6) {
  const dots = Array.from({ length: max }, (_, i) => {
    const filled = i < value;
    return `<span style="${s({
      display:'inline-block', width:'10px', height:'10px',
      borderRadius:'50%', border:`1px solid ${C.goldDim}`, margin:'0 1px',
      background: filled ? C.goldBright : 'rgba(20,17,12,0.5)',
      boxShadow: filled ? `0 0 3px rgba(201,168,76,0.5)` : 'none',
    })}"></span>`;
  }).join('');
  return `<div style="display:flex;align-items:center;">${dots}</div>`;
}

function panelTitle(text) {
  return `<div style="${s({
    fontFamily:"'Cinzel',serif", fontSize:'12px', letterSpacing:'1.5px',
    textTransform:'uppercase', color:C.goldDim,
    padding:'8px 14px 5px', borderBottom:`1px solid rgba(107,85,48,0.3)`,
    background:'rgba(20,17,12,0.4)',
  })}">${text}</div>`;
}

function panel(titleText, bodyHTML, extraStyle = {}) {
  return `<div style="${s({
    background: C.panelBg, border:`1px solid ${C.borderOrnate}`,
    borderRadius:'2px', overflow:'hidden', ...extraStyle,
  })}">${panelTitle(titleText)}${bodyHTML}</div>`;
}

// ─── Main generator ───────────────────────────────────────────────────────────
export function generateCharacterHTML(character) {
  const culture = cultures.find(c => c.id === character.cultureId);
  const calling  = callings.find(c  => c.id === character.callingId);
  if (!culture || !calling) return '<p>Character data incomplete.</p>';

  const attrs = character.attributes || {};
  const attrBonus = character.attributeBonus;
  const effectiveAttrs = {
    strength: (attrs.strength || 0) + (attrBonus === 'strength' ? 1 : 0),
    heart:    (attrs.heart    || 0) + (attrBonus === 'heart'    ? 1 : 0),
    wits:     (attrs.wits     || 0) + (attrBonus === 'wits'     ? 1 : 0),
  };
  const derived = deriveStats({ ...character, attributes: effectiveAttrs }, culture);

  const eq  = character.equipment || {};
  const id  = character.identity  || {};
  const tracking = character._tracking || {};

  const totalArmour = (eq.armourRating || 0) + (eq.helmRating || 0);
  const totalLoad   = (eq.armourLoad   || 0) + (eq.helmLoad   || 0)
                    + (eq.shieldLoad   || 0)
                    + (eq.weapons || []).reduce((s,w) => s + (Number(w.load)||0), 0);

  const selectedVirtues  = (character.virtues           || []).map(id => virtues.find(v => v.id === id)).filter(Boolean);
  const selectedFeatures = (character.distinctiveFeatures || []).map(id => features.find(f => f.id === id)).filter(Boolean);

  const favouredSkills = new Set([
    character.cultureFavouredSkill,
    ...(character.callingFavouredSkills || []),
  ].filter(Boolean));

  // ── Sections ──────────────────────────────────────────────────────────────

  // Header
  const header = `
    <div style="text-align:center;padding-bottom:20px;border-bottom:1px solid rgba(107,85,48,0.4);margin-bottom:16px;">
      <div style="font-family:'Cinzel Decorative',serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:${C.goldDim};margin-bottom:10px;">
        The One Ring · Second Edition
      </div>
      <h1 style="font-family:'Cinzel Decorative',serif;font-size:34px;color:${C.goldBright};text-shadow:0 0 30px rgba(201,168,76,0.4),0 2px 4px rgba(0,0,0,0.8);line-height:1;margin-bottom:6px;letter-spacing:2px;">
        ${id.name || 'Unnamed Hero'}
      </h1>
      <div style="font-family:'Cinzel',serif;font-size:12px;color:${C.textSecondary};letter-spacing:1px;font-style:italic;">
        ${culture.name} · ${calling.name}
      </div>
    </div>
    <div style="text-align:center;margin:12px 0;color:${C.goldDim};letter-spacing:8px;opacity:0.7;font-size:14px;">✦ ✦ ✦</div>`;

  // Identity row
  const identityFields = [
    ['Culture',          culture.name],
    ['Calling',          calling.name],
    ['Standard of Living', culture.standardOfLiving],
    ['Shadow Path',      calling.shadowPath],
    ['Age',              id.age    || '—'],
    ['Patron',           id.patron || '—'],
  ];
  const identity = `
    <div style="display:flex;flex-wrap:wrap;border:1px solid ${C.borderOrnate};border-radius:2px;overflow:hidden;margin-bottom:12px;">
      ${identityFields.map(([label, val], i) => `
        <div style="flex:1;min-width:100px;padding:8px 12px;border-right:${i < identityFields.length-1 ? `1px solid rgba(107,85,48,0.3)` : 'none'};background:rgba(20,17,12,0.5);">
          <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${C.labelText};margin-bottom:3px;">${label}</div>
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${C.textSecondary};">${val}</div>
        </div>`).join('')}
    </div>`;

  // Attributes
  const attrDefs = [
    { key:'strength', label:'Strength', bg: C.bodyTint },
    { key:'heart',    label:'Heart',    bg: C.heartTint },
    { key:'wits',     label:'Wits',     bg: C.witsTint  },
  ];
  const attributes = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;border:1px solid ${C.borderOrnate};border-radius:2px;overflow:hidden;margin-bottom:12px;">
      ${attrDefs.map(({ key, label, bg }, i) => `
        <div style="padding:16px 10px;text-align:center;background:${bg};${i < 2 ? `border-right:1px solid ${C.borderOrnate};` : ''}">
          <div style="font-family:'Cinzel',serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:${C.textSecondary};margin-bottom:10px;">${label}</div>
          <div style="display:flex;border:1px solid rgba(107,85,48,0.3);border-radius:1px;overflow:hidden;">
            <div style="flex:1;padding:6px 8px;text-align:center;">
              <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${C.labelText};margin-bottom:4px;">Score</div>
              <div style="font-family:'Cinzel Decorative',serif;font-size:24px;color:${C.goldBright};line-height:1;">${effectiveAttrs[key]}</div>
            </div>
            <div style="width:1px;background:rgba(107,85,48,0.4);"></div>
            <div style="flex:1;padding:6px 8px;text-align:center;">
              <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${C.labelText};margin-bottom:4px;">TN</div>
              <div style="font-family:'Cinzel Decorative',serif;font-size:24px;color:${C.goldBright};line-height:1;">${20 - effectiveAttrs[key]}</div>
            </div>
          </div>
        </div>`).join('')}
    </div>`;

  // Derived stats
  const derivedStats = [
    ['Endurance',       derived.endurance],
    ['Hope',            derived.hope],
    ['Parry',           derived.parry],
    ['Wound Threshold', derived.woundThreshold],
    ['Armour Rating',   totalArmour],
    ['Valour',          character.valour || 1],
    ['Wisdom',          character.wisdom || 1],
  ];
  const derivedRow = `
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-bottom:12px;">
      ${derivedStats.map(([label, val]) => `
        <div style="background:rgba(20,17,12,0.7);border:1px solid ${C.borderOrnate};border-radius:2px;padding:8px;text-align:center;">
          <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${C.labelText};margin-bottom:4px;">${label}</div>
          <div style="font-family:'Cinzel Decorative',serif;font-size:20px;color:${C.goldBright};text-shadow:0 0 10px rgba(201,168,76,0.3);">${val}</div>
        </div>`).join('')}
    </div>`;

  // Hope & Shadow panels
  const hopeShadow = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
      <div style="border:1px solid ${C.borderOrnate};border-radius:2px;overflow:hidden;">
        ${panelTitle('Hope')}
        <div style="display:flex;padding:10px 14px;">
          <div style="flex:1;text-align:center;">
            <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${C.labelText};margin-bottom:4px;">Total</div>
            <div style="font-family:'Cinzel Decorative',serif;font-size:22px;color:${C.goldBright};">${derived.hope}</div>
          </div>
          <div style="flex:1;text-align:center;">
            <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${C.labelText};margin-bottom:4px;">Current</div>
            <div style="font-family:'Cinzel Decorative',serif;font-size:22px;color:${C.goldBright};">____</div>
          </div>
        </div>
        <div style="font-family:'Cinzel',serif;font-size:12px;color:${C.labelText};padding:4px 14px 8px;letter-spacing:0.5px;">Miserable threshold: ${derived.miserableThreshold}</div>
      </div>
      <div style="border:1px solid rgba(139,32,32,0.4);border-radius:2px;overflow:hidden;background:rgba(35,15,15,0.5);">
        ${panelTitle('Shadow')}
        <div style="display:flex;padding:10px 14px;">
          <div style="flex:1;text-align:center;">
            <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${C.labelText};margin-bottom:4px;">Total</div>
            <div style="font-family:'Cinzel Decorative',serif;font-size:22px;color:${C.goldBright};">____</div>
          </div>
          <div style="flex:1;text-align:center;">
            <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${C.labelText};margin-bottom:4px;">Permanent</div>
            <div style="font-family:'Cinzel Decorative',serif;font-size:22px;color:${C.goldBright};">____</div>
          </div>
        </div>
      </div>
    </div>`;

  // Skills
  const skillGroupBorders = { Body:'rgba(180,130,50,0.5)', Heart:'rgba(140,50,50,0.6)', Wits:'rgba(50,80,140,0.5)' };
  function skillGroupHTML(groupName, skillIds) {
    const rows = skillIds.map(skillId => {
      const total = character.additionalSkills?.[skillId] || 0;
      const fav   = favouredSkills.has(skillId);
      return `
        <div style="display:flex;align-items:center;padding:4px 0;border-bottom:1px solid rgba(107,85,48,0.15);">
          <span style="font-family:'Cinzel',serif;font-size:13px;color:${fav ? C.goldBright : C.textPrimary};flex:1;letter-spacing:0.5px;font-style:${fav?'italic':'normal'};">
            ${fav ? '★ ' : ''}${SKILL_LABELS[skillId]}
          </span>
          ${pips(total)}
        </div>`;
    }).join('');
    return `
      <div style="background:${C.panelBg};border:1px solid ${C.borderOrnate};border-top:2px solid ${skillGroupBorders[groupName]};border-radius:2px;padding:12px 14px;">
        <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${C.goldDim};margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid rgba(107,85,48,0.3);">${groupName}</div>
        ${rows}
      </div>`;
  }

  const combatRows = Object.keys(COMBAT_LABELS).map(skillId => {
    const total = character.additionalCombat?.[skillId] || 0;
    return `
      <div style="display:flex;align-items:center;padding:4px 0;border-bottom:1px solid rgba(107,85,48,0.15);">
        <span style="font-family:'Cinzel',serif;font-size:13px;color:${C.textPrimary};flex:1;">${COMBAT_LABELS[skillId]}</span>
        ${pips(total)}
      </div>`;
  }).join('');

  const combatPanel = `
    <div style="background:${C.panelBg};border:1px solid ${C.borderOrnate};border-top:2px solid rgba(130,50,50,0.6);border-radius:2px;padding:12px 14px;">
      <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${C.goldDim};margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid rgba(107,85,48,0.3);">Combat Proficiencies</div>
      ${combatRows}
      <div style="display:flex;gap:16px;padding-top:8px;margin-top:4px;border-top:1px solid rgba(107,85,48,0.3);">
        <div style="flex:1;text-align:center;">
          <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${C.labelText};margin-bottom:3px;">Parry</div>
          <div style="font-family:'Cinzel Decorative',serif;font-size:18px;color:${C.goldBright};">${derived.parry}</div>
        </div>
        <div style="flex:1;text-align:center;">
          <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${C.labelText};margin-bottom:3px;">Weary Threshold</div>
          <div style="font-family:'Cinzel Decorative',serif;font-size:18px;color:${C.goldBright};">${derived.wearyThreshold}</div>
        </div>
      </div>
    </div>`;

  const skillsGrid = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${skillGroupHTML('Body',  SKILL_GROUPS.Body)}
        ${skillGroupHTML('Heart', SKILL_GROUPS.Heart)}
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${skillGroupHTML('Wits',  SKILL_GROUPS.Wits)}
        ${combatPanel}
      </div>
    </div>`;

  // Traits (Cultural Blessing, Virtues, Distinctive Features)
  function traitHTML(name, desc) {
    return `
      <div style="padding:8px 12px;border-bottom:1px solid rgba(107,85,48,0.2);">
        <div style="font-family:'Cinzel',serif;font-size:13px;color:${C.goldBright};margin-bottom:4px;">${name}</div>
        <div style="font-size:14px;color:${C.labelText};line-height:1.5;font-style:italic;">${desc}</div>
      </div>`;
  }

  const traitsGrid = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px;">
      ${panel('Cultural Blessing', traitHTML(culture.culturalBlessing.name, culture.culturalBlessing.description))}
      ${panel('Virtues', selectedVirtues.length === 0
        ? `<div style="padding:8px 12px;font-size:12px;color:${C.labelText};font-style:italic;">None selected</div>`
        : selectedVirtues.map(v => traitHTML(v.name, v.description)).join('')
      )}
      ${panel('Distinctive Features', [
        ...(selectedFeatures.length === 0
          ? [`<div style="padding:8px 12px;font-size:12px;color:${C.labelText};font-style:italic;">None selected</div>`]
          : selectedFeatures.map(f => traitHTML(f.name, f.description))),
        ...(calling.additionalFeature
          ? [traitHTML(`${calling.additionalFeature.name} (Calling)`, calling.additionalFeature.description)]
          : []),
      ].join(''))}
    </div>`;

  // Equipment
  const weaponRows = (eq.weapons || []).length === 0
    ? `<div style="padding:8px 12px;font-size:12px;color:${C.labelText};font-style:italic;">None</div>`
    : (eq.weapons || []).map(w => `
        <div style="display:flex;align-items:center;gap:10px;padding:7px 12px;border-bottom:1px solid rgba(107,85,48,0.15);">
          <span style="font-family:'Cinzel',serif;font-size:12px;color:${C.goldBright};flex:1;">${w.name}</span>
          <span style="font-family:'Cinzel',serif;font-size:13px;color:${C.labelText};">Dmg ${w.damage||'—'}</span>
          <span style="font-family:'Cinzel',serif;font-size:13px;color:${C.labelText};">Inj ${w.injury||'—'}</span>
          <span style="font-family:'Cinzel',serif;font-size:13px;color:${C.labelText};">Load ${w.load||0}</span>
        </div>`).join('');

  function eqStatRow(label, value, strong = false) {
    return `<div style="display:flex;justify-content:space-between;padding:6px 12px;border-bottom:1px solid rgba(107,85,48,0.15);font-family:'Cinzel',serif;font-size:13px;color:${C.textSecondary};">
      <span>${label}</span>
      <span style="${strong ? `color:${C.goldBright};` : ''}">${value}</span>
    </div>`;
  }

  const armourName  = equipmentData.armour.find(a => a.id === (eq.armourId  || 'none'))?.name || 'No Armour';
  const helmName    = equipmentData.helms.find(h  => h.id === (eq.helmId    || 'none'))?.name || 'No Helm';
  const shieldName  = equipmentData.shields.find(s => s.id === (eq.shieldId || 'none'))?.name || 'No Shield';

  const equipment = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
      ${panel('Weapons', weaponRows)}
      ${panel('Armour & Load', [
        eqStatRow('Armour',     `${armourName} (Rating ${eq.armourRating||0})`),
        eqStatRow('Helm',       `${helmName} (Rating ${eq.helmRating||0})`),
        eqStatRow('Shield',     `${shieldName} (Parry +${eq.shieldParryBonus||0})`),
        eqStatRow('Total Load', totalLoad, true),
      ].join(''))}
    </div>`;

  // Backstory
  const backstory = id.backstory ? panel('Backstory',
    `<p style="padding:12px 16px;font-size:13px;color:${C.textSecondary};line-height:1.8;font-style:italic;white-space:pre-wrap;">${id.backstory}</p>`,
    { marginBottom:'12px' }
  ) : '';

  // In-play tracking
  const trackingCells = TRACKING_FIELDS.map(field => {
    const val = (tracking[field.key] !== undefined && tracking[field.key] !== null)
      ? tracking[field.key]
      : field.defaultFn(derived);
    return `
      <div style="padding:8px;text-align:center;border:1px solid rgba(107,85,48,0.2);margin:2px;">
        <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${C.labelText};margin-bottom:8px;">${field.label}</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:6px;">
          <span style="font-family:'Cinzel',serif;font-size:22px;font-weight:bold;color:${C.goldBright};border-bottom:1px solid ${C.goldDim};padding:0 8px;">${val}</span>
          ${field.showMax ? `<span style="font-family:'Cinzel',serif;font-size:13px;color:${C.textSecondary};">/ ${field.defaultFn(derived)}</span>` : ''}
        </div>
      </div>`;
  }).join('');

  const trackingSection = `
    <div style="background:${C.panelBg};border:1px solid ${C.borderOrnate};border-radius:2px;overflow:hidden;">
      ${panelTitle('In-Play Tracking')}
      <div style="display:grid;grid-template-columns:repeat(3,1fr);padding:10px 12px;">
        ${trackingCells}
      </div>
    </div>`;

  // ── Assemble the full document ────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${id.name || 'Character'} \u2014 The One Ring</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: ${C.stoneDark};
      background-image:
        radial-gradient(ellipse at 20% 20%, rgba(42,35,25,0.8) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 80%, rgba(30,24,16,0.9) 0%, transparent 60%);
      font-family: 'IM Fell English', serif;
      color: ${C.textPrimary};
      line-height: 1.5;
      padding: 24px;
    }
  </style>
</head>
<body>
  <div style="max-width:880px;margin:0 auto;background:linear-gradient(160deg,rgba(28,24,18,0.99),rgba(20,17,12,0.99));border:1px solid ${C.borderOrnate};border-radius:3px;padding:32px;position:relative;">
    <div style="position:absolute;inset:6px;border:1px solid rgba(107,85,48,0.2);pointer-events:none;"></div>
    <div style="position:relative;z-index:1;">
      ${header}
      ${identity}
      ${attributes}
      ${derivedRow}
      ${hopeShadow}
      ${skillsGrid}
      ${traitsGrid}
      ${equipment}
      ${backstory}
      ${trackingSection}
    </div>
  </div>
  <p style="margin-top:24px;text-align:center;font-family:'Cinzel',serif;font-size:11px;color:#9a8a6a;letter-spacing:1px;text-transform:uppercase;">
    Exported from The One Ring Character Builder &mdash; Second Edition
  </p>
</body>
</html>`;
}
