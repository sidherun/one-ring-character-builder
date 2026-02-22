import { useMemo, useState, useCallback, useEffect } from 'react';
import styles from './Step10Review.module.css';
import cultures from '../../data/cultures.json';
import callings from '../../data/callings.json';
import virtues from '../../data/virtues.json';
import features from '../../data/features.json';
import equipmentData from '../../data/equipment.json';
import { deriveStats } from '../../utils/characterDerived';
import { encodeCharacterToHash } from '../../utils/urlState';
import { saveCharacterToRoster } from '../../utils/rosterStorage';
import { generateCharacterHTML } from '../../utils/generateCharacterHTML';

const TRACKING_FIELDS = [
  { key: 'currentEndurance', label: 'Current Endurance', defaultFn: (d) => d.endurance,  min: 0, max: 40, showMax: true, maxFn: (d) => d.endurance },
  { key: 'currentHope',      label: 'Current Hope',      defaultFn: (d) => d.hope,       min: 0, max: 30, showMax: true, maxFn: (d) => d.hope },
  { key: 'currentShadow',    label: 'Current Shadow',    defaultFn: () => 0,              min: 0, max: 30, showMax: true, maxFn: (d) => d.miserableThreshold },
  { key: 'fellowshipPoints', label: 'Fellowship Points', defaultFn: () => 0,              min: 0, max: 99, showMax: true, maxFn: () => '—' },
  { key: 'adventurePoints',  label: 'Adventure Points',  defaultFn: () => 0,              min: 0, max: 99, showMax: true, maxFn: () => '—' },
  { key: 'treasurePoints',   label: 'Treasure Points',   defaultFn: () => 0,              min: 0, max: 99, showMax: true, maxFn: () => '—' },
];

// Hope / Shadow panel fields (not shown in tracking grid)
const HOPE_SHADOW_FIELDS = [
  { key: 'hopeCurrent',      label: 'Hope Current',     defaultFn: (d) => d.hope, min: 0, max: 30 },
  { key: 'shadowTotal',      label: 'Shadow Total',     defaultFn: () => 0,        min: 0, max: 30 },
  { key: 'shadowPermanent',  label: 'Shadow Permanent', defaultFn: () => 0,        min: 0, max: 30 },
];

const SKILL_LABELS = {
  awe: 'Awe', athletics: 'Athletics', awareness: 'Awareness', hunting: 'Hunting',
  song: 'Song', craft: 'Craft', travel: 'Travel',
  enhearten: 'Enhearten', battle: 'Battle', persuade: 'Persuade',
  stealth: 'Stealth', scan: 'Scan', insight: 'Insight',
  explore: 'Explore', healing: 'Healing', riddle: 'Riddle',
  lore: 'Lore', courtesy: 'Courtesy',
};

const COMBAT_LABELS = { axes: 'Axes', bows: 'Bows', spears: 'Spears', swords: 'Swords', knives: 'Knives' };

const SKILL_GROUPS = {
  Body: ['awe', 'athletics', 'awareness', 'hunting', 'song', 'craft'],
  Heart: ['enhearten', 'battle', 'travel', 'courtesy', 'insight', 'healing'],
  Wits: ['persuade', 'stealth', 'scan', 'explore', 'riddle', 'lore'],
};

function Pip({ filled }) {
  return <span className={`${styles.pip} ${filled ? styles.pipFilled : styles.pipEmpty}`} />;
}

function PipRow({ value, max = 6 }) {
  return (
    <div className={styles.pipRow}>
      {Array.from({ length: max }).map((_, i) => <Pip key={i} filled={i < value} />)}
    </div>
  );
}

export default function Step10Review({ character, onSaveToRoster, onViewRoster, onChange }) {
  const culture = cultures.find(c => c.id === character.cultureId);
  const calling = callings.find(c => c.id === character.callingId);

  const effectiveAttrs = useMemo(() => {
    const base = { ...character.attributes };
    const bonus = character.attributeBonus;
    if (bonus && base[bonus] != null) return { ...base, [bonus]: base[bonus] + 1 };
    return base;
  }, [character.attributes, character.attributeBonus]);

  const derived = useMemo(() => deriveStats({ ...character, attributes: effectiveAttrs }, culture), [effectiveAttrs, culture]);

  const getSkillTotal = (skillId) => {
    return character.additionalSkills?.[skillId] || 0;
  };

  const getCombatTotal = (skillId) => {
    return character.additionalCombat?.[skillId] || 0;
  };

  const favouredSkills = useMemo(() => {
    const set = new Set();
    if (character.cultureFavouredSkill) set.add(character.cultureFavouredSkill);
    (character.callingFavouredSkills || []).forEach(s => set.add(s));
    return set;
  }, [character.cultureFavouredSkill, character.callingFavouredSkills]);

  const selectedVirtues = (character.virtues || []).map(id => virtues.find(v => v.id === id)).filter(Boolean);
  const selectedFeatures = (character.distinctiveFeatures || []).map(id => features.find(f => f.id === id)).filter(Boolean);
  const eq = character.equipment || {};
  const id = character.identity || {};
  const totalArmour = (eq.armourRating || 0) + (eq.helmRating || 0);

  // Must be declared before totalLoad/loadStatus which depend on it
  const tracking = character._tracking || {};

  // Total Load = armour + helm + shield + weapons (per TOR2E rules)
  const totalLoad = (eq.armourLoad || 0) + (eq.helmLoad || 0) + (eq.shieldLoad || 0)
    + (eq.weapons || []).reduce((s, w) => s + (Number(w.load) || 0), 0);

  // Current endurance from tracking (falls back to derived max if not yet tracked)
  const currentEndurance = tracking.currentEndurance !== undefined && tracking.currentEndurance !== null
    ? Number(tracking.currentEndurance)
    : derived.endurance;

  // Semantic load status per TOR2E rules:
  // Weary = current Endurance ≤ Load
  const getLoadStatus = (load, currEnd) => {
    if (load === 0) return null;
    if (currEnd <= load) return { label: 'Weary', danger: true };
    // Warn if one point of damage would cause Weary
    if (currEnd - load === 1) return { label: 'Weary on next hit', danger: false };
    return null;
  };
  const loadStatus = getLoadStatus(totalLoad, currentEndurance);

  const handleExportHTML = () => {
    const fullHTML = generateCharacterHTML(character);
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id.name || 'character'}-tor2e.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id.name || 'character'}-tor2e.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareURL = () => {
    const hash = encodeCharacterToHash(character);
    const url = `${window.location.origin}${window.location.pathname}#char=${hash}`;
    navigator.clipboard.writeText(url).then(() => alert('Share URL copied to clipboard!'));
  };

  const handlePrint = () => window.print();

  const [savedToRoster, setSavedToRoster] = useState(false);
  const handleSaveToRoster = useCallback(() => {
    if (onSaveToRoster) {
      onSaveToRoster();
      setSavedToRoster(true);
      setTimeout(() => setSavedToRoster(false), 2500);
    }
  }, [onSaveToRoster]);

  // Tracking field helpers
  // Local display state lets inputs show intermediate strings (e.g. '' while user clears to retype)
  const [trackingDisplay, setTrackingDisplay] = useState({});

  const getTrackingValue = useCallback((field) => {
    // If user is mid-edit on this field, show their raw string
    if (trackingDisplay[field.key] !== undefined) return trackingDisplay[field.key];
    if (tracking[field.key] !== undefined && tracking[field.key] !== null) {
      return tracking[field.key];
    }
    return field.defaultFn(derived);
  }, [trackingDisplay, tracking, derived]);

  const handleTrackingChange = useCallback((key, value) => {
    // Store raw string in display state so the input doesn't snap while typing
    setTrackingDisplay(prev => ({ ...prev, [key]: value }));
    // Only commit a valid number to character state
    if (value !== '' && !isNaN(Number(value))) {
      const numVal = Math.max(0, Number(value));
      const updated = { ...tracking, [key]: numVal };
      if (onChange) onChange({ _tracking: updated });
    }
  }, [tracking, onChange]);

  const handleTrackingBlur = useCallback((key, value) => {
    // On blur, coerce any remaining empty / invalid string to 0 and clear display override
    const numVal = value === '' || isNaN(Number(value)) ? 0 : Math.max(0, Number(value));
    const updated = { ...tracking, [key]: numVal };
    if (onChange) onChange({ _tracking: updated });
    setTrackingDisplay(prev => { const n = { ...prev }; delete n[key]; return n; });
  }, [tracking, onChange]);

  // Auto-save to roster whenever tracking values change (only if already in roster)
  useEffect(() => {
    if (character._rosterId && character._tracking) {
      saveCharacterToRoster(character);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character._tracking]);

  if (!culture || !calling) return <div className={styles.container}><p>Please complete all steps first.</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.exportBar}>
        <button type="button" className={styles.exportBtn} onClick={handlePrint}>Print / Save as PDF</button>
        <button type="button" className={styles.exportBtn} onClick={handleExportHTML}>Download HTML</button>
        <button type="button" className={styles.exportBtn} onClick={handleExportJSON}>Save as JSON</button>
        <button type="button" className={styles.exportBtn} onClick={handleShareURL}>Copy Share URL</button>
        {onSaveToRoster && (
          <button
            type="button"
            className={`${styles.exportBtn} ${savedToRoster ? styles.exportBtnSaved : styles.exportBtnRoster}`}
            onClick={handleSaveToRoster}
            disabled={savedToRoster}
          >
            {savedToRoster ? '✓ Saved to Roster' : 'Save to Roster'}
          </button>
        )}
        {onViewRoster && (
          <button type="button" className={styles.exportBtnSecondary} onClick={onViewRoster}>
            View Roster →
          </button>
        )}
      </div>

      <div className={styles.sheet} id="character-sheet">
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.gameTitle}>The One Ring · Second Edition</div>
          <h1 className={styles.charName}>{id.name || 'Unnamed Hero'}</h1>
          <div className={styles.charSubtitle}>
            {culture.name} · {calling.name}
          </div>
        </div>

        <div className={styles.runeDivider}>✦ ✦ ✦</div>

        {/* IDENTITY ROW */}
        <div className={styles.identityRow}>
          {[
            ['Culture', culture.name],
            ['Calling', calling.name],
            ['Standard of Living', culture.standardOfLiving],
            ['Shadow Path', calling.shadowPath],
            ['Age', id.age || '—'],
            ['Patron', id.patron || '—'],
          ].map(([label, val]) => (
            <div key={label} className={styles.idField}>
              <span className={styles.idLabel}>{label}</span>
              <span className={styles.idVal}>{val}</span>
            </div>
          ))}
        </div>

        {/* ATTRIBUTES */}
        <div className={styles.attrTrio}>
          {[
            { key: 'strength', label: 'Strength', tint: 'body' },
            { key: 'heart', label: 'Heart', tint: 'heart' },
            { key: 'wits', label: 'Wits', tint: 'wits' },
          ].map(({ key, label, tint }) => (
            <div key={key} className={`${styles.attrCell} ${styles[tint]}`}>
              <span className={styles.attrName}>{label}</span>
              <div className={styles.attrSplit}>
                <div className={styles.attrHalf}>
                  <span className={styles.halfLabel}>Score</span>
                  <span className={styles.halfVal}>{effectiveAttrs[key] ?? '—'}</span>
                </div>
                <div className={styles.attrDivider} />
                <div className={styles.attrHalf}>
                  <span className={styles.halfLabel}>TN</span>
                  <span className={styles.halfVal}>
                    {effectiveAttrs[key] != null ? 20 - effectiveAttrs[key] : '—'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DERIVED STATS */}
        <div className={styles.derivedRow}>
          {[
            { label: 'Endurance', val: derived.endurance },
            { label: 'Hope', val: derived.hope },
            { label: 'Parry', val: derived.parry },
            { label: 'Wound Threshold', val: derived.woundThreshold },
            { label: 'Armour Rating', val: totalArmour },
            { label: 'Valour', val: character.valour || 1 },
            { label: 'Wisdom', val: character.wisdom || 1 },
          ].map(({ label, val }) => (
            <div key={label} className={styles.derivedBox}>
              <span className={styles.derivedLabel}>{label}</span>
              <span className={styles.derivedVal}>{val}</span>
            </div>
          ))}
        </div>

        {/* HOPE & SHADOW */}
        <div className={styles.hopeShadowRow}>
          <div className={styles.hopePanel}>
            <div className={styles.panelTitle}>Hope</div>
            <div className={styles.splitStat}>
              <div className={styles.splitHalf}>
                <span className={styles.splitLabel}>Total</span>
                <span className={styles.splitVal}>{derived.hope}</span>
              </div>
              <div className={styles.splitHalf}>
                <span className={styles.splitLabel}>Current</span>
                <input
                  type="number"
                  className={`${styles.splitVal} ${styles.splitInput}`}
                  value={getTrackingValue(HOPE_SHADOW_FIELDS[0])}
                  min={0}
                  max={derived.hope}
                  onChange={e => handleTrackingChange('hopeCurrent', e.target.value)}
                  onBlur={e => handleTrackingBlur('hopeCurrent', e.target.value)}
                />
              </div>
            </div>
            <div className={styles.threshold}>Miserable threshold: {derived.miserableThreshold}</div>
          </div>
          <div className={styles.shadowPanel}>
            <div className={styles.panelTitle}>Shadow</div>
            <div className={styles.splitStat}>
              <div className={styles.splitHalf}>
                <span className={styles.splitLabel}>Total</span>
                <input
                  type="number"
                  className={`${styles.splitVal} ${styles.splitInput}`}
                  value={getTrackingValue(HOPE_SHADOW_FIELDS[1])}
                  min={0}
                  max={99}
                  onChange={e => handleTrackingChange('shadowTotal', e.target.value)}
                  onBlur={e => handleTrackingBlur('shadowTotal', e.target.value)}
                />
              </div>
              <div className={styles.splitHalf}>
                <span className={styles.splitLabel}>Permanent</span>
                <input
                  type="number"
                  className={`${styles.splitVal} ${styles.splitInput}`}
                  value={getTrackingValue(HOPE_SHADOW_FIELDS[2])}
                  min={0}
                  max={99}
                  onChange={e => handleTrackingChange('shadowPermanent', e.target.value)}
                  onBlur={e => handleTrackingBlur('shadowPermanent', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SKILLS */}
        <div className={styles.skillsLayout}>
          {Object.entries(SKILL_GROUPS).map(([group, skillIds]) => (
            <div key={group} className={`${styles.skillGroup} ${styles['grp' + group]}`}>
              <div className={styles.skillGroupTitle}>{group}</div>
              {skillIds.map(skillId => (
                <div key={skillId} className={styles.skillRow}>
                  <span className={`${styles.skillName} ${favouredSkills.has(skillId) ? styles.skillFavoured : ''}`}>
                    {favouredSkills.has(skillId) && <span className={styles.star}>★</span>}
                    {SKILL_LABELS[skillId]}
                  </span>
                  <PipRow value={getSkillTotal(skillId)} />
                </div>
              ))}
            </div>
          ))}

          <div className={`${styles.skillGroup} ${styles.grpCombat}`}>
            <div className={styles.skillGroupTitle}>Combat Proficiencies</div>
            {Object.keys(COMBAT_LABELS).map(skillId => (
              <div key={skillId} className={styles.skillRow}>
                <span className={styles.skillName}>{COMBAT_LABELS[skillId]}</span>
                <PipRow value={getCombatTotal(skillId)} />
              </div>
            ))}
            <div className={styles.combatStats}>
              <div className={styles.combatStat}>
                <span className={styles.combatLabel}>Parry</span>
                <span className={styles.combatVal}>{derived.parry}</span>
              </div>
              <div className={styles.combatStat}>
                <span className={styles.combatLabel}>Weary Threshold</span>
                <span className={styles.combatVal}>{derived.wearyThreshold}</span>
              </div>
            </div>
          </div>
        </div>

        {/* VIRTUES & FEATURES */}
        <div className={styles.traitsLayout}>
          <div className={styles.traitsPanel}>
            <div className={styles.panelTitle}>Cultural Blessing</div>
            <div className={styles.trait}>
              <span className={styles.traitName}>{culture.culturalBlessing.name}</span>
              <p className={styles.traitDesc}>{culture.culturalBlessing.description}</p>
            </div>
          </div>
          <div className={styles.traitsPanel}>
            <div className={styles.panelTitle}>Virtues</div>
            {selectedVirtues.length === 0 ? (
              <span className={styles.traitEmpty}>None selected</span>
            ) : selectedVirtues.map(v => (
              <div key={v.id} className={styles.trait}>
                <span className={styles.traitName}>{v.name}</span>
                <p className={styles.traitDesc}>{v.description}</p>
              </div>
            ))}
          </div>
          <div className={styles.traitsPanel}>
            <div className={styles.panelTitle}>Distinctive Features</div>
            {selectedFeatures.length === 0 ? (
              <span className={styles.traitEmpty}>None selected</span>
            ) : selectedFeatures.map(f => (
              <div key={f.id} className={styles.trait}>
                <span className={styles.traitName}>{f.name}</span>
                <p className={styles.traitDesc}>{f.description}</p>
              </div>
            ))}
            {calling?.additionalFeature && (
              <div className={styles.trait}>
                <span className={styles.traitName}>{calling.additionalFeature.name} (Calling)</span>
                <p className={styles.traitDesc}>{calling.additionalFeature.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* EQUIPMENT */}
        <div className={styles.eqLayout}>
          <div className={styles.eqPanel}>
            <div className={styles.panelTitle}>Weapons</div>
            {(eq.weapons || []).length === 0 ? (
              <span className={styles.traitEmpty}>None</span>
            ) : (eq.weapons || []).map((w, i) => (
              <div key={i} className={styles.weaponRow}>
                <span className={styles.weaponName}>{w.name}</span>
                <span className={styles.weaponStat}>Dmg {w.damage || '—'}</span>
                <span className={styles.weaponStat}>Inj {w.injury || '—'}</span>
                <span className={styles.weaponStat}>Load {w.load || 0}</span>
              </div>
            ))}
          </div>
          <div className={styles.eqPanel}>
            <div className={styles.panelTitle}>Armour & Load</div>
            <div className={styles.eqStat}><span>Armour</span><span>{equipmentData.armour.find(a => a.id === (eq.armourId || 'none'))?.name || 'No Armour'} (Rating {eq.armourRating || 0})</span></div>
            <div className={styles.eqStat}><span>Helm</span><span>{equipmentData.helms.find(h => h.id === (eq.helmId || 'none'))?.name || 'No Helm'} (Rating {eq.helmRating || 0})</span></div>
            <div className={styles.eqStat}><span>Shield</span><span>{equipmentData.shields.find(s => s.id === (eq.shieldId || 'none'))?.name || 'No Shield'} (Parry +{eq.shieldParryBonus || 0})</span></div>
            <div className={styles.eqStat}>
              <span>Total Load</span>
              <span className={styles.loadValue}>
                <strong>{totalLoad}</strong>
                {loadStatus && (
                  <span className={loadStatus.danger ? styles.loadWeary : styles.loadWarning}>
                    {loadStatus.label}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* BACKSTORY */}
        {id.backstory && (
          <div className={styles.backstoryPanel}>
            <div className={styles.panelTitle}>Backstory</div>
            <p className={styles.backstory}>{id.backstory}</p>
          </div>
        )}

        {/* IN-PLAY TRACKING SECTION */}
        <div className={styles.trackingSection}>
          <div className={styles.panelTitle}>In-Play Tracking</div>
          <div className={styles.trackingGrid}>
            {TRACKING_FIELDS.map(field => (
              <div key={field.key} className={styles.trackingField}>
                <span className={styles.trackingLabel}>{field.label}</span>
                <div className={styles.trackingRow}>
                  <input
                    type="number"
                    className={styles.trackingInput}
                    value={getTrackingValue(field)}
                    min={field.min}
                    max={field.max}
                    onChange={e => handleTrackingChange(field.key, e.target.value)}
                    onBlur={e => handleTrackingBlur(field.key, e.target.value)}
                  />
                  {field.showMax && (
                    <span className={styles.trackingMax}>/ {field.maxFn(derived)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
