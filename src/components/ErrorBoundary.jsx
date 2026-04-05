import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <h1 className={styles.title}>Something Went Wrong</h1>
            <p className={styles.message}>
              The character builder encountered an unexpected error. Your character data is safe in browser storage.
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={this.handleReload}
              >
                Reload Page
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={this.handleReset}
              >
                Try Again
              </button>
            </div>

            {this.state.error && (
              <details className={styles.details}>
                <summary className={styles.summary}>Technical Details</summary>
                <pre className={styles.errorText}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
