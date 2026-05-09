import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

const steps = ['Create', 'QR', 'Scan', 'Verify', 'Track'];
const roles = [
  {
    title: 'Manufacturer',
    body: 'Creates product records and generates traceable QR verification links.',
  },
  {
    title: 'Distributor / Retailer',
    body: 'Transfers ownership and updates product location through each logistics stage.',
  },
  {
    title: 'Consumer',
    body: 'Verifies authenticity, tracks product details, and manages personal inventory.',
  },
];
const features = [
  'Blockchain authenticity and tamper-resistant history',
  'QR-based verification with route-safe deep links',
  'Expiry countdown reminders for proactive checks',
  'Personal inventory support for saved products',
];

type ActionCard = { title: string; description: string; to: string };

function cardsFor(role: UserRole): ActionCard[] {
  if (role === 'admin') {
    return [
      { title: 'Create Product', description: 'Register new products and generate QR.', to: '/create' },
      { title: 'Transfer Ownership', description: 'Update owner in supply chain.', to: '/transfer' },
      { title: 'Update Location', description: 'Track product movement.', to: '/location' },
      { title: 'Expiring Soon', description: 'See products approaching expiry.', to: '/expiring' },
      { title: 'Inventory', description: 'View saved inventory products.', to: '/inventory' },
      { title: 'Verify Product', description: 'Verify authenticity and history.', to: '/verify' },
    ];
  }
  if (role === 'manufacturer') {
    return [
      { title: 'Create Product', description: 'Register product and generate QR.', to: '/create' },
      { title: 'View QR', description: 'Use Verify page action to open QR by product ID.', to: '/verify' },
      { title: 'Verify Product', description: 'Check product details and history.', to: '/verify' },
    ];
  }
  if (role === 'distributor' || role === 'retailer') {
    return [
      { title: 'Transfer Ownership', description: 'Transfer to next supply chain owner.', to: '/transfer' },
      { title: 'Update Location', description: 'Record current product location.', to: '/location' },
      { title: 'Verify Product', description: 'Verify chain record before processing.', to: '/verify' },
    ];
  }
  return [
    { title: 'Verify Product', description: 'Verify product authenticity before purchase.', to: '/verify' },
    { title: 'Inventory', description: 'Manage your saved scanned products.', to: '/inventory' },
    { title: 'Expiring Soon', description: 'Check countdown alerts for expiry.', to: '/expiring' },
    { title: 'Profile', description: 'Update your dietary and language preferences.', to: '/profile' },
  ];
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const flashSuccess = (location.state as { flashSuccess?: string } | null)?.flashSuccess;

  return (
    <div className="app-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10 animate-fade-up">
        <header className="card p-5 md:p-6 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Final Year Project Demo
              </p>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                Blockchain-Based Anti-Counterfeit Supply Chain System
              </h1>
            </div>
            <div className="flex gap-2">
              {!loading && !user && (
                <>
                  <Link
                    to="/login"
                    className="px-3.5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Register
                  </Link>
                </>
              )}
              {!loading && user && (
                <Link
                  to="/verify"
                  className="px-3.5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Open Verification
                </Link>
              )}
            </div>
          </div>
        </header>

        {flashSuccess && (
          <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            {flashSuccess}
          </div>
        )}

        <section className="card p-6 md:p-8 mb-6">
          <p className="text-gray-700 text-sm md:text-base leading-relaxed max-w-3xl">
            Verify products with QR codes, trace supply-chain activity on blockchain, monitor expiry
            reminders, and support personal inventory tracking for consumers.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/verify"
              className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              Verify Product
            </Link>
            {!loading && !user && (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </section>

        {!loading && user && (
          <section className="card p-5 mb-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">Your Role Workspace</h2>
                <p className="text-xs text-gray-600 mt-1 capitalize">
                  Signed in as {user.name} ({user.role})
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cardsFor(user.role).map((card) => (
                <Link
                  key={card.title}
                  to={card.to}
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <p className="font-semibold text-gray-900">{card.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">How It Works</h2>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <p key={step} className="text-sm text-gray-700">
                  <span className="inline-flex w-6 h-6 mr-2 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    {idx + 1}
                  </span>
                  {step}
                </p>
              ))}
            </div>
          </div>
          <div className="card p-5 lg:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-3">User Roles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {roles.map((role) => (
                <div key={role.title} className="rounded-lg border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-gray-900">{role.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{role.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card p-5 mt-6">
          <h2 className="font-semibold text-gray-900 mb-3">Key Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
            {features.map((feature) => (
              <li key={feature} className="rounded-lg border border-gray-200 px-3 py-2 bg-white/70">
                {feature}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
