import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import AppShell from '../components/AppShell';
import { Alert, Button } from '../components';
import { fetchMyProductReports } from '../api/complaintService';
import { COMPLAINT_CATEGORY_LABELS, type ComplaintCategory } from '../constants/complaintCategories';
import type { ComplaintStatus, ProductComplaint } from '../types';

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
  if (status === 'open') return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200';
  if (status === 'reviewed') return 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200';
  return 'bg-success-100 text-success-800 dark:bg-success-900/50 dark:text-success-200';
}

export default function MyProductReportsPage() {
  const [reports, setReports] = useState<ProductComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReports(await fetchMyProductReports(100));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load your reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppShell
      title="My product reports"
      subtitle="Issues you reported after verifying products — including replies from the brand."
    >
      <div className="space-y-6 animate-fade-up max-w-3xl">
        {error && <Alert type="error">{error}</Alert>}

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={() => void load()} disabled={loading}>
            Refresh
          </Button>
          <Button as={Link} to="/verify" variant="ghost" size="sm">
            Verify another product
          </Button>
        </div>

        {loading && reports.length === 0 ? (
          <p className="text-sm text-page-muted">Loading…</p>
        ) : reports.length === 0 ? (
          <div className="card p-6 text-sm text-page-muted">
            <p>You have not submitted any product issue reports while signed in.</p>
            <p className="mt-2">
              After you verify a product, use <strong>Report a product issue</strong> on the verify page.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {reports.map((r) => {
              const catLabel = COMPLAINT_CATEGORY_LABELS[r.category as ComplaintCategory] ?? r.category;
              return (
                <li key={r.id} className="card p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-page-title">{r.productName || r.productId}</p>
                      <p className="text-xs font-mono text-page-muted">{r.productId}</p>
                    </div>
                    <span
                      className={clsx(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                        statusBadgeClass(r.status),
                      )}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-page-body">{catLabel}</p>
                  <div className="rounded-lg bg-neutral-50/80 px-3 py-2 dark:bg-neutral-900/50">
                    <p className="text-xs font-medium text-page-label">Your report</p>
                    <p className="text-sm text-page-body mt-1 leading-relaxed">{r.message}</p>
                    <p className="text-xs text-page-muted mt-2">{formatDate(r.createdAt)}</p>
                  </div>
                  {r.manufacturerResponse ? (
                    <div className="rounded-lg border border-primary-200/70 bg-primary-50/50 px-3 py-3 dark:border-primary-800/50 dark:bg-primary-950/25">
                      <p className="text-xs font-medium text-primary-800 dark:text-primary-200">
                        Brand response
                      </p>
                      <p className="text-sm text-page-body mt-1 leading-relaxed whitespace-pre-wrap">
                        {r.manufacturerResponse}
                      </p>
                      <p className="text-xs text-page-muted mt-2">Updated {formatDate(r.updatedAt)}</p>
                    </div>
                  ) : r.status === 'open' ? (
                    <p className="text-sm text-page-muted italic">
                      Waiting for the brand to review your report.
                    </p>
                  ) : null}
                  <Link
                    to={`/verify/${encodeURIComponent(r.productId)}`}
                    className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-300"
                  >
                    View product again
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
