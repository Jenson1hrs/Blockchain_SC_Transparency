import { Link, useLocation } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { Button, Alert } from '../components';
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
        description: 'Register product and generate QR.',
        to: '/create',
        icon: '➕',
        color: 'primary',
      },
      {
        title: 'View QR',
        description: 'Use Verify page action to open QR by product ID.',
        to: '/verify',
        icon: '📱',
        color: 'neutral',
      },
      {
        title: 'Verify Product',
        description: 'Check product details and history.',
        to: '/verify',
        icon: '✅',
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

  const getColorClasses = (color: ActionCard['color']) => {
    switch (color) {
      case 'primary':
        return 'hover:border-primary-200 hover:shadow-primary-100/50';
      case 'success':
        return 'hover:border-success-200 hover:shadow-success-100/50';
      case 'warning':
        return 'hover:border-warning-200 hover:shadow-warning-100/50';
      default:
        return 'hover:border-neutral-200 hover:shadow-neutral-100/50';
    }
  };

  return (
    <AppShell
      title="Dashboard"
      subtitle={
        user ? `Welcome back, ${user.name}` : 'Public verification available'
      }
    >
      <div className="space-y-8 animate-fade-up">
        {/* Welcome Section */}
        <div className="card p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full text-2xl mb-4">
            {user ? '👋' : '🔍'}
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {user
              ? `Hello, ${user.name}!`
              : 'Welcome to Supply Chain Verification'}
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {user
              ? `You are logged in as a ${user.role}. Access your role-specific features below.`
              : 'Verify product authenticity using QR codes. Sign in for additional features.'}
          </p>
        </div>

        {/* Success Message */}
        {flashSuccess && <Alert type="success">{flashSuccess}</Alert>}

        {/* Quick Actions Grid */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className={`card p-6 transition-all duration-200 ${getColorClasses(card.color)} group`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{card.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-sm text-neutral-600 mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Section (if user is logged in) */}
        {user && (
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">
              Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-100 text-primary-600 rounded-lg">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">0</p>
                    <p className="text-sm text-neutral-600">
                      Products Verified
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-warning-100 text-warning-600 rounded-lg">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">0</p>
                    <p className="text-sm text-neutral-600">Expiring Soon</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-success-100 text-success-600 rounded-lg">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">0</p>
                    <p className="text-sm text-neutral-600">In Inventory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA for non-logged-in users */}
        {!user && (
          <div className="card p-8 text-center bg-gradient-to-r from-primary-50 to-primary-100/50">
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Ready to get started?
            </h3>
            <p className="text-neutral-600 mb-6">
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
