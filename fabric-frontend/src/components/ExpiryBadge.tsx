import React from 'react';
import { clsx } from 'clsx';

interface ExpiryBadgeProps {
  level: 'expired' | 'urgent' | 'warning' | 'safe';
  className?: string;
}

export const ExpiryBadge: React.FC<ExpiryBadgeProps> = ({
  level,
  className,
}) => {
  const badgeClass = clsx(
    'badge',
    {
      'badge-danger': level === 'expired',
      'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-100':
        level === 'urgent',
      'badge-warning': level === 'warning',
      'badge-success': level === 'safe',
    },
    className,
  );

  const label = {
    expired: 'Expired',
    urgent: 'Urgent',
    warning: 'Warning',
    safe: 'Safe',
  }[level];

  return <span className={badgeClass}>{label}</span>;
};
