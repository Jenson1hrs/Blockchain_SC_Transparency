import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import AppShell from '../components/AppShell';
import { useRolePageMeta } from '../hooks/useRolePageMeta';
import { Button } from '../components';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationService';
import type { AppNotification, NotificationSeverity } from '../types';

type ReadFilter = 'all' | 'unread' | 'read';
type SeverityFilter = 'all' | NotificationSeverity;

const severityStyles: Record<
  NotificationSeverity,
  { badge: string; border: string }
> = {
  info: {
    badge: 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200',
    border: 'border-l-primary-500',
  },
  success: {
    badge: 'bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-200',
    border: 'border-l-success-500',
  },
  warning: {
    badge: 'bg-warning-100 text-warning-800 dark:bg-warning-900/40 dark:text-warning-200',
    border: 'border-l-warning-500',
  },
  danger: {
    badge: 'bg-danger-100 text-danger-800 dark:bg-danger-900/40 dark:text-danger-200',
    border: 'border-l-danger-500',
  },
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function NotificationsPage() {
  const pageMeta = useRolePageMeta('notifications');
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications({
        readStatus: readFilter,
        severity: severityFilter === 'all' ? undefined : severityFilter,
        limit: 100,
      });
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [readFilter, severityFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleMarkRead = async (id: number) => {
    setBusyId(id);
    try {
      await markNotificationRead(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to mark all read');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadOnPage = items.filter((n) => !n.isRead).length;

  return (
    <AppShell title={pageMeta.title} subtitle={pageMeta.subtitle}>
      <div className="space-y-6 animate-fade-up">
        
        <div className="card p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          <div className="flex flex-wrap gap-2">
            {(['all', 'unread', 'read'] as ReadFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setReadFilter(f)}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors capitalize',
                  readFilter === f
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-neutral-900/80 border-neutral-300 dark:border-neutral-600 text-page-body hover:bg-neutral-50 dark:hover:bg-neutral-800'
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
            className="input-field text-sm w-full sm:w-auto"
            aria-label="Filter by severity"
          >
            <option value="all">All severities</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
          </select>
          {unreadOnPage > 0 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={markingAll}
              onClick={() => void handleMarkAll()}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {error && (
          
          <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800 dark:border-danger-800 dark:bg-danger-950/40 dark:text-danger-200">
            {error}
          </div>
        )}

        {loading && (
          <div className="card p-12 text-center">
            <p className="text-page-muted">Loading notifications…</p>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="card p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-page-title">You&apos;re all caught up</h3>
            <p className="mt-2 text-sm text-page-muted max-w-md mx-auto">
              No notifications match your filters. Supply-chain events, safety alerts, and governance
              updates will appear here.
            </p>
            <Button as={Link} to="/home" variant="secondary" className="mt-6">
              Back to dashboard
            </Button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <ul className="space-y-3">
            {items.map((n) => {
              const styles = severityStyles[n.severity] ?? severityStyles.info;
              return (
                <li
                  key={n.id}
                  className={clsx(
                    'card p-4 sm:p-5 border-l-4',
                    styles.border,
                    !n.isRead && 'ring-1 ring-primary-200/50 dark:ring-primary-800/40'
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-page-title">{n.title}</h3>
                        <span
                          className={clsx(
                            'inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize',
                            styles.badge
                          )}
                        >
                          {n.severity}
                        </span>
                        {!n.isRead && (
                          <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-page-body leading-relaxed">{n.message}</p>
                      <p className="mt-2 text-xs text-page-muted">{formatDateTime(n.createdAt)}</p>
                      {n.relatedProductId && (
                        <p className="mt-1 text-xs">
                          <span className="text-page-muted">Product: </span>
                          <Link
                            to={`/verify/${encodeURIComponent(n.relatedProductId)}`}
                            className="font-mono text-primary-600 hover:underline dark:text-primary-400"
                          >
                            {n.relatedProductId}
                          </Link>
                        </p>
                      )}
                    </div>
                    {!n.isRead && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        loading={busyId === n.id}
                        onClick={() => void handleMarkRead(n.id)}
                        className="shrink-0"
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
