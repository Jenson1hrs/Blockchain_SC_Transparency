import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getProductHistory,
  transferProduct,
} from '../api/productService';
import { fetchSupplyChainUsers, type SupplyChainUser } from '../api/userService';
import type { Product, ProductHistory, UserRole } from '../types';
import { formatHistoryTimestamp } from '../utils/historyTime';
import AppShell from '../components/AppShell';
import {
  VerificationBadge,
  OrganizationFlaggedBadge,
  VerifiedOrganizationBadge,
} from '../components/VerificationBadge';

const TRANSFER_ROLES: UserRole[] = ['manufacturer', 'distributor', 'retailer'];

const TransferProduct = () => {
  const [productId, setProductId] = useState('');
  const [recipientQuery, setRecipientQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [recipients, setRecipients] = useState<SupplyChainUser[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<SupplyChainUser | null>(null);
  const [searchingRecipients, setSearchingRecipients] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<ProductHistory[]>([]);

  const loadRecipients = useCallback(async () => {
    setSearchingRecipients(true);
    try {
      const rows = await fetchSupplyChainUsers(recipientQuery, roleFilter || undefined);
      setRecipients(rows);
    } catch {
      setRecipients([]);
    } finally {
      setSearchingRecipients(false);
    }
  }, [recipientQuery, roleFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRecipients();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [loadRecipients]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId.trim()) {
      setError('Product ID is required');
      return;
    }
    if (!selectedRecipient) {
      setError('Select a recipient organization from the list');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setProduct(null);
    setHistory([]);
    try {
      const updated = await transferProduct(productId.trim(), selectedRecipient.id);
      setProduct(updated);
      setSuccess(
        `Ownership transfer successful for product ${updated.productId} → ${selectedRecipient.displayName}.`
      );
      const h = await getProductHistory(productId.trim());
      setHistory(h);
      setSelectedRecipient(null);
      setRecipientQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Transfer Ownership" subtitle="Transfer product custody to another supply-chain organization.">
      <div className="max-w-3xl mx-auto">

        <form
          onSubmit={submit}
          className="card p-6 space-y-4 mb-8 animate-fade-up"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">
              Product ID
            </label>
            <input
              type="text"
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="e.g. P1200"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-600"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">
              Recipient organization
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              <input
                type="search"
                value={recipientQuery}
                onChange={(e) => setRecipientQuery(e.target.value)}
                placeholder="Search by name, company, or email"
                className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-600"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-neutral-900 dark:border-neutral-600"
              >
                <option value="">All roles</option>
                {TRANSFER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {selectedRecipient && (
              <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-primary-200 bg-primary-50/80 px-3 py-2 text-sm dark:border-primary-800 dark:bg-primary-950/40">
                <span className="font-medium">{selectedRecipient.displayName}</span>
                <span className="text-page-muted capitalize">({selectedRecipient.role})</span>
                {selectedRecipient.organizationVerified && <VerifiedOrganizationBadge />}
                {selectedRecipient.organizationFlagged && <OrganizationFlaggedBadge />}
                <button
                  type="button"
                  className="ml-auto text-xs text-primary-700 hover:underline dark:text-primary-300"
                  onClick={() => setSelectedRecipient(null)}
                >
                  Clear
                </button>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-100 dark:divide-neutral-800">
              {searchingRecipients && (
                <p className="p-3 text-sm text-page-muted">Searching…</p>
              )}
              {!searchingRecipients && recipients.length === 0 && (
                <p className="p-3 text-sm text-page-muted">No matching organizations</p>
              )}
              {recipients.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedRecipient(u)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800/80 ${
                    selectedRecipient?.id === u.id ? 'bg-primary-50 dark:bg-primary-950/30' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{u.displayName}</span>
                    <span className="text-xs text-page-muted capitalize">{u.role}</span>
                    {u.organizationVerified && <VerificationBadge verified />}
                    {u.organizationFlagged && <OrganizationFlaggedBadge />}
                  </div>
                  {u.email && (
                    <span className="text-xs text-page-muted">{u.email}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm dark:bg-green-950/40 dark:border-green-900 dark:text-green-300">
              {success}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !selectedRecipient}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Transferring…' : 'Transfer'}
          </button>
        </form>

        {product && (
          <div className="card overflow-hidden mb-8 animate-fade-up">
            <div className="bg-yellow-50 p-4 border-b border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900">
              <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200">Updated Product</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-neutral-200">Product ID</p>
                <p className="font-mono">{product.productId}</p>
                <Link to={`/qr/${encodeURIComponent(product.productId)}`} className="text-xs text-blue-600 hover:underline">
                  View QR code
                </Link>
              </div>
              <div>
                <p className="text-gray-500 dark:text-neutral-200">Owner</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {product.currentOwnerName || product.owner}
                </p>
                {product.currentOwnerRole && (
                  <p className="text-xs text-page-muted capitalize">{product.currentOwnerRole}</p>
                )}
              </div>
              <div><p className="text-gray-500 dark:text-neutral-200">Status</p><p className="font-medium text-neutral-900 dark:text-neutral-100">{product.status}</p></div>
              <div><p className="text-gray-500 dark:text-neutral-200">Location</p><p className="font-medium text-neutral-900 dark:text-neutral-100">{product.location}</p></div>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="card overflow-hidden animate-fade-up">
            <div className="bg-gray-100 p-4 border-b border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
              <h3 className="text-lg font-semibold">Product journey</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-neutral-700">
              {history.map((entry, index) => (
                <div key={`${entry.txId}-${index}`} className="p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm font-medium">{entry.data.status}</span>
                    <span className="text-xs text-gray-500 dark:text-neutral-200">{formatHistoryTimestamp(entry)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-neutral-200 mt-1">
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

export default TransferProduct;
