import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import type { ComplaintStatus, ProductComplaint } from '../types';
import { COMPLAINT_CATEGORY_LABELS, type ComplaintCategory } from '../constants/complaintCategories';
import { Button } from './Button';
import { Alert } from './Alert';

const MIN_RESPONSE = 10;

type Props = {
  complaint: ProductComplaint | null;
  targetStatus: ComplaintStatus | null;
  isOpen: boolean;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (status: ComplaintStatus, manufacturerResponse: string) => void;
};

export function ManufacturerComplaintRespondModal({
  complaint,
  targetStatus,
  isOpen,
  busy,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (!isOpen || !complaint) return;
    setResponse(complaint.manufacturerResponse?.trim() ?? '');
  }, [isOpen, complaint]);

  if (!isOpen || !complaint || !targetStatus) return null;

  const catLabel =
    COMPLAINT_CATEGORY_LABELS[complaint.category as ComplaintCategory] ?? complaint.category;
  const statusLabel = targetStatus === 'resolved' ? 'Resolved' : 'Reviewed';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (response.trim().length < MIN_RESPONSE) return;
    onSubmit(targetStatus, response.trim());
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-h-[92vh] overflow-y-auto sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-neutral-200/90 bg-white shadow-xl dark:border-neutral-600 dark:bg-neutral-900">
        <form onSubmit={(e) => void handleSubmit(e)} className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-page-title">Reply to customer report</h2>
            <p className="mt-1 text-sm text-page-muted">
              Mark as <span className="font-medium">{statusLabel}</span> and send a message the
              customer can read in their account.
            </p>
          </div>

          <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-3 text-sm dark:border-neutral-600/60 dark:bg-neutral-900/40">
            <p className="font-medium text-page-title">{complaint.productName || complaint.productId}</p>
            <p className="text-xs text-page-muted mt-1">{catLabel}</p>
            <p className="mt-2 text-page-body leading-relaxed">{complaint.message}</p>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <div>
            <label htmlFor="mfg-complaint-response" className="block text-sm font-medium text-page-label mb-1">
              Your response to the customer <span className="text-danger-600">*</span>
            </label>
            <textarea
              id="mfg-complaint-response"
              rows={5}
              required
              minLength={MIN_RESPONSE}
              maxLength={2000}
              placeholder="Explain what you found, next steps, or how the customer should proceed…"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              disabled={busy}
            />
            <p className="mt-1 text-xs text-page-muted">Minimum {MIN_RESPONSE} characters. Not shown publicly — only to the reporter’s account.</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || response.trim().length < MIN_RESPONSE}>
              {busy ? 'Saving…' : `Send reply & mark ${statusLabel.toLowerCase()}`}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
