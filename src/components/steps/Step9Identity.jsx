import styles from './Step9Identity.module.css';

export default function Step9Identity({ character, onChange }) {
  const id = character.identity || {};

  const update = (field, val) => {
    onChange({ identity: { ...id, [field]: val } });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Identity & Backstory</h2>
      <p className={styles.intro}>
        Give your character a name and personal details. The backstory field is free-form —
        describe your character's history, motivation, and personal goals.
      </p>

      <div className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="char-name">Name *</label>
            <input
              id="char-name"
              className={styles.input}
              value={id.name || ''}
              onChange={e => update('name', e.target.value)}
              placeholder="Enter character name"
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="char-age">Age</label>
            <input
              id="char-age"
              className={styles.input}
              type="number"
              value={id.age || ''}
              onChange={e => update('age', e.target.value)}
              placeholder="Age in years"
              min="1"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="char-height">Height</label>
            <input
              id="char-height"
              className={styles.input}
              value={id.height || ''}
              onChange={e => update('height', e.target.value)}
              placeholder="e.g. 5ft 10in"
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="char-eyes">Eye Colour</label>
            <input
              id="char-eyes"
              className={styles.input}
              value={id.eyeColour || ''}
              onChange={e => update('eyeColour', e.target.value)}
              placeholder="e.g. Grey"
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="char-hair">Hair Colour</label>
            <input
              id="char-hair"
              className={styles.input}
              value={id.hairColour || ''}
              onChange={e => update('hairColour', e.target.value)}
              placeholder="e.g. Dark Brown"
            />
          </div>
        </div>

        <div className={styles.formField}>
          <label className={styles.label} htmlFor="char-patron">Patron (optional)</label>
          <input
            id="char-patron"
            className={styles.input}
            value={id.patron || ''}
            onChange={e => update('patron', e.target.value)}
            placeholder="e.g. Gandalf the Grey, Círdan the Shipwright"
          />
          <span className={styles.hint}>A notable figure who supports your character's adventures.</span>
        </div>

        <div className={styles.formField}>
          <label className={styles.label} htmlFor="char-backstory">Backstory</label>
          <textarea
            id="char-backstory"
            className={styles.textarea}
            value={id.backstory || ''}
            onChange={e => update('backstory', e.target.value)}
            placeholder="Write your character's history, motivation, and personal story..."
            rows={8}
          />
        </div>
      </div>
    </div>
  );
}
