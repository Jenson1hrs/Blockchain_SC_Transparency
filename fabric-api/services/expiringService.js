const pool = require('../config/db');
const inventoryService = require('./inventoryService');
const { ensureProductColumns, mapProductToApi } = require('./dbService');

const GLOBAL_ROLES = new Set(['admin', 'regulator']);

async function countExpiredInScope(whereSql, params) {
  const res = await pool.query(
    `SELECT COUNT(*)::int AS c FROM products
     WHERE ${whereSql}
       AND expiry_date IS NOT NULL
       AND expiry_date < CURRENT_DATE`,
    params
  );
  return res.rows[0].c;
}

/**
 * Role-scoped expiring products for GET /expiring (authenticated).
 */
async function getExpiringForUser(role, userId, { days = 7, includeExpired = false } = {}) {
  await ensureProductColumns();
  const safeDays = Number.isFinite(Number(days)) && Number(days) > 0 ? Math.min(Number(days), 30) : 7;
  const uid = userId != null ? Number(userId) : NaN;

  let scope = 'global';
  let whereParts = ['expiry_date IS NOT NULL'];
  const params = [];
  let idx = 1;

  if (role === 'consumer') {
    scope = 'consumer_inventory';
    await inventoryService.ensureUserInventoryTable();
    if (!Number.isFinite(uid)) {
      return { products: [], meta: { scope, includeExpired, expiredCount: 0 } };
    }
    whereParts.push(`product_id IN (SELECT product_id FROM user_inventory WHERE user_id = $${idx})`);
    params.push(uid);
    idx += 1;
  } else if (role === 'retailer' || role === 'distributor') {
    scope = role === 'retailer' ? 'retailer_custody' : 'distributor_custody';
    if (!Number.isFinite(uid)) {
      return { products: [], meta: { scope, includeExpired, expiredCount: 0 } };
    }
    whereParts.push(`current_owner_user_id = $${idx}`);
    params.push(uid);
    idx += 1;
    whereParts.push(`LOWER(TRIM(current_owner_role)) = $${idx}`);
    params.push(role);
    idx += 1;
  } else if (role === 'manufacturer') {
    scope = 'manufacturer_created';
    if (!Number.isFinite(uid)) {
      return { products: [], meta: { scope, includeExpired, expiredCount: 0 } };
    }
    whereParts.push(`manufacturer_user_id = $${idx}`);
    params.push(uid);
    idx += 1;
  } else if (GLOBAL_ROLES.has(role)) {
    scope = 'global';
  } else {
    const err = new Error('Your role cannot view expiring products');
    err.statusCode = 403;
    throw err;
  }

  const whereSql = whereParts.join(' AND ');
  const expiredCount = await countExpiredInScope(whereSql, params);

  let dateClause;
  if (includeExpired) {
    dateClause = `(
      (expiry_date >= CURRENT_DATE AND expiry_date <= (CURRENT_DATE + ($${idx} * INTERVAL '1 day')))
      OR expiry_date < CURRENT_DATE
    )`;
    params.push(safeDays);
    idx += 1;
  } else {
    dateClause = `expiry_date >= CURRENT_DATE AND expiry_date <= (CURRENT_DATE + ($${idx} * INTERVAL '1 day'))`;
    params.push(safeDays);
    idx += 1;
  }

  const result = await pool.query(
    `SELECT * FROM products
     WHERE ${whereSql}
       AND ${dateClause}
     ORDER BY expiry_date ASC`,
    params
  );

  return {
    products: result.rows.map(mapProductToApi),
    meta: {
      scope,
      days: safeDays,
      includeExpired: Boolean(includeExpired),
      expiredCount,
    },
  };
}

module.exports = { getExpiringForUser };
