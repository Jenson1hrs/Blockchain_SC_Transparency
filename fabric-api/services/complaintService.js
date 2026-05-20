const pool = require('../config/db');
const { getProductFromDB } = require('./dbService');

const CATEGORIES = [
  'suspected_counterfeit',
  'expired_product',
  'wrong_product_info',
  'allergy_safety_concern',
  'damaged_packaging',
  'suspicious_seller',
  'other',
];

const STATUSES = ['open', 'reviewed', 'resolved'];

const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 2000;
const MIN_RESPONSE_LENGTH = 10;
const MAX_RESPONSE_LENGTH = 2000;

async function ensureComplaintsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_complaints (
      id SERIAL PRIMARY KEY,
      product_id TEXT NOT NULL,
      manufacturer_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      reporter_user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
      reporter_role TEXT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_product_complaints_mfg_status
      ON product_complaints (manufacturer_user_id, status, created_at DESC)
  `);
  await pool.query(`
    ALTER TABLE product_complaints
      ADD COLUMN IF NOT EXISTS manufacturer_response TEXT
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_product_complaints_reporter
      ON product_complaints (reporter_user_id, created_at DESC)
      WHERE reporter_user_id IS NOT NULL
  `);
}

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    productId: row.product_id,
    manufacturerUserId: row.manufacturer_user_id,
    category: row.category,
    message: row.message,
    reporterUserId: row.reporter_user_id ?? null,
    reporterRole: row.reporter_role ?? null,
    status: row.status,
    manufacturerResponse: row.manufacturer_response ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    productName: row.product_name ?? null,
    batchNumber: row.batch_number ?? null,
  };
}

function normalizeManufacturerResponse(value, { required = false } = {}) {
  if (value == null || String(value).trim() === '') {
    if (required) {
      const err = new Error(
        `A response to the customer is required (at least ${MIN_RESPONSE_LENGTH} characters)`
      );
      err.statusCode = 400;
      throw err;
    }
    return null;
  }
  const text = String(value).trim();
  if (text.length < MIN_RESPONSE_LENGTH) {
    const err = new Error(`Response must be at least ${MIN_RESPONSE_LENGTH} characters`);
    err.statusCode = 400;
    throw err;
  }
  if (text.length > MAX_RESPONSE_LENGTH) {
    const err = new Error(`Response must be at most ${MAX_RESPONSE_LENGTH} characters`);
    err.statusCode = 400;
    throw err;
  }
  return text;
}

async function createComplaint({ productId, category, message, reporterUserId, reporterRole }) {
  await ensureComplaintsTable();
  const pid = String(productId ?? '').trim();
  if (!pid) {
    const err = new Error('Product id is required');
    err.statusCode = 400;
    throw err;
  }

  const cat = String(category ?? '').trim();
  if (!CATEGORIES.includes(cat)) {
    const err = new Error('Invalid complaint category');
    err.statusCode = 400;
    throw err;
  }

  const msg = String(message ?? '').trim();
  if (msg.length < MIN_MESSAGE_LENGTH) {
    const err = new Error(`Message must be at least ${MIN_MESSAGE_LENGTH} characters`);
    err.statusCode = 400;
    throw err;
  }
  if (msg.length > MAX_MESSAGE_LENGTH) {
    const err = new Error(`Message must be at most ${MAX_MESSAGE_LENGTH} characters`);
    err.statusCode = 400;
    throw err;
  }

  const product = await getProductFromDB(pid);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  const mfgId = product.manufacturer_user_id != null ? Number(product.manufacturer_user_id) : null;
  if (!Number.isFinite(mfgId)) {
    const err = new Error(
      'This product cannot receive reports because no manufacturer account is linked'
    );
    err.statusCode = 400;
    throw err;
  }

  const result = await pool.query(
    `INSERT INTO product_complaints
       (product_id, manufacturer_user_id, category, message, reporter_user_id, reporter_role, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'open')
     RETURNING *`,
    [
      pid,
      mfgId,
      cat,
      msg,
      reporterUserId != null ? Number(reporterUserId) : null,
      reporterRole != null ? String(reporterRole).trim() : null,
    ]
  );
  return mapRow(result.rows[0]);
}

async function getManufacturerSummary(manufacturerUserId) {
  await ensureComplaintsTable();
  const mfgId = Number(manufacturerUserId);
  if (!Number.isFinite(mfgId)) {
    return {
      totalCount: 0,
      openCount: 0,
      reviewedCount: 0,
      resolvedCount: 0,
      recentOpen: [],
    };
  }

  const countRes = await pool.query(
    `SELECT status, COUNT(*)::int AS c
     FROM product_complaints
     WHERE manufacturer_user_id = $1
     GROUP BY status`,
    [mfgId]
  );
  let openCount = 0;
  let reviewedCount = 0;
  let resolvedCount = 0;
  for (const row of countRes.rows) {
    if (row.status === 'open') openCount = row.c;
    else if (row.status === 'reviewed') reviewedCount = row.c;
    else if (row.status === 'resolved') resolvedCount = row.c;
  }
  const totalCount = openCount + reviewedCount + resolvedCount;

  const recentRes = await pool.query(
    `SELECT c.*, p.name AS product_name, p.batch_number
     FROM product_complaints c
     LEFT JOIN products p ON p.product_id = c.product_id
     WHERE c.manufacturer_user_id = $1 AND c.status = 'open'
     ORDER BY c.created_at DESC
     LIMIT 5`,
    [mfgId]
  );

  return {
    totalCount,
    openCount,
    reviewedCount,
    resolvedCount,
    recentOpen: recentRes.rows.map(mapRow),
  };
}

async function listForManufacturer(manufacturerUserId, { status, productId, limit = 50 } = {}) {
  await ensureComplaintsTable();
  const mfgId = Number(manufacturerUserId);
  if (!Number.isFinite(mfgId)) return [];

  const params = [mfgId];
  const clauses = ['c.manufacturer_user_id = $1'];
  let idx = 2;

  const statusFilter = status != null ? String(status).trim() : '';
  if (statusFilter && STATUSES.includes(statusFilter)) {
    clauses.push(`c.status = $${idx}`);
    params.push(statusFilter);
    idx += 1;
  }

  const pid = productId != null ? String(productId).trim() : '';
  if (pid) {
    clauses.push(`c.product_id = $${idx}`);
    params.push(pid);
    idx += 1;
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  params.push(safeLimit);

  const result = await pool.query(
    `SELECT c.*, p.name AS product_name, p.batch_number
     FROM product_complaints c
     LEFT JOIN products p ON p.product_id = c.product_id
     WHERE ${clauses.join(' AND ')}
     ORDER BY c.created_at DESC
     LIMIT $${idx}`,
    params
  );
  return result.rows.map(mapRow);
}

async function listForReporter(reporterUserId, { limit = 50 } = {}) {
  await ensureComplaintsTable();
  const uid = Number(reporterUserId);
  if (!Number.isFinite(uid)) return [];

  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const result = await pool.query(
    `SELECT c.*, p.name AS product_name, p.batch_number
     FROM product_complaints c
     LEFT JOIN products p ON p.product_id = c.product_id
     WHERE c.reporter_user_id = $1
     ORDER BY c.updated_at DESC, c.created_at DESC
     LIMIT $2`,
    [uid, safeLimit]
  );
  return result.rows.map(mapRow);
}

async function updateStatus(manufacturerUserId, complaintId, status, manufacturerResponse) {
  await ensureComplaintsTable();
  const nextStatus = String(status ?? '').trim();
  if (!STATUSES.includes(nextStatus)) {
    const err = new Error('Status must be open, reviewed, or resolved');
    err.statusCode = 400;
    throw err;
  }
  const id = Number(complaintId);
  const mfgId = Number(manufacturerUserId);
  if (!Number.isFinite(id) || !Number.isFinite(mfgId)) {
    const err = new Error('Complaint not found');
    err.statusCode = 404;
    throw err;
  }

  const needsResponse = nextStatus === 'reviewed' || nextStatus === 'resolved';
  const responseText = normalizeManufacturerResponse(manufacturerResponse, {
    required: needsResponse,
  });

  const result = await pool.query(
    `UPDATE product_complaints
     SET status = $1,
         manufacturer_response = COALESCE($2, manufacturer_response),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 AND manufacturer_user_id = $4
     RETURNING *`,
    [nextStatus, responseText, id, mfgId]
  );
  if (!result.rows[0]) {
    const err = new Error('Complaint not found');
    err.statusCode = 404;
    throw err;
  }
  const row = result.rows[0];
  const productRes = await pool.query(
    `SELECT name, batch_number FROM products WHERE product_id = $1`,
    [row.product_id]
  );
  const p = productRes.rows[0];
  return mapRow({
    ...row,
    product_name: p?.name ?? null,
    batch_number: p?.batch_number ?? null,
  });
}

module.exports = {
  CATEGORIES,
  STATUSES,
  MIN_MESSAGE_LENGTH,
  ensureComplaintsTable,
  createComplaint,
  getManufacturerSummary,
  listForManufacturer,
  listForReporter,
  updateStatus,
  MIN_RESPONSE_LENGTH,
};
