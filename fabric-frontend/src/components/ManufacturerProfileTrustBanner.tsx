import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { isManufacturerProfileComplete } from '../utils/manufacturerProfile';

export function ManufacturerProfileTrustBanner({ className }: { className?: string }) {
  const { user } = useAuth();
  const { t } = useI18n();

  if (!user || user.role !== 'manufacturer') return null;

  const profileComplete = isManufacturerProfileComplete(user);

  return (
    <div
      className={
        className ??
        'rounded-xl border border-primary-200/70 bg-primary-50/60 px-4 py-3 text-sm text-page-body dark:border-primary-800/50 dark:bg-primary-950/25'
      }
    >
      <p className="font-medium text-page-title">{t('mfgTrust.bannerTitle')}</p>
      <p className="mt-1 leading-relaxed">{t('mfgTrust.bannerBody')}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link
          to="/profile"
          className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-300"
        >
          {t('mfgTrust.editProfile')}
        </Link>
        {user.id > 0 && (
          <Link
            to={`/organization/${user.id}`}
            className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-300"
          >
            {t('mfgTrust.previewPublicPage')}
          </Link>
        )}
      </div>
      {!profileComplete && (
        <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">{t('mfgTrust.incompleteHint')}</p>
      )}
    </div>
  );
}
