const pool = require('../config/db');

const SUPPLY_CHAIN_ROLES = ['manufacturer', 'distributor', 'retailer'];

async function ensureOrganizationColumns() {
  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS company_name TEXT,
      ADD COLUMN IF NOT EXISTS company_description TEXT,
      ADD COLUMN IF NOT EXISTS company_website TEXT,
      ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
      ADD COLUMN IF NOT EXISTS company_location TEXT,
      ADD COLUMN IF NOT EXISTS organization_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS verified_by_regulator BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS organization_flagged BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS organization_flag_reason TEXT,
      ADD COLUMN IF NOT EXISTS organization_flagged_at TIMESTAMP
  `);
}

async function ensureProductOwnershipColumns() {
  await pool.query(`
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS manufacturer_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS manufacturer_company_name TEXT
  `);
}

function rowToPublicOrganization(row, stats = {}) {
  if (!row) return null;
  const displayName =
    row.company_name && String(row.company_name).trim()
      ? String(row.company_name).trim()
      : row.name;
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    companyName: row.company_name ?? null,
    companyDescription: row.company_description ?? null,
    companyWebsite: row.company_website ?? null,
    companyLogoUrl: row.company_logo_url ?? null,
    companyLocation: row.company_location ?? null,
    displayName,
    createdAt: row.created_at,
    totalProducts: stats.totalProducts ?? 0,
    metadataCompletionPercent: stats.metadataCompletionPercent ?? null,
    verifiedProductCount: stats.verifiedProductCount ?? null,
    organizationVerified: Boolean(row.organization_verified),
    verifiedByRegulator: Boolean(row.verified_by_regulator),
    verificationDate: row.verification_date ?? null,
    organizationFlagged: Boolean(row.organization_flagged),
    organizationFlagReason: row.organization_flag_reason ?? null,
    organizationFlaggedAt: row.organization_flagged_at ?? null,
  };
}

async function getOrganizationStats(userId, role) {
  await ensureProductOwnershipColumns();
  const stats = {
    totalProducts: 0,
    metadataCompletionPercent: null,
    verifiedProductCount: null,
  };

  if (role === 'manufacturer') {
    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS c FROM products WHERE manufacturer_user_id = $1`,
      [userId]
    );
    stats.totalProducts = countRes.rows[0].c;

    const metaRes = await pool.query(
      `SELECT image_url, ingredients, allergy_info, usage_instructions, halal_status
       FROM products WHERE manufacturer_user_id = $1`,
      [userId]
    );
    if (metaRes.rows.length > 0) {
      const { assessProductMetadata } = require('./productMetadata');
      let sum = 0;
      for (const row of metaRes.rows) {
        sum += assessProductMetadata(row).completionPercent;
      }
      stats.metadataCompletionPercent = Math.round(sum / metaRes.rows.length);
    } else {
      stats.metadataCompletionPercent = 100;
    }
    stats.verifiedProductCount = stats.totalProducts;
  }

  return stats;
}

async function getPublicOrganizationByUserId(userId) {
  await ensureOrganizationColumns();
  const result = await pool.query(
    `SELECT id, name, email, role, company_name, company_description, company_website,
            company_logo_url, company_location, organization_verified, verified_by_regulator,
            verification_date, organization_flagged, organization_flag_reason,
            organization_flagged_at, created_at
     FROM users WHERE id = $1`,
    [userId]
  );
  const row = result.rows[0];
  if (!row) return null;
  if (!SUPPLY_CHAIN_ROLES.includes(row.role)) {
    return null;
  }
  const stats = await getOrganizationStats(row.id, row.role);
  return rowToPublicOrganization(row, stats);
}

/** Resolve legacy products that only have manufacturer string. */
async function resolveOrganizationUserId({ manufacturerUserId, manufacturerName }) {
  if (manufacturerUserId != null) {
    const byId = await getPublicOrganizationByUserId(manufacturerUserId);
    if (byId) return byId.id;
  }
  const name = manufacturerName != null ? String(manufacturerName).trim() : '';
  if (!name) return null;

  await ensureOrganizationColumns();
  const result = await pool.query(
    `SELECT id FROM users
     WHERE role IN ('manufacturer','distributor','retailer')
       AND (
         LOWER(TRIM(company_name)) = LOWER(TRIM($1))
         OR LOWER(TRIM(name)) = LOWER(TRIM($1))
       )
     ORDER BY id ASC
     LIMIT 1`,
    [name]
  );
  return result.rows[0]?.id ?? null;
}

module.exports = {
  SUPPLY_CHAIN_ROLES,
  ensureOrganizationColumns,
  ensureProductOwnershipColumns,
  getPublicOrganizationByUserId,
  resolveOrganizationUserId,
  rowToPublicOrganization,
};
