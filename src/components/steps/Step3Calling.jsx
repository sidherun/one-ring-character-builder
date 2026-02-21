import styles from './Step3Calling.module.css';
import callings from '../../data/callings.json';

const SKILL_LABELS = {
  battle: 'Battle', enhearten: 'Enhearten', persuade: 'Persuade',
  athletics: 'Athletics', awe: 'Awe', hunting: 'Hunting',
  courtesy: 'Courtesy', song: 'Song', travel: 'Travel',
  craft: 'Craft', lore: 'Lore', riddle: 'Riddle',
  explore: 'Explore', scan: 'Scan', stealth: 'Stealth',
  awareness: 'Awareness', healing: 'Healing', insight: 'Insight',
};

export default function Step3Calling({ character, onChange }) {
  const selectedId = character.callingId;
  const selectedCalling = callings.find(c => c.id === selectedId);

  const handleSelect = (callingId) => {
    onChange({
      callingId,
      callingFavouredSkills: [],
    });
  };

  const handleFavouredSkillToggle = (skillId) => {
    if (!selectedCalling) return;
    const current = character.callingFavouredSkills || [];
    const max = selectedCalling.favouredSkillCount;

    if (current.includes(skillId)) {
      onChange({ callingFavouredSkills: current.filter(s => s !== skillId) });
    } else if (current.length < max) {
      onChange({ callingFavouredSkills: [...current, skillId] });
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Choose your Calling</h2>
      <p className={styles.intro}>
        Your Calling defines why you adventure and what drives you forward. Each Calling also
        grants favoured skills and a unique Distinctive Feature.
      </p>

      <div className={styles.grid}>
        {callings.map(calling => {
          const isSelected = selectedId === calling.id;
          return (
            <div
              key={calling.id}
              className={`${styles.card} ${isSelected ? styles.selected : ''}`}
            >
              <button
                type="button"
                className={styles.cardBtn}
                onClick={() => handleSelect(calling.id)}
                aria-pressed={isSelected}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardName}>{calling.name}</span>
                </div>
                <p className={styles.cardDesc}>{calling.description}</p>
                <div className={styles.shadowPath}>
                  <span className={styles.shadowLabel}>Shadow Path:</span>
                  <span className={styles.shadowName}>{calling.shadowPath}</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>Feature:</span>
                  <span className={styles.featureName}>{calling.additionalFeature.name}</span>
                </div>
              </button>

              {isSelected && (
                <div className={styles.favouredPicker}>
                  <div className={styles.favouredTitle}>
                    Choose {calling.favouredSkillCount} of {calling.favouredSkills.length} Favoured Skills:
                  </div>
                  <div className={styles.favouredOptions}>
                    {calling.favouredSkills.map(skillId => {
                      const chosen = (character.callingFavouredSkills || []).includes(skillId);
                      const max = calling.favouredSkillCount;
                      const atMax = (character.callingFavouredSkills || []).length >= max;
                      return (
                        <button
                          key={skillId}
                          type="button"
                          className={`${styles.favouredBtn} ${chosen ? styles.favouredChosen : ''}`}
                          onClick={() => handleFavouredSkillToggle(skillId)}
                          disabled={!chosen && atMax}
                        >
                          {chosen ? '★' : '☆'} {SKILL_LABELS[skillId] || skillId}
                        </button>
                      );
                    })}
                  </div>
                  {(character.callingFavouredSkills || []).length < calling.favouredSkillCount && (
                    <div className={styles.pickReminder}>
                      Please select {calling.favouredSkillCount - (character.callingFavouredSkills || []).length} more skill(s)
                    </div>
                  )}
                </div>
              )}

              {isSelected && <div className={styles.selectedBadge}>✓ Selected</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
