const pool = require('../config/db');
const userService = require('./userService');
const inventoryService = require('./inventoryService');
const organizationService = require('./organizationService');
const { assessProductMetadata } = require('./productMetadata');
const {
  checkDatabaseHealth,
  checkBlockchainHealth,
} = require('./systemHealthService');
const regulatorService = require('./regulatorService');
const ownershipService = require('./ownershipService');
const transferRequestService = require('./transferRequestService');

const EXPIRING_SOON_DAYS = 7;

function userIdParam(userId) {
  const id = userId != null ? Number(userId) : NaN;
  return Number.isFinite(id) ? id : null;
}

function heldProductsClause(userId) {
  const id = userIdParam(userId);
  if (id == null) return { sql: '1=0', params: [] };
  return { sql: 'current_owner_user_id = $1', params: [id] };
}

async function ensureDashboardTables() {
  await ensureProductAnalyticsColumns();
  await ownershipService.ensureOwnershipColumns();
  await transferRequestService.ensureTransferRequestsTable();
}

async function countTransferByDirection(userId, direction, status) {
  const id = userIdParam(userId);
  if (id == null) return 0;
  const col = direction === 'inbound' ? 'to_user_id' : 'from_user_id';
  const res = await pool.query(
    `SELECT COUNT(*)::int AS c FROM transfer_requests WHERE ${col} = $1 AND status = $2`,
    [id, status]
  );
  return res.rows[0].c;
}

function mapTransferRequestSummary(row) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name ?? null,
    fromOrgName: row.from_org_name,
    toOrgName: row.to_org_name,
    status: row.status,
    message: row.message ?? null,
    rejectionReason: row.rejection_reason ?? null,
    createdAt: row.created_at,
    respondedAt: row.responded_at ?? null,
  };
}

async function recentTransferRequests(userId, direction, limit = 5) {
  const id = userIdParam(userId);
  if (id == null) return [];
  const col = direction === 'inbound' ? 'to_user_id' : 'from_user_id';
  const res = await pool.query(
    `SELECT tr.*, p.name AS product_name
     FROM transfer_requests tr
     LEFT JOIN products p ON p.product_id = tr.product_id
     WHERE tr.${col} = $1
     ORDER BY tr.created_at DESC
     LIMIT $2`,
    [id, limit]
  );
  return res.rows.map(mapTransferRequestSummary);
}

/**
 * Ensure columns used by dashboard analytics exist (mirrors dbService insert patterns).
 */
async function ensureProductAnalyticsColumns() {
  await organizationService.ensureProductOwnershipColumns();
  await pool.query(`
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS expiry_date DATE,
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS ingredients TEXT,
      ADD COLUMN IF NOT EXISTS allergy_info TEXT,
      ADD COLUMN IF NOT EXISTS halal_status TEXT,
      ADD COLUMN IF NOT EXISTS usage_instructions TEXT
  `);
}

/**
 * Manufacturer "My Products" / analytics: ONLY products registered to this user's account.
 * Rows with NULL manufacturer_user_id are legacy/unassigned — never shown to manufacturers here.
 */
function manufacturerScopedWhereClause(manufacturerUserId) {
  const id =
    manufacturerUserId != null && manufacturerUserId !== ''
      ? Number(manufacturerUserId)
      : NaN;
  if (!Number.isFinite(id)) {
    return { sql: '1=0', params: [] };
  }
  return {
    sql: 'manufacturer_user_id = $1',
    params: [id],
  };
}

/** Quick substring match for user's allergy terms vs product text (prototype; not medical-grade). */
function matchesDietaryConflict(dietaryPreference, ingredientsText, halalStatus) {
  const dietary = dietaryPreference != null ? String(dietaryPreference).trim().toLowerCase() : '';
  if (!dietary || !ingredientsText) return false;
  const hay = String(ingredientsText).toLowerCase();
  const meatTerms = ['meat', 'beef', 'chicken', 'pork', 'fish', 'gelatin'];
  if (dietary === 'vegetarian' || dietary === 'vegan') {
    if (meatTerms.some((t) => hay.includes(t))) return true;
  }
  if (dietary === 'halal' && halalStatus) {
    const h = String(halalStatus).trim().toLowerCase();
    if (!h || h === 'unknown' || h === 'none') return true;
    if (
      h === 'non halal' ||
      h.includes('non halal') ||
      h.includes('non-halal') ||
      h === 'vegeterian' ||
      h === 'vegetarian'
    ) {
      return true;
    }
    if (h !== 'halal') return true;
  }
  return false;
}

function matchesUserAllergies(allergiesText, ingredientsText, allergyInfoText) {
  if (!allergiesText || String(allergiesText).trim() === '') return false;
  const terms = String(allergiesText)
    .split(/[,;\n]+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length >= 2);
  if (terms.length === 0) return false;
  const hay = `${ingredientsText || ''} ${allergyInfoText || ''}`.toLowerCase();
  return terms.some((t) => hay.includes(t));
}

async function getAdminSummary() {
  await userService.ensureUsersTable();
  await ensureProductAnalyticsColumns();

  const totalUsersRes = await pool.query(`SELECT COUNT(*)::int AS c FROM users`);
  const totalUsers = totalUsersRes.rows[0].c;

  const byRoleRes = await pool.query(
    `SELECT role, COUNT(*)::int AS c FROM users GROUP BY role`
  );
  const usersByRole = {};
  userService.ROLES.forEach((r) => {
    usersByRole[r] = 0;
  });
  for (const row of byRoleRes.rows) {
    usersByRole[row.role] = row.c;
  }

  const totalProductsRes = await pool.query(`SELECT COUNT(*)::int AS c FROM products`);
  const totalProducts = totalProductsRes.rows[0].c;

  const database = await checkDatabaseHealth();
  const blockchain = await checkBlockchainHealth();

  const recentRes = await pool.query(
    `SELECT id, name, email, role, created_at
     FROM users
     ORDER BY created_at DESC NULLS LAST
     LIMIT 10`
  );
  const recentUsers = recentRes.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  }));

  return {
    totalUsers,
    usersByRole,
    totalProducts,
    apiStatus: 'online',
    databaseStatus: database.status,
    databaseDetail: database.detail,
    blockchainStatus: blockchain.status,
    blockchainDetail: blockchain.detail,
    recentUsers,
  };
}

function mapProductRow(row) {
  if (!row) return null;
  const meta = assessProductMetadata(row);
  return {
    productId: row.product_id,
    name: row.name,
    manufacturer: row.manufacturer,
    manufacturerCompanyName: row.manufacturer_company_name ?? row.manufacturer,
    status: row.status,
    location: row.location,
    owner: row.owner,
    timestamp: row.timestamp,
    expiryDate: row.expiry_date,
    batchNumber: row.batch_number,
    metadataComplete: meta.isComplete,
    metadataCompletionPercent: meta.completionPercent,
  };
}

async function getManufacturerSummary(manufacturerUserId) {
  await ensureDashboardTables();
  const where = manufacturerScopedWhereClause(manufacturerUserId);
  const uid = userIdParam(manufacturerUserId);

  const totalRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM products WHERE ${where.sql}`,
    where.params
  );
  const productsCreatedCount = totalRes.rows[0].c;
  const totalProducts = productsCreatedCount;

  let productsStillInCustodyCount = 0;
  if (uid != null) {
    const custodyRes = await pool.query(
      `SELECT COUNT(*)::int AS c FROM products WHERE current_owner_user_id = $1`,
      [uid]
    );
    productsStillInCustodyCount = custodyRes.rows[0].c;
  }

  const [outboundPendingCount, outboundAcceptedCount, outboundRejectedCount] =
    await Promise.all([
      countTransferByDirection(uid, 'outbound', 'pending'),
      countTransferByDirection(uid, 'outbound', 'accepted'),
      countTransferByDirection(uid, 'outbound', 'rejected'),
    ]);
  const recentOutboundRequests = await recentTransferRequests(uid, 'outbound', 5);

  const statusRes = await pool.query(
    `SELECT status, COUNT(*)::int AS c
     FROM products
     WHERE ${where.sql}
     GROUP BY status`,
    where.params
  );
  const productsByStatus = {};
  for (const row of statusRes.rows) {
    productsByStatus[row.status || 'unknown'] = row.c;
  }

  const recentRes = await pool.query(
    `SELECT product_id, name, manufacturer, manufacturer_company_name, batch_number, location, owner, status, timestamp, expiry_date,
            image_url, ingredients, allergy_info, halal_status, usage_instructions
     FROM products
     WHERE ${where.sql}
     ORDER BY timestamp DESC NULLS LAST
     LIMIT 10`,
    where.params
  );
  const recentProducts = recentRes.rows.map(mapProductRow);

  const metaRowsRes = await pool.query(
    `SELECT image_url, ingredients, allergy_info, usage_instructions, halal_status
     FROM products
     WHERE ${where.sql}`,
    where.params
  );
  let metadataCompletionPercent = 100;
  let missingMetadataCount = 0;
  if (metaRowsRes.rows.length > 0) {
    let sum = 0;
    for (const row of metaRowsRes.rows) {
      const meta = assessProductMetadata(row);
      sum += meta.completionPercent;
      if (!meta.isComplete) missingMetadataCount += 1;
    }
    metadataCompletionPercent = Math.round(sum / metaRowsRes.rows.length);
  }

  const incompleteRes = await pool.query(
    `SELECT product_id, name, manufacturer, manufacturer_company_name, batch_number, location, owner, status, timestamp, expiry_date,
            image_url, ingredients, allergy_info, halal_status, usage_instructions
     FROM products
     WHERE ${where.sql}
       AND (
         image_url IS NULL OR TRIM(image_url) = ''
         OR ingredients IS NULL OR TRIM(ingredients) = ''
         OR allergy_info IS NULL OR TRIM(allergy_info) = ''
         OR usage_instructions IS NULL OR TRIM(usage_instructions) = ''
         OR halal_status IS NULL OR TRIM(halal_status) = ''
       )
     ORDER BY timestamp DESC NULLS LAST
     LIMIT 8`,
    where.params
  );
  const recentIncompleteProducts = incompleteRes.rows
    .map(mapProductRow)
    .filter((p) => !p.metadataComplete);

  const qrRes = await pool.query(
    `SELECT COUNT(*)::int AS c
     FROM products
     WHERE ${where.sql}
       AND product_id IS NOT NULL AND TRIM(product_id) <> ''
       AND batch_number IS NOT NULL AND TRIM(batch_number) <> ''`,
    where.params
  );
  const qrSupportedProductsCount = qrRes.rows[0].c;

  const metadataCompletionPercentage = metadataCompletionPercent;

  return {
    totalProducts,
    productsCreatedCount,
    productsStillInCustodyCount,
    outboundPendingCount,
    outboundAcceptedCount,
    outboundRejectedCount,
    recentOutboundRequests,
    productsByStatus,
    recentProducts,
    missingMetadataCount,
    metadataCompletionPercent,
    metadataCompletionPercentage,
    recentIncompleteProducts,
    qrSupportedProductsCount,
  };
}

async function getDistributorSummary(userId) {
  await ensureDashboardTables();
  const held = heldProductsClause(userId);
  const uid = userIdParam(userId);

  const heldRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM products WHERE ${held.sql}`,
    held.params
  );
  const currentlyHeldCount = heldRes.rows[0].c;

  const inTransitRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM products
     WHERE ${held.sql} AND status ILIKE '%Transit%'`,
    held.params
  );
  const inTransitCount = inTransitRes.rows[0].c;

  const [
    inboundPendingCount,
    inboundAcceptedCount,
    inboundRejectedCount,
    outboundPendingCount,
    outboundAcceptedCount,
    outboundRejectedCount,
  ] = await Promise.all([
    countTransferByDirection(uid, 'inbound', 'pending'),
    countTransferByDirection(uid, 'inbound', 'accepted'),
    countTransferByDirection(uid, 'inbound', 'rejected'),
    countTransferByDirection(uid, 'outbound', 'pending'),
    countTransferByDirection(uid, 'outbound', 'accepted'),
    countTransferByDirection(uid, 'outbound', 'rejected'),
  ]);

  const [recentInboundRequests, recentOutboundRequests] = await Promise.all([
    recentTransferRequests(uid, 'inbound', 5),
    recentTransferRequests(uid, 'outbound', 5),
  ]);

  const locRes = await pool.query(
    `SELECT TRIM(location) AS location, COUNT(*)::int AS count
     FROM products
     WHERE ${held.sql}
       AND location IS NOT NULL AND TRIM(location) <> ''
     GROUP BY TRIM(location)
     ORDER BY count DESC
     LIMIT 20`,
    held.params
  );
  const productsByLocation = locRes.rows.map((row) => ({
    location: row.location,
    count: row.count,
  }));

  return {
    assignedProductsCount: currentlyHeldCount,
    currentlyHeldCount,
    inTransitCount,
    inTransitProductsCount: inTransitCount,
    inboundPendingCount,
    inboundAcceptedCount,
    inboundRejectedCount,
    outboundPendingCount,
    outboundAcceptedCount,
    outboundRejectedCount,
    recentInboundRequests,
    recentOutboundRequests,
    productsByLocation,
    recentTransfersOrUpdatedProducts: [],
    transferRelatedStatusCount: {},
  };
}

async function getRetailerSummary(userId) {
  await ensureDashboardTables();
  const held = heldProductsClause(userId);
  const uid = userIdParam(userId);

  const heldRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM products WHERE ${held.sql}`,
    held.params
  );
  const currentlyHeldCount = heldRes.rows[0].c;

  const expiringRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM products
     WHERE ${held.sql}
       AND expiry_date IS NOT NULL
       AND expiry_date >= CURRENT_DATE
       AND expiry_date <= (CURRENT_DATE + ($2 * INTERVAL '1 day'))`,
    [...held.params, EXPIRING_SOON_DAYS]
  );
  const expiringSoonCount = expiringRes.rows[0].c;

  const expiredRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM products
     WHERE ${held.sql}
       AND expiry_date IS NOT NULL
       AND expiry_date < CURRENT_DATE`,
    held.params
  );
  const expiredCount = expiredRes.rows[0].c;

  const readyRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM products
     WHERE ${held.sql}
       AND (
         status ILIKE 'Retail Ready'
         OR status ILIKE 'Received by Retailer'
         OR status ILIKE 'Delivered'
         OR status ILIKE 'Received'
       )`,
    held.params
  );
  const readyForSaleCount = readyRes.rows[0].c;

  const [inboundPendingCount, inboundAcceptedCount, inboundRejectedCount] =
    await Promise.all([
      countTransferByDirection(uid, 'inbound', 'pending'),
      countTransferByDirection(uid, 'inbound', 'accepted'),
      countTransferByDirection(uid, 'inbound', 'rejected'),
    ]);

  const recentInboundRequests = await recentTransferRequests(uid, 'inbound', 5);

  const statusRes = await pool.query(
    `SELECT COALESCE(NULLIF(TRIM(status), ''), 'unknown') AS status, COUNT(*)::int AS c
     FROM products
     WHERE ${held.sql}
     GROUP BY COALESCE(NULLIF(TRIM(status), ''), 'unknown')`,
    held.params
  );
  const productsByStatus = {};
  for (const row of statusRes.rows) {
    productsByStatus[row.status] = row.c;
  }

  const heldMetaRows = await pool.query(
    `SELECT image_url, ingredients, allergy_info, usage_instructions, halal_status, expiry_date
     FROM products
     WHERE ${held.sql}`,
    held.params
  );
  let metadataWarningCount = 0;
  let expiringOrExpiredWarningCount = 0;
  for (const row of heldMetaRows.rows) {
    if (!assessProductMetadata(row).isComplete) metadataWarningCount += 1;
    if (row.expiry_date) {
      const exp = new Date(row.expiry_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expDay = new Date(exp);
      expDay.setHours(0, 0, 0, 0);
      const days = Math.ceil((expDay - today) / (24 * 60 * 60 * 1000));
      if (days <= EXPIRING_SOON_DAYS) expiringOrExpiredWarningCount += 1;
    }
  }

  return {
    assignedProductsCount: currentlyHeldCount,
    currentlyHeldCount,
    inboundPendingCount,
    inboundAcceptedCount,
    inboundRejectedCount,
    expiringSoonCount,
    expiredCount,
    readyForSaleCount,
    recentInboundRequests,
    productsByStatus,
    productsAtRetailLocationsCount: currentlyHeldCount,
    metadataWarningCount,
    expiringOrExpiredWarningCount,
    recentlyUpdatedProducts: [],
  };
}

async function getConsumerSummary(userId, userRow) {
  await ensureProductAnalyticsColumns();
  await inventoryService.ensureUserInventoryTable();

  const invCountRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM user_inventory WHERE user_id = $1`,
    [userId]
  );
  const inventoryCount = invCountRes.rows[0].c;

  const expiringSoonRes = await pool.query(
    `SELECT COUNT(*)::int AS c
     FROM user_inventory ui
     INNER JOIN products p ON p.product_id = ui.product_id
     WHERE ui.user_id = $1
       AND p.expiry_date IS NOT NULL
       AND p.expiry_date >= CURRENT_DATE
       AND p.expiry_date <= (CURRENT_DATE + ($2 * INTERVAL '1 day'))`,
    [userId, EXPIRING_SOON_DAYS]
  );
  const expiringSoonCount = expiringSoonRes.rows[0].c;

  const expiredRes = await pool.query(
    `SELECT COUNT(*)::int AS c
     FROM user_inventory ui
     INNER JOIN products p ON p.product_id = ui.product_id
     WHERE ui.user_id = $1
       AND p.expiry_date IS NOT NULL
       AND p.expiry_date < CURRENT_DATE`,
    [userId]
  );
  const expiredCount = expiredRes.rows[0].c;

  const allergyRows = await pool.query(
    `SELECT p.ingredients, p.allergy_info
     FROM user_inventory ui
     INNER JOIN products p ON p.product_id = ui.product_id
     WHERE ui.user_id = $1`,
    [userId]
  );
  const allergiesText = userRow?.allergies ?? '';
  const dietaryPreference = userRow?.dietary_preference ?? userRow?.dietaryPreference ?? '';
  let allergyAlertCount = 0;
  let dietaryAlertCount = 0;
  for (const row of allergyRows.rows) {
    if (matchesUserAllergies(allergiesText, row.ingredients, row.allergy_info)) {
      allergyAlertCount += 1;
    }
    if (matchesDietaryConflict(dietaryPreference, row.ingredients, row.halal_status)) {
      dietaryAlertCount += 1;
    }
  }

  const recentInvRes = await pool.query(
    `SELECT ui.id, ui.product_id, ui.added_at,
            p.name AS product_name, p.status, p.expiry_date
     FROM user_inventory ui
     LEFT JOIN products p ON p.product_id = ui.product_id
     WHERE ui.user_id = $1
     ORDER BY ui.added_at DESC NULLS LAST
     LIMIT 10`,
    [userId]
  );
  const recentInventoryItems = recentInvRes.rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    addedAt: row.added_at,
    productName: row.product_name,
    status: row.status,
    expiryDate: row.expiry_date,
  }));

  return {
    inventoryCount,
    expiringSoonCount,
    expiredCount,
    allergyAlertCount,
    dietaryAlertCount,
    safetyAlertCount: allergyAlertCount + dietaryAlertCount,
    recentInventoryItems,
  };
}

/**
 * @param {string} role
 * @param {number} userId
 * @param {object|null} userRow users table row (consumer allergies etc.; not used for manufacturer scoping)
 */
async function getSummaryByRole(role, userId, userRow) {
  switch (role) {
    case 'admin':
      return getAdminSummary();
    case 'manufacturer': {
      return getManufacturerSummary(userId);
    }
    case 'distributor':
      return getDistributorSummary(userId);
    case 'retailer':
      return getRetailerSummary(userId);
    case 'consumer':
      return getConsumerSummary(userId, userRow);
    case 'regulator':
      return regulatorService.getRegulatorSummary();
    default:
      return null;
  }
}

module.exports = {
  getSummaryByRole,
  EXPIRING_SOON_DAYS,
};
