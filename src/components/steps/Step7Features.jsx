import styles from './Step7Features.module.css';
import features from '../../data/features.json';
import callings from '../../data/callings.json';

export default function Step7Features({ character, onChange }) {
  const calling = callings.find(c => c.id === character.callingId);
  const callingFeature = calling?.additionalFeature;

  const selected = character.distinctiveFeatures || [];
  const MAX = 2;

  // Culture-specific features list
  const culture = character.cultureId;
  const cultureChoices = {
    bardings: ['Bold', 'Eager', 'Fair', 'Fierce', 'Generous', 'Proud', 'Tall', 'Wilful'],
    dwarves: ['Determined', 'Fierce', 'Generous', 'Proud', 'Secretive', 'Stern', 'Suspicious', 'Tall'],
    elves: ['Fair', 'Keen-eyed', 'Lordly', 'Merry', 'Patient', 'Subtle', 'Swift', 'Wary'],
    hobbits: ['Eager', 'Fair-spoken', 'Faithful', 'Generous', 'Inquisitive', 'Patient', 'Rustic', 'True-hearted'],
    menofbree: ['Cunning', 'Fair-spoken', 'Faithful', 'Generous', 'Inquisitive', 'Patient', 'Rustic', 'True-hearted'],
    rangers: ['Bold', 'Eager', 'Fair', 'Grim', 'Patient', 'Secretive', 'Stern', 'Tall'],
  };

  const allowed = cultureChoices[culture] || [];
  const filteredFeatures = features.filter(f => allowed.includes(f.name));

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange({ distinctiveFeatures: selected.filter(f => f !== id) });
    } else if (selected.length < MAX) {
      onChange({ distinctiveFeatures: [...selected, id] });
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Distinctive Features</h2>
      <p className={styles.intro}>
        Choose exactly <strong>2 Distinctive Features</strong> from your culture's list.
        These traits define what sets your character apart from others.
      </p>

      {callingFeature && (
        <div className={styles.callingFeature}>
          <div className={styles.callingFeatureHeader}>
            <span className={styles.callingBadge}>Calling Feature</span>
            <span className={styles.callingName}>{callingFeature.name}</span>
          </div>
          <p className={styles.callingDesc}>{callingFeature.description}</p>
        </div>
      )}

      <div className={styles.counter}>
        Features selected: <strong>{selected.length} / {MAX}</strong>
      </div>

      <div className={styles.featureGrid}>
        {filteredFeatures.map(feature => {
          const isSelected = selected.includes(feature.id);
          const atMax = selected.length >= MAX && !isSelected;
          return (
            <button
              key={feature.id}
              type="button"
              className={`${styles.featureCard} ${isSelected ? styles.featureSelected : ''} ${atMax ? styles.featureDisabled : ''}`}
              onClick={() => toggle(feature.id)}
              disabled={atMax}
              aria-pressed={isSelected}
            >
              <div className={styles.featureName}>{feature.name}</div>
              <p className={styles.featureDesc}>{feature.description}</p>
              {isSelected && <div className={styles.featureCheck}>✓</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
