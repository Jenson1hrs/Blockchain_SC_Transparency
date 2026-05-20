import { useI18n } from '../context/I18nContext';

type Props = {
  productsByStatus: Record<string, number>;
};

export function ManufacturerProductStatusBreakdown({ productsByStatus }: Props) {
  const { t } = useI18n();
  const entries = Object.entries(productsByStatus ?? {}).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-page-muted rounded-lg border border-neutral-200/80 bg-neutral-50/50 px-4 py-3 dark:border-neutral-600/60 dark:bg-neutral-900/40">
        {t('mfgDash.statusEmpty')}
      </p>
    );
  }

  const max = Math.max(...entries.map(([, c]) => c), 1);

  return (
    <ul className="space-y-3">
      {entries.map(([status, count]) => (
        <li key={status}>
          <div className="flex justify-between gap-3 text-sm mb-1">
            <span className="font-medium text-page-title capitalize">{status || t('mfgDash.statusUnknown')}</span>
            <span className="tabular-nums text-page-muted">{count}</span>
          </div>
          <div
            className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden"
            role="presentation"
          >
            <div
              className="h-full rounded-full bg-primary-500 dark:bg-primary-600 motion-safe:transition-all"
              style={{ width: `${Math.round((count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
