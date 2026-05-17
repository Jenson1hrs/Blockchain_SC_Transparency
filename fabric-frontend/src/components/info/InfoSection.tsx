import type { ReactNode } from 'react';
import { clsx } from 'clsx';

type InfoSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'muted';
};

export function InfoSection({
  title,
  subtitle,
  children,
  className,
  variant = 'default',
}: InfoSectionProps) {
  const shell =
    variant === 'gradient'
      ? 'card overflow-hidden border-primary-200/60 bg-gradient-to-br from-white via-primary-50/30 to-white dark:border-primary-800/40 dark:from-neutral-800/95 dark:via-primary-950/20 dark:to-neutral-900/95'
      : variant === 'muted'
        ? 'card-soft'
        : 'card';

  return (
    <section
      className={clsx(
        shell,
        'p-6 md:p-8 motion-safe:transition-shadow motion-safe:duration-300 hover:shadow-medium',
        className,
      )}
    >
      <h2 className="text-xl font-semibold text-page-heading md:text-2xl">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-page-body">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

type InfoStatProps = {
  icon: string;
  label: string;
  value: string;
};

export function InfoStatCard({ icon, label, value }: InfoStatProps) {
  return (
    <div className="group rounded-2xl border border-neutral-200/80 bg-white/90 p-5 shadow-soft motion-safe:transition-all motion-safe:duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-medium dark:border-neutral-600/50 dark:bg-neutral-800/90 dark:hover:border-primary-600/50">
      <div className="text-2xl mb-3 motion-safe:transition-transform group-hover:scale-110">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wider text-page-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-page-heading">{value}</p>
    </div>
  );
}
