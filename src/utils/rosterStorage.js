const ROSTER_INDEX_KEY = 'tor2e_roster';
const charKey = (id) => `tor2e_char_${id}`;

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
  } catch {
    // ignore
  }
}
