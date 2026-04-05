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
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem('tor2e_character');
    if (!data) return null;
    const parsed = JSON.parse(data);
    const validation = safeValidateCharacter(parsed);
    return validation.success ? validation.data : null;
  } catch {
    return null;
  }
}

export function clearLocalStorage() {
  localStorage.removeItem('tor2e_character');
  localStorage.removeItem('tor2e_saved_at');
}
