import { apiClient } from './client';
import { formatApiError } from './formatApiError';
import type { AppNotification, NotificationSeverity } from '../types';

export function dispatchNotificationsUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('notifications-updated'));
}

export async function getNotifications(params?: {
  readStatus?: 'all' | 'unread' | 'read';
  severity?: NotificationSeverity;
  limit?: number;
}): Promise<AppNotification[]> {
  const url = 'notifications';
  try {
    const res = await apiClient.get<{ success: boolean; data?: AppNotification[] }>(url, {
      params: {
        readStatus: params?.readStatus,
        severity: params?.severity,
        limit: params?.limit,
      },
    });
    if (!res.data.success) throw new Error('Failed to load notifications');
    return res.data.data ?? [];
  } catch (e) {
    throw new Error(formatApiError(e, url));
  }
}

export async function getUnreadCount(): Promise<number> {
  const url = 'notifications/unread-count';
  try {
    const res = await apiClient.get<{ success: boolean; unreadCount?: number }>(url);
    if (!res.data.success) throw new Error('Failed to load unread count');
    return res.data.unreadCount ?? 0;
  } catch (e) {
    throw new Error(formatApiError(e, url));
  }
}

export async function markNotificationRead(id: number): Promise<AppNotification> {
  const path = `notifications/${id}/read`;
  try {
    const res = await apiClient.patch<{ success: boolean; data?: AppNotification }>(path);
    if (!res.data.success || !res.data.data) throw new Error('Failed to mark notification read');
    dispatchNotificationsUpdated();
    return res.data.data;
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const path = 'notifications/read-all';
  try {
    const res = await apiClient.patch<{ success: boolean }>(path);
    if (!res.data.success) throw new Error('Failed to mark all read');
    dispatchNotificationsUpdated();
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}
