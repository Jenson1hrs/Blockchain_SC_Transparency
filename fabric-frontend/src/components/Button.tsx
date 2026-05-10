import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { clsx } from 'clsx';

type SharedButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export type ButtonProps =
  | (SharedButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: never })
  | (SharedButtonProps & LinkProps & { as: typeof Link });

function buildClassName(
  variant: NonNullable<SharedButtonProps['variant']>,
  size: NonNullable<SharedButtonProps['size']>,
  className?: string
) {
  return clsx(
    'inline-flex items-center justify-center font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200',
    {
      'btn-primary': variant === 'primary',
      'btn-secondary': variant === 'secondary',
      'btn-ghost': variant === 'ghost',
    },
    {
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2 text-sm': size === 'md',
      'px-6 py-3 text-base': size === 'lg',
    },
    className
  );
}

export const Button: React.FC<ButtonProps> = (props) => {
  const {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    className,
  } = props;

  const activeLoading = loading || isLoading;
  const buttonClass = buildClassName(variant, size, className);

  const content = (
    <>
      {activeLoading && (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText || children}</span>
        </>
      )}
      {!activeLoading && (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </>
  );

  if ('as' in props && props.as === Link) {
    const {
      as: _a,
      variant: _v,
      size: _s,
      isLoading: _i,
      loading: _l,
      loadingText: _t,
      leftIcon: _li,
      rightIcon: _ri,
      className: _c,
      children: _ch,
      ...linkProps
    } = props;
    return (
      <Link
        className={clsx(buttonClass, activeLoading && 'pointer-events-none opacity-50')}
        aria-busy={activeLoading}
        aria-disabled={activeLoading}
        onClick={activeLoading ? (e) => e.preventDefault() : linkProps.onClick}
        {...linkProps}
      >
        {content}
      </Link>
    );
  }

  const {
    variant: _v,
    size: _s,
    isLoading: _i,
    loading: _l,
    loadingText: _t,
    leftIcon: _li,
    rightIcon: _ri,
    children: _ch,
    className: _c,
    disabled,
    type,
    ...buttonAttrs
  } = props as SharedButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      type={type ?? 'button'}
      className={buttonClass}
      disabled={disabled || activeLoading}
      {...buttonAttrs}
    >
      {content}
    </button>
  );
};
