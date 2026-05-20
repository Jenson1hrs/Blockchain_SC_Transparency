import type { UserRole } from '../types';

const ALL_ROLES: UserRole[] = [
  'admin',
  'manufacturer',
  'distributor',
  'retailer',
  'consumer',
  'regulator',
];

/** Path prefix → roles allowed (mirrors App.tsx ProtectedRoute rules). */
const ROUTE_ROLE_RULES: { prefix: string; roles: UserRole[] }[] = [
  { prefix: '/home', roles: ALL_ROLES },
  { prefix: '/profile', roles: ALL_ROLES },
  { prefix: '/notifications', roles: ALL_ROLES },
  { prefix: '/admin/users', roles: ['admin'] },
  { prefix: '/admin/system', roles: ['admin'] },
  { prefix: '/regulator/organizations', roles: ['regulator'] },
  { prefix: '/regulator/products', roles: ['regulator'] },
  { prefix: '/regulator/transparency', roles: ['regulator'] },
  { prefix: '/my-products', roles: ['manufacturer'] },
  { prefix: '/manufacturer/complaints', roles: ['manufacturer'] },
  { prefix: '/assigned-products', roles: ['distributor', 'retailer'] },
  { prefix: '/inventory', roles: ['consumer'] },
  { prefix: '/my-reports', roles: ALL_ROLES },
  { prefix: '/create', roles: ['admin', 'manufacturer'] },
  { prefix: '/transfer', roles: ['admin', 'manufacturer', 'distributor', 'retailer'] },
  { prefix: '/location', roles: ['admin', 'distributor', 'retailer'] },
  {
    prefix: '/expiring',
    roles: ['admin', 'manufacturer', 'distributor', 'retailer', 'consumer', 'regulator'],
  },
];

const PUBLIC_PREFIXES = [
  '/',
  '/verify',
  '/verify-product',
  '/login',
  '/register',
  '/about',
  '/how-it-works',
  '/faq',
  '/contact',
  '/feedback',
  '/qr/',
  '/verify/',
  '/organization/',
];

function normalizePath(path: string): string {
  const base = path.split('?')[0].split('#')[0] || '/';
  if (base.length > 1 && base.endsWith('/')) return base.slice(0, -1);
  return base;
}

export function isPathAllowedForRole(path: string, role: UserRole): boolean {
  const normalized = normalizePath(path);
  if (PUBLIC_PREFIXES.some((p) => normalized === p || normalized.startsWith(p))) {
    return true;
  }
  for (const rule of ROUTE_ROLE_RULES) {
    if (normalized === rule.prefix || normalized.startsWith(`${rule.prefix}/`)) {
      return rule.roles.includes(role);
    }
  }
  return false;
}

/** Safe post-login destination when a bookmarked path is not allowed for this role. */
export function resolvePostLoginPath(from: string | undefined, role: UserRole): string {
  const raw = from?.trim() || '/';
  if (
    !raw ||
    raw === '/' ||
    raw === '/login' ||
    raw === '/register'
  ) {
    return '/home';
  }
  if (isPathAllowedForRole(raw, role)) {
    return raw;
  }
  return '/home';
}
