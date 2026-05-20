import { clsx } from 'clsx';
import type { Product } from '../types';
import { getExpiryReminder } from '../utils/expiryReminder';

export type VerificationSummaryLevel = 'full' | 'limited' | 'failed';

type ProductFields = Pick<
  Product,
  'expiryDate' | 'ingredients' | 'allergyInfo' | 'halalStatus' | 'usageInstructions'
>;

type Props = {
  verificationLevel: VerificationSummaryLevel;
  product?: ProductFields | null;
  hasSupplyChainHistory?: boolean;
  className?: string;
};

/** Readable local date, e.g. "22 May 2026" (handles ISO timestamps and YYYY-MM-DD). */
export function formatReadableExpiryDate(expiryDate: string): string | null {
  const trimmed = expiryDate.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]) - 1;
    const day = Number(dateOnly[3]);
    const local = new Date(year, month, day);
    if (Number.isNaN(local.getTime())) return null;
    return local.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildShortExpiryLine(expiryDate: string | null | undefined): {
  headline: string;
  active: boolean;
} {
  if (!expiryDate?.trim()) {
    return { headline: 'No expiry on file', active: false };
  }
  const reminder = getExpiryReminder(expiryDate);
  const formatted = formatReadableExpiryDate(expiryDate);
  if (!formatted) {
    return { headline: 'Expiry on file', active: true };
  }
  if (reminder?.level === 'expired') {
    return { headline: 'Expired', active: false };
  }
  if (reminder?.level === 'urgent' || reminder?.level === 'warning') {
    return { headline: `Use before ${formatted}`, active: true };
  }
  return { headline: `Safe until ${formatted}`, active: true };
}

const LEVEL_STYLES: Record<
  VerificationSummaryLevel,
  { banner: string; label: string; ring: string }
> = {
  full: {
    banner: 'bg-success-600 text-white dark:bg-success-700',
    label: 'Fully verified',
    ring: 'ring-success-200/80 dark:ring-success-800/50',
  },
  limited: {
    banner: 'bg-warning-500 text-warning-950 dark:bg-warning-600 dark:text-warning-950',
    label: 'Limited check',
    ring: 'ring-warning-200/80 dark:ring-warning-800/50',
  },
  failed: {
    banner: 'bg-danger-600 text-white dark:bg-danger-700',
    label: 'Not verified',
    ring: 'ring-danger-200/80 dark:ring-danger-800/50',
  },
};

function TrustCard({
  icon,
  label,
  headline,
  state,
}: {
  icon: string;
  label: string;
  headline: string;
  state: 'pass' | 'warn' | 'muted' | 'fail';
}) {
  return (
    <div
      className={clsx(
        'flex flex-col gap-2 rounded-xl border p-4 min-h-[7.5rem]',
        state === 'pass' &&
          'border-success-200/90 bg-success-50/80 dark:border-success-800/50 dark:bg-success-950/25',
        state === 'warn' &&
          'border-warning-200/90 bg-warning-50/70 dark:border-warning-800/50 dark:bg-warning-950/20',
        state === 'fail' &&
          'border-danger-200/90 bg-danger-50/70 dark:border-danger-800/50 dark:bg-danger-950/25',
        state === 'muted' &&
          'border-neutral-200/90 bg-neutral-50/60 dark:border-neutral-700/60 dark:bg-neutral-900/40',
      )}
    >
      <span className="text-2xl leading-none" aria-hidden>
        {icon}
      </span>
      <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p
        className={clsx(
          'text-base sm:text-lg font-semibold leading-snug',
          state === 'pass' && 'text-success-900 dark:text-success-100',
          state === 'warn' && 'text-warning-950 dark:text-warning-100',
          state === 'fail' && 'text-danger-900 dark:text-danger-100',
          state === 'muted' && 'text-neutral-700 dark:text-neutral-200',
        )}
      >
        {headline}
      </p>
    </div>
  );
}

export function ConsumerVerificationSummary({
  verificationLevel,
  product,
  hasSupplyChainHistory = false,
  className,
}: Props) {
  const hasSafetyMetadata = Boolean(
    product?.ingredients?.trim() ||
      product?.allergyInfo?.trim() ||
      product?.halalStatus?.trim() ||
      product?.usageInstructions?.trim(),
  );

  const expiry = buildShortExpiryLine(product?.expiryDate);
  const levelStyle = LEVEL_STYLES[verificationLevel];

  const authenticityHeadline =
    verificationLevel === 'full'
      ? 'Full QR verified'
      : verificationLevel === 'limited'
        ? 'Scan QR to verify'
        : 'Verification failed';

  const authenticityState: 'pass' | 'warn' | 'muted' | 'fail' =
    verificationLevel === 'full'
      ? 'pass'
      : verificationLevel === 'limited'
        ? 'warn'
        : 'fail';

  const expiryHeadline =
    verificationLevel === 'failed' && !product?.expiryDate
      ? 'Unavailable'
      : expiry.headline;

  const expiryState: 'pass' | 'warn' | 'muted' | 'fail' =
    verificationLevel === 'failed'
      ? 'muted'
      : expiry.headline === 'Expired'
        ? 'fail'
        : expiry.active
          ? expiry.headline.startsWith('Use before')
            ? 'warn'
            : 'pass'
          : 'muted';

  const ingredientsHeadline =
    verificationLevel === 'failed' && !hasSafetyMetadata
      ? 'Unavailable'
      : hasSafetyMetadata
        ? 'Safety info available'
        : 'Not published yet';

  const ingredientsState: 'pass' | 'warn' | 'muted' | 'fail' =
    verificationLevel === 'failed'
      ? 'muted'
      : hasSafetyMetadata
        ? 'pass'
        : 'warn';

  const journeyHeadline =
    verificationLevel === 'failed' && !hasSupplyChainHistory
      ? 'Unavailable'
      : hasSupplyChainHistory
        ? 'Custody path shown'
        : 'Awaiting handoffs';

  const journeyState: 'pass' | 'warn' | 'muted' | 'fail' =
    verificationLevel === 'failed'
      ? 'muted'
      : hasSupplyChainHistory
        ? 'pass'
        : 'warn';

  return (
    <section
      className={clsx(
        'overflow-hidden rounded-2xl border bg-white shadow-soft ring-2 dark:bg-neutral-900',
        levelStyle.ring,
        className,
      )}
      aria-labelledby="verification-summary-heading"
    >
      <div className={clsx('px-5 py-3 sm:px-6', levelStyle.banner)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="verification-summary-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight"
          >
            Verification summary
          </h2>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            {levelStyle.label}
          </span>
        </div>
        <p className="mt-1 text-sm opacity-90 max-w-2xl">
          Quick trust check for this skincare product before you buy or use it.
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <TrustCard
            icon="🛡️"
            label="Authenticity"
            headline={authenticityHeadline}
            state={authenticityState}
          />
          <TrustCard
            icon="📅"
            label="Expiry"
            headline={expiryHeadline}
            state={expiryState}
          />
          <TrustCard
            icon="🧴"
            label="Ingredients"
            headline={ingredientsHeadline}
            state={ingredientsState}
          />
          <TrustCard
            icon="📍"
            label="Journey"
            headline={journeyHeadline}
            state={journeyState}
          />
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-500 text-center sm:text-left">
          QR verification helps detect modified links, but physical labels can still be copied.
        </p>
      </div>
    </section>
  );
}
