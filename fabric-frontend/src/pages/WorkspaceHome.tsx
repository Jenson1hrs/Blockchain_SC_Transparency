import { Link, useLocation } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { DashboardAnalytics } from '../components/DashboardAnalytics';
import { Alert } from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { DASHBOARD_ROLE_HEADING, ROLE_LABEL_PROFESSIONAL } from '../constants/dashboardRoleCopy';
import { roleWorkspaceCards } from '../utils/roleWorkspaceCards';
import type { UserRole } from '../types';

const WORKSPACE_FOOTER_KEY: Partial<Record<UserRole, string>> = {
  consumer: 'workspace.footerConsumer',
  distributor: 'workspace.footerDistributor',
  retailer: 'workspace.footerRetailer',
};

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
      title={t('workspace.dashboardTitle')}
      subtitle={`${user.name} · ${ROLE_LABEL_PROFESSIONAL[user.role]}`}
    >
      <div className="space-y-8 animate-fade-up">
        {flashSuccess && (
          <Alert type="success" className="border border-green-200 dark:border-success-800">
            {flashSuccess}
          </Alert>
        )}

        {/* Role lead + greeting (demo / supervisor pitch) */}
        <div className="card-soft overflow-hidden border border-neutral-200/75 shadow-soft dark:border-neutral-600/75">
          <div className="flex flex-col gap-6 p-6 sm:gap-8 sm:p-8 md:flex-row md:items-start">
            <div className="flex shrink-0 justify-center md:justify-start md:pt-0.5">
              <div
                className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-2xl text-primary-600 shadow-inner dark:bg-primary-900/45 dark:text-primary-300"
                aria-hidden
              >
                👋
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-3 text-center md:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-page-title">
                {t('workspace.helloUser', { name: user.name })}
              </h2>
              <p className="mx-auto max-w-prose text-base leading-relaxed text-page-body sm:text-[1.0625rem] md:mx-0">
                {DASHBOARD_ROLE_HEADING[user.role]}
              </p>
            </div>
          </div>
        </div>

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
            <p className="max-w-2xl text-sm text-page-muted">{t('workspace.quickActionsHint')}</p>
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

        {WORKSPACE_FOOTER_KEY[user.role] && (
          <p className="max-w-2xl border-t border-neutral-200/80 pt-6 text-sm leading-relaxed text-page-muted dark:border-neutral-700">
            {t(WORKSPACE_FOOTER_KEY[user.role]!)}
          </p>
        )}
      </div>
    </AppShell>
  );
}
