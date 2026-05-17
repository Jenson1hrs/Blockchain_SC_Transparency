import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Alert, Button, ExpiryBadge, ProductStatusBadge } from '../components';
import { fetchAssignedProducts } from '../api/productService';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useRolePageMeta } from '../hooks/useRolePageMeta';
import { getExpiryReminder } from '../utils/expiryReminder';
import type { Product } from '../types';

export default function AssignedProductsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const isRetailer = user?.role === 'retailer';
  const pageMeta = useRolePageMeta('assignedProducts', 'distributor');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAssignedProducts();
      setProducts(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <AppShell title={pageMeta.title} subtitle={pageMeta.subtitle}>
      <div className="space-y-6 animate-fade-up">
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => void load()} disabled={loading}>
            {loading ? t('workspace.refreshingAnalytics') : t('workspace.refreshAnalytics')}
          </Button>
          {isRetailer ? (
            <Button as={Link} to="/transfer" variant="primary">
              {t('nav.incomingTransfers')}
            </Button>
          ) : (
            <Button as={Link} to="/transfer">
              {t('nav.transfers')}
            </Button>
          )}
        </div>

        {error && (
          <Alert type="error" className="border border-red-200 dark:border-red-900/60">
            {error}
          </Alert>
        )}

        {loading && products.length === 0 && (
          <p className="text-sm text-page-muted">{t('common.loading')}</p>
        )}

        {!loading && products.length === 0 && (
          <p className="text-sm text-page-muted">
            {isRetailer ? t('retailStock.empty') : t('assignedProducts.empty')}
          </p>
        )}

        {products.length > 0 && (
          <div className="card p-5 overflow-x-auto">
            <p className="mb-4 text-sm text-page-muted">
              {isRetailer
                ? t('retailStock.count', { count: String(products.length) })
                : t('assignedProducts.count', { count: String(products.length) })}
            </p>
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Product ID</th>
                  <th className="text-left px-3 py-2 font-medium">Name</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                  <th className="text-left px-3 py-2 font-medium">Location</th>
                  <th className="text-left px-3 py-2 font-medium">Expiry</th>
                  <th className="text-left px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-700/80">
                {products.map((p) => {
                  const expiryReminder = getExpiryReminder(p.expiryDate);
                  return (
                    <tr key={p.productId}>
                      <td className="px-3 py-3 font-mono text-xs">{p.productId}</td>
                      <td className="px-3 py-3 font-medium">{p.name || '—'}</td>
                      <td className="px-3 py-3">
                        {p.status ? <ProductStatusBadge status={p.status} /> : '—'}
                      </td>
                      <td className="px-3 py-3 text-page-muted">{p.location || '—'}</td>
                      <td className="px-3 py-3">
                        {p.expiryDate ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{String(p.expiryDate).slice(0, 10)}</span>
                            {expiryReminder && <ExpiryBadge level={expiryReminder.level} />}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            as={Link}
                            to="/verify"
                            state={{ productId: p.productId }}
                            variant="secondary"
                            size="sm"
                          >
                            {t('mfgProducts.openVerify')}
                          </Button>
                          {isRetailer ? (
                            <Button
                              as={Link}
                              to="/location"
                              state={{ productId: p.productId }}
                              variant="ghost"
                              size="sm"
                            >
                              {t('nav.updateStoreLocation')}
                            </Button>
                          ) : (
                            <Button
                              as={Link}
                              to="/location"
                              state={{ productId: p.productId }}
                              variant="ghost"
                              size="sm"
                            >
                              {t('nav.location')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
