const pool = require('../config/db');
const organizationService = require('./organizationService');
const notificationTriggers = require('./notificationTriggers');
const { assessProductMetadata } = require('./productMetadata');
const {
  checkDatabaseHealth,
  checkBlockchainHealth,
} = require('./systemHealthService');

async function ensureVerificationColumns() {
  await organizationService.ensureOrganizationColumns();
  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS organization_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS verified_by_regulator BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS organization_flagged BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS organization_flag_reason TEXT,
      ADD COLUMN IF NOT EXISTS organization_flagged_at TIMESTAMP
  `);
}

function mapOrgRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    companyName: row.company_name ?? null,
    companyLocation: row.company_location ?? null,
    companyWebsite: row.company_website ?? null,
    organizationVerified: Boolean(row.organization_verified),
    verifiedByRegulator: Boolean(row.verified_by_regulator),
    verificationDate: row.verification_date ?? null,
    organizationFlagged: Boolean(row.organization_flagged),
    organizationFlagReason: row.organization_flag_reason ?? null,
    organizationFlaggedAt: row.organization_flagged_at ?? null,
    createdAt: row.created_at,
  };
}

function mapProductOversightRow(row) {
  const meta = assessProductMetadata(row);
  const orgUnverified =
    row.manufacturer_user_id != null && !row.organization_verified;
  const orgFlagged = Boolean(row.organization_flagged);
  const flagged = !meta.isComplete || orgUnverified || orgFlagged;
  return {
    productId: row.product_id,
    name: row.name,
    manufacturer: row.manufacturer,
    manufacturerCompanyName: row.manufacturer_company_name ?? row.manufacturer,
    manufacturerUserId: row.manufacturer_user_id ?? null,
    batchNumber: row.batch_number,
    status: row.status,
    location: row.location,
    owner: row.owner,
    expiryDate: row.expiry_date ?? null,
    imageUrl: row.image_url ?? null,
    metadataComplete: meta.isComplete,
    metadataCompletionPercent: meta.completionPercent,
    manufacturerOrganizationVerified: Boolean(row.organization_verified),
    manufacturerOrganizationFlagged: orgFlagged,
    flagged,
  };
}

async function getRegulatorSummary() {
  await ensureVerificationColumns();
  await organizationService.ensureProductOwnershipColumns();

  const verifiedRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM users
     WHERE role IN ('manufacturer','distributor','retailer')
       AND organization_verified = true`
  );
  const verifiedOrganizationsCount = verifiedRes.rows[0].c;

  const pendingRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM users
     WHERE role IN ('manufacturer','distributor','retailer')
       AND COALESCE(organization_verified, false) = false`
  );
  const pendingOrganizationsCount = pendingRes.rows[0].c;

  const totalProductsRes = await pool.query(`SELECT COUNT(*)::int AS c FROM products`);
  const totalTraceableProducts = totalProductsRes.rows[0].c;

  const metaRows = await pool.query(
    `SELECT image_url, ingredients, allergy_info, usage_instructions, halal_status
     FROM products`
  );
  let incompleteMetadataProductCount = 0;
  for (const row of metaRows.rows) {
    if (!assessProductMetadata(row).isComplete) incompleteMetadataProductCount += 1;
  }

  const flaggedRes = await pool.query(
    `SELECT COUNT(*)::int AS c
     FROM products p
     LEFT JOIN users u ON u.id = p.manufacturer_user_id
     WHERE (
       p.image_url IS NULL OR TRIM(p.image_url) = ''
       OR p.ingredients IS NULL OR TRIM(p.ingredients) = ''
       OR p.allergy_info IS NULL OR TRIM(p.allergy_info) = ''
       OR p.usage_instructions IS NULL OR TRIM(p.usage_instructions) = ''
       OR p.halal_status IS NULL OR TRIM(p.halal_status) = ''
       OR (p.manufacturer_user_id IS NOT NULL AND COALESCE(u.organization_verified, false) = false)
     )`
  );
  const flaggedProductCount = flaggedRes.rows[0].c;

  const database = await checkDatabaseHealth();
  const blockchain = await checkBlockchainHealth();

  return {
    verifiedOrganizationsCount,
    pendingOrganizationsCount,
    incompleteMetadataProductCount,
    flaggedProductCount,
    totalTraceableProducts,
    databaseStatus: database.status,
    blockchainStatus: blockchain.status,
    apiStatus: 'online',
  };
}

async function listOrganizations() {
  await ensureVerificationColumns();
  const result = await pool.query(
    `SELECT id, name, email, role, company_name, company_location, company_website,
            company_description, organization_verified, verified_by_regulator, verification_date,
            organization_flagged, organization_flag_reason, organization_flagged_at, created_at
     FROM users
     WHERE role IN ('manufacturer','distributor','retailer')
     ORDER BY organization_flagged DESC, organization_verified ASC, created_at DESC`
  );
  return result.rows.map(mapOrgRow);
}

async function setOrganizationVerification(organizationUserId, verified, regulatorUserId) {
  await ensureVerificationColumns();
  const existing = await pool.query(
    `SELECT id, role, organization_verified FROM users WHERE id = $1`,
    [organizationUserId]
  );
  const row = existing.rows[0];
  if (!row || !organizationService.SUPPLY_CHAIN_ROLES.includes(row.role)) {
    return null;
  }

  const wasVerified = Boolean(row.organization_verified);
  const result = await pool.query(
    `UPDATE users
     SET organization_verified = $2,
         verified_by_regulator = $2,
         verification_date = CASE WHEN $2 THEN CURRENT_TIMESTAMP ELSE NULL END
     WHERE id = $1
     RETURNING id, name, email, role, company_name, company_location, company_website,
               organization_verified, verified_by_regulator, verification_date,
               organization_flagged, organization_flag_reason, organization_flagged_at, created_at`,
    [organizationUserId, Boolean(verified)]
  );
  const mapped = mapOrgRow(result.rows[0]);
  if (Boolean(verified) && !wasVerified) {
    void notificationTriggers.onOrganizationApproved(organizationUserId).catch(() => {});
  } else if (!Boolean(verified) && wasVerified) {
    void notificationTriggers.onOrganizationRevoked(organizationUserId).catch(() => {});
  }
  return mapped;
}

async function setOrganizationFlag(organizationUserId, flagged, reason) {
  await ensureVerificationColumns();
  const existing = await pool.query(
    `SELECT id, role, organization_flagged FROM users WHERE id = $1`,
    [organizationUserId]
  );
  const row = existing.rows[0];
  if (!row || !organizationService.SUPPLY_CHAIN_ROLES.includes(row.role)) {
    return null;
  }

  const wasFlagged = Boolean(row.organization_flagged);
  const result = await pool.query(
    `UPDATE users
     SET organization_flagged = $2,
         organization_flag_reason = CASE WHEN $2 THEN $3 ELSE NULL END,
         organization_flagged_at = CASE WHEN $2 THEN CURRENT_TIMESTAMP ELSE NULL END
     WHERE id = $1
     RETURNING id, name, email, role, company_name, company_location, company_website,
               organization_verified, verified_by_regulator, verification_date,
               organization_flagged, organization_flag_reason, organization_flagged_at, created_at`,
    [organizationUserId, Boolean(flagged), reason != null ? String(reason).trim() || null : null]
  );
  const mapped = mapOrgRow(result.rows[0]);
  if (Boolean(flagged) && !wasFlagged) {
    void notificationTriggers
      .onOrganizationFlagged(organizationUserId, reason != null ? String(reason).trim() : null)
      .catch(() => {});
  } else if (!Boolean(flagged) && wasFlagged) {
    void notificationTriggers.onOrganizationUnflagged(organizationUserId).catch(() => {});
  }
  return mapped;
}

async function listProductsForOversight({
  filter = 'all',
  q = '',
  status = '',
  manufacturer = '',
  limit = 100,
} = {}) {
  await ensureVerificationColumns();
  await organizationService.ensureProductOwnershipColumns();
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 200);

  const params = [];
  const clauses = ['1=1'];
  let paramIdx = 1;

  const search = q != null ? String(q).trim() : '';
  if (search) {
    clauses.push(`(
      p.product_id ILIKE $${paramIdx}
      OR p.name ILIKE $${paramIdx}
      OR p.manufacturer ILIKE $${paramIdx}
      OR p.manufacturer_company_name ILIKE $${paramIdx}
      OR p.batch_number ILIKE $${paramIdx}
    )`);
    params.push(`%${search}%`);
    paramIdx += 1;
  }

  const statusFilter = status != null ? String(status).trim() : '';
  if (statusFilter) {
    clauses.push(`LOWER(TRIM(p.status)) = LOWER(TRIM($${paramIdx}))`);
    params.push(statusFilter);
    paramIdx += 1;
  }

  const mfgFilter = manufacturer != null ? String(manufacturer).trim() : '';
  if (mfgFilter) {
    clauses.push(`(
      p.manufacturer ILIKE $${paramIdx}
      OR p.manufacturer_company_name ILIKE $${paramIdx}
    )`);
    params.push(`%${mfgFilter}%`);
    paramIdx += 1;
  }

  if (filter === 'incomplete') {
    clauses.push(`(
      p.image_url IS NULL OR TRIM(p.image_url) = ''
      OR p.ingredients IS NULL OR TRIM(p.ingredients) = ''
      OR p.allergy_info IS NULL OR TRIM(p.allergy_info) = ''
      OR p.usage_instructions IS NULL OR TRIM(p.usage_instructions) = ''
      OR p.halal_status IS NULL OR TRIM(p.halal_status) = ''
    )`);
  } else if (filter === 'flagged') {
    clauses.push(`(
      p.image_url IS NULL OR TRIM(p.image_url) = ''
      OR p.ingredients IS NULL OR TRIM(p.ingredients) = ''
      OR p.allergy_info IS NULL OR TRIM(p.allergy_info) = ''
      OR p.usage_instructions IS NULL OR TRIM(p.usage_instructions) = ''
      OR p.halal_status IS NULL OR TRIM(p.halal_status) = ''
      OR (p.manufacturer_user_id IS NOT NULL AND COALESCE(u.organization_verified, false) = false)
      OR COALESCE(u.organization_flagged, false) = true
    )`);
  } else if (filter === 'expiring') {
    clauses.push(`p.expiry_date IS NOT NULL
      AND p.expiry_date >= CURRENT_DATE
      AND p.expiry_date <= (CURRENT_DATE + INTERVAL '7 days')`);
  } else if (filter === 'flagged_org') {
    clauses.push(`COALESCE(u.organization_flagged, false) = true`);
  }

  params.push(safeLimit);
  const result = await pool.query(
    `SELECT p.*, u.organization_verified, u.organization_flagged
     FROM products p
     LEFT JOIN users u ON u.id = p.manufacturer_user_id
     WHERE ${clauses.join(' AND ')}
     ORDER BY p.timestamp DESC NULLS LAST
     LIMIT $${paramIdx}`,
    params
  );
  return result.rows.map(mapProductOversightRow);
}

module.exports = {
  ensureVerificationColumns,
  getRegulatorSummary,
  listOrganizations,
  setOrganizationVerification,
  setOrganizationFlag,
  listProductsForOversight,
};
