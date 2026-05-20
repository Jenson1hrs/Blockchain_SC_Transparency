import { clsx } from 'clsx';
import { useI18n } from '../context/I18nContext';
import type { Product } from '../types';
import {
  inferManufacturerJourneyBadges,
  type ManufacturerJourneyBadgeId,
  type ManufacturerJourneyOptions,
} from '../utils/productTrustPath';

const BADGE_STYLES: Record<ManufacturerJourneyBadgeId, string> = {
  in_manufacturer_custody:
    'bg-primary-100 text-primary-900 dark:bg-primary-950/50 dark:text-primary-200',
  with_distributor: 'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200',
  received_by_retailer:
    'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200',
  retail_ready: 'bg-success-100 text-success-900 dark:bg-success-950/50 dark:text-success-200',
  pending_transfer: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
  needs_action: 'bg-orange-100 text-orange-900 dark:bg-orange-950/50 dark:text-orange-200',
  journey_unclear: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
};

const BADGE_I18N: Record<ManufacturerJourneyBadgeId, string> = {
  in_manufacturer_custody: 'mfgJourney.inManufacturerCustody',
  with_distributor: 'mfgJourney.withDistributor',
  received_by_retailer: 'mfgJourney.receivedByRetailer',
  retail_ready: 'mfgJourney.retailReady',
  pending_transfer: 'mfgJourney.pendingTransfer',
  needs_action: 'mfgJourney.needsAction',
  journey_unclear: 'mfgJourney.journeyUnclear',
};

type Props = {
  product: Product;
  options: ManufacturerJourneyOptions;
  className?: string;
};

export function ManufacturerJourneyBadges({ product, options, className }: Props) {
  const { t } = useI18n();
  const badges = inferManufacturerJourneyBadges(product, options);

  if (badges.length === 0) return null;

  return (
    <div className={clsx('flex flex-wrap gap-1.5', className)} role="list" aria-label={t('mfgJourney.listLabel')}>
      {badges.map((badge) => (
        <span
          key={badge.id}
          role="listitem"
          className={clsx(
            'inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium',
            BADGE_STYLES[badge.id],
          )}
        >
          {t(BADGE_I18N[badge.id])}
        </span>
      ))}
    </div>
  );
}
