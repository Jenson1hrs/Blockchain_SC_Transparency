const pool = require('../config/db');
const { assessProductMetadata } = require('./productMetadata');
const organizationService = require('./organizationService');
const ownershipService = require('./ownershipService');
const productStatusService = require('./productStatusService');

async function ensureProductColumns() {
  await pool.query(`
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS expiry_date DATE,
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS ingredients TEXT,
      ADD COLUMN IF NOT EXISTS allergy_info TEXT,
      ADD COLUMN IF NOT EXISTS halal_status TEXT,
      ADD COLUMN IF NOT EXISTS usage_instructions TEXT
  `);
  await organizationService.ensureProductOwnershipColumns();
  await ownershipService.ensureOwnershipColumns();
}

function mapProductToApi(row) {
  if (!row) return null;
  const meta = assessProductMetadata(row);
  const manufacturerCompanyName =
    row.manufacturer_company_name != null && String(row.manufacturer_company_name).trim() !== ''
      ? String(row.manufacturer_company_name).trim()
      : row.manufacturer;

  return {
    productId: row.product_id,
    name: row.name,
    manufacturer: row.manufacturer,
    manufacturerUserId: row.manufacturer_user_id ?? null,
    manufacturerCompanyName: manufacturerCompanyName ?? row.manufacturer,
    batchNumber: row.batch_number,
    location: row.location,
    owner: row.owner,
    status: productStatusService.reconcileDisplayStatus(row),
    timestamp: row.timestamp,
    expiryDate: row.expiry_date ?? null,
    imageUrl: row.image_url ?? null,
    ingredients: row.ingredients ?? null,
    allergyInfo: row.allergy_info ?? null,
    halalStatus: row.halal_status ?? null,
    usageInstructions: row.usage_instructions ?? null,
    metadataComplete: meta.isComplete,
    metadataCompletionPercent: meta.completionPercent,
    metadataMissingFields: meta.missingFields,
    manufacturerOrganizationVerified: Boolean(
      row.manufacturer_org_verified ?? row.organization_verified
    ),
    manufacturerVerifiedByRegulator: Boolean(
      row.manufacturer_verified_by_regulator ?? row.verified_by_regulator
    ),
    manufacturerVerificationDate:
      row.manufacturer_verification_date ?? row.verification_date ?? null,
    manufacturerOrganizationFlagged: Boolean(
      row.manufacturer_org_flagged ?? row.organization_flagged
    ),
    currentOwnerUserId: row.current_owner_user_id ?? null,
    currentOwnerRole: row.current_owner_role ?? null,
    currentOwnerName: row.current_owner_name ?? null,
    lastTransferredToUserId: row.last_transferred_to_user_id ?? null,
    lastTransferredAt: row.last_transferred_at ?? null,
  };
}

function mapSearchResultRow(row) {
  return {
    productId: row.product_id,
    name: row.name,
    manufacturer: row.manufacturer,
    batchNumber: row.batch_number,
    status: row.status,
    location: row.location,
    owner: row.owner,
    expiryDate: row.expiry_date ?? null,
    imageUrl: row.image_url ?? null,
  };
}

async function searchProducts(query, limit = 30) {
  await ensureProductColumns();
  const q = query != null ? String(query).trim() : '';
  if (!q) return [];

  const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 50);
  const term = `%${q}%`;

  const result = await pool.query(
    `SELECT product_id, name, manufacturer, batch_number, status, location, owner, expiry_date, image_url
     FROM products
     WHERE product_id ILIKE $1
        OR name ILIKE $1
        OR manufacturer ILIKE $1
        OR manufacturer_company_name ILIKE $1
        OR batch_number ILIKE $1
     ORDER BY
       CASE WHEN LOWER(TRIM(product_id)) = LOWER(TRIM($2)) THEN 0 ELSE 1 END,
       timestamp DESC NULLS LAST
     LIMIT $3`,
    [term, q, safeLimit]
  );
  return result.rows.map(mapSearchResultRow);
}

async function getProductFromDB(productId) {
  await ensureProductColumns();
  await organizationService.ensureOrganizationColumns();
  const result = await pool.query(
    `SELECT p.*, u.organization_verified, u.verified_by_regulator, u.verification_date,
            u.organization_flagged
     FROM products p
     LEFT JOIN users u ON u.id = p.manufacturer_user_id
     WHERE p.product_id = $1`,
    [productId]
  );
  return result.rows[0] || null;
}

async function getProductById(id) {
  return getProductFromDB(id);
}

async function insertProduct(data) {
  await ensureProductColumns();
  const ownerDisplay = data.currentOwnerName ?? data.manufacturer;
  const result = await pool.query(
    `INSERT INTO products
     (product_id, name, manufacturer, batch_number, location, owner, status, timestamp,
      expiry_date, image_url, ingredients, allergy_info, halal_status, usage_instructions,
      manufacturer_user_id, manufacturer_company_name,
      current_owner_user_id, current_owner_role, current_owner_name)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
     ON CONFLICT (product_id) DO UPDATE SET
       name = EXCLUDED.name,
       manufacturer = EXCLUDED.manufacturer,
       batch_number = EXCLUDED.batch_number,
       location = EXCLUDED.location,
       expiry_date = EXCLUDED.expiry_date,
       image_url = EXCLUDED.image_url,
       ingredients = EXCLUDED.ingredients,
       allergy_info = EXCLUDED.allergy_info,
       halal_status = EXCLUDED.halal_status,
       usage_instructions = EXCLUDED.usage_instructions,
       manufacturer_user_id = COALESCE(EXCLUDED.manufacturer_user_id, products.manufacturer_user_id),
       manufacturer_company_name = COALESCE(EXCLUDED.manufacturer_company_name, products.manufacturer_company_name),
       current_owner_user_id = COALESCE(EXCLUDED.current_owner_user_id, products.current_owner_user_id),
       current_owner_role = COALESCE(EXCLUDED.current_owner_role, products.current_owner_role),
       current_owner_name = COALESCE(EXCLUDED.current_owner_name, products.current_owner_name)
     RETURNING *`,
    [
      data.id,
      data.name,
      data.manufacturer,
      data.batch,
      data.location,
      ownerDisplay,
      'Manufactured',
      new Date().toISOString(),
      data.expiryDate || null,
      data.imageUrl || null,
      data.ingredients || null,
      data.allergyInfo || null,
      data.halalStatus || null,
      data.usageInstructions || null,
      data.manufacturerUserId ?? null,
      data.manufacturerCompanyName ?? data.manufacturer ?? null,
      data.currentOwnerUserId ?? null,
      data.currentOwnerRole ?? null,
      data.currentOwnerName ?? null,
    ]
  );
  return result.rows[0];
}

async function getExpiringProducts(days = 7) {
  await ensureProductColumns();
  const result = await pool.query(
    `SELECT *
     FROM products
     WHERE expiry_date IS NOT NULL
       AND expiry_date >= CURRENT_DATE
       AND expiry_date <= (CURRENT_DATE + ($1 * INTERVAL '1 day'))
     ORDER BY expiry_date ASC`,
    [days]
  );
  return result.rows;
}

module.exports = {
  ensureProductColumns,
  mapProductToApi,
  mapSearchResultRow,
  searchProducts,
  getProductFromDB,
  getProductById,
  insertProduct,
  getExpiringProducts,
};
