import React from 'react';
import { ProductStatusBadge } from './ProductStatusBadge';

interface TimelineEntry {
  timestamp: string;
  status: string;
  location?: string;
  notes?: string;
  actor?: string;
}

interface ProductTimelineProps {
  history: TimelineEntry[];
  className?: string;
}

export const ProductTimeline: React.FC<ProductTimelineProps> = ({
  history,
  className,
}) => {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {history.map((entry, index) => (
        <div key={index} className="flex gap-4">
          {/* Timeline indicator */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-primary-500 rounded-full border-2 border-white shadow-sm" />
            {index < history.length - 1 && (
              <div className="w-px h-16 bg-neutral-200 mt-2" />
            )}
          </div>

          {/* Timeline content */}
          <div className="flex-1 pb-8">
            <div className="flex items-center gap-3 mb-2">
              <ProductStatusBadge status={entry.status} />
              <span className="text-sm text-neutral-500">
                {formatTimestamp(entry.timestamp)}
              </span>
            </div>

            {entry.location && (
              <p className="text-sm text-neutral-700 mb-1">
                <span className="font-medium">Location:</span> {entry.location}
              </p>
            )}

            {entry.actor && (
              <p className="text-sm text-neutral-700 mb-1">
                <span className="font-medium">Actor:</span> {entry.actor}
              </p>
            )}

            {entry.notes && (
              <p className="text-sm text-neutral-600">{entry.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
