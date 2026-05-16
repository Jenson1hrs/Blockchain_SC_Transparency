import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Alert, Button } from '../components';
import { fetchAssignedProducts } from '../api/productService';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import type { Product } from '../types';

export default function AssignedProductsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
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

  const titleKey =
    user?.role === 'retailer' ? 'assignedProducts.titleRetailer' : 'assignedProducts.titleDistributor';
  const subtitleKey =
    user?.role === 'retailer'
      ? 'assignedProducts.subtitleRetailer'
      : 'assignedProducts.subtitleDistributor';

  return (
    <AppShell title={t(titleKey)} subtitle={t(subtitleKey)}>
      <div className="space-y-6 animate-fade-up">
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => void load()} disabled={loading}>
            {loading ? t('workspace.refreshingAnalytics') : t('workspace.refreshAnalytics')}
          </Button>
          <Button as={Link} to="/transfer">
            {t('nav.transfer')}
          </Button>
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
          <p className="text-sm text-page-muted">{t('assignedProducts.empty')}</p>
        )}

        {products.length > 0 && (
          <div className="card p-5">
            <p className="mb-4 text-sm text-page-muted">
              {t('assignedProducts.count', { count: String(products.length) })}
            </p>
            <ul className="divide-y divide-neutral-200/80 dark:divide-neutral-700/80">
              {products.map((p) => (
                <li
                  key={p.productId}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-page-title truncate">{p.name || p.productId}</p>
                    <p className="text-xs text-page-muted mt-0.5">
                      ID: {p.productId}
                      {p.status ? ` · ${p.status}` : ''}
                      {p.currentOwnerName ? ` · ${p.currentOwnerName}` : ''}
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
                    <Button as={Link} to="/transfer" variant="ghost" size="sm">
                      {t('nav.transfer')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  );
}
