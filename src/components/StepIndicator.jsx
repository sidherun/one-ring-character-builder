import styles from './StepIndicator.module.css';

const STEP_NAMES = [
  'Welcome',
  'Culture',
  'Calling',
  'Attributes',
  'Skills',
  'Virtues',
  'Features',
  'Equipment',
  'Identity',
  'Review',
];

export default function StepIndicator({ currentStep, completedSteps, onNavigate }) {
  return (
    <nav className={styles.indicator} aria-label="Wizard steps">
      {STEP_NAMES.map((name, i) => {
        const step = i + 1;
        const isCompleted = completedSteps.includes(step);
        const isCurrent = step === currentStep;
        const canNavigate = isCompleted || step <= Math.max(...completedSteps, 1) + 1;

        return (
          <button
            key={step}
            type="button"
            className={`${styles.step} ${isCurrent ? styles.current : ''} ${isCompleted ? styles.completed : ''}`}
            onClick={() => canNavigate && onNavigate(step)}
            disabled={!canNavigate}
            aria-current={isCurrent ? 'step' : undefined}
            aria-label={`Step ${step}: ${name}${isCompleted ? ' (completed)' : ''}`}
          >
            <span className={styles.stepNum}>{isCompleted && !isCurrent ? '✓' : step}</span>
            <span className={styles.stepName}>{name}</span>
          </button>
        );
      })}
    </nav>
  );
}
