import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useRolePageMeta } from '../hooks/useRolePageMeta';
import { useAuth } from '../context/AuthContext';
import { Button, Alert, ProductCard } from '../components';
import { getExpiringProducts } from '../api/productService';
import { getExpiryReminder } from '../utils/expiryReminder';
import type { Product } from '../types';
import { addToUserInventory } from '../api/inventoryService';

const ExpiringProducts = () => {
  const { user } = useAuth();
  const pageMeta = useRolePageMeta('expiring');
  const isConsumer = user?.role === 'consumer';
  const [items, setItems] = useState<Product[]>([]);
  const [expiredInScope, setExpiredInScope] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryMsg, setInventoryMsg] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const { products, meta } = await getExpiringProducts(7, { includeExpired: true });
        setItems(products);
        const fromMeta = meta?.expiredCount ?? 0;
        const fromList = products.filter(
          (p) => getExpiryReminder(p.expiryDate)?.level === 'expired',
        ).length;
        setExpiredInScope(Math.max(fromMeta, fromList));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const expiredCount = items.filter(
    (p) => getExpiryReminder(p.expiryDate)?.level === 'expired',
  ).length;
  const urgentCount = items.filter(
    (p) => getExpiryReminder(p.expiryDate)?.level === 'urgent',
  ).length;
  const warningCount = items.filter(
    (p) => getExpiryReminder(p.expiryDate)?.level === 'warning',
  ).length;
  const showExpiredStat = expiredCount > 0 || expiredInScope > 0;

  return (
    <AppShell title={pageMeta.title} subtitle={pageMeta.subtitle}>
      <div className="space-y-8 animate-fade-up">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Expiry Alerts
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-200 mt-1">
                {pageMeta.subtitle}
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              {showExpiredStat && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-danger-600">
                    {expiredCount || expiredInScope}
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-300">Expired</div>
                </div>
              )}
              {urgentCount > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-600">{urgentCount}</div>
                  <div className="text-neutral-500 dark:text-neutral-300">Urgent</div>
                </div>
              )}
              {warningCount > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-600">{warningCount}</div>
                  <div className="text-neutral-500 dark:text-neutral-300">Warning</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="card p-12 text-center">
            <p className="text-neutral-600 dark:text-neutral-200">Checking for expiring products…</p>
          </div>
        )}

        {error && !loading && <Alert type="error">{error}</Alert>}

        {!loading && !error && items.length === 0 && (
          <div className="card p-12 text-center">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              All Good!
            </h3>
            <p className="text-neutral-600 dark:text-neutral-200 mb-8 max-w-md mx-auto">
              No products in your scope are expiring within the next 7 days.
            </p>
            <Button as={Link} to="/verify" size="lg">
              Verify Product
            </Button>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="space-y-6">
            {items.map((product) => {
              const reminder = getExpiryReminder(product.expiryDate);
              return (
                <ProductCard
                  key={product.productId}
                  product={{
                    id: product.productId,
                    name: product.name,
                    description: product.ingredients ?? undefined,
                    manufacturer: product.manufacturer,
                    status: product.status,
                    expiryDate: product.expiryDate ?? undefined,
                    imageUrl: product.imageUrl ?? undefined,
                  }}
                  expiryReminder={reminder || undefined}
                  actions={
                    <div className="flex gap-2">
                      <Button
                        as={Link}
                        to={`/verify/${encodeURIComponent(product.productId)}`}
                        variant="secondary"
                        size="sm"
                      >
                        Verify
                      </Button>
                      {isConsumer && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            void (async () => {
                              setError(null);
                              try {
                                const { added } = await addToUserInventory(product.productId);
                                setInventoryMsg(
                                  added
                                    ? `${product.name} added to inventory`
                                    : `${product.name} already in inventory`,
                                );
                              } catch (e) {
                                setError(
                                  e instanceof Error ? e.message : 'Could not save to inventory',
                                );
                              }
                            })();
                          }}
                        >
                          Save
                        </Button>
                      )}
                    </div>
                  }
                />
              );
            })}
          </div>
        )}

        {inventoryMsg && (
          <Alert type="success">
            {inventoryMsg}{' '}
            <Link to="/inventory" className="underline font-medium">
              Open Inventory
            </Link>
          </Alert>
        )}
      </div>
    </AppShell>
  );
};

export default ExpiringProducts;
