import { useState, useEffect, useCallback } from 'react';
import App from './App.jsx';
import RosterPage from './pages/RosterPage.jsx';
import VersionHistoryPage from './pages/VersionHistoryPage.jsx';
import { createDefaultCharacter } from './utils/defaultCharacter.js';

function getPage() {
  const hash = window.location.hash;
  if (hash === '#roster') return 'roster';
  if (hash === '#history') return 'history';
  return 'wizard';
}

export default function Router() {
  const [page, setPage] = useState(getPage);
  const [characterToLoad, setCharacterToLoad] = useState(null);
  const [historyCharacterId, setHistoryCharacterId] = useState(null);

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

  const handleViewHistory = useCallback((rosterId) => {
    setHistoryCharacterId(rosterId);
    window.location.hash = 'history';
    setPage('history');
  }, []);

  if (page === 'history' && historyCharacterId) {
    return (
      <VersionHistoryPage
        rosterId={historyCharacterId}
        onLoadVersion={handleLoadCharacter}
        onBack={goToRoster}
      />
    );
  }

  if (page === 'roster') {
    return (
      <RosterPage
        onNewCharacter={handleNewCharacter}
        onLoadCharacter={handleLoadCharacter}
        onGoHome={goToWizard}
        onViewHistory={handleViewHistory}
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
