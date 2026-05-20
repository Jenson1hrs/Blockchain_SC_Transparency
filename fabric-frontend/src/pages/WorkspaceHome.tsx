import { Link, useLocation } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { DashboardAnalytics } from '../components/DashboardAnalytics';
import { RoleWorkspaceHero } from '../components/RoleWorkspaceHero';
import { Alert } from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import {
  ROLE_QUICK_ACTIONS_HINT,
  ROLE_WORKSPACE_SUBTITLE,
  ROLE_WORKSPACE_TITLE,
} from '../constants/dashboardRoleCopy';
import { roleWorkspaceCards } from '../utils/roleWorkspaceCards';
import { ManufacturerProfileTrustBanner } from '../components/ManufacturerProfileTrustBanner';

/** Signed-in home (`/home`): analytics from API + role-based shortcuts from `roleWorkspaceCards`. */
export default function WorkspaceHome() {
  const { user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const flashSuccess = (location.state as { flashSuccess?: string } | null)?.flashSuccess;

  const {
    loading: summaryLoading,
    error: summaryError,
    payload: summaryPayload,
    refresh: refreshSummary,
    isRefreshing,
  } = useDashboardSummary(!!user);

  if (!user) return null;

  const cards = roleWorkspaceCards(user.role);

  return (
    <AppShell
      title={ROLE_WORKSPACE_TITLE[user.role]}
      subtitle={`${user.name} · ${ROLE_WORKSPACE_SUBTITLE[user.role]}`}
    >
      <div className="space-y-8 animate-fade-up">
        {flashSuccess && (
          <Alert type="success" className="border border-green-200 dark:border-success-800">
            {flashSuccess}
          </Alert>
        )}

        <RoleWorkspaceHero role={user.role} userName={user.name} />

        {user.role === 'manufacturer' && <ManufacturerProfileTrustBanner />}

        <DashboardAnalytics
          role={user.role}
          loading={summaryLoading}
          error={summaryError}
          payload={summaryPayload}
          onRefresh={refreshSummary}
          refreshLabel={t('workspace.refreshAnalytics')}
          refreshingLabel={t('workspace.refreshingAnalytics')}
          isRefreshing={isRefreshing}
        />

        <div>
          <div className="mb-6 space-y-1">
            <h3 className="text-lg font-semibold text-page-title">{t('workspace.quickActions')}</h3>
            <p className="max-w-2xl text-sm text-page-muted">{ROLE_QUICK_ACTIONS_HINT[user.role]}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => (
              <Link
                key={`${card.titleKey}-${index}`}
                to={card.to}
                className="group card p-6 transition-all duration-300 ease-out animate-fade-up hover:-translate-y-1 hover:shadow-medium motion-safe:ease-out"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3">
                    {card.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-2 font-semibold text-page-title transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {t(card.titleKey)}
                    </h3>
                    <p className="text-sm leading-relaxed text-page-body">{t(card.descriptionKey)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
