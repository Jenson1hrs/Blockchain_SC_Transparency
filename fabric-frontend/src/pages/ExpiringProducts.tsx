import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Button, Alert, ProductCard } from '../components';
import { getExpiringProducts } from '../api/productService';
import { getExpiryReminder } from '../utils/expiryReminder';
import type { Product } from '../types';
import { addToUserInventory } from '../api/inventoryService';

const ExpiringProducts = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryMsg, setInventoryMsg] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const rows = await getExpiringProducts(7);
        setItems(rows);
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

  return (
    <AppShell
      title="Expiring Products"
      subtitle="Products reaching expiry within the next 7 days"
    >
      <div className="space-y-8 animate-fade-up">
        {/* Header with Stats */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Expiry Alerts
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-200 mt-1">
                Monitor products approaching their expiry dates
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              {expiredCount > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-danger-600">
                    {expiredCount}
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-300">Expired</div>
                </div>
              )}
              {urgentCount > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-600">
                    {urgentCount}
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-300">Urgent</div>
                </div>
              )}
              {warningCount > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-600">
                    {warningCount}
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-300">Warning</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 rounded-full mb-4">
              <svg
                className="animate-spin w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Loading Products
            </h3>
            <p className="text-neutral-600 dark:text-neutral-200">
              Checking for expiring products...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && <Alert type="error">{error}</Alert>}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 dark:bg-success-900/35 text-success-600 dark:text-success-300 rounded-full mb-6">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              All Good!
            </h3>
            <p className="text-neutral-600 dark:text-neutral-200 mb-8 max-w-md mx-auto">
              No products are expiring within the next 7 days. All your tracked
              products are safe.
            </p>
            <Button as={Link} to="/verify" size="lg">
              Verify Product
            </Button>
          </div>
        )}

        {/* Products List */}
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
                              setError(e instanceof Error ? e.message : 'Could not save to inventory');
                            }
                          })();
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  }
                />
              );
            })}
          </div>
        )}

        {/* Inventory Message */}
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
