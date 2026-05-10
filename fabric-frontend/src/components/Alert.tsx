import React from 'react';
import { clsx } from 'clsx';

interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  children,
  className,
}) => {
  const alertClass = clsx(
    'alert',
    {
      'alert-success': type === 'success',
      'alert-warning': type === 'warning',
      'alert-error': type === 'error',
      'alert-info': type === 'info',
    },
    className,
  );

  return (
    <div className={alertClass}>
      {title && <div className="font-medium mb-1">{title}</div>}
      <div>{children}</div>
    </div>
  );
};
