import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationService';
import type { AppNotification, NotificationSeverity } from '../types';
import { useAuth } from '../context/AuthContext';

const POLL_MS = 60_000;

const severityDot: Record<NotificationSeverity, string> = {
  info: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
};

const severityBorder: Record<NotificationSeverity, string> = {
  info: 'border-l-primary-500',
  success: 'border-l-success-500',
  warning: 'border-l-warning-500',
  danger: 'border-l-danger-500',
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const [count, list] = await Promise.all([
        getUnreadCount(),
        getNotifications({ limit: 5 }),
      ]);
      setUnreadCount(count);
      setItems(list);
    } catch {
      /* keep last known state */
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setItems([]);
      return;
    }
    setLoading(true);
    void refresh().finally(() => setLoading(false));
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    const onUpdate = () => void refresh();
    window.addEventListener('notifications-updated', onUpdate);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('notifications-updated', onUpdate);
    };
  }, [user, refresh]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  if (!user) return null;

  const handleMarkAll = async () => {
    setBusy(true);
    try {
      await markAllNotificationsRead();
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleMarkOne = async (id: number) => {
    try {
      await markNotificationRead(id);
      await refresh();
    } catch {
      /* ignore */
    }
  };

  return (
    
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200/80 bg-white/90 text-neutral-700 shadow-sm hover:bg-primary-50 hover:text-primary-700 dark:border-neutral-600/60 dark:bg-neutral-800/90 dark:text-neutral-100 dark:hover:bg-neutral-700"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[70] mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-large dark:border-neutral-600/70 dark:bg-neutral-900 animate-fade-up">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-700">
            <h3 className="text-sm font-semibold text-page-title">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleMarkAll()}
                className="text-xs font-medium text-primary-600 hover:underline disabled:opacity-50 dark:text-primary-400"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-page-muted">Loading…</p>
            )}
            {!loading && items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-page-muted">No notifications yet.</p>
            )}
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!n.isRead) void handleMarkOne(n.id);
                    }}
                    className={clsx(
                      'w-full text-left px-4 py-3 border-l-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60',
                      severityBorder[n.severity],
                      !n.isRead && 'bg-primary-50/40 dark:bg-primary-950/20'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={clsx('mt-1.5 h-2 w-2 shrink-0 rounded-full', severityDot[n.severity])}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-page-title">{n.title}</p>
                        <p className="mt-0.5 text-xs text-page-body line-clamp-2">{n.message}</p>
                        <p className="mt-1 text-[11px] text-page-muted">{formatWhen(n.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-neutral-100 px-4 py-2.5 dark:border-neutral-700">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
