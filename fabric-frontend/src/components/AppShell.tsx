import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserInventory } from '../api/inventoryService';
import { useI18n } from '../context/I18nContext';
import { getToken } from '../utils/authStorage';
import type { UserRole } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { Footer } from './Footer';
import { NotificationBell } from './NotificationBell';
import { StickyNavToggle } from './StickyNavToggle';
import { homePathForUser } from '../utils/roleNavigation';
import { VERICHAIN_NAME } from '../constants/branding';

const APP_NAV_COLLAPSED_KEY = 'verichain-app-nav-collapsed';
const APP_NAV_ID = 'app-shell-nav';

function readAppNavCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(APP_NAV_COLLAPSED_KEY) === '1';
}

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

type NavItem = { to: string; labelKey: string; badgeInventory?: boolean };

function mainNavForRole(role: UserRole | null, authed: boolean): NavItem[] {
  if (!authed || !role) {
    return [
      { to: '/', labelKey: 'nav.home' },
      { to: '/verify', labelKey: 'nav.verify' },
    ];
  }
  if (role === 'admin') {
    return [
      { to: '/home', labelKey: 'nav.home' },
      { to: '/verify', labelKey: 'nav.verify' },
      { to: '/admin/users', labelKey: 'nav.users' },
      { to: '/admin/system', labelKey: 'nav.system' },
      { to: '/notifications', labelKey: 'nav.notifications' },
      { to: '/profile', labelKey: 'nav.profile' },
    ];
  }
  if (role === 'regulator') {
    return [
      { to: '/home', labelKey: 'nav.home' },
      { to: '/verify', labelKey: 'nav.verify' },
      { to: '/regulator/organizations', labelKey: 'nav.regulatorOrgs' },
      { to: '/regulator/products', labelKey: 'nav.regulatorProducts' },
      { to: '/regulator/transparency', labelKey: 'nav.regulatorTransparency' },
      { to: '/notifications', labelKey: 'nav.notifications' },
      { to: '/profile', labelKey: 'nav.profile' },
    ];
  }
  if (role === 'manufacturer') {
    return [
      { to: '/home', labelKey: 'nav.home' },
      { to: '/create', labelKey: 'nav.create' },
      { to: '/my-products', labelKey: 'nav.myProducts' },
      { to: '/manufacturer/complaints', labelKey: 'nav.customerReports' },
      { to: '/transfer', labelKey: 'nav.requestTransfer' },
      { to: '/expiring', labelKey: 'nav.expiring' },
      { to: '/verify', labelKey: 'nav.verify' },
      { to: '/notifications', labelKey: 'nav.notifications' },
      { to: '/profile', labelKey: 'nav.profile' },
    ];
  }
  if (role === 'distributor') {
    return [
      { to: '/home', labelKey: 'nav.home' },
      { to: '/assigned-products', labelKey: 'nav.assignedProducts' },
      { to: '/transfer', labelKey: 'nav.transfers' },
      { to: '/location', labelKey: 'nav.location' },
      { to: '/verify', labelKey: 'nav.verify' },
      { to: '/expiring', labelKey: 'nav.expiring' },
      { to: '/notifications', labelKey: 'nav.notifications' },
      { to: '/profile', labelKey: 'nav.profile' },
    ];
  }
  if (role === 'retailer') {
    return [
      { to: '/home', labelKey: 'nav.home' },
      { to: '/assigned-products', labelKey: 'nav.retailStock' },
      { to: '/transfer', labelKey: 'nav.incomingTransfers' },
      { to: '/location', labelKey: 'nav.updateStoreLocation' },
      { to: '/verify', labelKey: 'nav.verify' },
      { to: '/expiring', labelKey: 'nav.expiring' },
      { to: '/notifications', labelKey: 'nav.notifications' },
      { to: '/profile', labelKey: 'nav.profile' },
    ];
  }
  /* consumer */
  return [
    { to: '/home', labelKey: 'nav.home' },
    { to: '/verify', labelKey: 'nav.verify' },
    { to: '/inventory', labelKey: 'nav.myInventory', badgeInventory: true },
    { to: '/my-reports', labelKey: 'nav.myProductReports' },
    { to: '/expiring', labelKey: 'nav.expiring' },
    { to: '/notifications', labelKey: 'nav.notifications' },
    { to: '/profile', labelKey: 'nav.profile' },
  ];
}

const navCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${
    isActive
      ? 'bg-primary-600 text-white shadow-sm dark:bg-primary-600'
      : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-800 dark:text-neutral-100 dark:hover:bg-neutral-800/90 dark:hover:text-white'
  }`;

const stickyBarClass =
  'sticky top-0 z-50 mb-6 rounded-xl border border-primary-200/50 bg-gradient-to-r from-white/90 via-white/90 to-primary-50/40 px-3 py-2.5 shadow-sm shadow-primary-500/[0.06] backdrop-blur-xl dark:border-neutral-500/50 dark:from-neutral-900/90 dark:via-neutral-900/90 dark:to-[#0c1528]/90 dark:shadow-lg dark:shadow-black/25 sm:px-4';

const AppShell = ({ title, subtitle, children }: AppShellProps) => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
  const [inventoryCount, setInventoryCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(readAppNavCollapsed);
  const homePath = homePathForUser(user);

  const toggleNav = () => {
    setNavCollapsed((prev) => {
      const next = !prev;
      sessionStorage.setItem(APP_NAV_COLLAPSED_KEY, next ? '1' : '0');
      return next;
    });
  };

  useEffect(() => {
    if (!user || user.role !== 'consumer') {
      setInventoryCount(0);
      return;
    }
    const refresh = () => {
      void (async () => {
        try {
          const items = await fetchUserInventory();
          setInventoryCount(items.length);
        } catch {
          setInventoryCount(0);
        }
      })();
    };
    refresh();
    window.addEventListener('inventory-updated', refresh);
    return () => window.removeEventListener('inventory-updated', refresh);
  }, [user]);

  const mainNav = useMemo(
    () => mainNavForRole(user?.role ?? null, Boolean(user)),
    [user]
  );

  const showGuestLinks = !loading && !user;
  const showAvatarSkeleton = loading && Boolean(getToken());

  const NavRow = () =>
    loading ? (
      <div
        className="h-9 min-w-[12rem] flex-1 rounded-lg bg-neutral-100/90 animate-pulse dark:bg-neutral-800"
        aria-hidden
      />
    ) : (
      <nav
        id={APP_NAV_ID}
        className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:gap-2"
        aria-label="Main"
      >
        {mainNav.map((item) => (
          <NavLink key={item.to} to={item.to} className={navCls}>
            {t(item.labelKey)}
            {item.badgeInventory && (
              <span className="ml-1.5 inline-flex min-w-5 justify-center rounded-full bg-black/10 px-1.5 text-[11px] dark:bg-white/15 dark:text-neutral-100">
                {inventoryCount}
              </span>
            )}
          </NavLink>
        ))}
        {showGuestLinks && (
          <>
            <NavLink to="/login" className={navCls}>
              {t('nav.login')}
            </NavLink>
            <NavLink to="/register" className={navCls}>
              {t('nav.register')}
            </NavLink>
          </>
        )}
      </nav>
    );

  const Controls = () =>
    loading ? (
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle compact />
        {showAvatarSkeleton ? (
          <div
            className="h-9 w-9 shrink-0 rounded-full bg-neutral-200/80 animate-pulse dark:bg-neutral-700"
            aria-hidden
          />
        ) : null}
      </div>
    ) : (
      <div className="flex shrink-0 items-center gap-2">
        <NotificationBell />
        <ThemeToggle compact />
        {user && (
          <div className="relative flex justify-end">
            <button
              type="button"
              onClick={() => setMenuOpen((s) => !s)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              aria-label="Account menu"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-[60] mt-2 w-56 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-500/60 dark:bg-neutral-900">
                <div className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-700">
                  <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-50">{user.name}</p>
                  <p className="text-xs capitalize text-neutral-500 dark:text-neutral-300">{user.role}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  {t('shell.profileSettings')}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    navigate('/login', { replace: true });
                  }}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  {t('shell.logout')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );

  return (
    <div className="app-bg min-h-screen px-4 py-8 sm:px-5">
      <div className="mx-auto max-w-5xl animate-fade-up">
        <div className="mb-5 md:mb-6">
          <h1 className="text-2xl font-bold leading-tight text-page-title md:text-3xl">{title}</h1>
          {subtitle ? (
            <p className="mt-1.5 min-h-[1.25rem] max-w-2xl text-sm text-page-muted">{subtitle}</p>
          ) : (
            <div className="mt-1 min-h-[1.25rem]" aria-hidden />
          )}
          {showGuestLinks && (
            <p className="mt-4 text-xs text-page-muted">
              <Link className="font-medium text-primary-600 hover:underline dark:text-primary-400" to="/login">
                {t('shell.signInLink')}
              </Link>{' '}
              {t('shell.signInBlurb')}
            </p>
          )}
        </div>

        <header className={stickyBarClass}>
          <div className="flex flex-nowrap items-center gap-2">
            <StickyNavToggle
              collapsed={navCollapsed}
              onToggle={toggleNav}
              controlsId={APP_NAV_ID}
            />
            <div className="min-w-0 flex-1">
              {navCollapsed ? (
                <Link
                  to={homePath}
                  className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-950/40"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-[10px] font-bold text-white">
                    VC
                  </span>
                  <span className="truncate max-w-[9rem] sm:max-w-none">{VERICHAIN_NAME}</span>
                </Link>
              ) : (
                <NavRow />
              )}
            </div>
            <Controls />
          </div>
          {navCollapsed && (
            <p className="mt-2 border-t border-neutral-200/60 pt-2 text-center text-[11px] text-page-muted dark:border-neutral-600/60">
              Tap the <span className="font-medium text-primary-700 dark:text-primary-300">arrow</span>{' '}
              to show navigation
            </p>
          )}
        </header>

        {children}
        <Footer user={user} />
      </div>
    </div>
  );
};

export default AppShell;
