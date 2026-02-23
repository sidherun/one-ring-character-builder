import { useState, useEffect } from 'react';
import { getRosterIndex, loadCharacterFromRoster, deleteCharacterFromRoster } from '../utils/rosterStorage';
import cultures from '../data/cultures.json';
import callings from '../data/callings.json';
import CharacterCard from '../components/CharacterCard';
import styles from './RosterPage.module.css';

export default function RosterPage({ onNewCharacter, onLoadCharacter, onGoHome, onViewHistory }) {
  const [roster, setRoster] = useState([]);

  useEffect(() => {
    setRoster(getRosterIndex().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)));
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this character? This cannot be undone.')) return;
    deleteCharacterFromRoster(id);
    setRoster(getRosterIndex().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)));
  };

  const handleLoad = (id) => {
    const char = loadCharacterFromRoster(id);
    if (char) onLoadCharacter(char);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button type="button" className={styles.titleLink} onClick={onGoHome}>The One Ring Character Builder · 2E Freedom Rules</button>
        <span className={styles.subtitle}>Character Roster</span>
      </div>

      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <h2 className={styles.heading}>Your Characters</h2>
          <button type="button" className={styles.btnNew} onClick={onNewCharacter}>
            + New Character
          </button>
        </div>

        {roster.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyRune}>✦</div>
            <p className={styles.emptyText}>No characters saved yet.</p>
            <p className={styles.emptyHint}>
              Complete a character and press <strong>Save to Roster</strong> on the review screen.
            </p>
            <button type="button" className={styles.btnNew} onClick={onNewCharacter}>
              Begin Character Creation
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {roster.map(entry => {
              const culture = cultures.find(c => c.id === entry.cultureId);
              const calling = callings.find(c => c.id === entry.callingId);
              return (
                <CharacterCard
                  key={entry.id}
                  entry={entry}
                  cultureName={culture?.name}
                  callingName={calling?.name}
                  onLoad={() => handleLoad(entry.id)}
                  onDelete={() => handleDelete(entry.id)}
                  onViewHistory={onViewHistory ? () => onViewHistory(entry.id) : undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
