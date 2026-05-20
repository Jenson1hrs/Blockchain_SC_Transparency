import type { AppNotification, UserRole } from '../types';

export function notificationDetailLink(
  notification: AppNotification,
  role: UserRole | null | undefined,
): { to: string; label: string } | null {
  if (notification.type === 'product_complaint_received' && role === 'manufacturer') {
    const q = notification.relatedProductId
      ? `?productId=${encodeURIComponent(notification.relatedProductId)}`
      : '';
    return { to: `/manufacturer/complaints${q}`, label: 'View customer reports' };
  }
  if (
    (notification.type === 'product_complaint_submitted' ||
      notification.type === 'product_complaint_status_updated') &&
    notification.relatedEntityId != null
  ) {
    return { to: '/my-reports', label: 'View my product reports' };
  }
  if (notification.relatedProductId) {
    return {
      to: `/verify/${encodeURIComponent(notification.relatedProductId)}`,
      label: notification.relatedProductId,
    };
  }
  return null;
}
