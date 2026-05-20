import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import AppShell from '../components/AppShell';
import { Alert, Button } from '../components';
import { ManufacturerComplaintRespondModal } from '../components/ManufacturerComplaintRespondModal';
import {
  fetchManufacturerComplaintSummary,
  fetchManufacturerComplaints,
  updateComplaintStatus,
} from '../api/complaintService';
import { COMPLAINT_CATEGORY_LABELS, type ComplaintCategory } from '../constants/complaintCategories';
import type { ComplaintStatus, ProductComplaint } from '../types';

type FilterStatus = 'all' | ComplaintStatus;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function statusBadgeClass(status: ComplaintStatus): string {
  if (status === 'open') {
    return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200';
  }
  if (status === 'reviewed') {
    return 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200';
  }
  return 'bg-success-100 text-success-800 dark:bg-success-900/50 dark:text-success-200';
}

export default function ManufacturerComplaintsPage() {
  const [searchParams] = useSearchParams();
  const productIdFilter = searchParams.get('productId')?.trim() || undefined;

  const [summary, setSummary] = useState<Awaited<ReturnType<typeof fetchManufacturerComplaintSummary>> | null>(
    null,
  );
  const [complaints, setComplaints] = useState<ProductComplaint[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [respondTarget, setRespondTarget] = useState<{
    complaint: ProductComplaint;
    status: ComplaintStatus;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, list] = await Promise.all([
        fetchManufacturerComplaintSummary(),
        fetchManufacturerComplaints({
          status: filter === 'all' ? undefined : filter,
          productId: productIdFilter,
          limit: 100,
        }),
      ]);
      setSummary(sum);
      setComplaints(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [filter, productIdFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const openRespond = (complaint: ProductComplaint, status: ComplaintStatus) => {
    setModalError(null);
    setRespondTarget({ complaint, status });
  };

  const handleRespondSubmit = async (status: ComplaintStatus, manufacturerResponse: string) => {
    if (!respondTarget) return;
    setUpdatingId(respondTarget.complaint.id);
    setModalError(null);
    try {
      await updateComplaintStatus(respondTarget.complaint.id, status, manufacturerResponse);
      setRespondTarget(null);
      await load();
    } catch (e) {
      setModalError(e instanceof Error ? e.message : 'Failed to save response');
    } finally {
      setUpdatingId(null);
    }
  };

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'reviewed', label: 'Reviewed' },
    { key: 'resolved', label: 'Resolved' },
  ];

  return (
    <AppShell
      title="Customer Reports"
      subtitle="Review consumer reports and reply before marking reviewed or resolved."
    >
      <div className="space-y-6 animate-fade-up max-w-4xl">
        {error && (
          <Alert type="error" className="border border-red-200 dark:border-red-900/60">
            {error}
          </Alert>
        )}

        {productIdFilter && (
          <p className="text-sm text-page-muted">
            Showing reports for product{' '}
            <span className="font-mono font-medium text-page-title">{productIdFilter}</span>
          </p>
        )}

        {summary && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="card p-3">
              <p className="text-xs text-page-label">Open</p>
              <p className="text-xl font-bold text-page-title">{summary.openCount}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-page-label">Reviewed</p>
              <p className="text-xl font-bold text-page-title">{summary.reviewedCount}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-page-label">Resolved</p>
              <p className="text-xl font-bold text-page-title">{summary.resolvedCount}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-page-label">Total</p>
              <p className="text-xl font-bold text-page-title">{summary.totalCount}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={clsx(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                filter === f.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-page-muted hover:bg-neutral-200 dark:bg-neutral-800',
              )}
            >
              {f.label}
            </button>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => void load()} disabled={loading}>
            Refresh
          </Button>
        </div>

        {loading && complaints.length === 0 ? (
          <p className="text-sm text-page-muted">Loading reports…</p>
        ) : complaints.length === 0 ? (
          <p className="text-sm text-page-muted rounded-lg border border-neutral-200/80 px-4 py-6 dark:border-neutral-600/60">
            No customer reports match this filter.
          </p>
        ) : (
          <ul className="space-y-4">
            {complaints.map((c) => {
              const catLabel =
                COMPLAINT_CATEGORY_LABELS[c.category as ComplaintCategory] ?? c.category;
              return (
                <li key={c.id} className="card p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-page-title">
                        {c.productName || c.productId}
                      </p>
                      <p className="text-xs font-mono text-page-muted">{c.productId}</p>
                      {c.batchNumber && (
                        <p className="text-xs text-page-muted">Batch: {c.batchNumber}</p>
                      )}
                    </div>
                    <span
                      className={clsx(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                        statusBadgeClass(c.status),
                      )}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-page-body">{catLabel}</p>
                  <div className="rounded-lg bg-neutral-50/80 px-3 py-2 dark:bg-neutral-900/50">
                    <p className="text-xs font-medium text-page-label">Customer report</p>
                    <p className="text-sm text-page-muted leading-relaxed mt-1">{c.message}</p>
                    <p className="text-xs text-page-muted mt-2">{formatDate(c.createdAt)}</p>
                  </div>
                  {c.manufacturerResponse && (
                    <div className="rounded-lg border border-primary-200/60 bg-primary-50/40 px-3 py-2 dark:border-primary-800/40 dark:bg-primary-950/20">
                      <p className="text-xs font-medium text-primary-800 dark:text-primary-200">
                        Your response (sent to customer)
                      </p>
                      <p className="text-sm text-page-body mt-1 leading-relaxed whitespace-pre-wrap">
                        {c.manufacturerResponse}
                      </p>
                    </div>
                  )}
                  {(c.status === 'open' || c.status === 'reviewed') && (
                    <div className="flex flex-wrap gap-2">
                      {c.status === 'open' && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={updatingId === c.id}
                          onClick={() => openRespond(c, 'reviewed')}
                        >
                          Reply & mark reviewed
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={updatingId === c.id}
                        onClick={() => openRespond(c, 'resolved')}
                      >
                        {c.status === 'open' ? 'Reply & resolve' : 'Update reply & resolve'}
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ManufacturerComplaintRespondModal
        complaint={respondTarget?.complaint ?? null}
        targetStatus={respondTarget?.status ?? null}
        isOpen={respondTarget != null}
        busy={updatingId != null}
        error={modalError}
        onClose={() => {
          if (!updatingId) setRespondTarget(null);
        }}
        onSubmit={(status, text) => void handleRespondSubmit(status, text)}
      />
    </AppShell>
  );
}
