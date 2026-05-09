import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { getExpiringProducts } from '../api/productService';
import { getExpiryReminder } from '../utils/expiryReminder';
import type { Product } from '../types';
import { addInventoryId } from '../utils/inventoryStorage';

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

  return (
    <AppShell
      title="Expiring Soon"
      subtitle="Products reaching expiry within 7 days."
    >
      <div className="card p-6 animate-fade-up">
        {loading && <p className="text-sm text-gray-600">Loading…</p>}
        {error && (
          <pre className="text-xs text-red-800 bg-red-50 p-3 rounded-lg border border-red-200 whitespace-pre-wrap font-sans overflow-x-auto">
            {error}
          </pre>
        )}
        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-gray-600">No products expiring in the next 7 days.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="divide-y divide-gray-200">
            {items.map((p) => {
              const expiry = getExpiryReminder(p.expiryDate);
              return (
                <div key={p.productId} className="py-4 flex flex-col gap-2">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{p.productId}</p>
                    </div>
                    {expiry && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          expiry.level === 'expired'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : expiry.level === 'urgent'
                              ? 'bg-orange-100 text-orange-800 border-orange-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {expiry.label}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Expiry: {p.expiryDate || 'N/A'} | Owner: {p.owner}
                  </div>
                  <div className="text-sm">
                    <div className="flex gap-4">
                      <Link
                        to={`/verify/${encodeURIComponent(p.productId)}`}
                        className="text-blue-600 hover:underline"
                      >
                        Verify product →
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const out = addInventoryId(p.productId);
                          setInventoryMsg(
                            out.added
                              ? `${p.productId} added to My Inventory`
                              : `${p.productId} already in My Inventory`
                          );
                        }}
                        className="text-indigo-700 hover:underline"
                      >
                        Add to Inventory
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {inventoryMsg && (
          <p className="text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg p-3 mt-4">
            {inventoryMsg}{' '}
            <Link to="/inventory" className="underline">
              Open Inventory
            </Link>
          </p>
        )}
      </div>
    </AppShell>
  );
};

export default ExpiringProducts;
