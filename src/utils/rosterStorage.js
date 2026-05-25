import { safeValidateCharacter } from './characterSchema';

const ROSTER_INDEX_KEY = 'tor2e_roster';
const charKey = (id) => `tor2e_char_${id}`;
const versionsKey = (id) => `tor2e_versions_${id}`;
const MAX_VERSIONS = 50;

export function getRosterIndex() {
  try {
    const data = localStorage.getItem(ROSTER_INDEX_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCharacterToRoster(character) {
  const id = character._rosterId || crypto.randomUUID();
  const fullChar = { ...character, _rosterId: id };

  const entry = {
    id,
    name: character.identity?.name || 'Unnamed Hero',
    cultureId: character.cultureId,
    callingId: character.callingId,
    savedAt: new Date().toISOString(),
    wizardStep: character.wizardStep || 1,
  };

  const index = getRosterIndex();
  const existingIdx = index.findIndex(e => e.id === id);
  if (existingIdx >= 0) {
    index[existingIdx] = entry;
  } else {
    index.push(entry);
  }

  try {
    localStorage.setItem(ROSTER_INDEX_KEY, JSON.stringify(index));
    localStorage.setItem(charKey(id), JSON.stringify(fullChar));
    return { success: true, id };
  } catch (err) {
    const isQuotaExceeded = err.name === 'QuotaExceededError' ||
      err.code === 22 || err.code === 1014;
    return {
      success: false,
      error: isQuotaExceeded
        ? 'Storage quota exceeded. Try deleting old characters from the roster to free up space.'
        : 'Failed to save character. Browser storage may be unavailable.',
    };
  }
}

export function loadCharacterFromRoster(id) {
  try {
    const data = localStorage.getItem(charKey(id));
    if (!data) return null;
    const parsed = JSON.parse(data);
    const validation = safeValidateCharacter(parsed);
    if (validation.success) return validation.data;
    // Schema validation failed (e.g. character saved before current schema).
    // Return the raw parsed data rather than silently dropping the character.
    console.warn('Character schema validation failed, loading raw data:', validation.error);
    return parsed;
  } catch {
    return null;
  }
}

export function deleteCharacterFromRoster(id) {
  const index = getRosterIndex().filter(e => e.id !== id);
  try {
    localStorage.setItem(ROSTER_INDEX_KEY, JSON.stringify(index));
    localStorage.removeItem(charKey(id));
    localStorage.removeItem(versionsKey(id));
  } catch {
    // ignore
  }
}

export function saveVersion(rosterId, character) {
  const entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    characterName: character.identity?.name || 'Unnamed Hero',
    step: character.wizardStep || 1,
    character: { ...character },
  };
  const existing = getVersions(rosterId);
  const updated = [entry, ...existing].slice(0, MAX_VERSIONS);
  try {
    localStorage.setItem(versionsKey(rosterId), JSON.stringify(updated));
    return { success: true };
  } catch (err) {
    const isQuotaExceeded = err.name === 'QuotaExceededError' ||
      err.code === 22 || err.code === 1014;
    return {
      success: false,
      error: isQuotaExceeded
        ? 'Storage quota exceeded. Version history could not be saved.'
        : 'Failed to save version history.',
    };
  }
}

export function getVersions(rosterId) {
  try {
    const data = localStorage.getItem(versionsKey(rosterId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteVersionsForCharacter(rosterId) {
  try {
    localStorage.removeItem(versionsKey(rosterId));
  } catch {
    // ignore
  }
}
