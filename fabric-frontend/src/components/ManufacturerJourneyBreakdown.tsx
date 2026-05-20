import { useI18n } from '../context/I18nContext';
import type { Product } from '../types';
import {
  countManufacturerJourneyBadges,
  type ManufacturerJourneyBadgeId,
  type ManufacturerJourneyOptions,
} from '../utils/productTrustPath';

const ROW_ORDER: ManufacturerJourneyBadgeId[] = [
  'in_manufacturer_custody',
  'with_distributor',
  'received_by_retailer',
  'retail_ready',
  'pending_transfer',
  'needs_action',
  'journey_unclear',
];

const ROW_I18N: Record<ManufacturerJourneyBadgeId, string> = {
  in_manufacturer_custody: 'mfgJourney.inManufacturerCustody',
  with_distributor: 'mfgJourney.withDistributor',
  received_by_retailer: 'mfgJourney.receivedByRetailer',
  retail_ready: 'mfgJourney.retailReady',
  pending_transfer: 'mfgJourney.pendingTransfer',
  needs_action: 'mfgJourney.needsAction',
  journey_unclear: 'mfgJourney.journeyUnclear',
};

type Props = {
  products: Product[];
  options: ManufacturerJourneyOptions;
};

export function ManufacturerJourneyBreakdown({ products, options }: Props) {
  const { t } = useI18n();
  const counts = countManufacturerJourneyBadges(products, options);
  const rows = ROW_ORDER.map((id) => ({ id, count: counts[id] })).filter((r) => r.count > 0);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-page-muted rounded-lg border border-neutral-200/80 bg-neutral-50/50 px-4 py-3 dark:border-neutral-600/60 dark:bg-neutral-900/40">
        {t('mfgJourney.breakdownEmpty')}
      </p>
    );
  }

  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <ul className="space-y-3">
      {rows.map(({ id, count }) => (
        <li key={id}>
          <div className="flex justify-between gap-3 text-sm mb-1">
            <span className="font-medium text-page-title">{t(ROW_I18N[id])}</span>
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
