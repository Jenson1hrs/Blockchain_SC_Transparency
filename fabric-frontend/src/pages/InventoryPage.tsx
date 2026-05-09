import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import type { Product } from '../types';
import { getProduct } from '../api/productService';
import { getExpiryReminder } from '../utils/expiryReminder';
import { getInventoryIds, removeInventoryId } from '../utils/inventoryStorage';

type InventoryFilter = 'all' | 'expired' | 'urgent' | 'warning' | 'safe';
type SortMode = 'expiryAsc' | 'expiryDesc' | 'nameAsc';

const InventoryPage = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<InventoryFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('expiryAsc');

  const load = async () => {
    setLoading(true);
    setError(null);
    const ids = getInventoryIds();
    try {
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

  const onRemove = (id: string) => {
    removeInventoryId(id);
    setItems((prev) => prev.filter((p) => p.productId !== id));
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

  return (
    <AppShell
      title="My Inventory"
      subtitle="Local prototype: products saved in your browser only."
    >
      <div className="card p-6 animate-fade-up">
        {loading && <p className="text-sm text-gray-600">Loading inventory...</p>}
        {error && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            {error}
          </p>
        )}
        {!loading && items.length === 0 && (
          <p className="text-sm text-gray-600">
            No items yet. Verify a product and click <strong>Add to My Inventory</strong>.
          </p>
        )}

        {!loading && items.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                ['all', 'All'],
                ['expired', 'Expired'],
                ['urgent', 'Urgent'],
                ['warning', 'Expiring Soon'],
                ['safe', 'Safe'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id as InventoryFilter)}
                  className={`px-3 py-1.5 text-sm rounded-md border ${
                    filter === id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="ml-auto px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
              >
                <option value="expiryAsc">Sort: Expiry soonest</option>
                <option value="expiryDesc">Sort: Expiry latest</option>
                <option value="nameAsc">Sort: Name A-Z</option>
              </select>
            </div>
          <div className="space-y-4">
            {filteredAndSorted.map((product) => {
              const reminder = getExpiryReminder(product.expiryDate);
              const badgeClass = reminder
                ? reminder.level === 'expired'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : reminder.level === 'urgent'
                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                    : reminder.level === 'warning'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-green-100 text-green-800 border-green-200'
                : 'bg-gray-100 text-gray-700 border-gray-200';
              return (
                <div key={product.productId} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                    <div className="md:col-span-1">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-28 object-cover rounded-md border border-gray-200"
                        />
                      ) : (
                        <div className="h-28 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-500">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-4">
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{product.productId}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full border ${badgeClass}`}>
                          {reminder?.label || 'No expiry date'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Expiry: {product.expiryDate || 'N/A'} | Owner: {product.owner}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <Link
                          to={`/verify/${encodeURIComponent(product.productId)}`}
                          className="text-blue-600 hover:underline"
                        >
                          Verify →
                        </Link>
                        <button
                          type="button"
                          onClick={() => onRemove(product.productId)}
                          className="text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredAndSorted.length === 0 && (
            <p className="text-sm text-gray-600 mt-2">No products match this filter.</p>
          )}
          </>
        )}
      </div>
    </AppShell>
  );
};

export default InventoryPage;
