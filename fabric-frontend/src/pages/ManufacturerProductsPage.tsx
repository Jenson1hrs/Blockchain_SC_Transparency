import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useRolePageMeta } from '../hooks/useRolePageMeta';
import { Alert, Button } from '../components';
import { MetadataIncompleteBadge } from '../components/MetadataIncompleteBadge';
import { fetchDashboardSummary } from '../api/dashboardService';
import { useI18n } from '../context/I18nContext';
import type { ManufacturerDashboardSummary } from '../types';

export default function ManufacturerProductsPage() {
  const pageMeta = useRolePageMeta('myProducts', 'manufacturer');
  const { t } = useI18n();
  const [data, setData] = useState<ManufacturerDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboardSummary();
      if (res.role !== 'manufacturer') {
        setError('This page is for manufacturer accounts only.');
        return;
      }
      setData(res.data as ManufacturerDashboardSummary);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const statusEntries = data
    ? Object.entries(data.productsByStatus).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <AppShell title={pageMeta.title} subtitle={pageMeta.subtitle}>
      <div className="space-y-6 animate-fade-up">
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => void load()} disabled={loading}>
            {loading ? t('workspace.refreshingAnalytics') : t('workspace.refreshAnalytics')}
          </Button>
          <Button as={Link} to="/create">
            {t('dash.mfg.create.t')}
          </Button>
        </div>

        {error && (
          <Alert type="error" className="border border-red-200 dark:border-red-900/60">
            {error}
          </Alert>
        )}

        {loading && !data && <p className="text-sm text-page-muted">{t('common.loading')}</p>}

        {data && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card p-4">
                <p className="text-page-label">{t('mfgProducts.total')}</p>
                <p className="mt-1 text-2xl font-bold text-page-title">{data.totalProducts}</p>
              </div>
              <div className="card p-4">
                <p className="text-page-label">{t('mfgProducts.metaCompletion')}</p>
                <p className="mt-1 text-2xl font-bold text-page-title">
                  {data.metadataCompletionPercent ?? 100}%
                </p>
              </div>
              <div className="card p-4">
                <p className="text-page-label">{t('mfgProducts.missingMeta')}</p>
                <p className="mt-1 text-2xl font-bold text-page-title">{data.missingMetadataCount}</p>
              </div>
              <div className="card p-4">
                <p className="text-page-label">{t('mfgProducts.qrReady')}</p>
                <p className="mt-1 text-2xl font-bold text-page-title">
                  {data.qrSupportedProductsCount ?? 0}
                </p>
              </div>
            </div>

            {statusEntries.length > 0 && (
              <div className="card p-5">
                <h3 className="text-page-heading mb-3">{t('mfgProducts.byStatus')}</h3>
                <ul className="flex flex-wrap gap-2">
                  {statusEntries.map(([status, count]) => (
                    <li
                      key={status}
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-200/90 bg-neutral-50/90 px-3 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-900/40"
                    >
                      <span className="font-medium text-page-title">{status}</span>
                      <span className="tabular-nums text-page-muted">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card p-5">
              <h3 className="text-page-heading mb-1">{t('mfgProducts.recentTitle')}</h3>
              <p className="mb-4 text-sm text-page-muted">{t('mfgProducts.recentHint')}</p>
              {data.recentProducts.length === 0 ? (
                <p className="text-sm text-page-muted">{t('mfgProducts.empty')}</p>
              ) : (
                <ul className="divide-y divide-neutral-200/80 dark:divide-neutral-700/80">
                  {data.recentProducts.map((p) => (
                    <li
                      key={p.productId}
                      className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-page-title truncate">
                            {p.name || p.productId}
                          </p>
                          {p.metadataComplete === false && <MetadataIncompleteBadge />}
                        </div>
                        <p className="text-xs text-page-muted mt-0.5">
                          ID: {p.productId}
                          {p.status ? ` · ${p.status}` : ''}
                          {p.metadataCompletionPercent != null
                            ? ` · ${p.metadataCompletionPercent}% metadata`
                            : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <Button
                          as={Link}
                          to="/verify"
                          state={{ productId: p.productId }}
                          variant="secondary"
                          size="sm"
                        >
                          {t('mfgProducts.openVerify')}
                        </Button>
                        <Button
                          as={Link}
                          to={`/qr/${encodeURIComponent(p.productId)}`}
                          variant="ghost"
                          size="sm"
                        >
                          {t('mfgProducts.openQr')}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
