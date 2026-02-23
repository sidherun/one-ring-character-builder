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
  } catch {
    // Storage full — silently fail
  }

  return id;
}

export function loadCharacterFromRoster(id) {
  try {
    const data = localStorage.getItem(charKey(id));
    return data ? JSON.parse(data) : null;
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
  } catch {
    // Storage full — silently fail
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
