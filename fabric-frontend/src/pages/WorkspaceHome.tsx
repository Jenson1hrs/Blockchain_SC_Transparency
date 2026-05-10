import { Link, useLocation } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Alert } from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { roleWorkspaceCards } from '../utils/roleWorkspaceCards';

/**
 * Signed-in home: role-based shortcuts only (not the public marketing landing page).
 * Each role sees the same pattern—different card sets—not separate route trees per role.
 */
export default function WorkspaceHome() {
  const { user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const flashSuccess = (location.state as { flashSuccess?: string } | null)?.flashSuccess;

  if (!user) return null;

  const cards = roleWorkspaceCards(user.role);

  return (
    <AppShell
      title={t('workspace.welcome', { name: user.name })}
      subtitle={
        user.role === 'admin'
          ? t('workspace.subAdmin')
          : user.role === 'distributor'
            ? t('workspace.subDistributor')
            : user.role === 'retailer'
              ? t('workspace.subRetailer')
              : t('workspace.subRole', { role: user.role })
      }
    >
      <div className="space-y-6 animate-fade-up">
        {flashSuccess && (
          <Alert type="success" className="border border-green-200">
            {flashSuccess}
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Link
              key={`${card.titleKey}-${index}`}
              to={card.to}
              className="group bg-white rounded-xl shadow-sm border border-slate-200 p-6
                hover:shadow-xl hover:border-primary-300 hover:-translate-y-1
                transition-all duration-300 ease-out animate-fade-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3">
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors mb-2">
                    {t(card.titleKey)}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{t(card.descriptionKey)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-sm text-slate-500 max-w-2xl">
          {user.role === 'admin' ? t('workspace.footerAdmin') : t('workspace.footerUser')}
        </p>
      </div>
    </AppShell>
  );
}
