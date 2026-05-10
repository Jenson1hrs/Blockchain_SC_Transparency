import { NavLink, Link } from 'react-router-dom';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserInventory } from '../api/inventoryService';
import { useI18n } from '../context/I18nContext';
import { getToken } from '../utils/authStorage';
import type { UserRole } from '../types';

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
      { to: '/profile', labelKey: 'nav.profile' },
    ];
  }
  if (role === 'manufacturer') {
    return [
      { to: '/home', labelKey: 'nav.home' },
      { to: '/verify', labelKey: 'nav.verify' },
      { to: '/create', labelKey: 'nav.create' },
      { to: '/expiring', labelKey: 'nav.expiring' },
      { to: '/profile', labelKey: 'nav.profile' },
    ];
  }
  if (role === 'distributor' || role === 'retailer') {
    return [
      { to: '/home', labelKey: 'nav.home' },
      { to: '/verify', labelKey: 'nav.verify' },
      { to: '/transfer', labelKey: 'nav.transfer' },
      { to: '/location', labelKey: 'nav.location' },
      { to: '/expiring', labelKey: 'nav.expiring' },
      { to: '/profile', labelKey: 'nav.profile' },
    ];
  }
  /* consumer */
  return [
    { to: '/home', labelKey: 'nav.home' },
    { to: '/verify', labelKey: 'nav.verify' },
    { to: '/expiring', labelKey: 'nav.expiring' },
    { to: '/inventory', labelKey: 'nav.inventory', badgeInventory: true },
    { to: '/profile', labelKey: 'nav.profile' },
  ];
}

const navCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${
    isActive
      ? 'bg-blue-600 text-white shadow-sm'
      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
  }`;

const AppShell = ({ title, subtitle, children }: AppShellProps) => {
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
  const [inventoryCount, setInventoryCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
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

  return (
    <div className="app-bg min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto animate-fade-up">
        <header className="card p-5 md:p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div className="min-w-0 flex-1 min-h-[3rem]">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{title}</h1>
              {subtitle ? (
                <p className="text-sm text-gray-600 mt-1 max-w-2xl min-h-[1.25rem]">{subtitle}</p>
              ) : (
                <div className="mt-1 min-h-[1.25rem]" aria-hidden />
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0 w-full sm:w-auto sm:max-w-[min(100%,28rem)] min-h-[4.5rem]">
              {loading ? (
                <>
                  <div
                    className={`flex w-full justify-end ${showAvatarSkeleton ? 'min-h-10' : 'min-h-0'}`}
                  >
                    {showAvatarSkeleton && (
                      <div
                        className="h-10 w-10 rounded-full bg-neutral-200/80 animate-pulse"
                        aria-hidden
                      />
                    )}
                  </div>
                  <div
                    className="h-9 w-full min-w-[12rem] rounded-lg bg-neutral-100/90 animate-pulse"
                    aria-hidden
                  />
                </>
              ) : (
                <>
                  {user && (
                    <div className="relative flex justify-end w-full min-h-10">
                      <button
                        type="button"
                        onClick={() => setMenuOpen((s) => !s)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black text-white hover:bg-gray-800 shadow-sm shrink-0"
                        aria-label="Account menu"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                          <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
                        </svg>
                      </button>
                      {menuOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg p-1 z-20">
                          <div className="px-3 py-2 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                          </div>
                          <Link
                            to="/profile"
                            onClick={() => setMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {t('shell.profileSettings')}
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setMenuOpen(false);
                              logout();
                            }}
                            className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {t('shell.logout')}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <nav className="flex flex-wrap gap-2 justify-end min-h-[2.25rem] items-center">
                    {mainNav.map((item) => (
                      <NavLink key={item.to} to={item.to} className={navCls}>
                        {t(item.labelKey)}
                        {item.badgeInventory && (
                          <span className="ml-1.5 inline-flex min-w-5 justify-center rounded-full bg-black/10 px-1.5 text-[11px]">
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
                </>
              )}
            </div>
          </div>
          {showGuestLinks && (
            <p className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
              <Link className="text-blue-600 hover:underline font-medium" to="/login">
                {t('shell.signInLink')}
              </Link>{' '}
              {t('shell.signInBlurb')}
            </p>
          )}
        </header>
        {children}
      </div>
    </div>
  );
};

export default AppShell;
