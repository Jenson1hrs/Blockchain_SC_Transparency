import { Navigate, useLocation } from 'react-router-dom';
import AppShell from './AppShell';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
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
  const { t } = useI18n();
  const location = useLocation();

  if (loading) {
    return (
      <AppShell title={t('common.loading')} subtitle={t('common.loadingSession')}>
        <div className="card p-8 text-center text-gray-600 animate-fade-up">{t('common.loading')}</div>
      </AppShell>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <AppShell title={t('common.accessDeniedTitle')} subtitle={t('common.accessDeniedSub')}>
        <div className="card p-8 text-center animate-fade-up">
          <p className="text-red-700 font-medium">{t('common.accessDenied')}</p>
        </div>
      </AppShell>
    );
  }

  return <>{children}</>;
}
