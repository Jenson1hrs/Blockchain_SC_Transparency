import { Link, useLocation } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

type ActionCard = { title: string; description: string; to: string };

function cardsFor(role: UserRole | null): ActionCard[] {
  if (!role) {
    return [
      { title: 'Verify Product', description: 'Scan or verify product authenticity.', to: '/verify' },
      { title: 'Login', description: 'Sign in to access role-based features.', to: '/login' },
      { title: 'Register', description: 'Create an application account.', to: '/register' },
    ];
  }
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

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const flashSuccess = (location.state as { flashSuccess?: string } | null)?.flashSuccess;
  const cards = cardsFor(user?.role ?? null);

  return (
    <AppShell
      title="Dashboard"
      subtitle={user ? `Welcome ${user.name}. Role: ${user.role}` : 'Guest mode: public verification only'}
    >
      <div className="space-y-4 animate-fade-up">
        {flashSuccess && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            {flashSuccess}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link key={card.title} to={card.to} className="card p-5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900">{card.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
