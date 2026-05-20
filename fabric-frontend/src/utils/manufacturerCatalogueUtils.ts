import type { Product } from '../types';
import { getExpiryReminder } from './expiryReminder';
import { normalizeOwnerRole } from './manufacturerProductInsights';

export type ManufacturerCatalogueFilter =
  | 'all'
  | 'in_custody'
  | 'at_distributor'
  | 'at_retailer'
  | 'missing_metadata'
  | 'expiring_soon'
  | 'pending_transfer';

const METADATA_FIELD_LABELS: Record<string, string> = {
  image_url: 'Product image',
  ingredients: 'Ingredients',
  allergy_info: 'Allergy information',
  usage_instructions: 'Usage instructions',
  halal_status: 'Halal status',
};

export function formatMetadataFieldLabel(field: string): string {
  return METADATA_FIELD_LABELS[field] ?? field.replace(/_/g, ' ');
}

export function productMatchesSearch(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    product.name,
    product.productId,
    product.batchNumber,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(q);
}

export function filterManufacturerCatalogue(
  products: Product[],
  filter: ManufacturerCatalogueFilter,
  options: {
    manufacturerUserId: number;
    pendingTransferProductIds: Set<string>;
  },
): Product[] {
  const { manufacturerUserId, pendingTransferProductIds } = options;

  return products.filter((p) => {
    switch (filter) {
      case 'all':
        return true;
      case 'in_custody':
        return Number(p.currentOwnerUserId) === manufacturerUserId;
      case 'at_distributor':
        return normalizeOwnerRole(p.currentOwnerRole) === 'distributor';
      case 'at_retailer':
        return normalizeOwnerRole(p.currentOwnerRole) === 'retailer';
      case 'missing_metadata':
        return p.metadataComplete === false;
      case 'expiring_soon': {
        const reminder = getExpiryReminder(p.expiryDate);
        if (!reminder) return false;
        return (
          reminder.level === 'warning' ||
          reminder.level === 'urgent' ||
          reminder.level === 'expired'
        );
      }
      case 'pending_transfer':
        return pendingTransferProductIds.has(p.productId);
      default:
        return true;
    }
  });
}

export function countByCatalogueFilter(
  products: Product[],
  manufacturerUserId: number,
  pendingTransferProductIds: Set<string>,
): Record<ManufacturerCatalogueFilter, number> {
  const filters: ManufacturerCatalogueFilter[] = [
    'all',
    'in_custody',
    'at_distributor',
    'at_retailer',
    'missing_metadata',
    'expiring_soon',
    'pending_transfer',
  ];
  const counts = {} as Record<ManufacturerCatalogueFilter, number>;
  for (const f of filters) {
    counts[f] =
      f === 'all'
        ? products.length
        : filterManufacturerCatalogue(products, f, {
            manufacturerUserId,
            pendingTransferProductIds,
          }).length;
  }
  return counts;
}
