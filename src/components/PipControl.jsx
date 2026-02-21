import styles from './PipControl.module.css';

export default function PipControl({ value, max = 6, onChange, disabled = false, label, favoured = false }) {
  const handleClick = (idx) => {
    if (disabled) return;
    // If clicking the current value pip, decrease by 1; otherwise set to idx+1
    const newVal = value === idx + 1 ? idx : idx + 1;
    onChange(Math.max(0, Math.min(max, newVal)));
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'ArrowRight' || e.key === '+') onChange(Math.min(max, value + 1));
    if (e.key === 'ArrowLeft' || e.key === '-') onChange(Math.max(0, value - 1));
  };

  return (
    <div className={styles.pipControl}>
      {label && (
        <span className={`${styles.skillName} ${favoured ? styles.favoured : ''}`}>
          {favoured && <span className={styles.star} aria-label="Favoured">★</span>}
          {label}
        </span>
      )}
      <div
        className={styles.pips}
        role="slider"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ? `${label} rating` : 'Rating'}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.pip} ${i < value ? styles.filled : styles.empty}`}
            onClick={() => handleClick(i)}
            disabled={disabled}
            tabIndex={-1}
            aria-label={`Set to ${i + 1}`}
          />
        ))}
      </div>
      <span className={styles.valueLabel}>{value}</span>
    </div>
  );
}
