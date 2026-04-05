import { useState, useCallback } from 'react';

/**
 * Custom hook to manage play mode state and transitions.
 * Play mode is the "character sheet view" that shows the completed character.
 *
 * @returns {{
 *   isPlaying: boolean,
 *   enterPlayMode: () => void,
 *   exitPlayMode: () => void,
 *   resetPlayModeOnNavigation: (targetStep: number) => void
 * }}
 */
export function usePlayMode() {
  const [isPlaying, setIsPlaying] = useState(false);

  const enterPlayMode = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const exitPlayMode = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resetPlayModeOnNavigation = useCallback((targetStep) => {
    if (targetStep !== 10) {
      setIsPlaying(false);
    }
  }, []);

  return {
    isPlaying,
    enterPlayMode,
    exitPlayMode,
    resetPlayModeOnNavigation,
  };
}
