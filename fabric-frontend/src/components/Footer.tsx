import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import type { AuthUser, UserRole } from '../types';
import {
  VERICHAIN_NAME,
  VERICHAIN_TAGLINE,
  VERICHAIN_DESCRIPTION,
  VERICHAIN_COPYRIGHT,
} from '../constants/branding';

const PLATFORM_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/faq', label: 'FAQ' },
];

const SUPPORT_LINKS = [
  { to: '/contact', label: 'Contact' },
  { to: '/feedback', label: 'Feedback' },
];

type QuickLink = { id: string; to: string; label: string; visible: boolean };

function buildQuickLinks(role: UserRole | undefined, authed: boolean): QuickLink[] {
  return [
    { id: 'home', to: '/', label: 'Home', visible: true },
    { id: 'dashboard', to: '/home', label: 'Dashboard', visible: authed },
    { id: 'verify', to: '/verify', label: 'Verify Product', visible: true },
    { id: 'notifications', to: '/notifications', label: 'Notifications', visible: authed },
    { id: 'profile', to: '/profile', label: 'Profile', visible: authed },
    {
      id: 'inventory',
      to: '/inventory',
      label: 'My Inventory',
      visible: authed && role === 'consumer',
    },
    {
      id: 'expiring',
      to: '/expiring',
      label: 'Expiring Soon',
      visible:
        authed &&
        role != null &&
        ['consumer', 'distributor', 'retailer', 'admin', 'regulator'].includes(role),
    },
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
  variant?: 'default' | 'landing';
}

export function Footer({ user = null, className, variant = 'default' }: FooterProps) {
  const { pathname } = useLocation();
  const isLanding = variant === 'landing';
  const role = user?.role;
  const authed = Boolean(user);
  const quickLinks = buildQuickLinks(role, authed).filter((l) => l.visible);

  const linkClass = (to: string) =>
    clsx(
      'text-[13px] font-medium transition-colors sm:text-sm',
      isLinkActive(pathname, to)
        ? isLanding
          ? 'text-primary-300'
          : 'text-primary-600 dark:text-primary-400'
        : isLanding
          ? 'text-slate-400 hover:text-white'
          : 'text-page-muted hover:text-primary-600 dark:hover:text-primary-400',
    );

  const shellClass = isLanding
    ? 'border-t border-slate-800 bg-slate-950/80'
    : 'overflow-hidden rounded-2xl border border-neutral-200/70 bg-gradient-to-b from-white/90 to-neutral-50/80 shadow-soft backdrop-blur-xl dark:border-neutral-600/45 dark:from-neutral-900/75 dark:to-neutral-950/80 dark:shadow-none';

  const titleClass = isLanding ? 'text-slate-100' : 'text-page-title';
  const bodyClass = isLanding ? 'text-slate-400' : 'text-page-body';
  const sectionLabelClass = isLanding
    ? 'text-xs font-semibold uppercase tracking-wider text-slate-300'
    : 'text-[10px] font-semibold uppercase tracking-[0.2em] text-page-muted';

  const linkCol = (title: string, aria: string, links: { to: string; label: string }[]) => (
    <div>
      <p className={sectionLabelClass}>{title}</p>
      <nav className="mt-3 flex flex-col gap-2" aria-label={aria}>
        {links.map((item) => (
          <Link key={item.to} to={item.to} className={linkClass(item.to)}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <footer
      className={clsx(
        isLanding ? 'mt-12' : 'mt-10 border-t border-neutral-200/90 pt-6 dark:border-neutral-700/70',
        className,
      )}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className={shellClass}>
        <div className="grid grid-cols-1 gap-8 px-5 py-6 sm:px-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6 lg:py-7">
          <div className="min-w-0 space-y-3 lg:col-span-4">
            <p className={clsx('text-lg font-semibold tracking-tight', titleClass)}>{VERICHAIN_NAME}</p>
            <p
              className={clsx(
                'text-sm font-medium',
                isLanding ? 'text-slate-300' : 'text-primary-700 dark:text-primary-300',
              )}
            >
              {VERICHAIN_TAGLINE}
            </p>
            <p className={clsx('max-w-md text-[13px] leading-relaxed sm:text-sm', bodyClass)}>
              {VERICHAIN_DESCRIPTION}
            </p>
          </div>

          <div className="lg:col-span-2">{linkCol('Platform', 'Platform links', PLATFORM_LINKS)}</div>
          <div className="lg:col-span-2">{linkCol('Support', 'Support links', SUPPORT_LINKS)}</div>
          <div className="lg:col-span-4">
            <p className={sectionLabelClass}>Quick Links</p>
            <nav className="mt-3 flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-x-4" aria-label="Quick links">
              {quickLinks.map((item) => (
                <Link key={item.id} to={item.to} className={linkClass(item.to)}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div
          className={clsx(
            'border-t px-4 py-4 text-center sm:px-6',
            isLanding
              ? 'border-slate-800'
              : 'border-neutral-200/80 bg-neutral-50/50 dark:border-neutral-700/60 dark:bg-neutral-950/40',
          )}
        >
          <p className={clsx('text-[11px] leading-relaxed sm:text-xs', bodyClass)}>{VERICHAIN_COPYRIGHT}</p>
        </div>
      </div>
    </footer>
  );
}
