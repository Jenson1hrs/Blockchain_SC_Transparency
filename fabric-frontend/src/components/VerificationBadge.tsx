import { clsx } from 'clsx';

type VerificationBadgeProps = {
  verified: boolean;
  compact?: boolean;
  className?: string;
};

export function VerificationBadge({ verified, compact, className }: VerificationBadgeProps) {
  if (!verified) return null;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        'border-emerald-300/90 bg-emerald-50 text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/50 dark:text-emerald-200',
        className
      )}
    >
      <svg
        className={compact ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
      {compact ? 'Verified' : 'Approved by Regulatory Authority'}
    </span>
  );
}

export function OrganizationFlaggedBadge({
  compact,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        'border-red-300/90 bg-red-50 text-red-900 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-200',
        className
      )}
    >
      <svg
        className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
      {compact ? 'Flagged' : 'Flagged for review'}
    </span>
  );
}

export function VerifiedOrganizationBadge(props: Omit<VerificationBadgeProps, 'verified'> & { verified?: boolean }) {
  const { verified = true, compact, className } = props;
  if (!verified) return null;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        'border-sky-300/90 bg-sky-50 text-sky-900 dark:border-sky-700/60 dark:bg-sky-950/50 dark:text-sky-200',
        className
      )}
    >
      <svg
        className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {compact ? 'Verified org' : 'Verified Organization'}
    </span>
  );
}
