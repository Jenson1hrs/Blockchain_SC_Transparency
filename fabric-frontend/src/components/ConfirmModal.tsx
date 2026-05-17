import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { Button } from './Button';

export type ConfirmModalVariant = 'info' | 'warning' | 'danger' | 'success';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

const variantStyles: Record<
  ConfirmModalVariant,
  { ring: string; iconBg: string; iconText: string; confirmBtn: string }
> = {
  info: {
    ring: 'border-primary-200/80 dark:border-primary-700/60',
    iconBg: 'bg-primary-100 dark:bg-primary-900/50',
    iconText: 'text-primary-600 dark:text-primary-300',
    confirmBtn:
      'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 dark:bg-primary-600 dark:hover:bg-primary-500',
  },
  warning: {
    ring: 'border-warning-200/80 dark:border-warning-800/60',
    iconBg: 'bg-warning-100 dark:bg-warning-950/50',
    iconText: 'text-warning-700 dark:text-warning-300',
    confirmBtn:
      'bg-warning-600 hover:bg-warning-700 text-white focus:ring-warning-500 dark:bg-warning-600 dark:hover:bg-warning-500',
  },
  danger: {
    ring: 'border-danger-200/80 dark:border-danger-800/60',
    iconBg: 'bg-danger-100 dark:bg-danger-950/50',
    iconText: 'text-danger-600 dark:text-danger-300',
    confirmBtn:
      'bg-danger-600 hover:bg-danger-700 text-white focus:ring-danger-500 dark:bg-danger-600 dark:hover:bg-danger-500',
  },
  success: {
    ring: 'border-success-200/80 dark:border-success-800/60',
    iconBg: 'bg-success-100 dark:bg-success-950/50',
    iconText: 'text-success-700 dark:text-success-300',
    confirmBtn:
      'bg-success-600 hover:bg-success-700 text-white focus:ring-success-500 dark:bg-success-600 dark:hover:bg-success-500',
  },
};

function VariantIcon({ variant }: { variant: ConfirmModalVariant }) {
  const paths: Record<ConfirmModalVariant, ReactNode> = {
    info: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    warning: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    ),
    danger: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    ),
    success: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    ),
  };

  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      {paths[variant]}
    </svg>
  );
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const styles = variantStyles[variant];

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        e.preventDefault();
        onCancel();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const timer = window.setTimeout(() => panelRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(timer);
    };
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onClick={() => {
        if (!loading) onCancel();
      }}
    >
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm dark:bg-black/65 motion-safe:animate-modal-backdrop-in"
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={clsx(
          'relative z-[101] w-full max-w-md rounded-2xl border bg-white/95 p-6 shadow-large backdrop-blur-sm',
          'dark:bg-neutral-900/95 dark:shadow-black/40',
          styles.ring,
          'animate-modal-in outline-none focus:outline-none'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4">
          <div
            className={clsx(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              styles.iconBg,
              styles.iconText
            )}
          >
            <VariantIcon variant={variant} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-semibold text-page-title leading-snug">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-2 text-sm text-page-body leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {children ? <div className="mt-4">{children}</div> : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={clsx(
              'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium',
              'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:focus:ring-offset-neutral-900',
              styles.confirmBtn
            )}
          >
            {loading && (
              <svg
                className="animate-spin -ml-0.5 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
