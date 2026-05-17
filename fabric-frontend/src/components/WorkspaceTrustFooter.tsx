import { clsx } from 'clsx';
import type { UserRole } from '../types';
import { WORKSPACE_FOOTER } from '../constants/dashboardRoleCopy';
import { RoleTrustBadge } from './RoleTrustBadge';

interface WorkspaceTrustFooterProps {
  role: UserRole;
  className?: string;
}

export function WorkspaceTrustFooter({ role, className }: WorkspaceTrustFooterProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-neutral-200/70 bg-gradient-to-r from-neutral-50/90 to-primary-50/30 px-5 py-4 dark:border-neutral-600/50 dark:from-neutral-900/50 dark:to-primary-950/20',
        className
      )}
    >
      <div className="mb-2.5">
        <RoleTrustBadge role={role} />
      </div>
      <p className="text-sm leading-relaxed text-page-body">{WORKSPACE_FOOTER[role]}</p>
    </div>
  );
}
