import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getProductHistory,
  updateLocation,
} from '../api/productService';
import type { Product, ProductHistory } from '../types';
import { formatHistoryTimestamp } from '../utils/historyTime';
import AppShell from '../components/AppShell';

const UpdateLocation = () => {
  const [productId, setProductId] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<ProductHistory[]>([]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId.trim() || !location.trim()) {
      setError('Product ID and new location are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setProduct(null);
    setHistory([]);
    try {
      const updated = await updateLocation(productId.trim(), location.trim());
      setProduct(updated);
      setSuccess(`Location update successful for product ${updated.productId}.`);
      const h = await getProductHistory(productId.trim());
      setHistory(h);
      setLocation('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Location update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Update Location" subtitle="Track movement by recording latest product location.">
      <div className="max-w-3xl mx-auto">

        <form
          onSubmit={submit}
          className="card p-6 space-y-4 mb-8 animate-fade-up"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product ID
            </label>
            <input
              type="text"
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="e.g. P1200"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <Link
              to={productId.trim() ? `/qr/${encodeURIComponent(productId.trim())}` : '#'}
              onClick={(e) => {
                if (!productId.trim()) {
                  e.preventDefault();
                  setError('Enter Product ID first to view QR');
                }
              }}
              className="inline-block mt-2 text-xs text-blue-600 hover:underline"
            >
              View QR code
            </Link>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Location
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Warehouse B"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {success}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating…' : 'Update location'}
          </button>
        </form>

        {product && (
          <div className="card overflow-hidden mb-8 animate-fade-up">
            <div className="bg-blue-50 p-4 border-b border-blue-200">
              <h2 className="text-lg font-semibold text-blue-900">Updated Product</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Product ID</p>
                <p className="font-mono">{product.productId}</p>
                <Link to={`/qr/${encodeURIComponent(product.productId)}`} className="text-xs text-blue-600 hover:underline">
                  View QR code
                </Link>
              </div>
              <div><p className="text-gray-500">Location</p><p className="font-medium">{product.location}</p></div>
              <div><p className="text-gray-500">Owner</p><p className="font-medium">{product.owner}</p></div>
              <div><p className="text-gray-500">Status</p><p className="font-medium">{product.status}</p></div>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="card overflow-hidden animate-fade-up">
            <div className="bg-gray-100 p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Product journey</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {history.map((entry, index) => (
                <div key={`${entry.txId}-${index}`} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm font-medium">{entry.data.status}</span>
                    <span className="text-xs text-gray-500">{formatHistoryTimestamp(entry)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Owner: {entry.data.owner} | Location: {entry.data.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default UpdateLocation;
