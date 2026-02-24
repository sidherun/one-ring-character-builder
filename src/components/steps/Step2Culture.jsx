import styles from './Step2Culture.module.css';
import cultures from '../../data/cultures.json';

export default function Step2Culture({ character, onChange }) {
  const selectedId = character.cultureId;

  const handleSelect = (cultureId) => {
    const culture = cultures.find(c => c.id === cultureId);
    if (!culture) return;

    // Pre-populate culture defaults
    const baseSkills = { ...culture.skills };

    onChange({
      cultureId,
      // Reset downstream steps when culture changes
      callingId: null,
      attributes: { strength: null, heart: null, wits: null },
      attributeBonus: null,
      additionalSkills: {
        awe: 0, athletics: 0, awareness: 0, hunting: 0, song: 0, craft: 0,
        travel: 0, enhearten: 0, battle: 0, persuade: 0, stealth: 0, scan: 0,
        insight: 0, explore: 0, healing: 0, riddle: 0, lore: 0, courtesy: 0,
      },
      additionalCombat: { axes: 0, bows: 0, spears: 0, swords: 0, knives: 0 },
      favouredSkills: [],
      cultureFavouredSkill: null,
      callingFavouredSkills: [],
      virtues: [],
      distinctiveFeatures: [],
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Choose your Heroic Culture</h2>
      <p className={styles.intro}>
        Your culture defines your heritage, abilities, and starting skills.
        Choose the one that best fits your character concept.
      </p>

      <div className={styles.grid}>
        {cultures.map(culture => (
          <button
            key={culture.id}
            type="button"
            className={`${styles.card} ${selectedId === culture.id ? styles.selected : ''}`}
            onClick={() => handleSelect(culture.id)}
            aria-pressed={selectedId === culture.id}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardName}>{culture.name}</span>
              <div className={styles.cardHeaderRight}>
                {selectedId === culture.id && (
                  <div className={styles.selectedBadge}>✓ Selected</div>
                )}
                <span className={styles.cardLiving}>{culture.standardOfLiving}</span>
              </div>
            </div>
            <p className={styles.cardDesc}>{culture.description}</p>
            <div className={styles.cardBlessing}>
              <span className={styles.blessingLabel}>Cultural Blessing:</span>
              <span className={styles.blessingName}>{culture.culturalBlessing.name}</span>
            </div>
            <p className={styles.blessingDesc}>{culture.culturalBlessing.description}</p>

            <div className={styles.cardStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Endurance</span>
                <span className={styles.statVal}>STR + {culture.derivedStats.endurance.modifier}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Hope</span>
                <span className={styles.statVal}>HRT + {culture.derivedStats.hope.modifier}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Parry</span>
                <span className={styles.statVal}>WIT + {culture.derivedStats.parry.modifier}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
