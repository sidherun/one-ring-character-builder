import callings from '../data/callings.json';

/**
 * Validates character data for a given wizard step.
 * Returns validation result with status and optional error message.
 *
 * @param {number} step - The wizard step number (1-10)
 * @param {object} character - The character object to validate
 * @returns {{valid: boolean, msg?: string}} Validation result
 *
 * @example
 * const result = validateStep(2, character);
 * if (!result.valid) {
 *   console.log(result.msg); // "Please select a Heroic Culture."
 * }
 */
export function validateStep(step, character) {
  switch (step) {
    case 1:
      // Welcome step - always valid
      return { valid: true };

    case 2:
      // Culture selection
      return {
        valid: !!character.cultureId,
        msg: 'Please select a Heroic Culture.',
      };

    case 3: {
      // Calling selection + favoured skills
      const calling = callings.find(c => c.id === character.callingId);
      const callingChosen = !!character.callingId;
      const favOk = calling
        ? (character.callingFavouredSkills || []).length >= calling.favouredSkillCount
        : false;
      return {
        valid: callingChosen && favOk,
        msg: !callingChosen
          ? 'Please select a Calling.'
          : 'Please choose your Calling favoured skills.',
      };
    }

    case 4: {
      // Attributes (Strength / Heart / Wits)
      const attrs = character.attributes;
      return {
        valid: attrs.strength != null && attrs.heart != null && attrs.wits != null,
        msg: 'Please select an attribute set.',
      };
    }

    case 5: {
      // Skills and combat proficiencies allocation
      const skillTotal = Object.values(character.additionalSkills || {}).reduce((s, v) => s + v, 0);
      const combatTotal = Object.values(character.additionalCombat || {}).reduce((s, v) => s + v, 0);
      return {
        valid: skillTotal <= 20 && combatTotal <= 3,
        msg: skillTotal > 20
          ? 'Skill points exceed maximum (20).'
          : combatTotal > 3
          ? 'Combat points exceed maximum (3).'
          : '',
      };
    }

    case 6:
      // Virtues - optional, always valid
      return { valid: true };

    case 7:
      // Distinctive Features - must select exactly 2
      return {
        valid: (character.distinctiveFeatures || []).length === 2,
        msg: 'Please select exactly 2 Distinctive Features.',
      };

    case 8:
      // Equipment - optional, always valid
      return { valid: true };

    case 9:
      // Identity - character name is required
      return {
        valid: !!(character.identity?.name),
        msg: 'Please enter a character name.',
      };

    case 10:
      // Review - always valid
      return { valid: true };

    default:
      return { valid: true };
  }
}
