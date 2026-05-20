import type { ProductTimelineEntry } from '../types';

export type TimelineDisplay = {
  title: string;
  explanation: string | null;
  showStatusBadge: boolean;
  /** Show dedicated Actor: line (when not already covered by explanation). */
  showActorLine: boolean;
  /** Show notes line (e.g. on-chain tx id). */
  showNotesLine: boolean;
};

function norm(value: string | null | undefined): string {
  return String(value ?? '').trim().toLowerCase();
}

function isTxNotes(notes: string | undefined): boolean {
  if (!notes?.trim()) return false;
  return /on-chain transaction/i.test(notes);
}

function statusMatchesLabel(label: string, status: string): boolean {
  const l = norm(label);
  const s = norm(status);
  if (!l || !s) return false;
  if (l === s) return true;
  if (l === 'product created' && s === 'manufactured') return true;
  if (l === 'product manufactured' && s === 'manufactured') return true;
  if (l === 'ownership transferred' && s === 'in transit') return false;
  return false;
}

function resolveTitle(entry: ProductTimelineEntry): string {
  const label = entry.label?.trim() || '';
  const status = entry.status?.trim() || '';
  const l = norm(label);
  const s = norm(status);

  if (l === 'product created' || (l === 'ownership transferred' && s === 'manufactured') || s === 'manufactured') {
    return 'Product Manufactured';
  }
  if (l === 'received by distributor' || s === 'received by distributor') {
    return 'Received by Distributor';
  }
  if (l === 'received by retailer' || s === 'received by retailer') {
    return 'Received by Retailer';
  }
  if (l === 'retail ready' || s === 'retail ready') {
    return 'Retail Ready';
  }
  if (l === 'in transit' || (l === 'ownership transferred' && s === 'in transit')) {
    return 'In Transit';
  }
  if (l === 'transfer requested' || s === 'transfer requested') {
    return 'Transfer Request Sent';
  }
  if (l === 'transfer rejected' || s === 'transfer rejected') {
    return 'Transfer Rejected';
  }
  if (l === 'transfer accepted' || s === 'transfer accepted') {
    if (s === 'received by distributor' || l === 'received by distributor') {
      return 'Received by Distributor';
    }
    if (s === 'received by retailer' || l === 'received by retailer') {
      return 'Received by Retailer';
    }
    return 'Transfer Accepted';
  }
  if (l === 'location updated') {
    return 'Location Updated';
  }
  if (label) return label;
  if (status) return status;
  return 'Supply Chain Event';
}

function buildExplanation(entry: ProductTimelineEntry, title: string): string | null {
  const actor = entry.actor?.trim();
  const notes = entry.notes?.trim();
  const titleNorm = norm(title);

  if (entry.source === 'workflow') {
    if (titleNorm === 'transfer request sent') {
      if (notes?.toLowerCase().startsWith('to ')) return notes;
      return actor ? `Requested by ${actor}` : null;
    }
    if (titleNorm === 'received by distributor') {
      return actor
        ? `Custody accepted by ${actor}`
        : notes?.replace(/^Custody accepted from[^.]*\.\s*/i, '') || null;
    }
    if (titleNorm === 'received by retailer') {
      return actor
        ? `Final business custody received by ${actor}`
        : notes?.replace(/^Custody accepted from[^.]*\.\s*/i, '') || null;
    }
    if (titleNorm === 'transfer rejected') {
      return notes || (actor ? `Rejected by ${actor}` : null);
    }
    if (notes && !isTxNotes(notes)) return notes;
    return actor ? `Recorded by ${actor}` : null;
  }

  if (titleNorm === 'product manufactured') {
    return actor ? `Registered by ${actor}` : null;
  }
  if (titleNorm === 'received by distributor') {
    return actor ? `Custody accepted by ${actor}` : null;
  }
  if (titleNorm === 'received by retailer') {
    return actor ? `Final business custody received by ${actor}` : null;
  }
  if (titleNorm === 'retail ready') {
    if (entry.location?.trim()) {
      return `Store or shelf location recorded (${entry.location.trim()}).`;
    }
    return notes?.replace(/^Store or shelf location recorded[^.]*\.?\s*/i, '') ||
      'Store or shelf location recorded — available before consumer sale.';
  }
  if (titleNorm === 'location updated') {
    return entry.location?.trim()
      ? `Location set to ${entry.location.trim()}`
      : actor
        ? `Location update recorded by ${actor}`
        : null;
  }
  if (titleNorm === 'in transit') {
    return actor ? `Custody in transit — holder: ${actor}` : 'Custody movement recorded on chain.';
  }
  if (titleNorm === 'ownership transferred' || norm(entry.label) === 'ownership transferred') {
    return actor ? `Custody transferred to ${actor}` : null;
  }

  if (notes && !isTxNotes(notes)) return notes;
  return actor ? `Recorded by ${actor}` : null;
}

/** Display-only copy for timeline rows; does not change API or stored history. */
export function getTimelineDisplay(entry: ProductTimelineEntry): TimelineDisplay {
  const title = resolveTitle(entry);
  const explanation = buildExplanation(entry, title);
  const redundantStatus = statusMatchesLabel(entry.label, entry.status);
  const showStatusBadge =
    entry.source === 'on-chain' &&
    Boolean(entry.status?.trim()) &&
    !redundantStatus &&
    norm(entry.status) !== norm(title);

  const explanationUsesActor =
    Boolean(explanation) &&
    Boolean(entry.actor?.trim()) &&
    explanation!.toLowerCase().includes(entry.actor!.trim().toLowerCase());

  const notes = entry.notes?.trim();
  const notesInExplanation =
    Boolean(explanation) && Boolean(notes) && explanation === notes;

  return {
    title,
    explanation,
    showStatusBadge,
    showActorLine: Boolean(entry.actor?.trim()) && !explanationUsesActor,
    showNotesLine: Boolean(notes) && (isTxNotes(notes) || !notesInExplanation),
  };
}
