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
          bg: 'bg-primary-100',
          text: 'text-primary-800',
          label: 'Manufactured',
        };
      case 'in transit':
        return {
          bg: 'bg-warning-100',
          text: 'text-warning-800',
          label: 'In Transit',
        };
      case 'delivered':
        return {
          bg: 'bg-success-100',
          text: 'text-success-800',
          label: 'Delivered',
        };
      case 'verified':
        return {
          bg: 'bg-success-100',
          text: 'text-success-800',
          label: 'Verified',
        };
      case 'expired':
        return {
          bg: 'bg-danger-100',
          text: 'text-danger-800',
          label: 'Expired',
        };
      default:
        return {
          bg: 'bg-neutral-100',
          text: 'text-neutral-800',
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
