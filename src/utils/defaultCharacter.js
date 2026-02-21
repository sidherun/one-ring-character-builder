export function createDefaultCharacter() {
  return {
    // Step 1 completed marker
    wizardStep: 1,

    // Identity (Step 9)
    identity: {
      name: '',
      age: '',
      height: '',
      eyeColour: '',
      hairColour: '',
      patron: '',
      backstory: '',
    },

    // Culture (Step 2)
    cultureId: null,

    // Calling (Step 3)
    callingId: null,

    // Attributes (Step 4)
    attributes: {
      strength: null,
      heart: null,
      wits: null,
    },

    // Optional: Rangers can add 1 point to one attribute
    attributeBonus: null, // 'strength' | 'heart' | 'wits'

    // Skills (Step 5)
    // Base values are from culture, these are the additional allocated points
    additionalSkills: {
      awe: 0, athletics: 0, awareness: 0, hunting: 0, song: 0, craft: 0,
      travel: 0, enhearten: 0, battle: 0, persuade: 0, stealth: 0, scan: 0,
      insight: 0, explore: 0, healing: 0, riddle: 0, lore: 0, courtesy: 0,
    },

    // Combat proficiencies - additional points beyond culture defaults
    additionalCombat: {
      axes: 0, bows: 0, spears: 0, swords: 0, knives: 0,
    },

    // Favoured skills (culture provides base + calling adds more)
    // These are the user-chosen favourites from culture/calling options
    favouredSkills: [], // Array of skill ids

    // Favoured calling skill choice (player picks 2 of 3)
    callingFavouredSkills: [], // Array of 2 skill ids chosen from calling options

    // Culture favoured skill choice (player picks 1 of 2)
    cultureFavouredSkill: null, // One skill id

    // Virtues (Step 6)
    virtues: [], // Array of virtue ids

    // Distinctive Features (Step 7)
    distinctiveFeatures: [], // Array of 2 feature ids

    // Equipment (Step 8)
    equipment: {
      weapons: [],
      armourId: 'none',
      armourLoad: 0,
      armourRating: 0,
      helmId: 'none',
      helmLoad: 0,
      helmRating: 0,
      shieldId: 'none',
      shieldLoad: 0,
      shieldParryBonus: 0,
      gear: [],
    },

    // Starting stats (always 1 for new characters)
    valour: 1,
    wisdom: 1,
  };
}
