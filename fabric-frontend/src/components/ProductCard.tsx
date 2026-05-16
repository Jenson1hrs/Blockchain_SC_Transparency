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
  /** Rule-based allergy / dietary / halal alerts (separate from expiry). */
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
  return (
    <div className={`card p-6 ${className || ''}`}>
      <div className="flex gap-6">
        {/* Product Image */}
        <div className="flex-shrink-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-24 h-24 object-cover rounded-lg border border-neutral-200 dark:border-neutral-600"
            />
          ) : (
            <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-900/80 rounded-lg border border-neutral-200 dark:border-neutral-600 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-neutral-400 dark:text-neutral-500"
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

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-200 mt-1 line-clamp-2">
                  {product.description}
                </p>
              )}
              {(product.manufacturerDisplayName || product.manufacturer) && (
                <p className="text-sm text-neutral-500 dark:text-neutral-300 mt-1">
                  Manufacturer:{' '}
                  <OrganizationLink
                    userId={product.manufacturerUserId}
                    name={product.manufacturerDisplayName || product.manufacturer || ''}
                  />
                </p>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex flex-col gap-2 items-end">
              {product.status && <ProductStatusBadge status={product.status} />}
              {expiryReminder && <ExpiryBadge level={expiryReminder.level} />}
              {product.metadataComplete === false && <MetadataIncompleteBadge />}
              {product.manufacturerOrganizationFlagged && (
                <OrganizationFlaggedBadge compact />
              )}
              {product.manufacturerOrganizationVerified && (
                <VerifiedOrganizationBadge compact />
              )}
            </div>
          </div>

          {personalizedAlerts && personalizedAlerts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-600">
              <PersonalizedAlertsList alerts={personalizedAlerts} compact />
            </div>
          )}

          {/* Actions */}
          {actions && <div className="mt-4 flex gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
};
