import type { ProductHistory } from '../types';

/** Chaincode history entries may omit top-level timestamp; use data.timestamp when needed. */
export function formatHistoryTimestamp(entry: ProductHistory): string {
  const s = entry.timestamp?.seconds;
  if (typeof s === 'number' && !Number.isNaN(s)) {
    return new Date(s * 1000).toLocaleString();
  }
  const dataTs = entry.data?.timestamp;
  if (dataTs) {
    const d = new Date(dataTs);
    if (!Number.isNaN(d.getTime())) return d.toLocaleString();
  }
  return '—';
}
