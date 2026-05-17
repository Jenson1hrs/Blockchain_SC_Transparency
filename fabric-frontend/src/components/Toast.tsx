import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  durationMs?: number;
}

export function Toast({ message, type = 'success', onClose, durationMs = 4200 }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, durationMs, onClose]);

  return createPortal(
    <div
      className="fixed bottom-6 left-1/2 z-[110] w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 animate-fade-up"
      role="status"
      aria-live="polite"
    >
      <div
        className={clsx(
          'flex items-start gap-3 rounded-xl border px-4 py-3 shadow-large backdrop-blur-sm',
          type === 'success' &&
            'border-success-200/80 bg-success-50/95 text-success-900 dark:border-success-800/60 dark:bg-success-950/90 dark:text-success-100',
          type === 'error' &&
            'border-danger-200/80 bg-danger-50/95 text-danger-900 dark:border-danger-800/60 dark:bg-danger-950/90 dark:text-danger-100'
        )}
      >
        <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md p-1 text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
}
