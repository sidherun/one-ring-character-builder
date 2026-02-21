import { useMemo } from 'react';
import styles from './Step4Attributes.module.css';
import cultures from '../../data/cultures.json';
import { deriveStats } from '../../utils/characterDerived';

const ATTR_LABELS = { strength: 'Strength', heart: 'Heart', wits: 'Wits' };
const FREE_VALUES = [7, 6, 5];

export default function Step4Attributes({ character, onChange }) {
  const culture = cultures.find(c => c.id === character.cultureId);
  if (!culture) return <div className={styles.container}><p>Please select a culture first.</p></div>;

  const selectedSetIdx = character._attributeSetIdx ?? null;
  const attrs = character.attributes;
  const bonus = character.attributeBonus;
  const freeAssign = character._freeAssign || { strength: null, heart: null, wits: null };

  const effectiveAttrs = useMemo(() => {
    const base = { ...attrs };
    if (bonus && base[bonus] != null) {
      return { ...base, [bonus]: base[bonus] + 1 };
    }
    return base;
  }, [attrs, bonus]);

  const derived = useMemo(() => deriveStats({ ...character, attributes: effectiveAttrs }, culture), [effectiveAttrs, culture]);

  const handleSelectSet = (idx) => {
    const set = culture.attributeSets[idx];
    if (set.freeAssign) {
      onChange({
        _attributeSetIdx: idx,
        attributes: { strength: null, heart: null, wits: null },
        attributeBonus: null,
        _freeAssign: { strength: null, heart: null, wits: null },
      });
    } else {
      onChange({
        _attributeSetIdx: idx,
        attributes: { strength: set.strength, heart: set.heart, wits: set.wits },
        attributeBonus: null,
        _freeAssign: { strength: null, heart: null, wits: null },
      });
    }
  };

  const handleFreeAssignChange = (attr, val) => {
    const numVal = val === '' ? null : Number(val);
    const updated = { ...freeAssign, [attr]: numVal };

    // Clear any other attribute that already has this value
    if (numVal !== null) {
      Object.keys(updated).forEach(k => {
        if (k !== attr && updated[k] === numVal) updated[k] = null;
      });
    }

    const allAssigned = FREE_VALUES.every(v => Object.values(updated).includes(v));
    onChange({
      _freeAssign: updated,
      attributes: allAssigned
        ? { strength: updated.strength, heart: updated.heart, wits: updated.wits }
        : { strength: null, heart: null, wits: null },
    });
  };

  const handleBonusAttr = (attr) => {
    onChange({ attributeBonus: bonus === attr ? null : attr });
  };

  const isRangers = character.cultureId === 'rangers';
  const isFreeAssignSelected = selectedSetIdx !== null && culture.attributeSets[selectedSetIdx]?.freeAssign;
  const freeAssignComplete = FREE_VALUES.every(v => Object.values(freeAssign).includes(v));
  const usedValues = Object.values(freeAssign).filter(v => v !== null);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Assign Attributes</h2>
      <p className={styles.intro}>
        Choose one of the attribute sets below, or ask your Loremaster about rolling.
        Each set represents a different balance of physical, spiritual, and mental capability.
      </p>

      <div className={styles.setsGrid}>
        {culture.attributeSets.map((set, idx) => {
          const isSelected = selectedSetIdx === idx;
          if (set.freeAssign) {
            return (
              <button
                key={idx}
                type="button"
                className={`${styles.setCard} ${styles.setCardFree} ${isSelected ? styles.setSelected : ''}`}
                onClick={() => handleSelectSet(idx)}
                aria-pressed={isSelected}
              >
                <div className={styles.setRoll}>Set 7 · GM Option</div>
                <div className={styles.setAttrs}>
                  <div className={styles.setAttr}>
                    <span className={styles.setAttrLabel}>STR</span>
                    <span className={styles.setAttrVal}>?</span>
                  </div>
                  <div className={styles.setAttr}>
                    <span className={styles.setAttrLabel}>HRT</span>
                    <span className={styles.setAttrVal}>?</span>
                  </div>
                  <div className={styles.setAttr}>
                    <span className={styles.setAttrLabel}>WIT</span>
                    <span className={styles.setAttrVal}>?</span>
                  </div>
                </div>
                <div className={styles.freeLabel}>Assign 7 · 6 · 5</div>
                {isSelected && <div className={styles.setCheck}>✓</div>}
              </button>
            );
          }
          return (
            <button
              key={idx}
              type="button"
              className={`${styles.setCard} ${isSelected ? styles.setSelected : ''}`}
              onClick={() => handleSelectSet(idx)}
              aria-pressed={isSelected}
            >
              <div className={styles.setRoll}>Set {set.roll}</div>
              <div className={styles.setAttrs}>
                <div className={styles.setAttr}>
                  <span className={styles.setAttrLabel}>STR</span>
                  <span className={styles.setAttrVal}>{set.strength}</span>
                </div>
                <div className={styles.setAttr}>
                  <span className={styles.setAttrLabel}>HRT</span>
                  <span className={styles.setAttrVal}>{set.heart}</span>
                </div>
                <div className={styles.setAttr}>
                  <span className={styles.setAttrLabel}>WIT</span>
                  <span className={styles.setAttrVal}>{set.wits}</span>
                </div>
              </div>
              {isSelected && <div className={styles.setCheck}>✓</div>}
            </button>
          );
        })}
      </div>

      {/* Free-assign dropdowns — shown when Set 7 is selected */}
      {isFreeAssignSelected && (
        <div className={styles.freeAssignSection}>
          <div className={styles.freeAssignTitle}>
            Assign each value (7, 6, 5) to one attribute — each value may only be used once:
          </div>
          <div className={styles.freeAssignRow}>
            {['strength', 'heart', 'wits'].map(attr => (
              <div key={attr} className={styles.freeAssignField}>
                <label className={styles.freeAssignLabel}>{ATTR_LABELS[attr]}</label>
                <select
                  className={styles.freeAssignSelect}
                  value={freeAssign[attr] ?? ''}
                  onChange={e => handleFreeAssignChange(attr, e.target.value)}
                >
                  <option value="">—</option>
                  {FREE_VALUES.map(v => (
                    <option
                      key={v}
                      value={v}
                      disabled={usedValues.includes(v) && freeAssign[attr] !== v}
                    >
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {!freeAssignComplete && (
            <div className={styles.freeAssignHint}>Assign all three values to continue.</div>
          )}
        </div>
      )}

      {/* Derived stats preview — shown once all attrs are set */}
      {attrs.strength != null && (
        <>
          {isRangers && (
            <div className={styles.bonusSection}>
              <div className={styles.bonusTitle}>Kings of Men — Add +1 to one Attribute:</div>
              <div className={styles.bonusBtns}>
                {['strength', 'heart', 'wits'].map(attr => (
                  <button
                    key={attr}
                    type="button"
                    className={`${styles.bonusBtn} ${bonus === attr ? styles.bonusSelected : ''}`}
                    onClick={() => handleBonusAttr(attr)}
                  >
                    {bonus === attr ? '★' : '☆'} {ATTR_LABELS[attr]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.derivedSection}>
            <div className={styles.derivedTitle}>Derived Statistics Preview</div>
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

            <div className={styles.statsRow}>
              {[
                { label: 'Endurance', val: derived.endurance },
                { label: 'Hope', val: derived.hope },
                { label: 'Parry', val: derived.parry },
                { label: 'Wound Threshold', val: derived.woundThreshold },
              ].map(({ label, val }) => (
                <div key={label} className={styles.statBox}>
                  <span className={styles.statLabel}>{label}</span>
                  <span className={styles.statVal}>{val ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
