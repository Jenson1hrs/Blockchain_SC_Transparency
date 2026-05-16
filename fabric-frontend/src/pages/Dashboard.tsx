import { Link, useLocation } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { DashboardAnalytics } from '../components/DashboardAnalytics';
import { useAuth } from '../context/AuthContext';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { Button, Alert } from '../components';
import { DASHBOARD_ROLE_HEADING, ROLE_LABEL_PROFESSIONAL } from '../constants/dashboardRoleCopy';
import type { UserRole } from '../types';

type ActionCard = {
  title: string;
  description: string;
  to: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'neutral';
};

function cardsFor(role: UserRole | null): ActionCard[] {
  if (!role) {
    return [
      {
        title: 'Verify Product',
        description: 'Scan or verify product authenticity.',
        to: '/verify',
        icon: '✅',
        color: 'primary',
      },
      {
        title: 'Login',
        description: 'Sign in to access role-based features.',
        to: '/login',
        icon: '🔐',
        color: 'neutral',
      },
      {
        title: 'Register',
        description: 'Create an application account.',
        to: '/register',
        icon: '👤',
        color: 'neutral',
      },
    ];
  }
  if (role === 'admin') {
    return [
      {
        title: 'Create Product',
        description: 'Register new products and generate QR.',
        to: '/create',
        icon: '➕',
        color: 'primary',
      },
      {
        title: 'Transfer Ownership',
        description: 'Update owner in supply chain.',
        to: '/transfer',
        icon: '↗️',
        color: 'warning',
      },
      {
        title: 'Update Location',
        description: 'Track product movement.',
        to: '/location',
        icon: '📍',
        color: 'warning',
      },
      {
        title: 'Expiring Soon',
        description: 'See products approaching expiry.',
        to: '/expiring',
        icon: '⏰',
        color: 'warning',
      },
      {
        title: 'Inventory',
        description: 'View saved inventory products.',
        to: '/inventory',
        icon: '📦',
        color: 'neutral',
      },
      {
        title: 'Verify Product',
        description: 'Verify authenticity and history.',
        to: '/verify',
        icon: '✅',
        color: 'success',
      },
    ];
  }
  if (role === 'manufacturer') {
    return [
      {
        title: 'Create Product',
        description: 'Register on the ledger and generate QR.',
        to: '/create',
        icon: '➕',
        color: 'primary',
      },
      {
        title: 'My Products',
        description: 'View your registered products and status.',
        to: '/my-products',
        icon: '📦',
        color: 'neutral',
      },
      {
        title: 'Verify & Trace',
        description: 'Authenticity, metadata, QR, and chain history.',
        to: '/verify',
        icon: '🔍',
        color: 'success',
      },
    ];
  }
  if (role === 'distributor') {
    return [
      {
        title: 'Shipment transfer',
        description: 'Warehouse handoff — transfer ownership to the next logistics partner.',
        to: '/transfer',
        icon: '🚚',
        color: 'warning',
      },
      {
        title: 'Warehouse & distribution locations',
        description: 'Update docks, hubs, or checkpoints along the route.',
        to: '/location',
        icon: '📍',
        color: 'warning',
      },
      {
        title: 'Verify product',
        description: 'Confirm authenticity during inbound and outbound handling.',
        to: '/verify',
        icon: '✅',
        color: 'success',
      },
      {
        title: 'Supply chain history',
        description: 'Trace shipments and custody from the verify screen.',
        to: '/verify',
        icon: '📜',
        color: 'neutral',
      },
    ];
  }
  if (role === 'retailer') {
    return [
      {
        title: 'Receiving & ownership handoff',
        description: 'Record transfers when goods arrive at store or move between locations.',
        to: '/transfer',
        icon: '🏪',
        color: 'warning',
      },
      {
        title: 'Store & shelf location',
        description: 'Update aisle, backroom, or sales-floor locations.',
        to: '/location',
        icon: '📍',
        color: 'warning',
      },
      {
        title: 'Verify before sale',
        description: 'Confirm authenticity before displaying or selling.',
        to: '/verify',
        icon: '✅',
        color: 'success',
      },
      {
        title: 'Product journey',
        description: 'Review full chain history after lookup on verify.',
        to: '/verify',
        icon: '📜',
        color: 'neutral',
      },
    ];
  }
  return [
    {
      title: 'Verify Product',
      description: 'Verify product authenticity before purchase.',
      to: '/verify',
      icon: '✅',
      color: 'success',
    },
    {
      title: 'Inventory',
      description: 'Manage your saved scanned products.',
      to: '/inventory',
      icon: '📦',
      color: 'neutral',
    },
    {
      title: 'Expiring Soon',
      description: 'Check countdown alerts for expiry.',
      to: '/expiring',
      icon: '⏰',
      color: 'warning',
    },
    {
      title: 'Profile',
      description: 'Update your dietary and language preferences.',
      to: '/profile',
      icon: '⚙️',
      color: 'neutral',
    },
  ];
}

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const flashSuccess = (location.state as { flashSuccess?: string } | null)
    ?.flashSuccess;
  const cards = cardsFor(user?.role ?? null);

  const {
    loading: summaryLoading,
    error: summaryError,
    payload: summaryPayload,
    refresh: refreshSummary,
    isRefreshing,
  } = useDashboardSummary(!!user);

  const getColorClasses = (color: ActionCard['color']) => {
    switch (color) {
      case 'primary':
        return 'hover:border-primary-300 dark:hover:border-primary-600/65 hover:shadow-primary-200/40 dark:hover:shadow-primary-900/35';
      case 'success':
        return 'hover:border-success-300 dark:hover:border-success-600/60 hover:shadow-success-200/40 dark:hover:shadow-success-900/30';
      case 'warning':
        return 'hover:border-warning-300 dark:hover:border-warning-600/55 hover:shadow-warning-200/40 dark:hover:shadow-warning-900/25';
      default:
        return 'hover:border-neutral-300 dark:hover:border-neutral-500 hover:shadow-neutral-200/30 dark:hover:shadow-black/35';
    }
  };

  return (
    <AppShell
      title="Dashboard"
      subtitle={
        user
          ? `${user.name} · ${ROLE_LABEL_PROFESSIONAL[user.role]}`
          : 'Public verification workspace'
      }
    >
      <div className="space-y-8 animate-fade-up">
        {/* Welcome Section */}
        <div className="card-soft overflow-hidden border border-neutral-200/75 shadow-soft dark:border-neutral-600/75">
          <div className="flex flex-col md:flex-row md:items-start gap-6 sm:gap-8 p-6 sm:p-8">
            <div className="flex shrink-0 justify-center md:justify-start md:pt-0.5">
              <div
                className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-2xl text-primary-600 shadow-inner dark:bg-primary-900/45 dark:text-primary-300"
                aria-hidden
              >
                {user ? '👋' : '🔍'}
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-3 text-center md:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-page-title">
                {user ? `Hello, ${user.name}` : 'Supply chain verification'}
              </h2>
              {user ? (
                <p className="mx-auto max-w-prose text-base leading-relaxed text-page-body sm:text-[1.0625rem] md:mx-0">
                  {DASHBOARD_ROLE_HEADING[user.role]}
                </p>
              ) : (
                <p className="mx-auto max-w-prose text-base leading-relaxed text-page-body md:mx-0">
                  Authenticate products using QR codes linked to the distributed ledger. Sign in to access
                  role-specific supply chain operations.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {flashSuccess && <Alert type="success">{flashSuccess}</Alert>}

        {user && (
          <DashboardAnalytics
            role={user.role}
            loading={summaryLoading}
            error={summaryError}
            payload={summaryPayload}
            onRefresh={refreshSummary}
            isRefreshing={isRefreshing}
          />
        )}

        {/* Quick Actions Grid */}
        <div>
          <div className="mb-6 space-y-1">
            <h3 className="text-lg font-semibold text-page-title">Quick actions</h3>
            <p className="text-sm text-page-muted max-w-2xl">
              Shortcuts to primary workflows for your role.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className={`card p-6 transition-all duration-300 motion-safe:ease-out ${getColorClasses(card.color)} group hover:-translate-y-1`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{card.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-200 mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA for non-logged-in users */}
        {!user && (
          <div className="card p-8 text-center bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-950/55 dark:to-primary-900/30 border-primary-100/80 dark:border-primary-800/50">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Ready to get started?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-200 mb-6">
              Create an account to access role-based features and manage your
              inventory.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button as={Link} to="/register" size="lg">
                Create Account
              </Button>
              <Button as={Link} to="/login" variant="secondary" size="lg">
                Sign In
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
