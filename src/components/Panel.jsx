import styles from './Panel.module.css';

export default function Panel({ title, children, className = '' }) {
  return (
    <div className={`${styles.panel} ${className}`}>
      {title && <div className={styles.panelTitle}>{title}</div>}
      <div className={styles.panelContent}>{children}</div>
    </div>
  );
}
