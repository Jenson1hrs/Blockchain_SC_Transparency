const pool = require('../config/db');

const CATEGORIES = [
  'Product verification',
  'QR scanning',
  'Inventory',
  'Expiry alerts',
  'Transfer workflow',
  'Regulator/organization review',
  'UI/UX',
  'Other',
];

async function ensureFeedbackTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
      role TEXT,
      category TEXT NOT NULL,
      rating INTEGER,
      likert_responses JSONB,
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    ALTER TABLE feedback
      ADD COLUMN IF NOT EXISTS likert_responses JSONB
  `);
}

function validateLikertResponses(likertResponses) {
  if (likertResponses == null) {
    const err = new Error('Likert responses are required');
    err.statusCode = 400;
    throw err;
  }
  if (typeof likertResponses !== 'object' || Array.isArray(likertResponses)) {
    const err = new Error('Invalid likert responses format');
    err.statusCode = 400;
    throw err;
  }
  const entries = Object.entries(likertResponses);
  if (entries.length < 1) {
    const err = new Error('Please answer the survey questions');
    err.statusCode = 400;
    throw err;
  }
  for (const [, val] of entries) {
    const n = Number(val);
    if (!Number.isFinite(n) || n < 1 || n > 5) {
      const err = new Error('Each likert response must be between 1 and 5');
      err.statusCode = 400;
      throw err;
    }
  }
  return likertResponses;
}

async function createFeedback({ userId, role, category, rating, likertResponses, message }) {
  await ensureFeedbackTable();
  const cat = String(category ?? '').trim();
  if (!cat) {
    const err = new Error('Category is required');
    err.statusCode = 400;
    throw err;
  }

  const likert = validateLikertResponses(likertResponses);
  const msg = message != null ? String(message).trim() : '';
  const ratingNum = rating != null ? Number(rating) : null;
  if (ratingNum != null && (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5)) {
    const err = new Error('Rating must be between 1 and 5');
    err.statusCode = 400;
    throw err;
  }

  const result = await pool.query(
    `INSERT INTO feedback (user_id, role, category, rating, likert_responses, message)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6)
     RETURNING id, user_id, role, category, rating, likert_responses, message, created_at`,
    [
      userId != null ? Number(userId) : null,
      role != null ? String(role).trim() : null,
      cat,
      ratingNum,
      JSON.stringify(likert),
      msg || null,
    ]
  );
  return mapRow(result.rows[0]);
}

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id ?? null,
    role: row.role ?? null,
    category: row.category,
    rating: row.rating ?? null,
    likertResponses: row.likert_responses ?? null,
    message: row.message ?? null,
    createdAt: row.created_at,
  };
}

async function listFeedback({ limit = 100 } = {}) {
  await ensureFeedbackTable();
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 200);
  const result = await pool.query(
    `SELECT f.*, u.name AS user_name, u.email AS user_email
     FROM feedback f
     LEFT JOIN users u ON u.id = f.user_id
     ORDER BY f.created_at DESC
     LIMIT $1`,
    [safeLimit]
  );
  return result.rows.map((row) => ({
    ...mapRow(row),
    userName: row.user_name ?? null,
    userEmail: row.user_email ?? null,
  }));
}

module.exports = {
  CATEGORIES,
  ensureFeedbackTable,
  createFeedback,
  listFeedback,
};
