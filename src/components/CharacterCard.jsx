import styles from './CharacterCard.module.css';

export default function CharacterCard({ entry, cultureName, callingName, onLoad, onDelete }) {
  const isComplete = entry.wizardStep >= 10;
  const savedDate = new Date(entry.savedAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.name}>{entry.name}</span>
        {!isComplete && <span className={styles.badge}>In Progress</span>}
      </div>
      <div className={styles.meta}>
        <span>{cultureName || '—'}</span>
        <span className={styles.dot}>·</span>
        <span>{callingName || '—'}</span>
      </div>
      <div className={styles.savedAt}>Saved {savedDate}</div>
      <div className={styles.actions}>
        <button type="button" className={styles.btnLoad} onClick={onLoad}>
          Load Character
        </button>
        <button type="button" className={styles.btnDelete} onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
