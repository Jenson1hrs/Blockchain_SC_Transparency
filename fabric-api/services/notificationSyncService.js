const pool = require('../config/db');
const notificationService = require('./notificationService');
const inventoryService = require('./inventoryService');
const postgresService = require('./dbService');
const { assessPersonalizedRisk } = require('./personalizedAlertService');

function daysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  const exp = new Date(expiryDate);
  if (Number.isNaN(exp.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDay = new Date(exp);
  expDay.setHours(0, 0, 0, 0);
  return Math.ceil((expDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

async function syncExpiryForProduct(userId, productId, expiryDate) {
  const days = daysUntilExpiry(expiryDate);
  if (days == null) return;

  if (days < 0) {
    await notificationService.createNotificationIfNew({
      userId,
      type: 'expiry_expired',
      title: 'Product expired',
      message: `Product ${productId} has expired.`,
      severity: 'danger',
      relatedProductId: productId,
      withinHours: 48,
    });
    return;
  }
  if (days <= 3) {
    await notificationService.createNotificationIfNew({
      userId,
      type: 'expiry_reminder_3d',
      title: 'Expiry urgent',
      message: `Product ${productId} expires in ${days} day(s).`,
      severity: 'warning',
      relatedProductId: productId,
      withinHours: 24,
    });
    return;
  }
  if (days <= 7) {
    await notificationService.createNotificationIfNew({
      userId,
      type: 'expiry_reminder_7d',
      title: 'Expiring soon',
      message: `Product ${productId} expires in ${days} day(s).`,
      severity: 'warning',
      relatedProductId: productId,
      withinHours: 24,
    });
  }
}

async function syncConsumerInventoryExpiry(userId) {
  const entries = await inventoryService.listForUser(userId);
  for (const entry of entries) {
    const row = await postgresService.getProductFromDB(entry.productId);
    if (row?.expiry_date) {
      await syncExpiryForProduct(userId, entry.productId, row.expiry_date);
    }
  }
}

async function syncCustodyExpiry(userId) {
  const result = await pool.query(
    `SELECT product_id, expiry_date FROM products
     WHERE current_owner_user_id = $1 AND expiry_date IS NOT NULL`,
    [userId]
  );
  for (const row of result.rows) {
    await syncExpiryForProduct(userId, row.product_id, row.expiry_date);
  }
}

async function syncConsumerSafetyAlerts(userId, userRow) {
  const entries = await inventoryService.listForUser(userId);
  for (const entry of entries) {
    const row = await postgresService.getProductFromDB(entry.productId);
    if (!row) continue;
    const product = postgresService.mapProductToApi(row);
    const risk = assessPersonalizedRisk(userRow, product);
    if (risk && (risk.severity === 'danger' || risk.severity === 'warning')) {
      await notificationService.createNotificationIfNew({
        userId,
        type: 'safety_alert',
        title: 'Safety alert',
        message: `Safety alert detected for Product ${entry.productId}.`,
        severity: risk.severity,
        relatedProductId: entry.productId,
        withinHours: 48,
      });
    }
  }
}

/**
 * Generate derived notifications (expiry, safety) when user loads key views.
 */
async function syncDerivedNotifications(userId, userRow) {
  if (!userId || !userRow) return;
  await notificationService.ensureNotificationsTable();
  const role = userRow.role;

  if (role === 'consumer') {
    await syncConsumerInventoryExpiry(userId);
    await syncConsumerSafetyAlerts(userId, userRow);
  }
  if (['manufacturer', 'distributor', 'retailer'].includes(role)) {
    await syncCustodyExpiry(userId);
  }
}

module.exports = {
  syncDerivedNotifications,
  syncExpiryForProduct,
};
