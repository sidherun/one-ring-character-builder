import styles from './Step1Welcome.module.css';

export default function Step1Welcome({ onStart, hasSavedChar, onRestore, onLoadFile, onViewRoster }) {
  return (
    <div className={styles.welcome}>
      <div className={styles.runeRow}>ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ</div>

      <h1 className={styles.title}>The One Ring</h1>
      <div className={styles.subtitle}>Character Builder — Second Edition — Freedom Rules</div>

      <div className={styles.divider}>✦ ✦ ✦</div>

      <div className={styles.intro}>
        <p>
          Welcome, traveller. This tool will guide you through the complete character creation
          process for <em>The One Ring Roleplaying Game, Second Edition</em>.
        </p>
        <p>
          You will choose your <strong>Heroic Culture</strong>, select a <strong>Calling</strong> that drives
          your adventuring life, assign your <strong>Attributes</strong>, allocate <strong>Skills</strong>,
          and equip your hero for the dangers ahead.
        </p>
        <p>
          When finished, you may print your character sheet or save it as a file.
          No account or installation is required.
        </p>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.btnStart} onClick={onStart}>
          Begin Character Creation
        </button>

        {hasSavedChar && (
          <button type="button" className={styles.btnSecondary} onClick={onRestore}>
            Restore Auto-saved Character
          </button>
        )}

        <label className={styles.btnSecondary}>
          Load Character from File
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={onLoadFile}
          />
        </label>

        <button type="button" className={styles.btnRoster} onClick={onViewRoster}>
          View Character Roster
        </button>
      </div>

      <div className={styles.steps}>
        <div className={styles.stepsTitle}>Creation Steps</div>
        <ol className={styles.stepsList}>
          {[
            'Choose your Heroic Culture',
            'Choose your Calling',
            'Assign your Attributes',
            'Allocate Skills',
            'Choose Virtues',
            'Select Distinctive Features',
            'Equip your hero',
            'Write your backstory',
            'Review & Export',
          ].map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
