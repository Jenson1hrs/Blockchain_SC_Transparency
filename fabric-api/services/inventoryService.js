const pool = require('../config/db');

async function ensureUserInventoryTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_inventory (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    )
  `);
}

async function listForUser(userId) {
  await ensureUserInventoryTable();
  const result = await pool.query(
    `SELECT id, product_id, added_at
     FROM user_inventory
     WHERE user_id = $1
     ORDER BY added_at DESC`,
    [userId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    addedAt: row.added_at,
  }));
}

/**
 * @returns {{ added: boolean }}
 */
async function addForUser(userId, productId) {
  await ensureUserInventoryTable();
  const clean = String(productId ?? '').trim();
  if (!clean) {
    const err = new Error('productId is required');
    err.statusCode = 400;
    throw err;
  }
  const result = await pool.query(
    `INSERT INTO user_inventory (user_id, product_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, product_id) DO NOTHING
     RETURNING id`,
    [userId, clean]
  );
  return { added: result.rowCount > 0 };
}

async function removeForUser(userId, productId) {
  await ensureUserInventoryTable();
  const clean = String(productId ?? '').trim();
  if (!clean) {
    const err = new Error('productId is required');
    err.statusCode = 400;
    throw err;
  }
  await pool.query(
    `DELETE FROM user_inventory WHERE user_id = $1 AND product_id = $2`,
    [userId, clean]
  );
}

module.exports = {
  ensureUserInventoryTable,
  listForUser,
  addForUser,
  removeForUser,
};
