import cultures from '../data/cultures.json';

/**
 * Initialise combat base values when culture/calling changes
 * @param {Object} character - The character object
 * @returns {Object} Base combat proficiencies object
 */
export function computeCombatBase(character) {
  const culture = cultures.find(c => c.id === character.cultureId);
  if (!culture) return {};
  const base = { axes: 0, bows: 0, spears: 0, swords: 0, knives: 0 };
  const combatProf = culture.combatProficiencies;
  if (combatProf?.fixed) {
    combatProf.fixed.forEach(f => {
      // If there's an OR, we don't pre-select; otherwise set fixed skill
      if (!f.or) {
        base[f.skill] = f.rank;
      }
    });
  }
  return base;
}
