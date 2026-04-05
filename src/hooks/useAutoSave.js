import { useEffect, useState } from 'react';
import { saveToLocalStorage } from '../utils/urlState';
import { saveCharacterToRoster } from '../utils/rosterStorage';

/**
 * Custom hook to auto-save character to localStorage and roster.
 *
 * @param {Object} character - The character object to save
 * @param {number} step - Current wizard step
 * @param {Function} showToast - Function to display toast notifications
 */
export function useAutoSave(character, step, showToast) {
  const [autoSaveError, setAutoSaveError] = useState(false);

  // Auto-save to localStorage on every character change
  useEffect(() => {
    if (step > 1) {
      const result = saveToLocalStorage(character);
      if (!result.success && !autoSaveError) {
        showToast(result.error, 'error', 0); // 0 = no auto-dismiss
        setAutoSaveError(true);
      } else if (result.success && autoSaveError) {
        setAutoSaveError(false);
      }
    }
  }, [character, step, autoSaveError, showToast]);

  // Persist notes to the roster entry whenever they change
  useEffect(() => {
    if (character._rosterId) {
      const result = saveCharacterToRoster(character);
      if (!result.success) {
        showToast(result.error, 'warning', 8000);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character._notes, showToast]);
}
