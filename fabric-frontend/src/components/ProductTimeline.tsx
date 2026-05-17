import React from 'react';
import { ProductStatusBadge } from './ProductStatusBadge';
import type { ProductTimelineEntry } from '../types';

interface ProductTimelineProps {
  history: ProductTimelineEntry[];
  className?: string;
}

function formatTimestamp(timestamp: string) {
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return timestamp || '—';
  return d.toLocaleString();
}

function sourceBadge(source: ProductTimelineEntry['source']) {
  if (source === 'personal') {
    return (
      <span className="inline-flex items-center rounded-md bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-900 dark:bg-violet-950/50 dark:text-violet-200">
        Personal Inventory Event
      </span>
    );
  }
  if (source === 'workflow') {
    return (
      <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
        Off-chain Workflow
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-900 dark:bg-blue-950/50 dark:text-blue-200">
      On-chain Custody
    </span>
  );
}

export const ProductTimeline: React.FC<ProductTimelineProps> = ({ history, className }) => {
  return (
    <div className={`space-y-4 ${className || ''}`}>
      {history.map((entry, index) => (
        <div key={entry.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full border-2 border-white dark:border-neutral-800 shadow-sm ${
                entry.source === 'personal'
                  ? 'bg-violet-500'
                  : entry.source === 'workflow'
                    ? 'bg-amber-500'
                    : 'bg-primary-500'
              }`}
            />
            {index < history.length - 1 && (
              <div className="w-px flex-1 min-h-[3rem] bg-neutral-200 dark:bg-neutral-700 mt-2" />
            )}
          </div>

          <div className="flex-1 pb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {sourceBadge(entry.source)}
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {entry.label}
              </span>
              {entry.source === 'on-chain' &&
                entry.status && (
                  <ProductStatusBadge
                    status={entry.status}
                  />
                )}
              <span className="text-sm text-neutral-500 dark:text-neutral-300">
                {formatTimestamp(entry.timestamp)}
              </span>
            </div>

            {entry.location && (
              <p className="text-sm text-neutral-700 dark:text-neutral-200 mb-1">
                <span className="font-medium">Location:</span> {entry.location}
              </p>
            )}

            {entry.actor && (
              <p className="text-sm text-neutral-700 dark:text-neutral-200 mb-1">
                <span className="font-medium">Actor:</span> {entry.actor}
              </p>
            )}

            {entry.notes && (
              <p className="text-sm text-neutral-600 dark:text-neutral-200">{entry.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
