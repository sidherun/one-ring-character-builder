import { describe, it, expect } from 'vitest';
import { validateStep } from '../validation.js';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Minimal valid character at each wizard stage */
function baseChar(overrides = {}) {
  return {
    cultureId: 'bardings',
    callingId: 'captain',              // favouredSkillCount = 2
    callingFavouredSkills: ['battle', 'enhearten'],
    attributes: { strength: 4, heart: 5, wits: 6 },
    additionalSkills: {},
    additionalCombat: {},
    virtues: [],
    distinctiveFeatures: ['Bold', 'Eager'],
    identity: { name: 'Thorion' },
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// Step 1 — Welcome
// ─────────────────────────────────────────────
describe('validateStep — step 1 (Welcome)', () => {
  it('is always valid', () => {
    expect(validateStep(1, {}).valid).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Step 2 — Culture
// ─────────────────────────────────────────────
describe('validateStep — step 2 (Culture)', () => {
  it('is invalid without a cultureId', () => {
    const { valid, msg } = validateStep(2, { cultureId: null });
    expect(valid).toBe(false);
    expect(msg).toBeTruthy();
  });

  it('is valid when cultureId is set', () => {
    expect(validateStep(2, { cultureId: 'bardings' }).valid).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Step 3 — Calling + favoured skills
// ─────────────────────────────────────────────
describe('validateStep — step 3 (Calling)', () => {
  it('is invalid without a callingId', () => {
    const { valid } = validateStep(3, { callingId: null, callingFavouredSkills: [] });
    expect(valid).toBe(false);
  });

  it('is invalid when too few favoured skills chosen', () => {
    // captain requires 2 favoured skills
    const { valid } = validateStep(3, {
      callingId: 'captain',
      callingFavouredSkills: ['battle'], // only 1
    });
    expect(valid).toBe(false);
  });

  it('is valid when calling and sufficient favoured skills chosen', () => {
    const { valid } = validateStep(3, {
      callingId: 'captain',
      callingFavouredSkills: ['battle', 'enhearten'],
    });
    expect(valid).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Step 4 — Attributes
// ─────────────────────────────────────────────
describe('validateStep — step 4 (Attributes)', () => {
  it('is invalid when any attribute is null', () => {
    const { valid } = validateStep(4, { attributes: { strength: 4, heart: null, wits: 6 } });
    expect(valid).toBe(false);
  });

  it('is valid when all three attributes are set', () => {
    const { valid } = validateStep(4, { attributes: { strength: 4, heart: 5, wits: 6 } });
    expect(valid).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Step 5 — Skills / combat allocation
// ─────────────────────────────────────────────
describe('validateStep — step 5 (Skills)', () => {
  it('is valid when skill and combat points are within limits', () => {
    const { valid } = validateStep(5, baseChar({
      additionalSkills: { awe: 3, athletics: 4 },
      additionalCombat: { swords: 2 },
    }));
    expect(valid).toBe(true);
  });

  it('is invalid when skill points exceed 20', () => {
    const overSkills = Object.fromEntries(
      ['awe', 'athletics', 'awareness', 'hunting', 'song'].map(k => [k, 5])
    ); // total = 25
    const { valid, msg } = validateStep(5, baseChar({ additionalSkills: overSkills }));
    expect(valid).toBe(false);
    expect(msg).toMatch(/skill/i);
  });

  it('is invalid when combat points exceed 3', () => {
    const { valid, msg } = validateStep(5, baseChar({
      additionalCombat: { swords: 2, bows: 2 }, // total = 4
    }));
    expect(valid).toBe(false);
    expect(msg).toMatch(/combat/i);
  });

  it('is valid at exactly 20 skill points', () => {
    const exactSkills = Object.fromEntries(
      ['awe', 'athletics', 'awareness', 'hunting', 'song',
       'craft', 'travel', 'enhearten', 'battle', 'persuade'].map(k => [k, 2])
    ); // 10 skills × 2 = 20
    expect(validateStep(5, baseChar({ additionalSkills: exactSkills })).valid).toBe(true);
  });

  it('is valid at exactly 3 combat points', () => {
    expect(validateStep(5, baseChar({
      additionalCombat: { swords: 2, bows: 1 },
    })).valid).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Step 6 — Virtues (optional)
// ─────────────────────────────────────────────
describe('validateStep — step 6 (Virtues)', () => {
  it('is always valid regardless of virtues array', () => {
    expect(validateStep(6, baseChar({ virtues: [] })).valid).toBe(true);
    expect(validateStep(6, baseChar({ virtues: ['Robust'] })).valid).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Step 7 — Distinctive Features (exactly 2)
// ─────────────────────────────────────────────
describe('validateStep — step 7 (Distinctive Features)', () => {
  it('is invalid with fewer than 2 features', () => {
    expect(validateStep(7, baseChar({ distinctiveFeatures: ['Bold'] })).valid).toBe(false);
  });

  it('is invalid with more than 2 features', () => {
    expect(validateStep(7, baseChar({ distinctiveFeatures: ['Bold', 'Eager', 'Fair'] })).valid).toBe(false);
  });

  it('is valid with exactly 2 features', () => {
    expect(validateStep(7, baseChar({ distinctiveFeatures: ['Bold', 'Eager'] })).valid).toBe(true);
  });

  it('returns a helpful message when invalid', () => {
    const { msg } = validateStep(7, baseChar({ distinctiveFeatures: [] }));
    expect(msg).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// Step 8 — Equipment (optional)
// ─────────────────────────────────────────────
describe('validateStep — step 8 (Equipment)', () => {
  it('is always valid', () => {
    expect(validateStep(8, baseChar()).valid).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Step 9 — Identity (name required)
// ─────────────────────────────────────────────
describe('validateStep — step 9 (Identity)', () => {
  it('is invalid without a character name', () => {
    const { valid, msg } = validateStep(9, baseChar({ identity: { name: '' } }));
    expect(valid).toBe(false);
    expect(msg).toBeTruthy();
  });

  it('is invalid when identity is missing', () => {
    expect(validateStep(9, baseChar({ identity: undefined })).valid).toBe(false);
  });

  it('is valid when name is provided', () => {
    expect(validateStep(9, baseChar({ identity: { name: 'Thorion' } })).valid).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Step 10 — Review (always valid)
// ─────────────────────────────────────────────
describe('validateStep — step 10 (Review)', () => {
  it('is always valid', () => {
    expect(validateStep(10, {}).valid).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Unknown step
// ─────────────────────────────────────────────
describe('validateStep — unknown step', () => {
  it('returns valid for unrecognised step numbers', () => {
    expect(validateStep(99, {}).valid).toBe(true);
  });
});
