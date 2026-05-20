import { clsx } from 'clsx';
import { useI18n } from '../context/I18nContext';
import type { Product, ProductTimelineEntry } from '../types';
import {
  inferConsumerTrustPath,
  type ConsumerTrustPathLevel,
} from '../utils/productTrustPath';

const TITLE_KEYS = {
  complete: 'trustPath.complete.title',
  partial: 'trustPath.partial.title',
  needs_attention: 'trustPath.needsAttention.title',
  unclear: 'trustPath.unclear.title',
} as const;

const MESSAGE_KEYS = {
  complete: 'trustPath.complete.message',
  partial: 'trustPath.partial.message',
  needs_attention: 'trustPath.needsAttention.message',
  unclear: 'trustPath.unclear.message',
} as const;

type Props = {
  product: Product;
  history: ProductTimelineEntry[];
  className?: string;
};

const LEVEL_STYLES: Record<
  ConsumerTrustPathLevel,
  { border: string; bg: string; title: string; icon: string }
> = {
  complete: {
    border: 'border-success-200/90 dark:border-success-800/60',
    bg: 'bg-success-50/80 dark:bg-success-950/30',
    title: 'text-success-900 dark:text-success-100',
    icon: 'text-success-600 dark:text-success-400',
  },
  partial: {
    border: 'border-primary-200/90 dark:border-primary-800/60',
    bg: 'bg-primary-50/60 dark:bg-primary-950/25',
    title: 'text-primary-900 dark:text-primary-100',
    icon: 'text-primary-600 dark:text-primary-400',
  },
  needs_attention: {
    border: 'border-amber-200/90 dark:border-amber-800/60',
    bg: 'bg-amber-50/80 dark:bg-amber-950/30',
    title: 'text-amber-950 dark:text-amber-100',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  unclear: {
    border: 'border-neutral-200/90 dark:border-neutral-600/60',
    bg: 'bg-neutral-50/80 dark:bg-neutral-900/40',
    title: 'text-page-title',
    icon: 'text-page-muted',
  },
};

function PathIcon({ level }: { level: ConsumerTrustPathLevel }) {
  if (level === 'complete') {
    return (
      <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (level === 'partial') {
    return (
      <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );
}

export function ProductTrustPathSummary({ product, history, className }: Props) {
  const { t } = useI18n();
  const result = inferConsumerTrustPath(product, history);
  const styles = LEVEL_STYLES[result.level];
  const title = t(TITLE_KEYS[result.level]);
  const message = t(MESSAGE_KEYS[result.level]);

  return (
    <section
      className={clsx(
        'rounded-xl border px-4 py-4 sm:px-5 sm:py-5',
        styles.border,
        styles.bg,
        className,
      )}
      aria-labelledby="product-trust-path-heading"
    >
      <div className="flex gap-3">
        <div className={styles.icon}>
          <PathIcon level={result.level} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-page-muted">
            {t('trustPath.sectionLabel')}
          </p>
          <h3
            id="product-trust-path-heading"
            className={clsx('mt-0.5 text-lg font-semibold', styles.title)}
          >
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-page-body">{message}</p>
        </div>
      </div>
    </section>
  );
}
