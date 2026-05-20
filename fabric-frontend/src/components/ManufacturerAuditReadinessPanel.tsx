import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import type { ManufacturerDashboardSummary, PublicOrganization } from '../types';
import type { ManufacturerBrandInsights } from '../hooks/useManufacturerBrandInsights';
import { isManufacturerProfileComplete } from '../utils/manufacturerProfile';
import { useAuth } from '../context/AuthContext';

type CheckState = 'pass' | 'warn' | 'fail' | 'na';

type CheckItem = {
  label: string;
  detail: string;
  state: CheckState;
  actionTo?: string;
  actionLabel?: string;
};

function CheckIcon({ state }: { state: CheckState }) {
  const base = 'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold';
  if (state === 'pass') {
    return <span className={`${base} bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-200`}>✓</span>;
  }
  if (state === 'warn') {
    return <span className={`${base} bg-warning-100 text-warning-800 dark:bg-warning-900/50 dark:text-warning-200`}>!</span>;
  }
  if (state === 'fail') {
    return <span className={`${base} bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-200`}>✕</span>;
  }
  return <span className={`${base} bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400`}>—</span>;
}

type Props = {
  summary: ManufacturerDashboardSummary;
  insights: ManufacturerBrandInsights | null;
  org: PublicOrganization | null;
  orgLoading?: boolean;
  openComplaintCount?: number;
};

export function ManufacturerAuditReadinessPanel({
  summary,
  insights,
  org,
  orgLoading = false,
  openComplaintCount = 0,
}: Props) {
  const { t } = useI18n();
  const { user } = useAuth();

  const metaPct = summary.metadataCompletionPercentage ?? summary.metadataCompletionPercent ?? 0;
  const qrCount = summary.qrSupportedProductsCount ?? 0;
  const profileComplete = isManufacturerProfileComplete(user);
  const downstream = insights?.downstreamCount ?? 0;
  const inCustody = summary.productsStillInCustodyCount;

  let regulatorState: CheckState = 'na';
  let regulatorDetail = t('mfgAudit.regulatorUnavailable');
  if (orgLoading) {
    regulatorDetail = t('common.loading');
  } else if (org) {
    if (org.organizationFlagged) {
      regulatorState = 'fail';
      regulatorDetail = t('mfgAudit.regulatorFlagged');
    } else if (org.organizationVerified) {
      regulatorState = 'pass';
      regulatorDetail = t('mfgAudit.regulatorVerified');
    } else {
      regulatorState = 'warn';
      regulatorDetail = t('mfgAudit.regulatorPending');
    }
  }

  const checks: CheckItem[] = [
    {
      label: t('mfgAudit.profile'),
      detail: profileComplete ? t('mfgAudit.profileOk') : t('mfgAudit.profileIncomplete'),
      state: profileComplete ? 'pass' : 'warn',
      actionTo: '/profile',
      actionLabel: t('mfgTrust.editProfile'),
    },
    {
      label: t('mfgAudit.metadata'),
      detail: t('mfgAudit.metadataDetail', {
        pct: metaPct,
        missing: summary.missingMetadataCount,
      }),
      state:
        summary.missingMetadataCount === 0
          ? 'pass'
          : metaPct >= 80
            ? 'warn'
            : 'fail',
      actionTo: '/my-products',
      actionLabel: t('mfgDash.actionFixCatalogue'),
    },
    {
      label: t('mfgAudit.qr'),
      detail: t('mfgAudit.qrDetail', { count: qrCount, total: summary.totalProducts }),
      state:
        summary.totalProducts === 0
          ? 'na'
          : qrCount === summary.totalProducts
            ? 'pass'
            : qrCount > 0
              ? 'warn'
              : 'fail',
      actionTo: '/my-products',
      actionLabel: t('mfgDash.openCatalogue'),
    },
    {
      label: t('mfgAudit.traceability'),
      detail: t('mfgAudit.traceabilityDetail', { custody: inCustody, downstream }),
      state:
        summary.totalProducts === 0
          ? 'na'
          : inCustody > 0 || downstream > 0
            ? 'pass'
            : 'warn',
      actionTo: '/my-products',
      actionLabel: t('mfgDash.openCatalogue'),
    },
    {
      label: t('mfgAudit.regulator'),
      detail: regulatorDetail,
      state: regulatorState,
      actionTo: user?.id ? `/organization/${user.id}` : undefined,
      actionLabel: t('mfgTrust.previewPublicPage'),
    },
    {
      label: t('mfgAudit.complaints'),
      detail:
        openComplaintCount > 0
          ? t('mfgAudit.complaintsOpen', { count: openComplaintCount })
          : t('mfgAudit.complaintsClear'),
      state: openComplaintCount > 0 ? 'warn' : 'pass',
      actionTo: openComplaintCount > 0 ? '/manufacturer/complaints' : undefined,
      actionLabel: t('mfgDash.actionViewComplaints'),
    },
  ];

  return (
    <div className="card p-5 sm:p-6">
      <h4 className="text-page-heading text-base">{t('mfgAudit.title')}</h4>
      <p className="mt-1 text-sm text-page-muted max-w-3xl">{t('mfgAudit.subtitle')}</p>
      <ul className="mt-4 space-y-3">
        {checks.map((item) => (
          <li
            key={item.label}
            className="flex gap-3 rounded-lg border border-neutral-200/80 bg-white/60 px-3 py-3 dark:border-neutral-600/60 dark:bg-neutral-900/30"
          >
            <CheckIcon state={item.state} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-page-title">{item.label}</p>
              <p className="text-xs text-page-muted mt-0.5 leading-relaxed">{item.detail}</p>
              {item.actionTo && item.actionLabel && item.state !== 'pass' && (
                <Link
                  to={item.actionTo}
                  className="mt-1.5 inline-block text-xs font-medium text-primary-700 hover:underline dark:text-primary-300"
                >
                  {item.actionLabel}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
