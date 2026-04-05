import { useState, useCallback } from 'react';

/**
 * Custom hook to manage toast notifications.
 *
 * @returns {{
 *   toast: {message: string, type: string, duration: number} | null,
 *   showToast: (message: string, type?: string, duration?: number) => void,
 *   hideToast: () => void
 * }}
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    setToast({ message, type, duration });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
}
