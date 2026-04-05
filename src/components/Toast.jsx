import { useEffect } from 'react';
import styles from './Toast.module.css';

/**
 * Toast notification component for displaying temporary messages
 * @param {object} props
 * @param {string} props.message - Message to display
 * @param {string} props.type - Toast type: 'success', 'error', 'warning', 'info'
 * @param {number} props.duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
 * @param {function} props.onClose - Callback when toast closes
 */
export default function Toast({ message, type = 'info', duration = 5000, onClose }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <div className={styles.content}>
        <span className={styles.icon}>{getIcon(type)}</span>
        <p className={styles.message}>{message}</p>
      </div>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={onClose}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}

function getIcon(type) {
  switch (type) {
    case 'success': return '✓';
    case 'error': return '⚠';
    case 'warning': return '⚠';
    case 'info': return 'ℹ';
    default: return 'ℹ';
  }
}
