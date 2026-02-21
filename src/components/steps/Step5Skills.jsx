import { useMemo } from 'react';
import styles from './Step5Skills.module.css';
import PipControl from '../PipControl';
import cultures from '../../data/cultures.json';
import callings from '../../data/callings.json';

const SKILL_GROUPS = {
  body: ['awe', 'athletics', 'awareness', 'hunting', 'song', 'craft'],
  heart: ['enhearten', 'battle', 'travel', 'courtesy', 'insight', 'healing'],
  wits: ['persuade', 'stealth', 'scan', 'explore', 'riddle', 'lore'],
};

const COMBAT_SKILLS = ['axes', 'bows', 'spears', 'swords', 'knives'];

const SKILL_LABELS = {
  awe: 'Awe', athletics: 'Athletics', awareness: 'Awareness', hunting: 'Hunting',
  song: 'Song', craft: 'Craft', travel: 'Travel',
  enhearten: 'Enhearten', battle: 'Battle', persuade: 'Persuade',
  stealth: 'Stealth', scan: 'Scan', insight: 'Insight',
  explore: 'Explore', healing: 'Healing', riddle: 'Riddle',
  lore: 'Lore', courtesy: 'Courtesy',
  axes: 'Axes', bows: 'Bows', spears: 'Spears', swords: 'Swords', knives: 'Knives',
};

export default function Step5Skills({ character, onChange }) {
  const culture = cultures.find(c => c.id === character.cultureId);
  const calling = callings.find(c => c.id === character.callingId);

  const favouredSkills = useMemo(() => {
    const set = new Set();
    if (character.cultureFavouredSkill) set.add(character.cultureFavouredSkill);
    (character.callingFavouredSkills || []).forEach(s => set.add(s));
    return set;
  }, [character.cultureFavouredSkill, character.callingFavouredSkills]);

  // All skills start at 0 — the full pool covers everything, no culture base pre-fill
  const getSkillTotal = (skillId) => {
    return character.additionalSkills?.[skillId] || 0;
  };

  const getCombatTotal = (skillId) => {
    return character.additionalCombat?.[skillId] || 0;
  };

  // Point totals
  const skillPointsUsed = useMemo(() =>
    Object.values(character.additionalSkills || {}).reduce((s, v) => s + v, 0),
    [character.additionalSkills]
  );
  const combatPointsUsed = useMemo(() =>
    Object.values(character.additionalCombat || {}).reduce((s, v) => s + v, 0),
    [character.additionalCombat]
  );

  const handleSkillChange = (skillId, newTotal) => {
    const newVal = Math.max(0, newTotal);
    const currentUsed = Object.values(character.additionalSkills || {}).reduce((s, v) => s + v, 0);
    const currentVal = character.additionalSkills?.[skillId] || 0;
    const wouldUse = currentUsed - currentVal + newVal;
    if (wouldUse > 20) return;
    onChange({ additionalSkills: { ...character.additionalSkills, [skillId]: newVal } });
  };

  const handleCombatChange = (skillId, newTotal) => {
    const newVal = Math.max(0, newTotal);
    const currentUsed = Object.values(character.additionalCombat || {}).reduce((s, v) => s + v, 0);
    const currentVal = character.additionalCombat?.[skillId] || 0;
    const wouldUse = currentUsed - currentVal + newVal;
    if (wouldUse > 3) return;
    onChange({ additionalCombat: { ...character.additionalCombat, [skillId]: newVal } });
  };

  // Culture favoured skill picker
  const handleCultureFavoured = (skillId) => {
    if (!culture?.favouredSkillChoices) return;
    onChange({ cultureFavouredSkill: character.cultureFavouredSkill === skillId ? null : skillId });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Allocate Skills</h2>
      <p className={styles.intro}>
        Distribute skill points among your character's abilities. You have <strong>20 points</strong> for
        Body, Heart, and Wits skills, and <strong>3 points</strong> for Combat skills.
        Favoured skills (marked ★) excel when you roll the Gandalf rune.
      </p>

      {culture?.favouredSkillChoices && (
        <div className={styles.cultureChoice}>
          <div className={styles.cultureChoiceTitle}>
            Cultural Favoured Skill — choose one:
          </div>
          <div className={styles.cultureChoiceOptions}>
            {culture.favouredSkillChoices.map(skillId => (
              <button
                key={skillId}
                type="button"
                className={`${styles.cultureChoiceBtn} ${character.cultureFavouredSkill === skillId ? styles.chosen : ''}`}
                onClick={() => handleCultureFavoured(skillId)}
              >
                {character.cultureFavouredSkill === skillId ? '★' : '☆'} {SKILL_LABELS[skillId]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.poolStatus}>
        <div className={`${styles.pool} ${skillPointsUsed > 20 ? styles.poolOver : ''}`}>
          <span className={styles.poolLabel}>Body + Heart + Wits Pool</span>
          <span className={styles.poolVal}>{skillPointsUsed} / 20</span>
          <div className={styles.poolBar}>
            <div className={styles.poolFill} style={{ width: `${Math.min(100, (skillPointsUsed / 20) * 100)}%`, background: skillPointsUsed > 20 ? '#c04040' : 'var(--gold-bright)' }} />
          </div>
        </div>
        <div className={`${styles.pool} ${combatPointsUsed > 3 ? styles.poolOver : ''}`}>
          <span className={styles.poolLabel}>Combat Pool</span>
          <span className={styles.poolVal}>{combatPointsUsed} / 3</span>
          <div className={styles.poolBar}>
            <div className={styles.poolFill} style={{ width: `${Math.min(100, (combatPointsUsed / 3) * 100)}%`, background: combatPointsUsed > 3 ? '#c04040' : 'var(--gold-bright)' }} />
          </div>
        </div>
      </div>

      <div className={styles.skillsLayout}>
        {Object.entries(SKILL_GROUPS).map(([group, skillIds]) => (
          <div key={group} className={`${styles.skillGroup} ${styles[group]}`}>
            <div className={styles.groupTitle}>{group.charAt(0).toUpperCase() + group.slice(1)}</div>
            {skillIds.map(skillId => (
              <PipControl
                key={skillId}
                label={SKILL_LABELS[skillId]}
                value={getSkillTotal(skillId)}
                max={6}
                favoured={favouredSkills.has(skillId)}
                onChange={(val) => handleSkillChange(skillId, val)}
              />
            ))}
          </div>
        ))}

        <div className={`${styles.skillGroup} ${styles.combat}`}>
          <div className={styles.groupTitle}>Combat</div>
          {COMBAT_SKILLS.map(skillId => (
            <PipControl
              key={skillId}
              label={SKILL_LABELS[skillId]}
              value={getCombatTotal(skillId)}
              max={6}
              favoured={false}
              onChange={(val) => handleCombatChange(skillId, val)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
