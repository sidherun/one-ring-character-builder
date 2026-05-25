import { describe, it, expect } from 'vitest';
import {
  deriveStats,
  getTotalSkillPoints,
  getTotalCombatPoints,
  validateSkillPoints,
  validateCombatPoints,
  computeLoad,
  computeTotalLoad,
} from '../characterDerived.js';

// Minimal culture fixture matching the shape of cultures.json
const bardingsCulture = {
  derivedStats: {
    endurance: { modifier: 20 },
    hope: { modifier: 8 },
    parry: { modifier: 12 },
  },
};

const dwarvesCulture = {
  culturalBlessing: { name: 'Redoubtable' },
  derivedStats: {
    endurance: { modifier: 22 },
    hope: { modifier: 6 },
    parry: { modifier: 10 },
  },
};

// ─────────────────────────────────────────────
// deriveStats
// ─────────────────────────────────────────────
describe('deriveStats', () => {
  it('returns empty object when culture is undefined', () => {
    expect(deriveStats({ attributes: { strength: 4, heart: 5, wits: 6 } }, undefined)).toEqual({});
  });

  it('computes TN values as 20 minus the attribute', () => {
    const char = { attributes: { strength: 4, heart: 5, wits: 6 }, equipment: {} };
    const stats = deriveStats(char, bardingsCulture);
    expect(stats.strengthTN).toBe(16);
    expect(stats.heartTN).toBe(15);
    expect(stats.witsTN).toBe(14);
  });

  it('computes endurance as strength + culture modifier', () => {
    const char = { attributes: { strength: 4, heart: 5, wits: 6 }, equipment: {} };
    const stats = deriveStats(char, bardingsCulture);
    expect(stats.endurance).toBe(24); // 4 + 20
  });

  it('computes hope as heart + culture modifier', () => {
    const char = { attributes: { strength: 4, heart: 5, wits: 6 }, equipment: {} };
    const stats = deriveStats(char, bardingsCulture);
    expect(stats.hope).toBe(13); // 5 + 8
  });

  it('computes base parry as wits + culture modifier', () => {
    const char = { attributes: { strength: 4, heart: 5, wits: 6 }, equipment: {} };
    const stats = deriveStats(char, bardingsCulture);
    expect(stats.parry).toBe(18); // 6 + 12
  });

  it('adds shield parry bonus to parry', () => {
    const char = {
      attributes: { strength: 4, heart: 5, wits: 6 },
      equipment: { shieldParryBonus: 2 },
    };
    const stats = deriveStats(char, bardingsCulture);
    expect(stats.parry).toBe(20); // 6 + 12 + 2
  });

  it('computes woundThreshold as ceiling of endurance / 2', () => {
    const char = { attributes: { strength: 5, heart: 5, wits: 6 }, equipment: {} };
    const stats = deriveStats(char, bardingsCulture);
    expect(stats.woundThreshold).toBe(Math.ceil(25 / 2)); // endurance = 25
  });

  it('sets wearyThreshold equal to endurance', () => {
    const char = { attributes: { strength: 4, heart: 5, wits: 6 }, equipment: {} };
    const stats = deriveStats(char, bardingsCulture);
    expect(stats.wearyThreshold).toBe(stats.endurance);
  });

  it('sets miserableThreshold equal to hope', () => {
    const char = { attributes: { strength: 4, heart: 5, wits: 6 }, equipment: {} };
    const stats = deriveStats(char, bardingsCulture);
    expect(stats.miserableThreshold).toBe(stats.hope);
  });
});

// ─────────────────────────────────────────────
// getTotalSkillPoints
// ─────────────────────────────────────────────
describe('getTotalSkillPoints', () => {
  it('sums only non-combat skills by default', () => {
    const skills = { awe: 2, athletics: 3, swords: 5 }; // swords not in non-combat list
    expect(getTotalSkillPoints(skills)).toBe(5);
  });

  it('sums all skills when excludeCombat is false', () => {
    const skills = { awe: 2, athletics: 3, swords: 5 };
    expect(getTotalSkillPoints(skills, false)).toBe(10);
  });

  it('returns 0 for empty skills', () => {
    expect(getTotalSkillPoints({})).toBe(0);
  });
});

// ─────────────────────────────────────────────
// getTotalCombatPoints
// ─────────────────────────────────────────────
describe('getTotalCombatPoints', () => {
  it('sums all combat proficiency values', () => {
    expect(getTotalCombatPoints({ swords: 2, bows: 1 })).toBe(3);
  });

  it('returns 0 for undefined input', () => {
    expect(getTotalCombatPoints(undefined)).toBe(0);
  });
});

// ─────────────────────────────────────────────
// validateSkillPoints
// ─────────────────────────────────────────────
describe('validateSkillPoints', () => {
  it('is valid when allocated <= 20', () => {
    const result = validateSkillPoints({ awe: 3, athletics: 4 });
    expect(result.valid).toBe(true);
    expect(result.allocated).toBe(7);
    expect(result.remaining).toBe(13);
  });

  it('is invalid when allocated > 20', () => {
    const overAllocated = Object.fromEntries(
      ['awe', 'athletics', 'awareness', 'hunting', 'song'].map((k, i) => [k, 5])
    );
    const result = validateSkillPoints(overAllocated);
    expect(result.valid).toBe(false);
    expect(result.remaining).toBeLessThan(0);
  });

  it('reports max as 20', () => {
    expect(validateSkillPoints({}).max).toBe(20);
  });
});

// ─────────────────────────────────────────────
// validateCombatPoints
// ─────────────────────────────────────────────
describe('validateCombatPoints', () => {
  it('is valid when allocated <= 3', () => {
    const result = validateCombatPoints({ swords: 2, bows: 1 });
    expect(result.valid).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('is invalid when allocated > 3', () => {
    const result = validateCombatPoints({ swords: 2, bows: 2 });
    expect(result.valid).toBe(false);
  });

  it('reports max as 3', () => {
    expect(validateCombatPoints({}).max).toBe(3);
  });
});

// ─────────────────────────────────────────────
// computeLoad (basic)
// ─────────────────────────────────────────────
describe('computeLoad', () => {
  it('returns 0 for undefined equipment', () => {
    expect(computeLoad(undefined)).toBe(0);
  });

  it('sums armour, helm, shield, weapons, and gear loads', () => {
    const equipment = {
      armourLoad: 6,
      helmLoad: 2,
      shieldLoad: 1,
      weapons: [{ load: 1 }, { load: 2 }],
      gear: [{ load: 1 }],
    };
    expect(computeLoad(equipment)).toBe(13);
  });
});

// ─────────────────────────────────────────────
// computeTotalLoad — Redoubtable blessing (Dwarves)
// ─────────────────────────────────────────────
describe('computeTotalLoad — Redoubtable', () => {
  const equipment = {
    armourLoad: 6,
    helmLoad: 3,
    shieldLoad: 2,
    weapons: [{ load: 1 }],
  };

  it('halves armour load for Redoubtable (rounds up)', () => {
    // armour 6 → 3, helm 3 → 2 (ceil), shield 2, weapon 1 = 8
    expect(computeTotalLoad(equipment, dwarvesCulture)).toBe(8);
  });

  it('does NOT halve shield or weapon load for Redoubtable', () => {
    const result = computeTotalLoad(equipment, dwarvesCulture);
    // shield (2) and weapon (1) are unchanged
    const shieldAndWeapon = equipment.shieldLoad + equipment.weapons[0].load;
    expect(result).toBeGreaterThanOrEqual(shieldAndWeapon);
  });

  it('applies no reduction for non-Redoubtable cultures', () => {
    // armour 6, helm 3, shield 2, weapon 1 = 12
    expect(computeTotalLoad(equipment, bardingsCulture)).toBe(12);
  });

  it('applies no reduction when culture is undefined', () => {
    expect(computeTotalLoad(equipment, undefined)).toBe(12);
  });

  it('returns 0 for undefined equipment', () => {
    expect(computeTotalLoad(undefined, dwarvesCulture)).toBe(0);
  });

  it('rounds fractional halved armour up (odd load value)', () => {
    const oddEquipment = { armourLoad: 5, helmLoad: 1, shieldLoad: 0, weapons: [] };
    // armour 5 → ceil(2.5) = 3, helm 1 → ceil(0.5) = 1
    expect(computeTotalLoad(oddEquipment, dwarvesCulture)).toBe(4);
  });
});
