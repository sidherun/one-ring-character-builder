/**
 * Derives all calculated stats from the character's base values.
 * All derived values are computed here — never stored directly.
 */

export function deriveStats(character, culture) {
  if (!culture) return {};

  const str = character.attributes.strength || 0;
  const heart = character.attributes.heart || 0;
  const wits = character.attributes.wits || 0;

  const enduranceMod = culture.derivedStats.endurance.modifier;
  const hopeMod = culture.derivedStats.hope.modifier;
  const parryMod = culture.derivedStats.parry.modifier;

  const endurance = str + enduranceMod;
  const hope = heart + hopeMod;
  const baseParry = wits + parryMod;

  // Add shield bonus if equipped
  const shieldBonus = character.equipment?.shieldParryBonus || 0;
  const parry = baseParry + shieldBonus;

  // Wound threshold = Body + Strength (in TOR2E, Wound Threshold = Endurance / 2 rounded up per some editions)
  // Per core rules: Wound Threshold = Endurance, Weary = when Endurance <= Load
  // TOR2E: Wound Threshold listed separately on sheet
  const woundThreshold = Math.ceil(endurance / 2);

  return {
    strengthTN: 20 - str,
    heartTN: 20 - heart,
    witsTN: 20 - wits,
    endurance,
    hope,
    parry,
    woundThreshold,
    wearyThreshold: endurance, // Weary when current endurance <= load
    miserableThreshold: hope,  // Miserable when current shadow >= hope
  };
}

export function getTotalSkillPoints(skills, excludeCombat = true) {
  const nonCombatSkills = ['awe', 'athletics', 'awareness', 'hunting', 'song', 'craft', 'travel',
    'enhearten', 'battle', 'persuade', 'stealth', 'scan', 'insight',
    'explore', 'healing', 'riddle', 'lore', 'courtesy'];

  if (excludeCombat) {
    return nonCombatSkills.reduce((sum, id) => sum + (skills[id] || 0), 0);
  }
  return Object.values(skills).reduce((sum, v) => sum + v, 0);
}

export function getTotalCombatPoints(combatProficiencies) {
  return Object.values(combatProficiencies || {}).reduce((sum, v) => sum + v, 0);
}

export function validateSkillPoints(skills) {
  const allocated = getTotalSkillPoints(skills, true);
  return { allocated, max: 20, valid: allocated <= 20, remaining: 20 - allocated };
}

export function validateCombatPoints(combatProficiencies) {
  const allocated = getTotalCombatPoints(combatProficiencies);
  return { allocated, max: 3, valid: allocated <= 3, remaining: 3 - allocated };
}

export function computeLoad(equipment) {
  if (!equipment) return 0;
  let load = 0;
  if (equipment.armourLoad) load += equipment.armourLoad;
  if (equipment.helmLoad) load += equipment.helmLoad;
  if (equipment.shieldLoad) load += equipment.shieldLoad;
  if (equipment.weapons) {
    equipment.weapons.forEach(w => { load += (w.load || 0); });
  }
  if (equipment.gear) {
    equipment.gear.forEach(g => { load += (g.load || 0); });
  }
  return load;
}
