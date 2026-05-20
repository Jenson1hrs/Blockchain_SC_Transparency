import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import type { Product } from '../types';
import { updateProductMetadata } from '../api/productService';
import { HALAL_STATUS_OPTIONS } from '../constants/halalStatusOptions';
import { formatMetadataFieldLabel } from '../utils/manufacturerCatalogueUtils';
import { Button } from './Button';
import { Alert } from './Alert';

type Props = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: Product) => void;
};

type FormState = {
  expiryDate: string;
  imageUrl: string;
  ingredients: string;
  allergyInfo: string;
  halalStatus: string;
  usageInstructions: string;
};

function productToForm(product: Product): FormState {
  const expiry = product.expiryDate?.trim() ?? '';
  const dateOnly = expiry.slice(0, 10);
  return {
    expiryDate: /^\d{4}-\d{2}-\d{2}$/.test(dateOnly) ? dateOnly : '',
    imageUrl: product.imageUrl?.trim() ?? '',
    ingredients: product.ingredients?.trim() ?? '',
    allergyInfo: product.allergyInfo?.trim() ?? '',
    halalStatus: product.halalStatus?.trim() ?? '',
    usageInstructions: product.usageInstructions?.trim() ?? '',
  };
}

export function ManufacturerMetadataModal({ product, isOpen, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>({
    expiryDate: '',
    imageUrl: '',
    ingredients: '',
    allergyInfo: '',
    halalStatus: '',
    usageInstructions: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!product || !isOpen) return;
    setForm(productToForm(product));
    setImagePreview(
      product.imageUrl?.startsWith('data:') || product.imageUrl?.startsWith('http')
        ? product.imageUrl
        : null,
    );
    setError(null);
  }, [product, isOpen]);

  const onPickImage = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image too large. Please pick an image ≤ 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setForm((f) => ({ ...f, imageUrl: dataUrl }));
      setImagePreview(dataUrl || null);
    };
    reader.onerror = () => setError('Failed to read selected image');
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await updateProductMetadata(product.productId, {
        expiryDate: form.expiryDate || null,
        imageUrl: form.imageUrl || null,
        ingredients: form.ingredients || null,
        allergyInfo: form.allergyInfo || null,
        halalStatus: form.halalStatus || null,
        usageInstructions: form.usageInstructions || null,
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save metadata');
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen || !product) return null;

  const missing = product.metadataMissingFields ?? [];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mfg-metadata-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={clsx(
          'relative z-10 w-full max-h-[92vh] overflow-y-auto',
          'sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-neutral-200/90',
          'bg-white shadow-xl dark:border-neutral-600 dark:bg-neutral-900',
        )}
      >
        <form onSubmit={(e) => void onSubmit(e)} className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 id="mfg-metadata-modal-title" className="text-lg font-semibold text-page-title">
              Edit consumer trust metadata
            </h2>
            <p className="mt-1 text-sm text-page-muted">
              {product.name || product.productId} · ID and batch cannot be changed here.
            </p>
            {missing.length > 0 && (
              <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
                Still needed: {missing.map((f) => formatMetadataFieldLabel(f)).join(', ')}
              </p>
            )}
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <div>
            <label className="block text-sm font-medium text-page-label mb-1">Expiry date</label>
            <input
              type="date"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              value={form.expiryDate}
              onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-page-label mb-1">Product image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
            <input
              type="url"
              placeholder="Or paste image URL"
              className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
              onChange={(e) => {
                setForm((f) => ({ ...f, imageUrl: e.target.value }));
                setImagePreview(e.target.value || null);
              }}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt=""
                className="mt-2 h-24 w-24 rounded-lg border object-cover"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-page-label mb-1">Halal status</label>
            <select
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              value={form.halalStatus}
              onChange={(e) => setForm((f) => ({ ...f, halalStatus: e.target.value }))}
            >
              <option value="">Select status</option>
              {HALAL_STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-page-label mb-1">Ingredients</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              value={form.ingredients}
              onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-page-label mb-1">Allergy information</label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              value={form.allergyInfo}
              onChange={(e) => setForm((f) => ({ ...f, allergyInfo: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-page-label mb-1">Usage instructions</label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              value={form.usageInstructions}
              onChange={(e) => setForm((f) => ({ ...f, usageInstructions: e.target.value }))}
            />
          </div>

          <p className="text-xs text-page-muted">
            Updates save to your product record for consumer verification pages. Blockchain identity
            (product ID, batch) is unchanged.
          </p>

          <div className="flex flex-wrap gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save metadata'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
