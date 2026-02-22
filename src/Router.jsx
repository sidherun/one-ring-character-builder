import { useState, useEffect, useCallback } from 'react';
import App from './App.jsx';
import RosterPage from './pages/RosterPage.jsx';
import { createDefaultCharacter } from './utils/defaultCharacter.js';

function getPage() {
  return window.location.hash === '#roster' ? 'roster' : 'wizard';
}

export default function Router() {
  const [page, setPage] = useState(getPage);
  const [characterToLoad, setCharacterToLoad] = useState(null);

  useEffect(() => {
    const onHashChange = () => setPage(getPage());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const goToRoster = useCallback(() => {
    window.location.hash = 'roster';
    setPage('roster');
  }, []);

  const goToWizard = useCallback(() => {
    window.location.hash = '';
    setPage('wizard');
  }, []);

  const handleNewCharacter = useCallback(() => {
    setCharacterToLoad(createDefaultCharacter());
    goToWizard();
  }, [goToWizard]);

  const handleLoadCharacter = useCallback((char) => {
    setCharacterToLoad(char);
    goToWizard();
  }, [goToWizard]);

  if (page === 'roster') {
    return (
      <RosterPage
        onNewCharacter={handleNewCharacter}
        onLoadCharacter={handleLoadCharacter}
        onGoHome={goToWizard}
      />
    );
  }

  return (
    <App
      onNavigateToRoster={goToRoster}
      characterToLoad={characterToLoad}
      onCharacterLoaded={() => setCharacterToLoad(null)}
    />
  );
}
