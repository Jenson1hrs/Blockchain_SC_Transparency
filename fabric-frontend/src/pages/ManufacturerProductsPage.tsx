import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useRolePageMeta } from '../hooks/useRolePageMeta';
import { Alert, Button } from '../components';
import { ManufacturerProductCatalogue } from '../components/ManufacturerProductCatalogue';
import { ManufacturerMetadataModal } from '../components/ManufacturerMetadataModal';
import { ManufacturerProfileTrustBanner } from '../components/ManufacturerProfileTrustBanner';
import { fetchDashboardSummary } from '../api/dashboardService';
import { useManufacturerBrandInsights } from '../hooks/useManufacturerBrandInsights';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import type { ManufacturerDashboardSummary, Product } from '../types';
import {
  type ManufacturerCatalogueFilter,
  countByCatalogueFilter,
  filterManufacturerCatalogue,
  productMatchesSearch,
} from '../utils/manufacturerCatalogueUtils';
import { clsx } from 'clsx';

const FILTER_KEYS: ManufacturerCatalogueFilter[] = [
  'all',
  'in_custody',
  'at_distributor',
  'at_retailer',
  'missing_metadata',
  'expiring_soon',
  'pending_transfer',
];

function parseFilterParam(value: string | null): ManufacturerCatalogueFilter {
  if (value && FILTER_KEYS.includes(value as ManufacturerCatalogueFilter)) {
    return value as ManufacturerCatalogueFilter;
  }
  return 'all';
}

export default function ManufacturerProductsPage() {
  const pageMeta = useRolePageMeta('myProducts', 'manufacturer');
  const { t } = useI18n();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [summary, setSummary] = useState<ManufacturerDashboardSummary | null>(null);
  const { insights, loading: insightsLoading, error: insightsError, refresh: refreshInsights } =
    useManufacturerBrandInsights(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ManufacturerCatalogueFilter>(() =>
    parseFilterParam(searchParams.get('filter')),
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    setFilter(parseFilterParam(searchParams.get('filter')));
  }, [searchParams]);

  const loadSummary = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await fetchDashboardSummary();
      if (res.role !== 'manufacturer') {
        setSummaryError('This page is for manufacturer accounts only.');
        return;
      }
      setSummary(res.data as ManufacturerDashboardSummary);
    } catch (e) {
      setSummaryError(e instanceof Error ? e.message : 'Failed to load summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    void loadSummary();
  }, []);

  const refreshAll = () => {
    void loadSummary();
    void refreshInsights();
  };

  const loading = summaryLoading || insightsLoading;
  const allProducts = insights?.catalogueProducts ?? [];
  const manufacturerId = user?.id ?? 0;
  const pendingIds = insights?.pendingOutboundProductIds ?? new Set<string>();

  const filterCounts = useMemo(
    () => countByCatalogueFilter(allProducts, manufacturerId, pendingIds),
    [allProducts, manufacturerId, pendingIds],
  );

  const filteredProducts = useMemo(() => {
    let list = filterManufacturerCatalogue(allProducts, filter, {
      manufacturerUserId: manufacturerId,
      pendingTransferProductIds: pendingIds,
    });
    if (searchQuery.trim()) {
      list = list.filter((p) => productMatchesSearch(p, searchQuery));
    }
    return list;
  }, [allProducts, filter, manufacturerId, pendingIds, searchQuery]);

  const setFilterAndUrl = (next: ManufacturerCatalogueFilter) => {
    setFilter(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('filter');
    else params.set('filter', next);
    setSearchParams(params, { replace: true });
  };

  const showPendingFilter = filterCounts.pending_transfer > 0 || pendingIds.size > 0;

  const handleMetadataSaved = (updated: Product) => {
    void refreshInsights();
    void loadSummary();
    setEditingProduct(null);
    if (updated.metadataComplete && filter === 'missing_metadata') {
      setFilterAndUrl('all');
    }
  };

  return (
    <AppShell title={pageMeta.title} subtitle={pageMeta.subtitle}>
      <div className="space-y-6 animate-fade-up">
        <ManufacturerProfileTrustBanner />

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={refreshAll} disabled={loading}>
            {loading ? t('workspace.refreshingAnalytics') : t('workspace.refreshAnalytics')}
          </Button>
          <Button as={Link} to="/create">
            {t('dash.mfg.create.t')}
          </Button>
          <Button as={Link} to="/transfer" variant="ghost">
            {t('nav.requestTransfer')}
          </Button>
          <Button as={Link} to="/dashboard" variant="ghost">
            {t('mfgCatalogue.backToOverview')}
          </Button>
        </div>

        {summaryError && (
          <Alert type="error" className="border border-red-200 dark:border-red-900/60">
            {summaryError}
          </Alert>
        )}
        {insightsError && <Alert type="warning">{insightsError}</Alert>}

        {summary && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="card p-3">
              <p className="text-xs text-page-label">{t('mfgDash.cardRegistered')}</p>
              <p className="text-xl font-bold text-page-title">{summary.totalProducts}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-page-label">{t('mfgDash.cardQrReady')}</p>
              <p className="text-xl font-bold text-page-title">{summary.qrSupportedProductsCount ?? 0}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-page-label">{t('mfgDash.cardMissingMeta')}</p>
              <p className="text-xl font-bold text-page-title">{summary.missingMetadataCount}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-page-label">{t('mfgDash.cardExpiring')}</p>
              <p className="text-xl font-bold text-page-title">{insights?.expiringSoonCount ?? 0}</p>
            </div>
          </div>
        )}

        <div className="card p-5">
          <h3 className="text-page-heading mb-1">{t('mfgCatalogue.title')}</h3>
          <p className="mb-4 text-sm text-page-muted">{t('mfgCatalogue.subtitle')}</p>

          <div className="mb-4">
            <label htmlFor="mfg-catalogue-search" className="sr-only">
              {t('mfgCatalogue.searchLabel')}
            </label>
            <input
              id="mfg-catalogue-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('mfgCatalogue.searchPlaceholder')}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-page-body placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-900"
            />
          </div>

          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label={t('mfgCatalogue.filtersLabel')}>
            {FILTER_KEYS.map((key) => {
              if (key === 'pending_transfer' && !showPendingFilter) return null;
              const count = filterCounts[key];
              const active = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilterAndUrl(key)}
                  className={clsx(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    active
                      ? 'bg-primary-600 text-white dark:bg-primary-600'
                      : 'bg-neutral-100 text-page-muted hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700',
                  )}
                >
                  {t(`mfgCatalogue.filter.${key}`)}
                  <span className="ml-1 tabular-nums opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          {loading && allProducts.length === 0 ? (
            <p className="text-sm text-page-muted">{t('common.loading')}</p>
          ) : (
            <ManufacturerProductCatalogue
              products={filteredProducts}
              pendingTransferProductIds={pendingIds}
              journeyOptions={
                manufacturerId
                  ? {
                      manufacturerUserId: manufacturerId,
                      pendingTransferProductIds: pendingIds,
                    }
                  : null
              }
              onEditMetadata={(p) => setEditingProduct(p)}
              emptyMessage={
                searchQuery.trim()
                  ? t('mfgCatalogue.emptySearch')
                  : filter !== 'all'
                    ? t('mfgCatalogue.emptyFilter')
                    : t('mfgProducts.empty')
              }
            />
          )}
        </div>

        <ManufacturerMetadataModal
          product={editingProduct}
          isOpen={editingProduct != null}
          onClose={() => setEditingProduct(null)}
          onSaved={handleMetadataSaved}
        />
      </div>
    </AppShell>
  );
}
