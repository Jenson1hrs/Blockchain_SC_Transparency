import type { UserRole } from '../types';
import { ROLE_LABEL_PROFESSIONAL } from '../constants/dashboardRoleCopy';

const roleAccent: Record<UserRole, string> = {
  admin:
    'from-violet-500/10 via-white/95 to-slate-50/80 dark:from-violet-600/15 dark:via-neutral-900/95 dark:to-[#0c1528]/80',
  regulator:
    'from-indigo-500/10 via-white/95 to-slate-50/80 dark:from-indigo-600/15 dark:via-neutral-900/95 dark:to-[#0c1528]/80',
  manufacturer:
    'from-primary-500/12 via-white/95 to-primary-50/50 dark:from-primary-600/15 dark:via-neutral-900/95 dark:to-[#0c1528]/80',
  distributor:
    'from-sky-500/10 via-white/95 to-slate-50/80 dark:from-sky-600/15 dark:via-neutral-900/95 dark:to-[#0c1528]/80',
  retailer:
    'from-amber-500/10 via-white/95 to-slate-50/80 dark:from-amber-600/12 dark:via-neutral-900/95 dark:to-[#0c1528]/80',
  consumer:
    'from-emerald-500/10 via-white/95 to-slate-50/80 dark:from-emerald-600/12 dark:via-neutral-900/95 dark:to-[#0c1528]/80',
};

interface RoleWorkspaceHeroProps {
  role: UserRole;
  userName: string;
}

export function RoleWorkspaceHero({ role, userName }: RoleWorkspaceHeroProps) {
  return (
    <div
      className={`card-soft overflow-hidden border border-neutral-200/75 bg-gradient-to-br shadow-soft dark:border-neutral-600/75 ${roleAccent[role]}`}
    >
      <div className="flex flex-col gap-5 p-6 sm:gap-6 sm:p-8 md:flex-row md:items-start">
        <div className="flex shrink-0 justify-center md:justify-start">
          <div
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-2xl shadow-inner dark:border-neutral-600/60 dark:bg-neutral-800/80"
            aria-hidden
          >
            👋
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-3 text-center md:text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-page-muted">
            {ROLE_LABEL_PROFESSIONAL[role]}
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-page-title">Hello, {userName}</h2>
        </div>
      </div>
    </div>
  );
}
