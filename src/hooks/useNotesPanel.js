import { useState, useCallback } from 'react';

/**
 * Custom hook to manage the notes panel state.
 * The notes panel is a slide-in sidebar that allows players to take session notes.
 *
 * @returns {{
 *   isNotesOpen: boolean,
 *   toggleNotes: () => void,
 *   closeNotes: () => void
 * }}
 */
export function useNotesPanel() {
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const toggleNotes = useCallback(() => {
    setIsNotesOpen(prev => !prev);
  }, []);

  const closeNotes = useCallback(() => {
    setIsNotesOpen(false);
  }, []);

  return {
    isNotesOpen,
    toggleNotes,
    closeNotes,
  };
}
