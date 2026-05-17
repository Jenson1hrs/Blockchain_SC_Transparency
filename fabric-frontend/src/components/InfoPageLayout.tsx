import { Link, useNavigate } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Footer } from './Footer';
import { VERICHAIN_NAME } from '../constants/branding';
import { homePathForUser } from '../utils/roleNavigation';

type InfoPageLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const NAV_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/faq', label: 'FAQ' },
  { to: '/verify', label: 'Verify' },
] as const;

export function InfoPageLayout({ title, subtitle, children }: InfoPageLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const homePath = homePathForUser(user);

  useEffect(() => {
    document.title = `${title} | ${VERICHAIN_NAME}`;
    return () => {
      document.title = VERICHAIN_NAME;
    };
  }, [title]);

  return (
    <div className="app-bg min-h-screen px-4 py-8 sm:px-5">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl dark:bg-primary-600/10" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-indigo-200/15 blur-3xl dark:bg-indigo-900/10" />
      </div>

      <div className="mx-auto max-w-4xl animate-fade-up">
        <header
          className={clsx(
            'sticky top-0 z-50 mb-8 rounded-xl border border-primary-200/50 bg-white/95 px-3 py-2.5 shadow-md shadow-primary-500/[0.06]',
            'backdrop-blur-xl dark:border-neutral-500/50 dark:bg-neutral-900/95 dark:shadow-lg dark:shadow-black/25',
            'sm:px-4',
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200/90 bg-white px-2.5 py-1.5 text-xs font-medium text-page-body motion-safe:transition-colors hover:border-primary-300 hover:text-primary-700 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-primary-500 dark:hover:text-primary-300 sm:text-sm"
              >
                <span aria-hidden>←</span>
                Back
              </button>
              <Link
                to={homePath}
                className="inline-flex items-center gap-1 rounded-lg border border-primary-200/80 bg-primary-50 px-2.5 py-1.5 text-xs font-medium text-primary-800 motion-safe:transition-colors hover:bg-primary-100 dark:border-primary-700/60 dark:bg-primary-950/40 dark:text-primary-200 dark:hover:bg-primary-950/70 sm:text-sm"
              >
                <span aria-hidden>⌂</span>
                {user ? 'Dashboard' : 'Home'}
              </Link>
              <Link
                to={homePath}
                className="flex items-center gap-2 text-base font-semibold tracking-tight text-primary-700 dark:text-primary-300 sm:text-lg"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-xs font-bold text-white shadow-md sm:h-9 sm:w-9 sm:text-sm">
                  VC
                </span>
                <span className="hidden sm:inline">{VERICHAIN_NAME}</span>
              </Link>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm sm:gap-3">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-md px-2 py-1 text-page-muted motion-safe:transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/40 dark:hover:text-primary-400"
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <Link
                  to="/profile"
                  className="rounded-md px-2 py-1 text-page-muted motion-safe:transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/40 dark:hover:text-primary-400"
                >
                  Profile
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="rounded-md px-2 py-1 text-page-muted motion-safe:transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/40 dark:hover:text-primary-400"
                >
                  Sign in
                </Link>
              )}
              <ThemeToggle compact />
            </nav>
          </div>
        </header>

        <div className="mb-10 overflow-hidden rounded-2xl border border-primary-200/40 bg-gradient-to-br from-white via-primary-50/40 to-indigo-50/30 p-8 shadow-soft dark:border-primary-800/30 dark:from-neutral-900 dark:via-primary-950/25 dark:to-neutral-900">
          <h1 className="text-3xl font-bold tracking-tight text-page-title md:text-4xl">{title}</h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-page-body">{subtitle}</p>
          ) : null}
        </div>

        <div className="space-y-8">{children}</div>

        <Footer user={user} className="mt-12" />
      </div>
    </div>
  );
}
