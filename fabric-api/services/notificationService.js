const pool = require('../config/db');

const SEVERITIES = ['info', 'success', 'warning', 'danger'];

async function ensureNotificationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT DEFAULT 'info',
      related_product_id TEXT,
      related_entity_id INTEGER,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'notifications_severity_check'
      ) THEN
        ALTER TABLE notifications
          ADD CONSTRAINT notifications_severity_check
          CHECK (severity IN ('info','success','warning','danger'));
      END IF;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_user_created
      ON notifications (user_id, created_at DESC)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
      ON notifications (user_id, is_read) WHERE is_read = false
  `);
}

function mapNotificationRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    severity: row.severity || 'info',
    relatedProductId: row.related_product_id ?? null,
    relatedEntityId: row.related_entity_id ?? null,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

async function hasRecentNotification({
  userId,
  type,
  relatedProductId = null,
  withinHours = 24,
}) {
  await ensureNotificationsTable();
  const res = await pool.query(
    `SELECT id FROM notifications
     WHERE user_id = $1 AND type = $2
       AND ($3::text IS NULL OR related_product_id = $3)
       AND created_at > NOW() - ($4::int * INTERVAL '1 hour')
     LIMIT 1`,
    [userId, type, relatedProductId, String(withinHours)]
  );
  return res.rows.length > 0;
}

async function createNotification({
  userId,
  type,
  title,
  message,
  severity = 'info',
  relatedProductId = null,
  relatedEntityId = null,
}) {
  await ensureNotificationsTable();
  const sev = SEVERITIES.includes(severity) ? severity : 'info';
  const result = await pool.query(
    `INSERT INTO notifications
     (user_id, type, title, message, severity, related_product_id, related_entity_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      userId,
      type,
      title,
      message,
      sev,
      relatedProductId != null ? String(relatedProductId) : null,
      relatedEntityId != null ? Number(relatedEntityId) : null,
    ]
  );
  return mapNotificationRow(result.rows[0]);
}

async function createNotificationIfNew({
  dedupe = true,
  withinHours = 24,
  userId,
  type,
  title,
  message,
  severity = 'info',
  relatedProductId = null,
  relatedEntityId = null,
}) {
  if (
    dedupe &&
    (await hasRecentNotification({ userId, type, relatedProductId, withinHours }))
  ) {
    return null;
  }
  return createNotification({
    userId,
    type,
    title,
    message,
    severity,
    relatedProductId,
    relatedEntityId,
  });
}

async function notifyUsersByRoles(roles, payload, options = {}) {
  await ensureNotificationsTable();
  if (!Array.isArray(roles) || roles.length === 0) return [];
  const res = await pool.query(
    `SELECT id FROM users WHERE role = ANY($1::text[])`,
    [roles]
  );
  const created = [];
  for (const row of res.rows) {
    const n = await createNotificationIfNew({
      userId: row.id,
      ...payload,
      ...options,
    });
    if (n) created.push(n);
  }
  return created;
}

async function getUserNotifications(userId, filters = {}) {
  await ensureNotificationsTable();
  const clauses = ['user_id = $1'];
  const params = [userId];
  let idx = 2;

  const readFilter = filters.readStatus || filters.read || 'all';
  if (readFilter === 'unread') {
    clauses.push('is_read = false');
  } else if (readFilter === 'read') {
    clauses.push('is_read = true');
  }

  if (filters.severity && SEVERITIES.includes(filters.severity)) {
    clauses.push(`severity = $${idx}`);
    params.push(filters.severity);
    idx += 1;
  }

  const limit = Math.min(Math.max(Number(filters.limit) || 100, 1), 200);
  params.push(limit);

  const result = await pool.query(
    `SELECT * FROM notifications
     WHERE ${clauses.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT $${idx}`,
    params
  );
  return result.rows.map(mapNotificationRow);
}

async function getUnreadCount(userId) {
  await ensureNotificationsTable();
  const result = await pool.query(
    `SELECT COUNT(*)::int AS c FROM notifications WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return result.rows[0].c;
}

async function markNotificationRead(userId, notificationId) {
  await ensureNotificationsTable();
  const result = await pool.query(
    `UPDATE notifications SET is_read = true
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [notificationId, userId]
  );
  return mapNotificationRow(result.rows[0]);
}

async function markAllNotificationsRead(userId) {
  await ensureNotificationsTable();
  await pool.query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return { updated: true };
}

module.exports = {
  SEVERITIES,
  ensureNotificationsTable,
  mapNotificationRow,
  hasRecentNotification,
  createNotification,
  createNotificationIfNew,
  notifyUsersByRoles,
  getUserNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
};
