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

const EXPIRING_SOON_DAYS = 7;

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
  await ensureProductAnalyticsColumns();
  const where = manufacturerScopedWhereClause(manufacturerUserId);

  const totalRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM products WHERE ${where.sql}`,
    where.params
  );
  const totalProducts = totalRes.rows[0].c;

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

  return {
    totalProducts,
    productsByStatus,
    recentProducts,
    missingMetadataCount,
    metadataCompletionPercent,
    recentIncompleteProducts,
    qrSupportedProductsCount,
  };
}

async function getDistributorSummary(userId) {
  await ensureProductAnalyticsColumns();
  await ownershipService.ensureOwnershipColumns();
  const where = ownershipService.listWhereForRole('distributor', userId);

  const totalRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM products WHERE ${where.sql}`,
    where.params
  );
  const assignedProductsCount = totalRes.rows[0].c;

  const inTransitRes = await pool.query(
    `SELECT COUNT(*)::int AS c
     FROM products
     WHERE ${where.sql} AND LOWER(TRIM(status)) = LOWER(TRIM($2))`,
    [...where.params, 'In Transit']
  );
  const inTransitProductsCount = inTransitRes.rows[0].c;

  const recentRes = await pool.query(
    `SELECT product_id, name, manufacturer, batch_number, location, owner, status, timestamp, expiry_date
     FROM products
     WHERE ${where.sql}
     ORDER BY timestamp DESC NULLS LAST
     LIMIT 10`,
    where.params
  );
  const recentTransfersOrUpdatedProducts = recentRes.rows.map(mapProductRow);

  const locRes = await pool.query(
    `SELECT TRIM(location) AS location, COUNT(*)::int AS count
     FROM products
     WHERE ${where.sql}
       AND location IS NOT NULL AND TRIM(location) <> ''
     GROUP BY TRIM(location)
     ORDER BY count DESC
     LIMIT 20`,
    where.params
  );
  const productsByLocation = locRes.rows.map((row) => ({
    location: row.location,
    count: row.count,
  }));

  const trRes = await pool.query(
    `SELECT COALESCE(NULLIF(TRIM(status), ''), 'unknown') AS status, COUNT(*)::int AS count
     FROM products
     WHERE ${where.sql}
     GROUP BY COALESCE(NULLIF(TRIM(status), ''), 'unknown')
     ORDER BY count DESC`,
    where.params
  );
  const transferRelatedStatusCount = {};
  for (const row of trRes.rows) {
    transferRelatedStatusCount[row.status] = row.count;
  }

  return {
    assignedProductsCount,
    inTransitProductsCount,
    recentTransfersOrUpdatedProducts,
    productsByLocation,
    transferRelatedStatusCount,
  };
}

async function getRetailerSummary(userId) {
  await ensureProductAnalyticsColumns();
  await ownershipService.ensureOwnershipColumns();
  const where = ownershipService.listWhereForRole('retailer', userId);

  const totalRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM products WHERE ${where.sql}`,
    where.params
  );
  const assignedProductsCount = totalRes.rows[0].c;

  const atRetailRes = await pool.query(
    `SELECT COUNT(*)::int AS c
     FROM products
     WHERE ${where.sql}
       AND (
         LOWER(TRIM(status)) = LOWER($2)
         OR LOWER(location) LIKE '%retail%'
         OR LOWER(location) LIKE '%store%'
         OR LOWER(location) LIKE '%shop%'
         OR LOWER(location) LIKE '%outlet%'
       )`,
    [...where.params, 'delivered']
  );
  const productsAtRetailLocationsCount = atRetailRes.rows[0].c;

  const expiringRes = await pool.query(
    `SELECT COUNT(*)::int AS c
     FROM products
     WHERE ${where.sql}
       AND expiry_date IS NOT NULL
       AND expiry_date >= CURRENT_DATE
       AND expiry_date <= (CURRENT_DATE + ($2 * INTERVAL '1 day'))`,
    [...where.params, EXPIRING_SOON_DAYS]
  );
  const expiringSoonCount = expiringRes.rows[0].c;

  const recentRes = await pool.query(
    `SELECT product_id, name, manufacturer, batch_number, location, owner, status, timestamp, expiry_date
     FROM products
     WHERE ${where.sql}
     ORDER BY timestamp DESC NULLS LAST
     LIMIT 10`,
    where.params
  );
  const recentlyUpdatedProducts = recentRes.rows.map(mapProductRow);

  const statusRes = await pool.query(
    `SELECT COALESCE(NULLIF(TRIM(status), ''), 'unknown') AS status, COUNT(*)::int AS c
     FROM products
     WHERE ${where.sql}
     GROUP BY COALESCE(NULLIF(TRIM(status), ''), 'unknown')`,
    where.params
  );
  const productsByStatus = {};
  for (const row of statusRes.rows) {
    productsByStatus[row.status] = row.c;
  }

  return {
    assignedProductsCount,
    productsAtRetailLocationsCount,
    expiringSoonCount,
    recentlyUpdatedProducts,
    productsByStatus,
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
  let allergyAlertCount = 0;
  for (const row of allergyRows.rows) {
    if (matchesUserAllergies(allergiesText, row.ingredients, row.allergy_info)) {
      allergyAlertCount += 1;
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
