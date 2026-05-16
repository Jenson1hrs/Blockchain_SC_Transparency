import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import type { AuthUser, Product } from '../types';
import {
  getPersonalizedAlerts,
  type PersonalizedAlert,
} from '../utils/personalizedAlerts';

const LOGIN_HINT =
  'Log in and set your allergies or dietary preferences to receive personalized safety alerts.';

function severityStyles(severity: PersonalizedAlert['severity']): string {
  switch (severity) {
    case 'danger':
      return 'border-danger-200 bg-danger-50 text-danger-900 dark:border-danger-800 dark:bg-danger-950/40 dark:text-danger-100';
    case 'warning':
      return 'border-warning-200 bg-warning-50 text-warning-900 dark:border-warning-800 dark:bg-warning-950/35 dark:text-warning-100';
    case 'success':
      return 'border-success-200 bg-success-50 text-success-900 dark:border-success-800 dark:bg-success-950/35 dark:text-success-100';
    default:
      return 'border-primary-200 bg-primary-50 text-primary-900 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-100';
  }
}

function AlertCard({
  alert,
  compact,
}: {
  alert: PersonalizedAlert;
  compact?: boolean;
}) {
  return (
    <div
      className={clsx(
        'rounded-xl border shadow-sm',
        severityStyles(alert.severity),
        compact ? 'px-3 py-2.5 text-sm' : 'px-4 py-3 text-sm'
      )}
      role="status"
    >
      <p className={clsx('font-semibold', compact ? 'text-xs' : 'text-sm')}>
        {alert.title}
      </p>
      <p className={clsx('mt-1 opacity-95', compact ? 'text-xs' : 'text-sm')}>
        {alert.message}
      </p>
    </div>
  );
}

type Props = {
  product: Pick<
    Product,
    'ingredients' | 'allergyInfo' | 'halalStatus'
  >;
  user: AuthUser | null;
  /** Logged-out banner (verify pages). Omit or false on screens that require auth. */
  showLoginHintWhenLoggedOut?: boolean;
  compact?: boolean;
  className?: string;
};

/**
 * Personalized allergy / halal / dietary alerts (rule-based).
 * Expiry reminders stay separate — use ExpiryBadge elsewhere.
 */
export function PersonalizedAlertsPanel({
  product,
  user,
  showLoginHintWhenLoggedOut = true,
  compact = false,
  className,
}: Props) {
  const alerts = useMemo(
    () => getPersonalizedAlerts(product, user),
    [product, user]
  );

  if (!user && showLoginHintWhenLoggedOut) {
    return (
      <div
        className={clsx(
          'rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-600 dark:bg-neutral-900/50 dark:text-neutral-300',
          className
        )}
      >
        <p className="font-medium text-neutral-800 dark:text-neutral-200">
          Personalized alerts
        </p>
        <p className="mt-1">{LOGIN_HINT}</p>
        <Link
          to="/login"
          className="mt-2 inline-block text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          Sign in
        </Link>
        {' · '}
        <Link
          to="/profile"
          className="inline-block text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          Profile settings
        </Link>
      </div>
    );
  }

  if (!alerts.length) return null;

  return (
    <div className={clsx('space-y-3', className)}>
      {!compact && (
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Personalized safety alerts
        </h3>
      )}
      <div className={clsx('space-y-2', compact && 'space-y-1.5')}>
        {alerts.map((a, i) => (
          <AlertCard key={`${a.type}-${a.severity}-${i}`} alert={a} compact={compact} />
        ))}
      </div>
    </div>
  );
}

/** Render alert cards from a precomputed list (e.g. inventory cards). */
export function PersonalizedAlertsList({
  alerts,
  compact,
  className,
}: {
  alerts: PersonalizedAlert[];
  compact?: boolean;
  className?: string;
}) {
  if (!alerts.length) return null;
  return (
    <div className={clsx('space-y-2', className)}>
      {alerts.map((a, i) => (
        <AlertCard key={`${a.type}-${a.severity}-${i}`} alert={a} compact={compact} />
      ))}
    </div>
  );
}
