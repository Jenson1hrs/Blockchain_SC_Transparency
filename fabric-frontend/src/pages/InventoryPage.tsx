import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Button, Alert, ProductCard } from '../components';
import { useAuth } from '../context/AuthContext';
import { getPersonalizedAlerts } from '../utils/personalizedAlerts';
import type { Product } from '../types';
import { getProduct } from '../api/productService';
import { fetchUserInventory, removeFromUserInventory } from '../api/inventoryService';
import { getExpiryReminder } from '../utils/expiryReminder';

type InventoryFilter = 'all' | 'expired' | 'urgent' | 'warning' | 'safe';
type SortMode = 'expiryAsc' | 'expiryDesc' | 'nameAsc';

const InventoryPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<InventoryFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('expiryAsc');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const entries = await fetchUserInventory();
      const ids = entries.map((e) => e.productId);
      const settled = await Promise.allSettled(ids.map((id) => getProduct(id)));
      const ok = settled
        .filter((r): r is PromiseFulfilledResult<Product> => r.status === 'fulfilled')
        .map((r) => r.value);
      setItems(ok);
      const failed = settled.filter((r) => r.status === 'rejected').length;
      if (failed > 0) {
        setError(`${failed} item(s) could not be loaded (might not exist anymore).`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed loading inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onRemove = async (id: string) => {
    setRemovingId(id);
    setError(null);
    try {
      await removeFromUserInventory(id);
      setItems((prev) => prev.filter((p) => p.productId !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const filteredAndSorted = [...items]
    .filter((p) => {
      if (filter === 'all') return true;
      const r = getExpiryReminder(p.expiryDate);
      return r?.level === filter;
    })
    .sort((a, b) => {
      if (sortMode === 'nameAsc') return a.name.localeCompare(b.name);
      const ar = getExpiryReminder(a.expiryDate);
      const br = getExpiryReminder(b.expiryDate);
      const ad = ar?.daysLeft ?? Number.POSITIVE_INFINITY;
      const bd = br?.daysLeft ?? Number.POSITIVE_INFINITY;
      return sortMode === 'expiryAsc' ? ad - bd : bd - ad;
    });

  const filterOptions = [
    { id: 'all' as InventoryFilter, label: 'All', count: items.length },
    {
      id: 'expired' as InventoryFilter,
      label: 'Expired',
      count: items.filter((p) => getExpiryReminder(p.expiryDate)?.level === 'expired').length,
    },
    {
      id: 'urgent' as InventoryFilter,
      label: 'Urgent',
      count: items.filter((p) => getExpiryReminder(p.expiryDate)?.level === 'urgent').length,
    },
    {
      id: 'warning' as InventoryFilter,
      label: 'Expiring Soon',
      count: items.filter((p) => getExpiryReminder(p.expiryDate)?.level === 'warning').length,
    },
    {
      id: 'safe' as InventoryFilter,
      label: 'Safe',
      count: items.filter((p) => getExpiryReminder(p.expiryDate)?.level === 'safe').length,
    },
  ];

  const sortOptions = [
    { value: 'expiryAsc' as SortMode, label: 'Expiry Soonest' },
    { value: 'expiryDesc' as SortMode, label: 'Expiry Latest' },
    { value: 'nameAsc' as SortMode, label: 'Name A-Z' },
  ];

  return (
    <AppShell
      title="My Inventory"
      subtitle="Products saved to your account for quick access"
    >
      <div className="space-y-8 animate-fade-up">
        {/* Header */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Saved Products</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-200 mt-1">
                {items.length} product{items.length !== 1 ? 's' : ''} in your inventory
              </p>
            </div>
            <Button as={Link} to="/verify" variant="secondary">
              Add Product
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 rounded-full mb-4">
              <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
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
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Loading Inventory</h3>
            <p className="text-neutral-600 dark:text-neutral-200">Fetching your saved products...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && <Alert type="error">{error}</Alert>}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-200 rounded-full mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No Products Saved</h3>
            <p className="text-neutral-600 dark:text-neutral-200 mb-8 max-w-md mx-auto">
              Your inventory is empty. Verify a product and save it here for quick access.
            </p>
            <Button as={Link} to="/verify" size="lg">
              Verify Product
            </Button>
          </div>
        )}

        {/* Filters and Content */}
        {!loading && items.length > 0 && (
          <>
            {/* Filters */}
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFilter(option.id)}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        filter === option.id
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {option.label}
                      <span
                        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          filter === option.id
                            ? 'bg-white/20 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-200'
                        }`}
                      >
                        {option.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Sort by:
                  </label>
                  <select
                    id="sort-select"
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="input-field text-sm"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="space-y-6">
              {filteredAndSorted.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-neutral-600 dark:text-neutral-200">No products match the selected filter.</p>
                </div>
              ) : (
                filteredAndSorted.map((product) => {
                  const reminder = getExpiryReminder(product.expiryDate);
                  const personalizedAlerts = user
                    ? getPersonalizedAlerts(product, user)
                    : undefined;
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
                      personalizedAlerts={personalizedAlerts}
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
                            variant="ghost"
                            size="sm"
                            disabled={removingId === product.productId}
                            onClick={() => void onRemove(product.productId)}
                            className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                          >
                            {removingId === product.productId ? 'Removing…' : 'Remove'}
                          </Button>
                        </div>
                      }
                    />
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default InventoryPage;
