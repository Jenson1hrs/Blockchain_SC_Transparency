import React from 'react';
import { ProductStatusBadge } from './ProductStatusBadge';
import { ExpiryBadge } from './ExpiryBadge';
import { PersonalizedAlertsList } from './PersonalizedAlertsPanel';
import { OrganizationLink } from './OrganizationLink';
import { MetadataIncompleteBadge } from './MetadataIncompleteBadge';
import { VerifiedOrganizationBadge, OrganizationFlaggedBadge } from './VerificationBadge';
import type { PersonalizedAlert } from '../utils/personalizedAlerts';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string;
    manufacturer?: string;
    manufacturerUserId?: number | null;
    manufacturerDisplayName?: string;
    metadataComplete?: boolean | null;
    manufacturerOrganizationVerified?: boolean;
    manufacturerOrganizationFlagged?: boolean;
    status?: string;
    expiryDate?: string;
    imageUrl?: string;
    qrCode?: string;
  };
  expiryReminder?: {
    level: 'expired' | 'urgent' | 'warning' | 'safe';
  };
  actions?: React.ReactNode;
  personalizedAlerts?: PersonalizedAlert[];
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  expiryReminder,
  actions,
  personalizedAlerts,
  className,
}) => {
  const badgeRow = (
    <>
      {product.status && <ProductStatusBadge status={product.status} />}
      {expiryReminder && <ExpiryBadge level={expiryReminder.level} />}
      {product.metadataComplete === false && <MetadataIncompleteBadge />}
      {product.manufacturerOrganizationFlagged && <OrganizationFlaggedBadge compact />}
      {product.manufacturerOrganizationVerified && <VerifiedOrganizationBadge compact />}
    </>
  );

  return (
    <div className={`card p-6 ${className || ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <div className="flex shrink-0 justify-center sm:justify-start">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-24 w-24 rounded-lg border border-neutral-200 object-cover dark:border-neutral-600"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-900/80">
              <svg
                className="h-8 w-8 text-neutral-400 dark:text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="text-lg font-semibold break-words text-neutral-900 dark:text-neutral-100 sm:truncate">
                {product.name}
              </h3>
              {product.description && (
                <p className="mt-1 text-sm leading-relaxed break-words text-neutral-600 dark:text-neutral-200 sm:line-clamp-2">
                  {product.description}
                </p>
              )}
              {(product.manufacturerDisplayName || product.manufacturer) && (
                <p className="mt-1 text-sm break-words text-neutral-500 dark:text-neutral-300">
                  Manufacturer:{' '}
                  <OrganizationLink
                    userId={product.manufacturerUserId}
                    name={product.manufacturerDisplayName || product.manufacturer || ''}
                  />
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 sm:max-w-[11rem] sm:shrink-0 sm:flex-col sm:items-end">
              {badgeRow}
            </div>
          </div>

          {personalizedAlerts && personalizedAlerts.length > 0 && (
            <div className="border-t border-neutral-200 pt-4 dark:border-neutral-600">
              <PersonalizedAlertsList alerts={personalizedAlerts} compact />
            </div>
          )}

          {actions && (
            <div className="flex w-full flex-col gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-600 sm:flex-row sm:flex-wrap sm:border-0 sm:pt-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
