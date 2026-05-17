import { clsx } from 'clsx';
import type { UserRole } from '../types';
import { ROLE_TRUST_BADGE } from '../constants/dashboardRoleCopy';

const toneClass: Record<UserRole, string> = {
  admin: 'border-violet-200/80 bg-violet-50/90 text-violet-900 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-200',
  regulator:
    'border-indigo-200/80 bg-indigo-50/90 text-indigo-900 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-200',
  manufacturer:
    'border-primary-200/80 bg-primary-50/90 text-primary-900 dark:border-primary-800/60 dark:bg-primary-950/40 dark:text-primary-200',
  distributor:
    'border-sky-200/80 bg-sky-50/90 text-sky-900 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-200',
  retailer:
    'border-amber-200/80 bg-amber-50/90 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200',
  consumer:
    'border-emerald-200/80 bg-emerald-50/90 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200',
};

interface RoleTrustBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleTrustBadge({ role, className }: RoleTrustBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        toneClass[role],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {ROLE_TRUST_BADGE[role]}
    </span>
  );
}
