import styles from './WizardNav.module.css';

export default function WizardNav({ step, totalSteps, onPrev, onNext, nextLabel, nextDisabled, validationMsg }) {
  return (
    <div className={styles.nav}>
      <div className={styles.stepCount}>Step {step} of {totalSteps}</div>
      {validationMsg && <div className={styles.validationMsg} role="alert">{validationMsg}</div>}
      <div className={styles.buttons}>
        {step > 1 && (
          <button type="button" className={styles.btnPrev} onClick={onPrev}>
            ← Previous
          </button>
        )}
        {step < totalSteps && (
          <button
            type="button"
            className={styles.btnNext}
            onClick={onNext}
            disabled={nextDisabled}
            aria-describedby={validationMsg ? 'validation-msg' : undefined}
          >
            {nextLabel || 'Next →'}
          </button>
        )}
      </div>
    </div>
  );
}
