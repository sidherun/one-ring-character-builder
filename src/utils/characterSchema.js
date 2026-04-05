import { z } from 'zod';

/**
 * Zod schema for validating character data loaded from external sources
 * (JSON imports, localStorage, URL hashes).
 */

// Identity sub-schema
const identitySchema = z.object({
  name: z.string().default(''),
  age: z.union([z.string(), z.number()]).default(''),
  height: z.string().default(''),
  eyeColour: z.string().default(''),
  hairColour: z.string().default(''),
  patron: z.string().default(''),
  backstory: z.string().default(''),
}).default({});

// Attributes sub-schema
const attributesSchema = z.object({
  strength: z.number().int().min(0).max(10).nullable().default(null),
  heart: z.number().int().min(0).max(10).nullable().default(null),
  wits: z.number().int().min(0).max(10).nullable().default(null),
}).default({ strength: null, heart: null, wits: null });

// Skills sub-schema
const skillsSchema = z.object({
  awe: z.number().int().min(0).default(0),
  athletics: z.number().int().min(0).default(0),
  awareness: z.number().int().min(0).default(0),
  hunting: z.number().int().min(0).default(0),
  song: z.number().int().min(0).default(0),
  craft: z.number().int().min(0).default(0),
  travel: z.number().int().min(0).default(0),
  enhearten: z.number().int().min(0).default(0),
  battle: z.number().int().min(0).default(0),
  persuade: z.number().int().min(0).default(0),
  stealth: z.number().int().min(0).default(0),
  scan: z.number().int().min(0).default(0),
  insight: z.number().int().min(0).default(0),
  explore: z.number().int().min(0).default(0),
  healing: z.number().int().min(0).default(0),
  riddle: z.number().int().min(0).default(0),
  lore: z.number().int().min(0).default(0),
  courtesy: z.number().int().min(0).default(0),
}).default({});

// Combat proficiencies sub-schema
const combatSchema = z.object({
  axes: z.number().int().min(0).default(0),
  bows: z.number().int().min(0).default(0),
  spears: z.number().int().min(0).default(0),
  swords: z.number().int().min(0).default(0),
  knives: z.number().int().min(0).default(0),
}).default({});

// Weapon sub-schema
const weaponSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  damage: z.union([z.string(), z.number()]).optional(),
  edge: z.union([z.string(), z.number()]).optional(),
  injury: z.union([z.string(), z.number()]).optional(),
  load: z.union([z.string(), z.number()]).optional(),
  qualities: z.union([z.string(), z.array(z.string())]).optional(),
});

// Equipment sub-schema
const equipmentSchema = z.object({
  weapons: z.array(weaponSchema).default([]),
  armourId: z.string().default('none'),
  armourLoad: z.number().min(0).default(0),
  armourRating: z.number().min(0).default(0),
  helmId: z.string().default('none'),
  helmLoad: z.number().min(0).default(0),
  helmRating: z.number().min(0).default(0),
  shieldId: z.string().default('none'),
  shieldLoad: z.number().min(0).default(0),
  shieldParryBonus: z.number().min(0).default(0),
  gear: z.array(z.any()).default([]),
}).default({});

// Tracking sub-schema (in-play tracking values)
const trackingSchema = z.object({
  currentEndurance: z.number().min(0).optional(),
  currentHope: z.number().min(0).optional(),
  currentShadow: z.number().min(0).optional(),
  fellowshipPoints: z.number().min(0).optional(),
  adventurePoints: z.number().min(0).optional(),
  treasurePoints: z.number().min(0).optional(),
  hopeCurrent: z.number().min(0).optional(),
  shadowTotal: z.number().min(0).optional(),
  shadowPermanent: z.number().min(0).optional(),
}).default({});

// Notes sub-schema
const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  lastEdited: z.string(),
});

// Main character schema
export const characterSchema = z.object({
  wizardStep: z.number().int().min(1).max(10).default(1),
  identity: identitySchema,
  cultureId: z.string().nullable().default(null),
  callingId: z.string().nullable().default(null),
  attributes: attributesSchema,
  attributeBonus: z.enum(['strength', 'heart', 'wits']).nullable().default(null),
  additionalSkills: skillsSchema,
  additionalCombat: combatSchema,
  favouredSkills: z.array(z.string()).default([]),
  callingFavouredSkills: z.array(z.string()).default([]),
  cultureFavouredSkill: z.string().nullable().default(null),
  virtues: z.array(z.string()).default([]),
  distinctiveFeatures: z.array(z.string()).default([]),
  equipment: equipmentSchema,
  valour: z.number().int().min(0).default(1),
  wisdom: z.number().int().min(0).default(1),

  // Private fields (prefixed with _)
  _combatBase: combatSchema.optional(),
  _tracking: trackingSchema.optional(),
  _notes: z.array(noteSchema).default([]),
  _rosterId: z.string().optional(),
}).passthrough(); // Allow additional fields for forward compatibility

/**
 * Validates and sanitizes character data.
 * Returns parsed character or throws with detailed error message.
 *
 * @param {unknown} data - Character data to validate
 * @returns {object} Validated character object
 * @throws {Error} If validation fails
 */
export function validateCharacter(data) {
  try {
    return characterSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue =>
        `${issue.path.join('.')}: ${issue.message}`
      ).join('; ');
      throw new Error(`Invalid character data: ${issues}`);
    }
    throw error;
  }
}

/**
 * Validates character data and returns result without throwing.
 * Useful for checking validity before attempting to load.
 *
 * @param {unknown} data - Character data to validate
 * @returns {{success: boolean, data?: object, error?: string}}
 */
export function safeValidateCharacter(data) {
  const result = characterSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const issues = result.error.issues.map(issue =>
    `${issue.path.join('.')}: ${issue.message}`
  ).join('; ');
  return { success: false, error: `Invalid character data: ${issues}` };
}
