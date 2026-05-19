import { clsx } from 'clsx';

type StickyNavToggleProps = {
  collapsed: boolean;
  onToggle: () => void;
  controlsId?: string;
  className?: string;
};

/** Chevron control to show/hide a sticky navigation row (mobile-friendly). */
export function StickyNavToggle({
  collapsed,
  onToggle,
  controlsId,
  className,
}: StickyNavToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
        'border-2 border-primary-400/80 bg-primary-100 text-primary-800 shadow-sm',
        'hover:bg-primary-200 active:scale-95',
        'dark:border-primary-500/70 dark:bg-primary-950/60 dark:text-primary-100 dark:hover:bg-primary-900/80',
        className,
      )}
      aria-expanded={!collapsed}
      aria-controls={controlsId}
      aria-label={collapsed ? 'Show menu' : 'Hide menu'}
      title={collapsed ? 'Show menu' : 'Hide menu'}
    >
      <svg
        viewBox="0 0 24 24"
        className={clsx(
          'h-5 w-5 stroke-current fill-none stroke-[2.5] motion-safe:transition-transform motion-safe:duration-200',
          collapsed ? '' : 'rotate-180',
        )}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}
