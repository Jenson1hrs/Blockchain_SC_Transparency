import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import type { AuthUser, UserRole } from '../types';

const APP_NAME = 'BlockSure';

const DESCRIPTION =
  'Blockchain-Based Anti-Counterfeit & Smart Inventory Management System';

const ROLE_TAGLINE: Record<UserRole, string> = {
  consumer: 'Helping consumers verify authenticity and manage smart inventory.',
  manufacturer: 'Secure product registration and QR traceability management.',
  distributor: 'Supply chain movement and ownership tracking.',
  retailer: 'Retail-level verification and inventory monitoring.',
  admin: 'System oversight, user management, and blockchain monitoring.',
  regulator: 'Regulatory oversight, organization verification, and compliance monitoring.',
};

type QuickLink = {
  id: string;
  to: string;
  label: string;
  visible: boolean;
};

function buildQuickLinks(role: UserRole | undefined): QuickLink[] {
  const authed = Boolean(role);
  const inventoryOk = role === 'admin' || role === 'consumer';

  return [
    { id: 'home', to: '/', label: 'Home', visible: true },
    { id: 'dashboard', to: '/home', label: 'Dashboard', visible: authed },
    { id: 'verify', to: '/verify', label: 'Verify Product', visible: true },
    {
      id: 'inventory',
      to: '/inventory',
      label: 'Inventory',
      visible: authed && inventoryOk,
    },
    {
      id: 'expiring',
      to: '/expiring',
      label: 'Expiring Soon',
      visible: authed && role !== 'manufacturer',
    },
    { id: 'profile', to: '/profile', label: 'Profile', visible: authed },
  ];
}

function isLinkActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/';
  if (to === '/verify') return pathname === '/verify' || pathname === '/verify-product';
  return pathname === to || pathname.startsWith(`${to}/`);
}

export interface FooterProps {
  user?: AuthUser | null;
  className?: string;
}

export function Footer({ user = null, className }: FooterProps) {
  const location = useLocation();
  const role = user?.role;
  const links = buildQuickLinks(role).filter((l) => l.visible);
  const { pathname } = location;

  return (
    <footer
      className={clsx('mt-12 border-t border-neutral-200/90 pt-8 dark:border-neutral-700/70', className)}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-gradient-to-b from-white/90 to-neutral-50/80 shadow-soft backdrop-blur-xl dark:border-neutral-600/45 dark:from-neutral-900/75 dark:to-neutral-950/80 dark:shadow-none">
        <div className="grid grid-cols-1 gap-8 px-5 py-7 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:py-8">
          {/* Brand */}
          <div className="min-w-0 space-y-2.5 lg:col-span-4">
            <p className="text-lg font-semibold tracking-tight text-page-title">{APP_NAME}</p>
            <p className="max-w-sm text-[13px] leading-relaxed text-page-body sm:text-sm">{DESCRIPTION}</p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col lg:col-span-5 lg:items-center lg:justify-center">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-page-muted lg:text-center">
              Quick links
            </p>
            <nav
              className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-1 sm:gap-y-2 lg:justify-center"
              aria-label="Footer quick links"
            >
              {links.map((item, i) => {
                const active = isLinkActive(pathname, item.to);
                return (
                  <span key={item.id} className="flex items-center sm:inline-flex">
                    {i > 0 && (
                      <span
                        className="mx-2 hidden h-3 w-px bg-neutral-300/90 sm:inline-block dark:bg-neutral-600/80"
                        aria-hidden
                      />
                    )}
                    <Link
                      to={item.to}
                      className={clsx(
                        'text-[13px] font-medium transition-colors sm:text-sm',
                        active
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-page-muted hover:text-primary-600 dark:hover:text-primary-400'
                      )}
                    >
                      {item.label}
                    </Link>
                  </span>
                );
              })}
            </nav>
          </div>

          {/* Academic */}
          <div className="min-w-0 border-t border-neutral-200/70 pt-6 lg:col-span-3 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0 dark:border-neutral-700/55">
            <p className="text-xs font-semibold uppercase tracking-wider text-page-muted">Academic</p>
            <p className="mt-2 text-sm font-medium text-page-title">Final Year Project</p>
            <p className="mt-1 text-sm text-page-body">Asia Pacific University (APU)</p>
          </div>
        </div>

        {role && (
          <div className="border-t border-neutral-200/60 bg-primary-50/40 px-5 py-3.5 dark:border-neutral-700/50 dark:bg-primary-950/25 sm:px-6">
            <p className="text-center text-sm leading-snug text-page-body lg:text-left" role="note">
              {ROLE_TAGLINE[role]}
            </p>
          </div>
        )}

        <div className="border-t border-neutral-200/80 bg-neutral-50/50 px-4 py-3 dark:border-neutral-700/60 dark:bg-neutral-950/40">
          <p className="text-center text-[11px] leading-relaxed text-page-muted sm:text-xs">
            © 2026 BlockSure. Secure Product Traceability Powered by Hyperledger Fabric.
          </p>
        </div>
      </div>
    </footer>
  );
}
