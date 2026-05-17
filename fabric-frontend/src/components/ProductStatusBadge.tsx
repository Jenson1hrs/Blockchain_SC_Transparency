import React from 'react';
import { clsx } from 'clsx';

interface ProductStatusBadgeProps {
  status: string;
  className?: string;
}

export const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({
  status,
  className,
}) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'manufactured':
        return {
          bg: 'bg-primary-100 dark:bg-primary-900/50',
          text: 'text-primary-800 dark:text-primary-200',
          label: 'Manufactured',
        };
      case 'in transit':
        return {
          bg: 'bg-warning-100 dark:bg-warning-900/40',
          text: 'text-warning-800 dark:text-warning-100',
          label: 'In Transit',
        };
      case 'transfer pending':
        return {
          bg: 'bg-amber-100 dark:bg-amber-900/40',
          text: 'text-amber-900 dark:text-amber-100',
          label: 'Transfer Pending',
        };
      case 'received by distributor':
        return {
          bg: 'bg-sky-100 dark:bg-sky-900/40',
          text: 'text-sky-900 dark:text-sky-100',
          label: 'Received by Distributor',
        };
      case 'received by retailer':
        return {
          bg: 'bg-indigo-100 dark:bg-indigo-900/40',
          text: 'text-indigo-900 dark:text-indigo-100',
          label: 'Received by Retailer',
        };
      case 'retail ready':
        return {
          bg: 'bg-success-100 dark:bg-success-900/40',
          text: 'text-success-800 dark:text-success-100',
          label: 'Retail Ready',
        };
      case 'delivered':
        return {
          bg: 'bg-success-100 dark:bg-success-900/40',
          text: 'text-success-800 dark:text-success-100',
          label: 'Delivered',
        };
      case 'verified':
        return {
          bg: 'bg-success-100 dark:bg-success-900/40',
          text: 'text-success-800 dark:text-success-100',
          label: 'Verified',
        };
      case 'expired':
        return {
          bg: 'bg-danger-100 dark:bg-danger-900/45',
          text: 'text-danger-800 dark:text-danger-100',
          label: 'Expired',
        };
      default:
        return {
          bg: 'bg-neutral-100 dark:bg-neutral-700',
          text: 'text-neutral-800 dark:text-neutral-100',
          label: status,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={clsx('badge', config.bg, config.text, className)}>
      {config.label}
    </span>
  );
};
