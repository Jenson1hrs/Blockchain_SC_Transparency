import { NavLink, Link } from 'react-router-dom';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { getInventoryIds } from '../utils/inventoryStorage';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

type NavItem = { to: string; label: string; badgeInventory?: boolean };

function mainNavForRole(role: UserRole | null, authed: boolean): NavItem[] {
  if (!authed || !role) {
    return [
      { to: '/', label: 'Home' },
      { to: '/verify', label: 'Verify' },
    ];
  }
  if (role === 'admin') {
    return [
      { to: '/dashboard', label: 'Home' },
      { to: '/verify', label: 'Verify' },
      { to: '/create', label: 'Create' },
      { to: '/transfer', label: 'Transfer' },
      { to: '/location', label: 'Location' },
      { to: '/expiring', label: 'Expiring Soon' },
      { to: '/inventory', label: 'Inventory', badgeInventory: true },
      { to: '/profile', label: 'Profile' },
    ];
  }
  if (role === 'manufacturer') {
    return [
      { to: '/dashboard', label: 'Home' },
      { to: '/verify', label: 'Verify' },
      { to: '/create', label: 'Create' },
      { to: '/expiring', label: 'Expiring Soon' },
      { to: '/profile', label: 'Profile' },
    ];
  }
  if (role === 'distributor' || role === 'retailer') {
    return [
      { to: '/dashboard', label: 'Home' },
      { to: '/verify', label: 'Verify' },
      { to: '/transfer', label: 'Transfer' },
      { to: '/location', label: 'Location' },
      { to: '/expiring', label: 'Expiring Soon' },
      { to: '/profile', label: 'Profile' },
    ];
  }
  /* consumer */
  return [
    { to: '/dashboard', label: 'Home' },
    { to: '/verify', label: 'Verify' },
    { to: '/expiring', label: 'Expiring Soon' },
    { to: '/inventory', label: 'Inventory', badgeInventory: true },
    { to: '/profile', label: 'Profile' },
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
  const [inventoryCount, setInventoryCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setInventoryCount(getInventoryIds().length);
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('inventory-updated', refresh as EventListener);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('inventory-updated', refresh as EventListener);
    };
  }, []);

  const mainNav = useMemo(
    () => mainNavForRole(user?.role ?? null, Boolean(user)),
    [user]
  );

  const showGuestLinks = !loading && !user;

  return (
    <div className="app-bg min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto animate-fade-up">
        <header className="card p-5 md:p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{title}</h1>
              {subtitle && <p className="text-sm text-gray-600 mt-1 max-w-2xl">{subtitle}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              {!loading && user && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((s) => !s)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black text-white hover:bg-gray-800 shadow-sm"
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
                        Profile / Settings
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
              <nav className="flex flex-wrap gap-2 justify-end">
                {mainNav.map((item) => (
                  <NavLink key={item.to} to={item.to} className={navCls}>
                    {item.label}
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
                      Login
                    </NavLink>
                    <NavLink to="/register" className={navCls}>
                      Register
                    </NavLink>
                  </>
                )}
              </nav>
            </div>
          </div>
          {showGuestLinks && (
            <p className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
              <Link className="text-blue-600 hover:underline font-medium" to="/login">
                Sign in
              </Link>{' '}
              to access supply-chain tools or your inventory (role-based).
            </p>
          )}
        </header>
        {children}
      </div>
    </div>
  );
};

export default AppShell;
