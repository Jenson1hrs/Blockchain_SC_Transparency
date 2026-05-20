import { Link } from 'react-router-dom';
import { Button, ExpiryBadge, ProductStatusBadge } from './index';
import { MetadataIncompleteBadge } from './MetadataIncompleteBadge';
import { formatReadableExpiryDate } from './ConsumerVerificationSummary';
import { useI18n } from '../context/I18nContext';
import type { Product } from '../types';
import { getExpiryReminder } from '../utils/expiryReminder';
import { isQrReady } from '../utils/manufacturerProductInsights';
import { formatMetadataFieldLabel } from '../utils/manufacturerCatalogueUtils';
import { ManufacturerJourneyBadges } from './ManufacturerJourneyBadges';
import type { ManufacturerJourneyOptions } from '../utils/productTrustPath';

type Props = {
  products: Product[];
  pendingTransferProductIds?: Set<string>;
  journeyOptions?: ManufacturerJourneyOptions | null;
  emptyMessage: string;
  onEditMetadata?: (product: Product) => void;
};

export function ManufacturerProductCatalogue({
  products,
  pendingTransferProductIds = new Set(),
  journeyOptions = null,
  emptyMessage,
  onEditMetadata,
}: Props) {
  const { t } = useI18n();

  if (products.length === 0) {
    return <p className="text-sm text-page-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-4">
      {products.map((p) => {
        const expiryReminder = getExpiryReminder(p.expiryDate);
        const formattedExpiry = p.expiryDate ? formatReadableExpiryDate(p.expiryDate) : null;
        const qrReady = isQrReady(p);
        const transferPending = pendingTransferProductIds.has(p.productId);
        const ownerLabel =
          p.currentOwnerName?.trim() ||
          p.owner?.trim() ||
          t('mfgCatalogue.ownerUnknown');
        const roleLabel = p.currentOwnerRole
          ? p.currentOwnerRole.charAt(0).toUpperCase() + p.currentOwnerRole.slice(1)
          : null;
        const missingFields = p.metadataMissingFields ?? [];

        return (
          <li
            key={p.productId}
            className="card p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-start"
          >
            <div className="shrink-0 flex justify-center sm:justify-start">
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-20 w-20 rounded-lg border border-neutral-200 object-cover dark:border-neutral-600"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-400 dark:border-neutral-600 dark:bg-neutral-900/50">
                  {t('mfgCatalogue.noImage')}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold text-page-title">{p.name || p.productId}</h4>
                {p.metadataComplete === false && <MetadataIncompleteBadge compact />}
                {qrReady ? (
                  <span className="inline-flex rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-800 dark:bg-primary-900/50 dark:text-primary-200">
                    {t('mfgCatalogue.qrReady')}
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                    {t('mfgCatalogue.qrNotReady')}
                  </span>
                )}
                {transferPending && !journeyOptions && (
                  <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                    {t('mfgCatalogue.transferPending')}
                  </span>
                )}
                {journeyOptions && (
                  <ManufacturerJourneyBadges product={p} options={journeyOptions} />
                )}
              </div>

              <p className="text-xs font-mono text-page-muted">{p.productId}</p>
              <p className="text-sm text-page-body">
                {t('mfgCatalogue.batch')}: <span className="font-mono">{p.batchNumber || '—'}</span>
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {p.status && <ProductStatusBadge status={p.status} />}
                {expiryReminder && <ExpiryBadge level={expiryReminder.level} />}
                {formattedExpiry && (
                  <span className="text-xs text-page-muted">
                    {t('mfgCatalogue.expiry')}: {formattedExpiry}
                  </span>
                )}
              </div>

              <p className="text-sm text-page-muted">
                {t('mfgCatalogue.custody')}: {ownerLabel}
                {roleLabel ? ` (${roleLabel})` : ''}
              </p>

              {p.metadataCompletionPercent != null && (
                <p className="text-xs text-page-muted">
                  {t('mfgCatalogue.metadata')}: {p.metadataCompletionPercent}%
                  {p.metadataComplete ? ` · ${t('mfgCatalogue.metadataComplete')}` : ''}
                </p>
              )}

              {missingFields.length > 0 && (
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  {t('mfgCatalogue.missingFields')}:{' '}
                  {missingFields.map((f) => formatMetadataFieldLabel(f)).join(', ')}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 shrink-0 sm:flex-col sm:items-stretch">
              {onEditMetadata && p.metadataComplete === false && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => onEditMetadata(p)}
                >
                  {t('mfgCatalogue.editMetadata')}
                </Button>
              )}
              <Button
                as={Link}
                to="/verify"
                state={{ productId: p.productId }}
                variant="secondary"
                size="sm"
              >
                {t('mfgCatalogue.view')}
              </Button>
              {qrReady ? (
                <Button
                  as={Link}
                  to={`/qr/${encodeURIComponent(p.productId)}`}
                  variant="secondary"
                  size="sm"
                >
                  {t('mfgCatalogue.qr')}
                </Button>
              ) : (
                <Button type="button" variant="secondary" size="sm" className="opacity-50 cursor-not-allowed" aria-disabled>
                  {t('mfgCatalogue.qr')}
                </Button>
              )}
              <Button as={Link} to="/transfer" variant="ghost" size="sm">
                {t('mfgCatalogue.transfer')}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
