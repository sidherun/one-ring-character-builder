import { useState, useEffect } from 'react';
import { getVersions } from '../utils/rosterStorage';
import styles from './VersionHistoryPage.module.css';

const STEP_LABELS = {
  1: 'Welcome',
  2: 'Culture',
  3: 'Calling',
  4: 'Attributes',
  5: 'Skills',
  6: 'Virtues',
  7: 'Features',
  8: 'Equipment',
  9: 'Identity',
  10: 'Review',
};

export default function VersionHistoryPage({ rosterId, onLoadVersion, onBack }) {
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    setVersions(getVersions(rosterId));
  }, [rosterId]);

  const characterName = versions[0]?.characterName || 'Character';

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← Back to Roster
        </button>
        <span className={styles.subtitle}>Version History — {characterName}</span>
      </div>

      <div className={styles.content}>
        {versions.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyRune}>✦</div>
            <p className={styles.emptyText}>No version history found.</p>
            <p className={styles.emptyHint}>
              Versions are recorded each time you press <strong>Save to Roster</strong>.
            </p>
          </div>
        ) : (
          <ul className={styles.list}>
            {versions.map((v, i) => {
              const date = new Date(v.timestamp);
              const dateStr = date.toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
              });
              const timeStr = date.toLocaleTimeString(undefined, {
                hour: '2-digit', minute: '2-digit',
              });
              const stepLabel = STEP_LABELS[v.step] || `Step ${v.step}`;
              const isLatest = i === 0;

              return (
                <li key={v.id} className={styles.versionRow}>
                  <div className={styles.versionMeta}>
                    <span className={styles.versionDate}>{dateStr}, {timeStr}</span>
                    <span className={styles.versionStep}>Step {v.step} — {stepLabel}</span>
                    {isLatest && <span className={styles.latestBadge}>Latest</span>}
                  </div>
                  <div className={styles.versionName}>{v.characterName}</div>
                  <button
                    type="button"
                    className={styles.btnRestore}
                    onClick={() => onLoadVersion(v.character)}
                  >
                    Restore Version
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
