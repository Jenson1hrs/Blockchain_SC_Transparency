import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getProduct, getProductHistory, verifyQr, getManufacturerDisplayLabel } from '../api/productService';
import { API_BASE_URL } from '../config';
import type { Product, ProductHistory } from '../types';
import { formatHistoryTimestamp } from '../utils/historyTime';
import { getExpiryReminder } from '../utils/expiryReminder';
import AppShell from '../components/AppShell';
import {
  Alert,
  Button,
  ProductCard,
  ProductTimeline,
  ProductStatusBadge,
  ExpiryBadge,
  PersonalizedAlertsPanel,
} from '../components';
import { useAuth } from '../context/AuthContext';
import { addToUserInventory } from '../api/inventoryService';
import {
  VerifiedOrganizationBadge,
  VerificationBadge,
  OrganizationFlaggedBadge,
} from '../components/VerificationBadge';

type VerifyState =
  | { kind: 'loading' }
  | { kind: 'authentic'; product: Product }
  | { kind: 'fake'; message?: string }
  | { kind: 'not_found'; message?: string }
  | { kind: 'id_only'; product: Product; message: string }
  | { kind: 'error'; message: string };

const QRVerifyPage = () => {
  const { user } = useAuth();
  const { productId: routeProductId } = useParams<{ productId: string }>();
  const location = useLocation();
  const [state, setState] = useState<VerifyState>({ kind: 'loading' });
  const [history, setHistory] = useState<ProductHistory[]>([]);
  const [inventoryMsg, setInventoryMsg] = useState<string | null>(null);
  const [inventoryErr, setInventoryErr] = useState<string | null>(null);

  const handleSaveToInventory = async (pid: string) => {
    setInventoryErr(null);
    setInventoryMsg(null);
    if (!user) {
      setInventoryErr('Sign in to save products to your inventory.');
      return;
    }
    try {
      const { added } = await addToUserInventory(pid);
      setInventoryMsg(added ? 'Added to My Inventory' : 'Already in My Inventory');
    } catch (e) {
      setInventoryErr(e instanceof Error ? e.message : 'Could not add to inventory');
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!routeProductId) {
        setState({ kind: 'error', message: 'Invalid product ID' });
        return;
      }

      const productId = decodeURIComponent(routeProductId);
      const params = new URLSearchParams(location.search);
      const batch = params.get('batch');
      const hash = params.get('hash');

      setState({ kind: 'loading' });
      setHistory([]);

      try {
        if (batch && hash) {
          const r = await verifyQr(productId, batch, hash);
          if (cancelled) return;

          if (r.status === 'authentic' && r.product) {
            setState({ kind: 'authentic', product: r.product });
            setHistory(await getProductHistory(productId));
            return;
          }
          if (r.status === 'fake') {
            setState({ kind: 'fake', message: r.message });
            return;
          }
          if (r.status === 'not_found') {
            setState({ kind: 'not_found', message: r.message });
            return;
          }
          if (r.status === 'invalid_request') {
            setState({
              kind: 'error',
              message: r.message || 'Invalid verification request',
            });
            return;
          }
          setState({
            kind: 'error',
            message: r.message || 'Verification failed',
          });
          return;
        }

        const product = await getProduct(productId);
        if (cancelled) return;
        setState({
          kind: 'id_only',
          product,
          message:
            'Product found by ID only. Scan the full QR (with batch and hash) for cryptographic verification.',
        });
        setHistory(await getProductHistory(productId));
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'Verification failed';
        if (msg.toLowerCase().includes('not found')) {
          setState({ kind: 'not_found', message: msg });
        } else {
          setState({ kind: 'error', message: msg });
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [routeProductId, location.search]);

  if (state.kind === 'loading') {
    return (
      <AppShell
        title="QR Verification"
        subtitle="Validating authenticity from scanned QR data"
      >
        <div className="card p-12 text-center animate-fade-up">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4">
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
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Verifying Product
          </h2>
          <p className="text-neutral-600 dark:text-neutral-200">
            Checking blockchain authenticity...
          </p>
        </div>
      </AppShell>
    );
  }

  if (state.kind === 'fake') {
    return (
      <AppShell title="QR Verification" subtitle="Validation failed">
        <div className="max-w-lg mx-auto animate-fade-up">
          <div className="card p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-danger-100 text-danger-600 rounded-full mb-6">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Verification Failed
            </h1>
            <p className="text-neutral-600 dark:text-neutral-200 mb-8">
              {state.message ||
                'QR verification failed. The QR code may have been tampered with.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button as={Link} to="/verify">
                Try Again
              </Button>
              <Button as={Link} to="/" variant="secondary">
                Home
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (state.kind === 'not_found') {
    return (
      <AppShell title="QR Verification" subtitle="Product not found">
        <div className="max-w-lg mx-auto animate-fade-up">
          <div className="card p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-200 rounded-full mb-6">
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
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.203-2.47M12 22c5.514 0 10-4.486 10-10S17.514 2 12 2 2 6.486 2 12s4.486 10 10 10z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Product Not Found
            </h1>
            <p className="text-neutral-600 dark:text-neutral-200 mb-8">
              {state.message ||
                'Product not found. This may be an unregistered or counterfeit item.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button as={Link} to="/verify">
                Verify Another
              </Button>
              <Button as={Link} to="/" variant="secondary">
                Home
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (state.kind === 'error') {
    const msg = state.message;
    const looksLikeConnection =
      /network error|no response|bad gateway|ECONNREFUSED|ERR_NETWORK|502|503/i.test(
        msg,
      );

    return (
      <AppShell title="QR Verification" subtitle="Verification error">
        <div className="max-w-2xl mx-auto animate-fade-up">
          <div className="card p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-danger-100 text-danger-600 rounded-full mb-4">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {looksLikeConnection
                  ? "Can't reach the API"
                  : 'Verification Error'}
              </h1>
            </div>

            {looksLikeConnection && (
              <Alert type="warning" className="mb-6">
                A <strong>fake hash</strong> test only works after the app can
                talk to the server. Generic "Network Error" usually means the
                browser never got an HTTP response (wrong API URL, API not
                running, or CORS blocked).
              </Alert>
            )}

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">
                API Configuration
              </p>
              <p className="text-xs font-mono text-neutral-600 dark:text-neutral-200">
                Base URL: {API_BASE_URL}
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-8">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">
                Error Details
              </p>
              <pre className="text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap font-mono overflow-x-auto">
                {msg}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button as={Link} to="/verify">
                Try Again
              </Button>
              <Button as={Link} to="/" variant="secondary">
                Home
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const product =
    state.kind === 'authentic' || state.kind === 'id_only'
      ? state.product
      : null;
  if (!product) return null;

  const expiryReminder = getExpiryReminder(product.expiryDate);

  return (
    <AppShell title="QR Verification" subtitle="Product verification results">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
        {/* Verification Status Banner */}
        {state.kind === 'authentic' ? (
          <Alert type="success" className="text-center">
            <div className="flex items-center justify-center gap-3">
              <svg
                className="w-6 h-6"
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
              <span className="font-semibold">
                Authentic Product - QR Verified
              </span>
            </div>
          </Alert>
        ) : (
          <Alert type="warning" className="text-center">
            <div className="flex items-center justify-center gap-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span className="font-semibold">
                Product Found - Limited Verification
              </span>
            </div>
            <p className="mt-2">{state.message}</p>
          </Alert>
        )}

        {(product.manufacturerOrganizationVerified ||
          product.manufacturerVerifiedByRegulator ||
          product.manufacturerOrganizationFlagged) && (
          <div className="flex flex-wrap gap-2">
            {product.manufacturerOrganizationFlagged && <OrganizationFlaggedBadge />}
            {product.manufacturerOrganizationVerified && <VerifiedOrganizationBadge />}
            {product.manufacturerVerifiedByRegulator && <VerificationBadge verified />}
          </div>
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
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void handleSaveToInventory(product.productId)}
              >
                Save to Inventory
              </Button>
            </div>
          }
        />

        <PersonalizedAlertsPanel product={product} user={user} />

        {inventoryErr && (
          <Alert type="error">
            {inventoryErr}{' '}
            <Link to="/login" className="underline font-medium">
              Sign in
            </Link>
          </Alert>
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
                <p className="text-neutral-900 dark:text-neutral-100 mt-1">{product.ingredients}</p>
              </div>
            )}

            {product.allergyInfo && (
              <div>
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                  Allergy Information
                </label>
                <p className="text-neutral-900 dark:text-neutral-100 mt-1">{product.allergyInfo}</p>
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

        {/* Product History */}
        {history.length > 0 && (
          <div className="card p-8">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
              Supply Chain History
            </h3>
            <ProductTimeline
              history={history.map((entry) => ({
                timestamp: formatHistoryTimestamp(entry),
                status: entry.data.status,
                location: entry.data.location,
                notes: `Transaction: ${entry.txId.slice(0, 16)}...`,
                actor: entry.data.owner,
              }))}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button as={Link} to="/verify">
            Verify Another Product
          </Button>
          <Button as={Link} to="/" variant="secondary">
            Home
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default QRVerifyPage;
