import { Navigate, useLocation } from 'react-router-dom';
import AppShell from './AppShell';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import type { ReactNode } from 'react';

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: UserRole[];
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <AppShell title="Loading…" subtitle="Checking session">
        <div className="card p-8 text-center text-gray-600 animate-fade-up">Loading…</div>
      </AppShell>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <AppShell title="Access denied" subtitle="Role restriction">
        <div className="card p-8 text-center animate-fade-up">
          <p className="text-red-700 font-medium">
            Access denied: your role cannot use this feature.
          </p>
        </div>
      </AppShell>
    );
  }

  return <>{children}</>;
}
