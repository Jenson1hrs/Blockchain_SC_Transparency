import { SUPPLY_CHAIN_STATUSES } from '../constants/supplyChainStatuses';
import type { Product, ProductTimelineEntry } from '../types';
import { getExpiryReminder } from './expiryReminder';
import { isQrReady, normalizeOwnerRole } from './manufacturerProductInsights';

export type ConsumerTrustPathLevel = 'complete' | 'partial' | 'needs_attention' | 'unclear';

export interface ConsumerTrustPathResult {
  level: ConsumerTrustPathLevel;
  title: string;
  message: string;
}

export type ManufacturerJourneyBadgeId =
  | 'in_manufacturer_custody'
  | 'with_distributor'
  | 'received_by_retailer'
  | 'retail_ready'
  | 'pending_transfer'
  | 'needs_action'
  | 'journey_unclear';

export interface ManufacturerJourneyBadge {
  id: ManufacturerJourneyBadgeId;
}

export interface ManufacturerJourneyOptions {
  manufacturerUserId: number;
  pendingTransferProductIds?: Set<string>;
}

function norm(value: string | null | undefined): string {
  return String(value ?? '').trim().toLowerCase();
}

function timelineHasManufacturerRegistration(history: ProductTimelineEntry[]): boolean {
  return history.some((e) => {
    const label = norm(e.label);
    const status = norm(e.status);
    return label === 'product created' || status === norm(SUPPLY_CHAIN_STATUSES.MANUFACTURED);
  });
}

function timelineHasRetailerReceipt(history: ProductTimelineEntry[]): boolean {
  return history.some((e) => {
    const label = norm(e.label);
    const status = norm(e.status);
    return (
      label === norm(SUPPLY_CHAIN_STATUSES.RECEIVED_RETAILER) ||
      status === norm(SUPPLY_CHAIN_STATUSES.RECEIVED_RETAILER) ||
      status === norm(SUPPLY_CHAIN_STATUSES.RETAIL_READY)
    );
  });
}

function timelineHasRejectedTransfer(history: ProductTimelineEntry[]): boolean {
  return history.some((e) => {
    const label = norm(e.label);
    const status = norm(e.status);
    return label === 'transfer rejected' || status === 'transfer rejected';
  });
}

function isProductRegistered(product: Product, history: ProductTimelineEntry[]): boolean {
  if (product.manufacturerUserId != null) return true;
  if (product.manufacturer?.trim()) return true;
  if (timelineHasManufacturerRegistration(history)) return true;
  if (history.length > 0) return true;
  return Boolean(product.productId?.trim() && product.name?.trim());
}

function hasRetailerCustody(product: Product, history: ProductTimelineEntry[]): boolean {
  const role = normalizeOwnerRole(product.currentOwnerRole);
  if (role === 'retailer') return true;
  const status = norm(product.status);
  if (
    status === norm(SUPPLY_CHAIN_STATUSES.RECEIVED_RETAILER) ||
    status === norm(SUPPLY_CHAIN_STATUSES.RETAIL_READY)
  ) {
    return true;
  }
  return timelineHasRetailerReceipt(history);
}

function hasCustodyHolder(product: Product): boolean {
  if (normalizeOwnerRole(product.currentOwnerRole)) return true;
  if (product.currentOwnerName?.trim()) return true;
  if (product.owner?.trim()) return true;
  return false;
}

/** Conflicting or incomplete custody signals — prefer neutral / attention over guessing. */
export function hasTrustPathAnomaly(
  product: Product,
  history: ProductTimelineEntry[],
): boolean {
  const role = normalizeOwnerRole(product.currentOwnerRole);
  const status = norm(product.status);

  if (!hasCustodyHolder(product) && history.length === 0) return true;
  if (timelineHasRejectedTransfer(history)) return true;

  if (role === 'retailer' && status === norm(SUPPLY_CHAIN_STATUSES.RECEIVED_DISTRIBUTOR)) {
    return true;
  }
  if (role === 'distributor' && status === norm(SUPPLY_CHAIN_STATUSES.RECEIVED_RETAILER)) {
    return true;
  }
  if (role === 'distributor' && status === norm(SUPPLY_CHAIN_STATUSES.RETAIL_READY)) {
    return true;
  }
  if (role === 'manufacturer' && status === norm(SUPPLY_CHAIN_STATUSES.RECEIVED_RETAILER)) {
    return true;
  }
  if (role === 'manufacturer' && status === norm(SUPPLY_CHAIN_STATUSES.RETAIL_READY)) {
    return true;
  }
  if (status === norm(SUPPLY_CHAIN_STATUSES.IN_TRANSIT) && role === 'retailer') return true;
  if (status === norm(SUPPLY_CHAIN_STATUSES.TRANSFER_PENDING) && role === 'retailer') return true;

  if (
    timelineHasRetailerReceipt(history) &&
    role &&
    role !== 'retailer' &&
    status !== norm(SUPPLY_CHAIN_STATUSES.RETAIL_READY)
  ) {
    return true;
  }

  return false;
}

export function inferConsumerTrustPath(
  product: Product,
  history: ProductTimelineEntry[],
): ConsumerTrustPathResult {
  const registered = isProductRegistered(product, history);

  if (!registered) {
    return {
      level: 'unclear',
      title: 'Trust path unclear',
      message:
        'We could not confirm how this product was registered. Review the detailed timeline below or contact the brand.',
    };
  }

  if (hasTrustPathAnomaly(product, history)) {
    return {
      level: 'needs_attention',
      title: 'Needs attention',
      message:
        'This product record exists, but the latest custody information may require checking.',
    };
  }

  if (hasRetailerCustody(product, history)) {
    return {
      level: 'complete',
      title: 'Complete Trust Path',
      message:
        'This product was registered by the brand and reached retailer custody before consumer verification.',
    };
  }

  return {
    level: 'partial',
    title: 'Partial Trust Path',
    message:
      'This product is registered, but final retailer receipt has not been recorded yet.',
  };
}

function inferPrimaryCustodyBadge(
  product: Product,
  manufacturerUserId?: number,
): ManufacturerJourneyBadgeId {
  const role = normalizeOwnerRole(product.currentOwnerRole);
  const status = norm(product.status);

  if (status === norm(SUPPLY_CHAIN_STATUSES.RETAIL_READY)) {
    return 'retail_ready';
  }
  if (
    role === 'retailer' ||
    status === norm(SUPPLY_CHAIN_STATUSES.RECEIVED_RETAILER)
  ) {
    return 'received_by_retailer';
  }
  if (
    role === 'distributor' ||
    status === norm(SUPPLY_CHAIN_STATUSES.RECEIVED_DISTRIBUTOR)
  ) {
    return 'with_distributor';
  }
  if (
    manufacturerUserId != null &&
    product.currentOwnerUserId != null &&
    Number(product.currentOwnerUserId) === Number(manufacturerUserId)
  ) {
    return 'in_manufacturer_custody';
  }
  if (
    role === 'manufacturer' ||
    status === norm(SUPPLY_CHAIN_STATUSES.MANUFACTURED) ||
    status === norm(SUPPLY_CHAIN_STATUSES.TRANSFER_PENDING)
  ) {
    return 'in_manufacturer_custody';
  }
  if (status === norm(SUPPLY_CHAIN_STATUSES.IN_TRANSIT)) {
    return 'with_distributor';
  }
  return 'journey_unclear';
}

function productNeedsManufacturerAction(product: Product): boolean {
  if (product.metadataComplete === false) return true;
  if (!isQrReady(product)) return true;
  const reminder = getExpiryReminder(product.expiryDate);
  if (
    reminder &&
    (reminder.level === 'warning' ||
      reminder.level === 'urgent' ||
      reminder.level === 'expired')
  ) {
    return true;
  }
  return false;
}

export function inferManufacturerJourneyBadges(
  product: Product,
  options: ManufacturerJourneyOptions,
): ManufacturerJourneyBadge[] {
  const badges: ManufacturerJourneyBadge[] = [];
  const pending = options.pendingTransferProductIds ?? new Set<string>();

  if (pending.has(product.productId)) {
    badges.push({ id: 'pending_transfer' });
  }

  if (productNeedsManufacturerAction(product)) {
    badges.push({ id: 'needs_action' });
  }

  if (hasTrustPathAnomaly(product, [])) {
    if (!badges.some((b) => b.id === 'needs_action')) {
      badges.push({ id: 'needs_action' });
    }
    badges.push({ id: 'journey_unclear' });
    return badges;
  }

  const primary = inferPrimaryCustodyBadge(product, options.manufacturerUserId);
  if (primary === 'journey_unclear') {
    badges.push({ id: 'journey_unclear' });
  } else {
    badges.push({ id: primary });
  }

  return badges;
}

export function countManufacturerJourneyBadges(
  products: Product[],
  options: ManufacturerJourneyOptions,
): Record<ManufacturerJourneyBadgeId, number> {
  const counts: Record<ManufacturerJourneyBadgeId, number> = {
    in_manufacturer_custody: 0,
    with_distributor: 0,
    received_by_retailer: 0,
    retail_ready: 0,
    pending_transfer: 0,
    needs_action: 0,
    journey_unclear: 0,
  };

  for (const p of products) {
    const badges = inferManufacturerJourneyBadges(p, options);
    const seen = new Set<ManufacturerJourneyBadgeId>();
    for (const b of badges) {
      if (seen.has(b.id)) continue;
      seen.add(b.id);
      counts[b.id] += 1;
    }
  }

  return counts;
}
