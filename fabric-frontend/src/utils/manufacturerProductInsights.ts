import type { Product } from '../types';
import type { DashboardTransferRequestSummary } from '../types';
import { getExpiryReminder } from './expiryReminder';

export function isQrReady(product: Pick<Product, 'productId' | 'batchNumber'>): boolean {
  return Boolean(product.productId?.trim() && product.batchNumber?.trim());
}

export function normalizeOwnerRole(role: string | null | undefined): string {
  return (role ?? '').trim().toLowerCase();
}

export function countProductsAtRole(
  products: Product[],
  role: 'distributor' | 'retailer' | 'manufacturer',
): number {
  const target = role.toLowerCase();
  return products.filter((p) => normalizeOwnerRole(p.currentOwnerRole) === target).length;
}

export function countProductsDownstream(products: Product[]): number {
  return products.filter((p) => {
    const r = normalizeOwnerRole(p.currentOwnerRole);
    return r === 'distributor' || r === 'retailer';
  }).length;
}

export function countNotQrReady(products: Product[]): number {
  return products.filter((p) => !isQrReady(p)).length;
}

export function countExpiringFromProducts(products: Product[]): number {
  return products.filter((p) => {
    const reminder = getExpiryReminder(p.expiryDate);
    if (!reminder) return false;
    return reminder.level === 'warning' || reminder.level === 'urgent' || reminder.level === 'expired';
  }).length;
}

export function pendingTransferProductIds(
  requests: DashboardTransferRequestSummary[],
): Set<string> {
  const ids = new Set<string>();
  for (const r of requests) {
    if (r.status === 'pending' && r.productId) ids.add(r.productId);
  }
  return ids;
}

export function metadataCompleteCount(total: number, missing: number): number {
  return Math.max(0, total - missing);
}
