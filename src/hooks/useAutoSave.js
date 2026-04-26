import { useEffect, useRef } from 'react';
import { saveToLocalStorage } from '../utils/urlState';
import { saveCharacterToRoster } from '../utils/rosterStorage';

const AUTOSAVE_DEBOUNCE_MS = 400;

export function useAutoSave(character, step, showToast) {
  const debounceRef = useRef(null);
  const hasShownErrorRef = useRef(false);

  // Debounced auto-save to localStorage on every character change
  useEffect(() => {
    if (step <= 1) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const result = saveToLocalStorage(character);
      if (!result.success && !hasShownErrorRef.current) {
        showToast(result.error, 'error', 0);
        hasShownErrorRef.current = true;
      } else if (result.success) {
        hasShownErrorRef.current = false;
      }
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [character, step, showToast]);

  // Persist notes to the roster entry whenever they change
  useEffect(() => {
    if (character._rosterId) {
      const result = saveCharacterToRoster(character);
      if (!result.success) {
        showToast(result.error, 'warning', 8000);
      }
    }
  }, [character._notes, character._rosterId, showToast]);
}
