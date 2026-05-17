import { clsx } from 'clsx';
import type { UserRole } from '../types';
import { DASHBOARD_SUPPLY_CHAIN_HELPER } from '../constants/dashboardRoleCopy';
import { RoleTrustBadge } from './RoleTrustBadge';

const bannerAccent: Record<UserRole, string> = {
  admin:
    'border-violet-200/60 bg-gradient-to-r from-violet-50/90 to-slate-50/50 dark:border-violet-800/50 dark:from-violet-950/30 dark:to-neutral-900/40',
  regulator:
    'border-indigo-200/60 bg-gradient-to-r from-indigo-50/90 to-slate-50/50 dark:border-indigo-800/50 dark:from-indigo-950/30 dark:to-neutral-900/40',
  manufacturer:
    'border-primary-200/60 bg-gradient-to-r from-primary-50/90 to-slate-50/50 dark:border-primary-800/50 dark:from-primary-950/30 dark:to-neutral-900/40',
  distributor:
    'border-sky-200/60 bg-gradient-to-r from-sky-50/90 to-slate-50/50 dark:border-sky-800/50 dark:from-sky-950/30 dark:to-neutral-900/40',
  retailer:
    'border-amber-200/60 bg-gradient-to-r from-amber-50/90 to-slate-50/50 dark:border-amber-800/50 dark:from-amber-950/30 dark:to-neutral-900/40',
  consumer:
    'border-emerald-200/60 bg-gradient-to-r from-emerald-50/90 to-slate-50/50 dark:border-emerald-800/50 dark:from-emerald-950/30 dark:to-neutral-900/40',
};

interface RoleAnalyticsBannerProps {
  role: UserRole;
  className?: string;
}

export function RoleAnalyticsBanner({ role, className }: RoleAnalyticsBannerProps) {
  const text = DASHBOARD_SUPPLY_CHAIN_HELPER[role];
  if (!text) return null;

  return (
    <div
      className={clsx(
        'md:col-span-2 xl:col-span-3 rounded-xl border px-5 py-4',
        bannerAccent[role],
        className
      )}
    >
      <div className="mb-2">
        <RoleTrustBadge role={role} />
      </div>
      <p className="text-sm text-page-body leading-relaxed">{text}</p>
    </div>
  );
}
