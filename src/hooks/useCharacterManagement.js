import { useEffect, useCallback } from 'react';
import { loadFromLocalStorage, clearLocalStorage, decodeCharacterFromHash } from '../utils/urlState';
import { safeValidateCharacter } from '../utils/characterSchema';
import { createDefaultCharacter } from '../utils/defaultCharacter';
import { computeCombatBase } from '../utils/combatUtils';

/**
 * Custom hook to manage character loading, restoring, and initialization.
 *
 * @param {Object} params
 * @param {Object} params.character - Current character state
 * @param {Function} params.setCharacter - Function to update character
 * @param {Function} params.setStep - Function to update wizard step
 * @param {Function} params.setCompletedSteps - Function to update completed steps
 * @param {Function} params.setShowRestorePrompt - Function to show/hide restore prompt
 * @param {Function} params.setHasSaved - Function to set hasSaved flag
 * @param {Object} params.characterToLoad - Character passed from router
 * @param {Function} params.onCharacterLoaded - Callback after character loaded from roster
 * @returns {{
 *   handleStart: () => void,
 *   handleRestore: () => void,
 *   handleLoadFile: (e: Event) => void
 * }}
 */
export function useCharacterManagement({
  character,
  setCharacter,
  setStep,
  setCompletedSteps,
  setShowRestorePrompt,
  setHasSaved,
  characterToLoad,
  onCharacterLoaded,
}) {
  // Load a character from the roster when Router passes one in
  useEffect(() => {
    if (characterToLoad) {
      setCharacter(characterToLoad);
      setStep(characterToLoad.wizardStep || 10);
      setCompletedSteps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      setShowRestorePrompt(false);
      setHasSaved(false);
      clearLocalStorage();
      if (onCharacterLoaded) onCharacterLoaded();
    }
  }, [characterToLoad, onCharacterLoaded, setCharacter, setStep, setCompletedSteps, setShowRestorePrompt, setHasSaved]);

  // Check for URL hash or local storage on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#char=')) {
      const decoded = decodeCharacterFromHash(hash.slice(6));
      if (decoded) {
        setCharacter(decoded);
        setStep(10);
        setCompletedSteps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        return;
      }
    }
    const saved = loadFromLocalStorage();
    if (saved) {
      setHasSaved(true);
      setShowRestorePrompt(true);
    }
  }, [setCharacter, setStep, setCompletedSteps, setHasSaved, setShowRestorePrompt]);

  // Keep combat base in sync with culture
  useEffect(() => {
    if (character.cultureId) {
      const base = computeCombatBase(character);
      setCharacter(prev => ({ ...prev, _combatBase: base }));
    }
  }, [character.cultureId, setCharacter]);

  const handleStart = useCallback(() => {
    setCharacter(createDefaultCharacter());
    setStep(2);
    setCompletedSteps([1]);
    setShowRestorePrompt(false);
    clearLocalStorage();
  }, [setCharacter, setStep, setCompletedSteps, setShowRestorePrompt]);

  const handleRestore = useCallback(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      setCharacter(saved);
      const restoredStep = saved.wizardStep || 2;
      setStep(restoredStep);
      setCompletedSteps(Array.from({ length: restoredStep }, (_, i) => i + 1));
      setShowRestorePrompt(false);
    }
  }, [setCharacter, setStep, setCompletedSteps, setShowRestorePrompt]);

  const handleLoadFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const loaded = JSON.parse(ev.target.result);
        const validation = safeValidateCharacter(loaded);
        if (!validation.success) {
          alert(`Cannot load character file:\n\n${validation.error}`);
          return;
        }
        setCharacter(validation.data);
        setStep(10);
        setCompletedSteps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      } catch (err) {
        alert('Invalid character file: ' + (err.message || 'Could not parse JSON'));
      }
    };
    reader.readAsText(file);
  }, [setCharacter, setStep, setCompletedSteps]);

  return {
    handleStart,
    handleRestore,
    handleLoadFile,
  };
}
