import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { fetchOrganizationSafe } from '../api/organizationService';
import { fetchManufacturerComplaintSummary } from '../api/complaintService';
import type { ManufacturerComplaintSummary } from '../types';
import { useManufacturerBrandInsights } from '../hooks/useManufacturerBrandInsights';
import type { ManufacturerDashboardSummary, PublicOrganization } from '../types';
import { metadataCompleteCount } from '../utils/manufacturerProductInsights';
import { isManufacturerProfileComplete } from '../utils/manufacturerProfile';
import { ManufacturerAuditReadinessPanel } from './ManufacturerAuditReadinessPanel';
import { ManufacturerProductStatusBreakdown } from './ManufacturerProductStatusBreakdown';
import { ManufacturerJourneyBreakdown } from './ManufacturerJourneyBreakdown';
import { TransferRequestTable } from './DashboardSupplyChainAnalytics';

function SectionHeading({ title, helper }: { title: string; helper?: string }) {
  return (
    <div className="md:col-span-2 xl:col-span-4 space-y-1 pt-2">
      <h4 className="text-base font-semibold text-page-title">{title}</h4>
      {helper ? (
        <p className="text-sm text-page-muted max-w-3xl leading-relaxed">{helper}</p>
      ) : null}
    </div>
  );
}

function BigNumber({ children }: { children: ReactNode }) {
  return (
    <p className="text-2xl sm:text-3xl font-bold tabular-nums text-page-title tracking-tight">
      {children}
    </p>
  );
}

function AnalyticsCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'card p-5 sm:p-6 flex flex-col gap-3 h-full min-h-[8.5rem] border-neutral-200/80 dark:border-neutral-600/80',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h4 className="text-page-heading text-base">{title}</h4>
        <p className="text-sm text-page-muted mt-0.5">{description}</p>
      </div>
      <div className="mt-auto pt-1">{children}</div>
    </div>
  );
}

function ActionListItem({
  title,
  detail,
  to,
  label,
}: {
  title: string;
  detail: string;
  to: string;
  label: string;
}) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-neutral-200/80 bg-white/80 px-3 py-3 dark:border-neutral-600/60 dark:bg-neutral-900/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-page-title">{title}</p>
        <p className="text-xs text-page-muted mt-0.5">{detail}</p>
      </div>
      <Link
        to={to}
        className="shrink-0 text-sm font-medium text-primary-700 hover:underline dark:text-primary-300"
      >
        {label}
      </Link>
    </li>
  );
}

export function ManufacturerBrandDashboard({ data }: { data: ManufacturerDashboardSummary }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { insights, loading: insightsLoading, error: insightsError } = useManufacturerBrandInsights(true);
  const [org, setOrg] = useState<PublicOrganization | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [complaintSummary, setComplaintSummary] = useState<ManufacturerComplaintSummary | null>(
    null,
  );

  useEffect(() => {
    if (!user?.id || user.role !== 'manufacturer') return;
    let cancelled = false;
    setOrgLoading(true);
    void fetchOrganizationSafe(user.id).then((row) => {
      if (!cancelled) {
        setOrg(row);
        setOrgLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!user?.id || user.role !== 'manufacturer') return;
    let cancelled = false;
    void fetchManufacturerComplaintSummary()
      .then((data) => {
        if (!cancelled) setComplaintSummary(data);
      })
      .catch(() => {
        if (!cancelled) setComplaintSummary(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  const metaPct = data.metadataCompletionPercentage ?? data.metadataCompletionPercent ?? 100;
  const openComplaints = complaintSummary?.openCount ?? 0;
  const completeCount = metadataCompleteCount(data.totalProducts, data.missingMetadataCount);
  const profileComplete = isManufacturerProfileComplete(user);

  const atDistributor = insights?.atDistributorCount ?? 0;
  const atRetailer = insights?.atRetailerCount ?? 0;
  const downstreamCount = insights?.downstreamCount ?? 0;
  const expiringCount = insights?.expiringSoonCount ?? 0;
  const notQrReady =
    insights?.notQrReadyCount ?? Math.max(0, data.totalProducts - (data.qrSupportedProductsCount ?? 0));

  const actionItems: { title: string; detail: string; to: string; label: string }[] = [];

  if (!profileComplete) {
    actionItems.push({
      title: t('mfgDash.actionProfile'),
      detail: t('mfgDash.actionProfileDetail'),
      to: '/profile',
      label: t('mfgTrust.editProfile'),
    });
  }
  if (data.missingMetadataCount > 0) {
    actionItems.push({
      title: t('mfgDash.actionMissingMeta'),
      detail: t('mfgDash.actionMissingMetaDetail', { count: data.missingMetadataCount }),
      to: '/my-products?filter=missing_metadata',
      label: t('mfgDash.actionFixCatalogue'),
    });
  }
  if (data.outboundPendingCount > 0) {
    actionItems.push({
      title: t('mfgDash.actionPendingTransfer'),
      detail: t('mfgDash.actionPendingTransferDetail', { count: data.outboundPendingCount }),
      to: '/transfer',
      label: t('mfgDash.actionViewTransfers'),
    });
  }
  if (expiringCount > 0) {
    actionItems.push({
      title: t('mfgDash.actionExpiring'),
      detail: t('mfgDash.actionExpiringDetail', { count: expiringCount }),
      to: '/expiring',
      label: t('mfgDash.actionViewExpiring'),
    });
  }
  if (notQrReady > 0) {
    actionItems.push({
      title: t('mfgDash.actionQrNotReady'),
      detail: t('mfgDash.actionQrNotReadyDetail', { count: notQrReady }),
      to: '/my-products',
      label: t('mfgDash.actionFixCatalogue'),
    });
  }
  if (openComplaints > 0) {
    actionItems.push({
      title: t('mfgDash.actionOpenComplaints'),
      detail: t('mfgDash.actionOpenComplaintsDetail', { count: openComplaints }),
      to: '/manufacturer/complaints',
      label: t('mfgDash.actionViewComplaints'),
    });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-primary-200/60 bg-primary-50/40 px-4 py-3 dark:border-primary-800/40 dark:bg-primary-950/20">
        <h3 className="text-lg font-semibold text-page-title">{t('mfgDash.overviewTitle')}</h3>
        <p className="mt-1 text-sm text-page-muted max-w-3xl">{t('mfgDash.overviewSubtitle')}</p>
      </div>

      {insightsError && (
        <p className="text-sm text-amber-800 dark:text-amber-200 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 dark:border-amber-900/50 dark:bg-amber-950/30">
          {insightsError} {t('mfgDash.insightsPartial')}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <SectionHeading title={t('mfgDash.sectionTrust')} helper={t('mfgDash.sectionTrustHelper')} />
        <AnalyticsCard title={t('mfgDash.cardRegistered')} description={t('mfgDash.cardRegisteredDesc')}>
          <BigNumber>{data.productsCreatedCount}</BigNumber>
        </AnalyticsCard>
        <AnalyticsCard title={t('mfgDash.cardQrReady')} description={t('mfgDash.cardQrReadyDesc')}>
          <BigNumber>{data.qrSupportedProductsCount ?? 0}</BigNumber>
        </AnalyticsCard>
        <AnalyticsCard title={t('mfgDash.cardMetaPct')} description={t('mfgDash.cardMetaPctDesc')}>
          <BigNumber>{metaPct}%</BigNumber>
        </AnalyticsCard>
        <AnalyticsCard title={t('mfgDash.cardMissingMeta')} description={t('mfgDash.cardMissingMetaDesc')}>
          <BigNumber>{data.missingMetadataCount}</BigNumber>
        </AnalyticsCard>

        <SectionHeading
          title={t('mfgDash.sectionSupplyChain')}
          helper={t('mfgDash.sectionSupplyChainHelper')}
        />
        <AnalyticsCard title={t('mfgDash.cardCustody')} description={t('mfgDash.cardCustodyDesc')}>
          <BigNumber>{data.productsStillInCustodyCount}</BigNumber>
        </AnalyticsCard>
        <AnalyticsCard title={t('mfgDash.cardAtDistributor')} description={t('mfgDash.cardAtDistributorDesc')}>
          <BigNumber>{insightsLoading ? '…' : atDistributor}</BigNumber>
        </AnalyticsCard>
        <AnalyticsCard title={t('mfgDash.cardAtRetailer')} description={t('mfgDash.cardAtRetailerDesc')}>
          <BigNumber>{insightsLoading ? '…' : atRetailer}</BigNumber>
        </AnalyticsCard>
        <AnalyticsCard title={t('mfgDash.cardDownstream')} description={t('mfgDash.cardDownstreamDesc')}>
          <BigNumber>{insightsLoading ? '…' : downstreamCount}</BigNumber>
        </AnalyticsCard>
        <AnalyticsCard
          title={t('mfgDash.cardPendingAccept')}
          description={t('mfgDash.cardPendingAcceptDesc')}
          className="md:col-span-2 xl:col-span-2"
        >
          <BigNumber>{data.outboundPendingCount}</BigNumber>
        </AnalyticsCard>

        <SectionHeading
          title={t('mfgDash.sectionConsumerTrust')}
          helper={t('mfgDash.sectionConsumerTrustHelper')}
        />
        <AnalyticsCard
          title={t('mfgDash.cardOpenComplaints')}
          description={t('mfgDash.cardOpenComplaintsDesc')}
        >
          <BigNumber>{openComplaints}</BigNumber>
          <Link
            to="/manufacturer/complaints"
            className="mt-2 inline-block text-sm font-medium text-primary-700 hover:underline dark:text-primary-300"
          >
            {t('mfgDash.actionViewComplaints')}
          </Link>
        </AnalyticsCard>

        <SectionHeading title={t('mfgDash.sectionAction')} helper={t('mfgDash.sectionActionHelper')} />
        <div className="md:col-span-2 xl:col-span-4">
          {actionItems.length === 0 ? (
            <p className="text-sm text-page-muted rounded-lg border border-neutral-200/80 bg-neutral-50/50 px-4 py-3 dark:border-neutral-600/60 dark:bg-neutral-900/40">
              {t('mfgDash.actionAllClear')}
            </p>
          ) : (
            <ul className="space-y-2">
              {actionItems.map((item) => (
                <ActionListItem key={item.title} {...item} />
              ))}
            </ul>
          )}
        </div>

        {data.outboundPendingCount > 0 && (
          <div className="md:col-span-2 xl:col-span-4 card p-5">
            <h4 className="text-page-heading text-base mb-1">{t('mfgDash.pendingTransfersTitle')}</h4>
            <p className="text-xs text-page-muted mb-3">{t('mfgDash.pendingTransfersHint')}</p>
            <TransferRequestTable
              requests={data.recentOutboundRequests.filter((r) => r.status === 'pending')}
              direction="outbound"
            />
            {data.outboundPendingCount > data.recentOutboundRequests.filter((r) => r.status === 'pending').length && (
              <p className="mt-3 text-xs text-page-muted">
                <Link to="/transfer" className="font-medium text-primary-700 hover:underline dark:text-primary-300">
                  {t('mfgDash.viewAllTransfers')}
                </Link>
              </p>
            )}
          </div>
        )}

        <SectionHeading title={t('mfgDash.sectionStatus')} helper={t('mfgDash.sectionStatusHelper')} />
        <div className="md:col-span-2 xl:col-span-2 card p-5">
          <ManufacturerProductStatusBreakdown productsByStatus={data.productsByStatus} />
        </div>
        <div className="md:col-span-2 xl:col-span-2 card p-5">
          <h4 className="text-page-heading text-base mb-1">{t('mfgJourney.breakdownTitle')}</h4>
          <p className="text-xs text-page-muted mb-3">{t('mfgJourney.breakdownHelper')}</p>
          {insights?.catalogueProducts && user?.id ? (
            <ManufacturerJourneyBreakdown
              products={insights.catalogueProducts}
              options={{
                manufacturerUserId: user.id,
                pendingTransferProductIds: insights.pendingOutboundProductIds,
              }}
            />
          ) : (
            <p className="text-sm text-page-muted">{t('mfgJourney.breakdownEmpty')}</p>
          )}
        </div>

        <SectionHeading title={t('mfgDash.sectionAudit')} helper={t('mfgDash.sectionAuditHelper')} />
        <div className="md:col-span-2 xl:col-span-4">
          <ManufacturerAuditReadinessPanel
            summary={data}
            insights={insights}
            org={org}
            orgLoading={orgLoading}
            openComplaintCount={openComplaints}
          />
        </div>

        <SectionHeading title={t('mfgDash.sectionCatalogue')} helper={t('mfgDash.sectionCatalogueHelper')} />
        <div className="md:col-span-2 xl:col-span-4 flex flex-wrap gap-3">
          <Link
            to="/my-products"
            className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500"
          >
            {t('mfgDash.openCatalogue')}
          </Link>
          <Link
            to="/create"
            className="inline-flex items-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-page-title hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800"
          >
            {t('dash.mfg.create.t')}
          </Link>
        </div>

        {(data.recentIncompleteProducts?.length ?? 0) > 0 && (
          <div className="md:col-span-2 xl:col-span-4 card p-5">
            <h4 className="text-page-heading text-base mb-2">{t('mfgDash.incompletePreview')}</h4>
            <ul className="divide-y divide-neutral-200/80 dark:divide-neutral-700/80">
              {data.recentIncompleteProducts!.slice(0, 5).map((p) => (
                <li key={p.productId} className="flex justify-between gap-3 py-2 text-sm">
                  <span className="font-medium truncate">{p.name || p.productId}</span>
                  <Link
                    to="/my-products?filter=missing_metadata"
                    className="shrink-0 text-primary-600 hover:underline text-xs"
                  >
                    {t('mfgDash.actionFixCatalogue')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <SectionHeading title={t('mfgDash.sectionJourney')} helper={t('mfgDash.sectionJourneyHelper')} />
        <AnalyticsCard title={t('mfgDash.cardMetaComplete')} description={t('mfgDash.cardMetaCompleteDesc')}>
          <BigNumber>{completeCount}</BigNumber>
        </AnalyticsCard>
        <AnalyticsCard title={t('mfgDash.cardExpiring')} description={t('mfgDash.cardExpiringDesc')}>
          <BigNumber>{insightsLoading ? '…' : expiringCount}</BigNumber>
        </AnalyticsCard>
        <AnalyticsCard title={t('mfgDash.outboundAccepted')} description={t('mfgDash.outboundAcceptedDesc')}>
          <BigNumber>{data.outboundAcceptedCount}</BigNumber>
        </AnalyticsCard>
        <AnalyticsCard title={t('mfgDash.outboundRejected')} description={t('mfgDash.outboundRejectedDesc')}>
          <BigNumber>{data.outboundRejectedCount}</BigNumber>
        </AnalyticsCard>
        <AnalyticsCard
          title={t('mfgDash.recentOutbound')}
          description={t('mfgDash.recentOutboundDesc')}
          className="md:col-span-2 xl:col-span-4"
        >
          <TransferRequestTable requests={data.recentOutboundRequests} direction="outbound" />
        </AnalyticsCard>
      </div>
    </div>
  );
}
