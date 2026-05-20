const pool = require('../config/db');
const { ensureProductColumns, getProductFromDB, mapProductToApi } = require('./dbService');

const ALLOWED_KEYS = new Set([
  'imageUrl',
  'expiryDate',
  'ingredients',
  'allergyInfo',
  'halalStatus',
  'usageInstructions',
]);

const COLUMN_MAP = {
  imageUrl: 'image_url',
  expiryDate: 'expiry_date',
  ingredients: 'ingredients',
  allergyInfo: 'allergy_info',
  halalStatus: 'halal_status',
  usageInstructions: 'usage_instructions',
};

function normalizePayload(body) {
  if (!body || typeof body !== 'object') {
    const err = new Error('Request body is required');
    err.statusCode = 400;
    throw err;
  }
  const updates = {};
  for (const key of ALLOWED_KEYS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      const val = body[key];
      if (val === null || val === undefined) {
        updates[key] = null;
      } else {
        updates[key] = String(val).trim();
      }
    }
  }
  if (Object.keys(updates).length === 0) {
    const err = new Error('No metadata fields to update');
    err.statusCode = 400;
    throw err;
  }
  if (updates.imageUrl && updates.imageUrl.length > 3_000_000) {
    const err = new Error('Image is too large');
    err.statusCode = 400;
    throw err;
  }
  return updates;
}

/**
 * Off-chain metadata only — does not touch chaincode or identity fields.
 */
async function updateManufacturerProductMetadata(manufacturerUserId, productId, body) {
  await ensureProductColumns();
  const pid = String(productId ?? '').trim();
  if (!pid) {
    const err = new Error('Product id is required');
    err.statusCode = 400;
    throw err;
  }
  const mfgId = Number(manufacturerUserId);
  if (!Number.isFinite(mfgId)) {
    const err = new Error('Invalid manufacturer account');
    err.statusCode = 403;
    throw err;
  }

  const existing = await getProductFromDB(pid);
  if (!existing) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  if (Number(existing.manufacturer_user_id) !== mfgId) {
    const err = new Error('You can only edit metadata for products registered to your account');
    err.statusCode = 403;
    throw err;
  }

  const updates = normalizePayload(body);
  const sets = [];
  const params = [pid];
  let idx = 2;
  for (const [apiKey, value] of Object.entries(updates)) {
    const col = COLUMN_MAP[apiKey];
    sets.push(`${col} = $${idx}`);
    params.push(value === '' ? null : value);
    idx += 1;
  }

  const result = await pool.query(
    `UPDATE products SET ${sets.join(', ')} WHERE product_id = $1 RETURNING *`,
    params
  );
  return mapProductToApi(result.rows[0]);
}

module.exports = {
  ALLOWED_KEYS,
  updateManufacturerProductMetadata,
};
