import type { ProductHistory } from '../types';

/**
 * Human-readable lifecycle label for each history entry.
 * Assumes history is oldest -> newest.
 */
export function getHistoryEventLabel(
  history: ProductHistory[],
  index: number
): string {
  const current = history[index]?.data;
  const prev = index > 0 ? history[index - 1]?.data : undefined;
  if (!current) return 'Update';
  if (!prev) return 'Product Created';
  if (current.owner !== prev.owner) return 'Ownership Transferred';
  if (current.location !== prev.location) return 'Location Updated';
  if (current.status !== prev.status) return 'Status Updated';
  return 'Product Updated';
}
