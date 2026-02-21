import styles from './Step6Virtues.module.css';
import virtues from '../../data/virtues.json';
import cultures from '../../data/cultures.json';
import callings from '../../data/callings.json';

export default function Step6Virtues({ character, onChange }) {
  const culture = cultures.find(c => c.id === character.cultureId);
  const calling = callings.find(c => c.id === character.callingId);
  const maxVirtues = calling?.startingVirtues || 1;

  // Filter available virtues (exclude cultural blessings, respect restrictions)
  const available = virtues.filter(v => {
    if (v.isCulturalBlessing) return false;
    if (v.restriction?.cultures) {
      return v.restriction.cultures.includes(character.cultureId);
    }
    if (v.restriction?.callings) {
      return v.restriction.callings.includes(character.callingId);
    }
    return true;
  });

  // Cultural blessing (auto-selected)
  const culturalBlessing = culture ? {
    name: culture.culturalBlessing.name,
    description: culture.culturalBlessing.description,
  } : null;

  const selected = character.virtues || [];

  const toggleVirtue = (id) => {
    if (selected.includes(id)) {
      onChange({ virtues: selected.filter(v => v !== id) });
    } else if (selected.length < maxVirtues) {
      onChange({ virtues: [...selected, id] });
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Choose Virtues</h2>
      <p className={styles.intro}>
        Select <strong>{maxVirtues} Virtue{maxVirtues > 1 ? 's' : ''}</strong> for your character.
        Your Cultural Blessing is automatically granted and does not count against this limit.
      </p>

      {culturalBlessing && (
        <div className={styles.culturalBlessing}>
          <div className={styles.blessingHeader}>
            <span className={styles.blessingBadge}>Cultural Blessing</span>
            <span className={styles.blessingName}>{culturalBlessing.name}</span>
          </div>
          <p className={styles.blessingDesc}>{culturalBlessing.description}</p>
        </div>
      )}

      <div className={styles.counter}>
        Virtues selected: <strong>{selected.length} / {maxVirtues}</strong>
      </div>

      <div className={styles.virtueGrid}>
        {available.map(virtue => {
          const isSelected = selected.includes(virtue.id);
          const atMax = selected.length >= maxVirtues && !isSelected;
          return (
            <button
              key={virtue.id}
              type="button"
              className={`${styles.virtueCard} ${isSelected ? styles.virtueSelected : ''} ${atMax ? styles.virtueDisabled : ''}`}
              onClick={() => toggleVirtue(virtue.id)}
              disabled={atMax}
              aria-pressed={isSelected}
            >
              <div className={styles.virtueName}>{virtue.name}</div>
              <p className={styles.virtueDesc}>{virtue.description}</p>
              {isSelected && <div className={styles.virtueCheck}>✓</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
