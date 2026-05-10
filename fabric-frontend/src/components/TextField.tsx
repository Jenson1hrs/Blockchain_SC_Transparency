import React from 'react';
import { clsx } from 'clsx';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const inputId = id || `field-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx('input-field', {
          'border-danger-300 focus:ring-danger-500 focus:border-danger-500':
            error,
        })}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};
