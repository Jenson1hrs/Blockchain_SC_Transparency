import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  getProduct,
  getProductHistory,
  verifyQr,
  getManufacturerDisplayLabel,
  searchProducts,
  type ProductSearchResult,
} from '../api/productService';
import type { Product, ProductTimelineEntry } from '../types';
import QRScanner from '../components/QRScanner';
import AppShell from '../components/AppShell';
import { useRolePageMeta } from '../hooks/useRolePageMeta';
import {
  Button,
  Alert,
  TextField,
  ProductCard,
  ProductStatusBadge,
  ExpiryBadge,
  ProductTimeline,
  PersonalizedAlertsPanel,
  ConsumerVerificationSummary,
  ProductComplaintForm,
  ProductTrustPathSummary,
} from '../components';
import { parseQrPayload } from '../utils/parseQrPayload';
import { getExpiryReminder } from '../utils/expiryReminder';
import { useAuth } from '../context/AuthContext';
import { addToUserInventory } from '../api/inventoryService';
import {
  VerifiedOrganizationBadge,
  VerificationBadge,
  OrganizationFlaggedBadge,
} from '../components/VerificationBadge';
import { OrganizationLink } from '../components/OrganizationLink';
import { VerifyProductLookupPreview } from '../components/ProductLookupPreview';

const VerifyProduct: React.FC = () => {
  const { user } = useAuth();
  const pageMeta = useRolePageMeta('verify');
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [productId, setProductId] = useState('');
  const [searchResults, setSearchResults] = useState<ProductSearchResult[] | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<ProductTimelineEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [pastedQrUrl, setPastedQrUrl] = useState('');
  const [inventoryMsg, setInventoryMsg] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [verificationLevel, setVerificationLevel] = useState<'full' | 'limited' | null>(null);

  useEffect(() => {
    const fromState = (location.state as { productId?: string } | null)?.productId;
    if (fromState && String(fromState).trim()) {
      const id = String(fromState).trim();
      setQuery(id);
      setProductId(id);
    }
  }, [location.state]);

  const loadProductById = async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) {
      setError('Please enter a product ID or search term');
      return;
    }
    setLoading(true);
    setError(null);
    setProduct(null);
    setHistory(null);
    setSearchResults(null);
    setProductId(trimmed);
    setVerificationLevel(null);

    try {
      const p = await getProduct(trimmed);
      setProduct(p);
      setVerificationLevel('limited');
      setQuery(trimmed);
      const h = await getProductHistory(trimmed);
      setHistory(h);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product not found or failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const term = query.trim();
    if (!term) {
      setError('Enter a product ID, name, manufacturer, or batch number');
      return;
    }

    setLoading(true);
    setError(null);
    setProduct(null);
    setHistory(null);
    setSearchResults(null);
    setVerificationLevel(null);

    try {
      const exactIdMatch = /^[A-Za-z0-9_-]+$/.test(term);
      if (exactIdMatch) {
        try {
          const p = await getProduct(term);
          setProduct(p);
          setVerificationLevel('limited');
          setProductId(term);
          setHistory(await getProductHistory(term));
          return;
        } catch {
          /* fall through to search */
        }
      }

      const results = await searchProducts(term);
      if (results.length === 0) {
        setError('No products matched your search. Try another keyword or check the product ID.');
        return;
      }
      if (results.length === 1 && results[0].productId.toLowerCase() === term.toLowerCase()) {
        await loadProductById(results[0].productId);
        return;
      }
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (scannedText: string) => {
    const parsed = parseQrPayload(scannedText);
    if (!parsed) {
      setError('Invalid QR: expected verify URL or id|batch|hash');
      return;
    }

    setLoading(true);
    setError(null);
    setShowScanner(false);
    setProduct(null);
    setHistory(null);
    setVerificationLevel(null);

    try {
      const r = await verifyQr(parsed.productId, parsed.batch, parsed.hash);
      if (r.status === 'authentic' && r.product) {
        setProduct(r.product);
        setVerificationLevel('full');
        setProductId(parsed.productId);
        const h = await getProductHistory(parsed.productId);
        setHistory(h);
        return;
      }
      if (r.status === 'fake') {
        setError(
          r.message ||
            'QR verification failed. The QR code may have been tampered with.',
        );
        return;
      }
      if (r.status === 'not_found') {
        setError(
          r.message ||
            'Product not found. This may be an unregistered or counterfeit item.',
        );
        return;
      }
      setError(r.message || 'Verification failed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const expiryReminder = product ? getExpiryReminder(product.expiryDate) : null;

  const handleAddToInventory = async (id: string) => {
    setInventoryMsg(null);
    if (!user) {
      setError('Sign in to save products to your inventory. Use Login in the navigation.');
      return;
    }
    if (user.role !== 'consumer') {
      return;
    }
    try {
      const { added } = await addToUserInventory(id);
      setInventoryMsg(added ? 'Added to My Inventory' : 'Already in My Inventory');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add to inventory');
    }
  };

  return (
    <AppShell title={pageMeta.title} subtitle={pageMeta.subtitle}>
      <div className="space-y-8 animate-fade-up">
        {/* Verification Form */}
        <div className="card p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Verify Product
            </h2>
            <p className="text-neutral-600 dark:text-neutral-200">
              Look up a product by ID, name, manufacturer, or batch. Use QR verification for
              authenticity checks.
            </p>
          </div>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSearch();
            }}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <TextField
                  label="Product lookup"
                  value={query}
                  onChange={(e) => {
                    const next = e.target.value;
                    setQuery(next);
                    setProductId(next);
                    const trimmed = next.trim();
                    if (
                      product &&
                      trimmed &&
                      trimmed.toLowerCase() !== product.productId.toLowerCase()
                    ) {
                      setProduct(null);
                      setHistory(null);
                      setVerificationLevel(null);
                      setSearchResults(null);
                    }
                  }}
                  placeholder="Product ID, name, manufacturer, or batch"
                />
                {!product && (
                  <VerifyProductLookupPreview
                    query={query}
                    disabled={loading}
                    onSelectProduct={(id) => void loadProductById(id)}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-2 items-end">
                <Button type="submit" isLoading={loading} className="whitespace-nowrap">
                  {loading ? 'Searching…' : 'Search'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowScanner((s) => !s)}
                >
                  {showScanner ? 'Close QR options' : 'Verify with QR'}
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                as={Link}
                to={
                  productId.trim()
                    ? `/qr/${encodeURIComponent(productId.trim())}`
                    : '#'
                }
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  if (!productId.trim()) {
                    e.preventDefault();
                    setError('Enter Product ID first to view QR');
                  }
                }}
              >
                View QR Code
              </Button>
              {user?.role === 'consumer' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const id = productId.trim() || product?.productId || '';
                    if (!id) {
                      setError('Enter Product ID first to add to inventory');
                      return;
                    }
                    void handleAddToInventory(id);
                  }}
                >
                  Add to Inventory
                </Button>
              )}
            </div>
          </form>

          {searchResults && searchResults.length > 0 && (
            <div className="mt-6 border-t border-neutral-200 dark:border-neutral-600 pt-6">
              <h3 className="text-sm font-semibold text-page-title mb-3">
                Search results ({searchResults.length})
              </h3>
              <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-600">
                <table className="min-w-full text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Product ID</th>
                      <th className="text-left px-3 py-2 font-medium">Name</th>
                      <th className="text-left px-3 py-2 font-medium">Manufacturer</th>
                      <th className="text-left px-3 py-2 font-medium">Batch</th>
                      <th className="text-left px-3 py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {searchResults.map((row) => (
                      <tr key={row.productId} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/30">
                        <td className="px-3 py-2 font-mono text-xs">{row.productId}</td>
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2">{row.manufacturer}</td>
                        <td className="px-3 py-2">{row.batchNumber}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="primary"
                              onClick={() => void loadProductById(row.productId)}
                            >
                              Verify
                            </Button>
                            <Button
                              as={Link}
                              to={`/qr/${encodeURIComponent(row.productId)}`}
                              size="sm"
                              variant="ghost"
                            >
                              View QR
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* QR Scanner Section */}
          {showScanner && (
            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-600">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Verify with QR
                </h3>
                <p className="text-neutral-600 dark:text-neutral-200">
                  Use your phone&apos;s QR scanner app, paste the verification link, or upload a photo of
                  the QR code.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <TextField
                      label="Paste verification link"
                      type="url"
                      value={pastedQrUrl}
                      onChange={(e) => setPastedQrUrl(e.target.value)}
                      placeholder="Full verification URL from QR (host from API FRONTEND_URL)"
                      helperText="From any QR scanner app"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        const t = pastedQrUrl.trim();
                        if (t) void handleScan(t);
                      }}
                      disabled={loading || !pastedQrUrl.trim()}
                      isLoading={loading}
                    >
                      Use Link
                    </Button>
                  </div>
                </div>

                <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-4">
                  <QRScanner
                    onScan={(t) => void handleScan(t)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          {/* Inventory Message */}
          {inventoryMsg && (
            <div className="mt-6">
              <Alert type="success">
                {inventoryMsg}{' '}
                <Link to="/inventory" className="underline font-medium">
                  Open Inventory
                </Link>
              </Alert>
            </div>
          )}
        </div>

        {/* Product Details */}
        {product && (
          <div className="space-y-8">
            {(product.manufacturerOrganizationVerified ||
              product.manufacturerVerifiedByRegulator ||
              product.manufacturerOrganizationFlagged) && (
              <div className="flex flex-wrap gap-2">
                {product.manufacturerOrganizationVerified && <VerifiedOrganizationBadge />}
                {product.manufacturerVerifiedByRegulator && <VerificationBadge verified />}
                {product.manufacturerOrganizationFlagged && <OrganizationFlaggedBadge />}
              </div>
            )}
            {verificationLevel && (
              <ConsumerVerificationSummary
                verificationLevel={verificationLevel}
                product={product}
                hasSupplyChainHistory={Boolean(history && history.length > 0)}
              />
            )}
            {/* Product Card */}
            <ProductCard
              product={{
                id: product.productId,
                name: product.name,
                description: product.ingredients ?? undefined,
                manufacturer: product.manufacturer,
                manufacturerUserId: product.manufacturerUserId,
                manufacturerDisplayName: getManufacturerDisplayLabel(product),
                metadataComplete: product.metadataComplete,
                manufacturerOrganizationVerified: product.manufacturerOrganizationVerified,
                manufacturerOrganizationFlagged: product.manufacturerOrganizationFlagged,
                status: product.status,
                expiryDate: product.expiryDate ?? undefined,
                imageUrl: product.imageUrl ?? undefined,
              }}
              expiryReminder={expiryReminder || undefined}
              actions={
                <>
                  <Button
                    as={Link}
                    to={`/qr/${encodeURIComponent(product.productId)}`}
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    View QR
                  </Button>
                  {user?.role === 'consumer' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => void handleAddToInventory(product.productId)}
                    >
                      Add to Inventory
                    </Button>
                  )}
                </>
              }
            />

            <PersonalizedAlertsPanel product={product} user={user} />

            <ProductComplaintForm productId={product.productId} productName={product.name} />

            {/* Detailed Information */}
            <div className="card p-8">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                Product Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                      Product ID
                    </label>
                    <p className="font-mono text-neutral-900 dark:text-neutral-100">
                      {product.productId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                      Batch Number
                    </label>
                    <p className="font-mono text-neutral-900 dark:text-neutral-100">
                      {product.batchNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                      Status
                    </label>
                    <div className="mt-1">
                      <ProductStatusBadge status={product.status} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                      Current Owner
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {product.currentOwnerName || product.owner}
                    </p>
                    {product.currentOwnerRole && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-300 capitalize">
                        {product.currentOwnerRole}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                      Manufacturer
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      <OrganizationLink
                        userId={product.manufacturerUserId}
                        name={getManufacturerDisplayLabel(product)}
                      />
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                      Location
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">{product.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                      Last Updated
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {new Date(product.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                      Halal Status
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {product.halalStatus || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                      Expiry Date
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {product.expiryDate || 'N/A'}
                    </p>
                  </div>
                  {expiryReminder && (
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                        Expiry Status
                      </label>
                      <div className="mt-1">
                        <ExpiryBadge level={expiryReminder.level} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-8 space-y-6">
                {product.ingredients && (
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                      Ingredients
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100 mt-1">
                      {product.ingredients}
                    </p>
                  </div>
                )}

                {product.allergyInfo && (
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                      Allergy Information
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100 mt-1">
                      {product.allergyInfo}
                    </p>
                  </div>
                )}

                {product.usageInstructions && (
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                      Usage Instructions
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100 mt-1">
                      {product.usageInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Supply chain trust path + history */}
            <div className="card p-8 space-y-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Supply Chain History
              </h3>
              <ProductTrustPathSummary product={product} history={history ?? []} />
              {history && history.length > 0 ? (
                <ProductTimeline history={history} />
              ) : (
                <p className="text-sm text-page-muted">
                  No detailed timeline events are recorded yet. The summary above is based on
                  current product custody data.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Image Zoom Modal */}
        {zoomImage && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl">
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                className="absolute -top-10 right-0 text-white text-sm border border-white/40 rounded-md px-3 py-1 hover:bg-white/10 transition-colors"
              >
                Close
              </button>
              <img
                src={zoomImage}
                alt="Enlarged product"
                className="w-full max-h-[80vh] object-contain rounded-lg bg-white shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default VerifyProduct;
