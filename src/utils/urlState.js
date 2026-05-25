/**
 * URL state encoding/decoding for sharing characters.
 */

import { safeValidateCharacter } from './characterSchema';

export function encodeCharacterToHash(character) {
  try {
    const json = JSON.stringify(character);
    const encoded = btoa(encodeURIComponent(json));
    return encoded;
  } catch {
    return null;
  }
}

export function decodeCharacterFromHash(hash) {
  try {
    const decoded = decodeURIComponent(atob(hash));
    const parsed = JSON.parse(decoded);
    const validation = safeValidateCharacter(parsed);
    return validation.success ? validation.data : null;
  } catch {
    return null;
  }
}

export function saveToLocalStorage(character) {
  try {
    localStorage.setItem('tor2e_character', JSON.stringify(character));
    localStorage.setItem('tor2e_saved_at', new Date().toISOString());
    return { success: true };
  } catch (err) {
    const isQuotaExceeded = err.name === 'QuotaExceededError' ||
      err.code === 22 || err.code === 1014;
    return {
      success: false,
      error: isQuotaExceeded
        ? 'Storage quota exceeded. Auto-save is paused. Try deleting old characters from the roster.'
        : 'Auto-save failed. Browser storage may be unavailable.',
    };
  }
}

export function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem('tor2e_character');
    if (!data) return null;
    const parsed = JSON.parse(data);
    const validation = safeValidateCharacter(parsed);
    if (validation.success) return validation.data;
    // Schema validation failed (e.g. draft saved before current schema).
    // Return the raw parsed data rather than silently dropping the restore prompt.
    console.warn('Draft schema validation failed, loading raw data:', validation.error);
    return parsed;
  } catch {
    return null;
  }
}

export function clearLocalStorage() {
  localStorage.removeItem('tor2e_character');
  localStorage.removeItem('tor2e_saved_at');
}
