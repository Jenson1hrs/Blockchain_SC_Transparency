import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  getProduct,
  getManufacturerDisplayLabel,
  searchProducts,
  type ProductSearchResult,
} from '../api/productService';
import type { Product } from '../types';
import { ProductStatusBadge } from './ProductStatusBadge';
import { Button } from './Button';

const DEBOUNCE_MS = 400;
const EXACT_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const MIN_FUZZY_LENGTH = 2;

export type ProductIdPreviewStatus =
  | 'idle'
  | 'loading'
  | 'found'
  | 'not_found'
  | 'not_owner'
  | 'error';

/** @deprecated Use ProductIdPreviewStatus */
export type TransferProductPreviewStatus = ProductIdPreviewStatus;

function formatExpiry(expiryDate: string | null | undefined): string | null {
  if (expiryDate == null || String(expiryDate).trim() === '') return null;
  return new Date(expiryDate).toLocaleDateString();
}

type ProductPreviewCardProps = {
  product: Product;
  hint?: ReactNode;
  actions?: ReactNode;
  tone?: 'primary' | 'amber' | 'neutral';
};

export function ProductPreviewCard({
  product,
  hint,
  actions,
  tone = 'primary',
}: ProductPreviewCardProps) {
  const manufacturerLabel = getManufacturerDisplayLabel(product);
  const ownerLabel = product.currentOwnerName?.trim() || product.owner?.trim() || '—';
  const expiry = formatExpiry(product.expiryDate);

  const toneClass =
    tone === 'amber'
      ? 'border-amber-200/90 bg-amber-50/60 dark:border-amber-800/60 dark:bg-amber-950/25'
      : tone === 'neutral'
        ? 'border-neutral-200/80 bg-neutral-50/50 dark:border-neutral-600/50 dark:bg-neutral-900/30'
        : 'border-primary-200/80 bg-primary-50/50 dark:border-primary-800/50 dark:bg-primary-950/25';

  return (
    <div className={`rounded-lg border px-3 py-3 text-sm ${toneClass}`}>
      {hint && <div className="mb-3">{hint}</div>}
      <div className="flex gap-3">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-20 w-20 shrink-0 rounded-lg border border-neutral-200 object-cover dark:border-neutral-600"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-900/80">
            <span className="text-xs text-page-muted text-center px-1">No image</span>
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold text-page-title leading-snug">{product.name}</p>
          <p className="font-mono text-xs text-page-muted">{product.productId}</p>
          <p className="text-page-body">
            Batch <span className="font-medium">{product.batchNumber || '—'}</span>
            {expiry && (
              <>
                {' '}
                · Expires <span className="font-medium">{expiry}</span>
              </>
            )}
          </p>
          <p className="text-page-muted text-xs">
            {manufacturerLabel}
            {product.location ? ` · ${product.location}` : ''}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {product.status && <ProductStatusBadge status={product.status} />}
            <span className="text-xs text-page-muted">
              Custody: <span className="font-medium text-page-body">{ownerLabel}</span>
            </span>
          </div>
        </div>
      </div>
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

type SearchResultRowProps = {
  row: ProductSearchResult;
  onSelect: () => void;
  disabled?: boolean;
};

function SearchResultPreviewRow({ row, onSelect, disabled }: SearchResultRowProps) {
  const expiry = formatExpiry(row.expiryDate);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className="w-full text-left rounded-lg border border-neutral-200/80 bg-white/80 px-3 py-2.5 hover:bg-neutral-50/80 transition-colors disabled:opacity-60 dark:border-neutral-600/80 dark:bg-neutral-900/40 dark:hover:bg-neutral-800/60"
    >
      <div className="flex gap-3">
        {row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt={row.name}
            className="h-14 w-14 shrink-0 rounded-lg border border-neutral-200 object-cover dark:border-neutral-600"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-[10px] text-page-muted dark:border-neutral-600 dark:bg-neutral-900/80">
            No image
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-page-title leading-snug">{row.name}</p>
          <p className="font-mono text-xs text-page-muted">{row.productId}</p>
          <p className="text-xs text-page-muted mt-0.5">
            {row.manufacturer}
            {row.batchNumber ? ` · Batch ${row.batchNumber}` : ''}
            {expiry ? ` · Expires ${expiry}` : ''}
          </p>
          {row.status && (
            <div className="mt-1">
              <ProductStatusBadge status={row.status} />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

type TransferPreviewProps = {
  productId: string;
  currentUserId?: number;
  onPreviewChange?: (status: ProductIdPreviewStatus, product: Product | null) => void;
};

export function TransferProductIdPreview({
  productId,
  currentUserId,
  onPreviewChange,
}: TransferPreviewProps) {
  const [status, setStatus] = useState<ProductIdPreviewStatus>('idle');
  const [product, setProduct] = useState<Product | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const onPreviewChangeRef = useRef(onPreviewChange);
  onPreviewChangeRef.current = onPreviewChange;

  useEffect(() => {
    const trimmed = productId.trim();
    if (!trimmed) {
      setStatus('idle');
      setProduct(null);
      setErrorMessage(null);
      onPreviewChangeRef.current?.('idle', null);
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setProduct(null);
    setErrorMessage(null);
    onPreviewChangeRef.current?.('loading', null);

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const p = await getProduct(trimmed);
          if (cancelled) return;

          const ownerId = p.currentOwnerUserId;
          const isOwner =
            currentUserId != null &&
            ownerId != null &&
            Number(ownerId) === Number(currentUserId);

          if (ownerId != null && currentUserId != null && !isOwner) {
            setProduct(p);
            setStatus('not_owner');
            onPreviewChangeRef.current?.('not_owner', p);
            return;
          }

          setProduct(p);
          setStatus('found');
          onPreviewChangeRef.current?.('found', p);
        } catch (e) {
          if (cancelled) return;
          const msg = e instanceof Error ? e.message : 'Could not load product';
          setProduct(null);
          setErrorMessage(msg);
          const notFound = /not found/i.test(msg);
          const next = notFound ? 'not_found' : 'error';
          setStatus(next);
          onPreviewChangeRef.current?.(next, null);
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [productId, currentUserId]);

  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <p className="mt-2 text-sm text-page-muted" role="status" aria-live="polite">
        Looking up product…
      </p>
    );
  }

  if (status === 'not_found') {
    return (
      <div
        className="mt-3 rounded-lg border border-amber-200/90 bg-amber-50/80 px-3 py-2 text-sm text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100"
        role="alert"
      >
        No product found with ID <span className="font-mono font-medium">{productId.trim()}</span>.
        Double-check the label or scan the QR code.
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className="mt-3 rounded-lg border border-red-200/90 bg-red-50/80 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
        role="alert"
      >
        {errorMessage ?? 'Could not load product details.'}
      </div>
    );
  }

  if (!product) return null;

  const notOwner = status === 'not_owner';

  return (
    <div className="mt-3" role="region" aria-label="Product confirmation preview">
      <ProductPreviewCard
        product={product}
        tone={notOwner ? 'amber' : 'primary'}
        hint={
          notOwner ? (
            <p className="text-amber-900 dark:text-amber-100">
              This product exists, but custody is held by{' '}
              <strong>
                {product.currentOwnerName?.trim() || product.owner?.trim() || 'another organization'}
              </strong>
              . You can only send transfer requests for products assigned to your organization.
            </p>
          ) : (
            <p className="text-primary-900 dark:text-primary-100 font-medium">
              Confirm this is the product you intend to transfer
            </p>
          )
        }
      />
    </div>
  );
}

type VerifyPreviewProps = {
  query: string;
  disabled?: boolean;
  onSelectProduct: (productId: string) => void;
};

export function VerifyProductLookupPreview({
  query,
  disabled,
  onSelectProduct,
}: VerifyPreviewProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'exact' | 'search' | 'empty' | 'error'>(
    'idle',
  );
  const [product, setProduct] = useState<Product | null>(null);
  const [searchRows, setSearchRows] = useState<ProductSearchResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setStatus('idle');
      setProduct(null);
      setSearchRows([]);
      setErrorMessage(null);
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setProduct(null);
    setSearchRows([]);
    setErrorMessage(null);

    const timer = window.setTimeout(() => {
      void (async () => {
        const exactId = EXACT_ID_PATTERN.test(term);

        if (exactId) {
          try {
            const p = await getProduct(term);
            if (cancelled) return;
            setProduct(p);
            setSearchRows([]);
            setStatus('exact');
            return;
          } catch (e) {
            if (cancelled) return;
            const msg = e instanceof Error ? e.message : '';
            if (!/not found/i.test(msg)) {
              setErrorMessage(msg || 'Could not load product');
              setStatus('error');
              return;
            }
          }
        }

        if (term.length < MIN_FUZZY_LENGTH) {
          if (exactId) {
            setStatus('empty');
            return;
          }
          setStatus('idle');
          return;
        }

        try {
          const results = await searchProducts(term, 8);
          if (cancelled) return;
          if (results.length === 0) {
            setStatus('empty');
            return;
          }
          if (results.length === 1) {
            try {
              const p = await getProduct(results[0].productId);
              if (cancelled) return;
              setProduct(p);
              setSearchRows([]);
              setStatus('exact');
              return;
            } catch {
              /* show search row */
            }
          }
          setSearchRows(results);
          setProduct(null);
          setStatus('search');
        } catch (e) {
          if (cancelled) return;
          setErrorMessage(e instanceof Error ? e.message : 'Search failed');
          setStatus('error');
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <p className="mt-2 text-sm text-page-muted" role="status" aria-live="polite">
        Looking up products…
      </p>
    );
  }

  if (status === 'error') {
    return (
      <div
        className="mt-3 rounded-lg border border-red-200/90 bg-red-50/80 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
        role="alert"
      >
        {errorMessage ?? 'Could not load product details.'}
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div
        className="mt-3 rounded-lg border border-amber-200/90 bg-amber-50/80 px-3 py-2 text-sm text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100"
        role="status"
      >
        No products matched <span className="font-medium">&ldquo;{query.trim()}&rdquo;</span>. Try
        another ID, name, manufacturer, or batch number.
      </div>
    );
  }

  if (status === 'exact' && product) {
    return (
      <div className="mt-3 space-y-2" role="region" aria-label="Product lookup preview">
        <ProductPreviewCard
          product={product}
          hint={
            <p className="text-primary-900 dark:text-primary-100 font-medium">
              Is this the product you want to verify?
            </p>
          }
          actions={
            <Button
              type="button"
              size="sm"
              disabled={disabled}
              onClick={() => onSelectProduct(product.productId)}
            >
              Verify this product
            </Button>
          }
        />
      </div>
    );
  }

  if (status === 'search' && searchRows.length > 0) {
    return (
      <div className="mt-3 space-y-2" role="region" aria-label="Product search preview">
        <p className="text-sm font-medium text-page-title">
          {searchRows.length} match{searchRows.length === 1 ? '' : 'es'} — select one to verify
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {searchRows.map((row) => (
            <SearchResultPreviewRow
              key={row.productId}
              row={row}
              disabled={disabled}
              onSelect={() => onSelectProduct(row.productId)}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

/** Compact summary for confirm modals */
export function TransferProductSummaryBlock({ product }: { product: Product }) {
  const manufacturerLabel = getManufacturerDisplayLabel(product);
  const expiry = formatExpiry(product.expiryDate);

  return (
    <div className="flex gap-3">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-16 w-16 shrink-0 rounded-lg border border-neutral-200 object-cover dark:border-neutral-600"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-xs text-page-muted dark:border-neutral-600 dark:bg-neutral-800/50">
          No image
        </div>
      )}
      <div className="min-w-0 text-sm">
        <p className="font-semibold text-page-title">{product.name}</p>
        <p className="font-mono text-xs text-page-muted mt-0.5">{product.productId}</p>
        <p className="text-page-muted mt-1">
          {manufacturerLabel}
          {product.batchNumber ? ` · Batch ${product.batchNumber}` : ''}
          {expiry ? ` · Expires ${expiry}` : ''}
        </p>
        {product.status && (
          <div className="mt-1.5">
            <ProductStatusBadge status={product.status} />
          </div>
        )}
      </div>
    </div>
  );
}
