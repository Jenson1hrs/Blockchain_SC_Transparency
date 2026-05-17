import type { ProductHistory, ProductTimelineEntry } from '../types';
import { formatHistoryTimestamp } from './historyTime';

function isUnifiedEntry(raw: Record<string, unknown>): boolean {
  return raw.source === 'on-chain' || raw.source === 'workflow';
}

/** Map API history response (unified timeline or legacy chain entries) to timeline UI rows. */
export function mapHistoryToTimeline(
  data: Array<Record<string, unknown> | ProductHistory>
): ProductTimelineEntry[] {
  if (!data?.length) return [];

  const first = data[0] as Record<string, unknown>;
  if (isUnifiedEntry(first)) {
    return (data as Record<string, unknown>[]).map((entry) => ({
      id: String(entry.id ?? entry.txId ?? Math.random()),
      source: entry.source as ProductTimelineEntry['source'],
      label: String(entry.label ?? entry.status ?? 'Event'),
      status: String(entry.status ?? ''),
      timestamp: String(entry.timestamp ?? ''),
      location: entry.location != null ? String(entry.location) : undefined,
      actor: entry.actor != null ? String(entry.actor) : undefined,
      notes: entry.notes != null ? String(entry.notes) : undefined,
      txId: entry.txId != null ? String(entry.txId) : undefined,
    }));
  }

  return (data as ProductHistory[]).map((entry, index) => ({
    id: entry.txId ? `chain-${entry.txId}` : `chain-legacy-${index}`,
    source: 'on-chain' as const,
    label:
      entry.data?.status === 'Manufactured'
        ? 'Product Created'
        : entry.data?.status === 'In Transit' || entry.data?.status === 'Delivered'
          ? 'Ownership Transferred'
          : 'Location Updated',
    status: entry.data?.status ?? 'Unknown',
    timestamp: formatHistoryTimestamp(entry),
    location: entry.data?.location,
    actor: entry.data?.owner,
    notes: entry.txId ? `On-chain transaction ${entry.txId.slice(0, 16)}…` : 'On-chain Event',
    txId: entry.txId,
  }));
}
