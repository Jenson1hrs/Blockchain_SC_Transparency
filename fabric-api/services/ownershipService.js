const pool = require('../config/db');
const userService = require('./userService');
const organizationService = require('./organizationService');
const productStatusService = require('./productStatusService');

const TRANSFERABLE_ROLES = ['manufacturer', 'distributor', 'retailer'];
/** Enterprise custody chain: Manufacturer → Distributor → Retailer (consumers are off-chain). */
const OUTBOUND_TRANSFER_ROLES = ['manufacturer', 'distributor'];

function assertValidSupplyChainTransfer(senderRole, recipientRole) {
  if (senderRole === 'retailer') {
    const err = new Error(
      'Retailers are the final business custody point and cannot send blockchain transfer requests.'
    );
    err.statusCode = 403;
    throw err;
  }
  if (senderRole === 'manufacturer' && recipientRole !== 'distributor') {
    const err = new Error(
      'Manufacturers may only send transfer requests to distributor organizations.'
    );
    err.statusCode = 400;
    throw err;
  }
  if (senderRole === 'distributor' && recipientRole !== 'retailer') {
    const err = new Error('Distributors may only send transfer requests to retailer organizations.');
    err.statusCode = 400;
    throw err;
  }
}

async function ensureOwnershipColumns() {
  await organizationService.ensureProductOwnershipColumns();
  await pool.query(`
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS current_owner_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS current_owner_role TEXT,
      ADD COLUMN IF NOT EXISTS current_owner_name TEXT,
      ADD COLUMN IF NOT EXISTS last_transferred_to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS last_transferred_at TIMESTAMP
  `);
  await pool.query(`
    UPDATE products
    SET current_owner_user_id = manufacturer_user_id,
        current_owner_role = 'manufacturer',
        current_owner_name = COALESCE(manufacturer_company_name, manufacturer)
    WHERE current_owner_user_id IS NULL
      AND manufacturer_user_id IS NOT NULL
  `);
}

function getUserDisplayName(userRow) {
  if (!userRow) return '';
  const company = userRow.company_name != null ? String(userRow.company_name).trim() : '';
  if (company) return company;
  return String(userRow.name || '').trim();
}

async function getOwnerDisplayForUser(userId) {
  const row = await userService.findUserById(userId);
  if (!row) return null;
  return {
    userId: row.id,
    role: row.role,
    displayName: getUserDisplayName(row),
    row,
  };
}

async function assertCanTransfer(actorUser, productId) {
  if (!OUTBOUND_TRANSFER_ROLES.includes(actorUser.role) && actorUser.role !== 'admin') {
    const err = new Error('Your role cannot initiate blockchain custody transfers.');
    err.statusCode = 403;
    throw err;
  }
  await ensureOwnershipColumns();
  const productRes = await pool.query(
    `SELECT product_id, current_owner_user_id FROM products WHERE product_id = $1`,
    [productId]
  );
  const product = productRes.rows[0];
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  const isOwner = Number(product.current_owner_user_id) === Number(actorUser.id);
  const isAdmin = actorUser.role === 'admin';
  if (!isOwner && !isAdmin) {
    const err = new Error(
      'You cannot transfer this product because it is not assigned to your organization.'
    );
    err.statusCode = 403;
    throw err;
  }
  return product;
}

async function assertCanUpdateLocation(actorUser, productId) {
  await ensureOwnershipColumns();
  const productRes = await pool.query(
    `SELECT product_id, current_owner_user_id FROM products WHERE product_id = $1`,
    [productId]
  );
  const product = productRes.rows[0];
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  if (Number(product.current_owner_user_id) !== Number(actorUser.id)) {
    const err = new Error(
      'You cannot update this product because it is not assigned to your organization.'
    );
    err.statusCode = 403;
    throw err;
  }
  return product;
}

async function applyCreateOwnership(data, reqUser) {
  if (!reqUser || reqUser.role !== 'manufacturer') {
    return data;
  }
  const userRow = await userService.findUserById(reqUser.id);
  const displayName = getUserDisplayName(userRow);
  return {
    ...data,
    manufacturerUserId: reqUser.id,
    manufacturerCompanyName: displayName,
    manufacturer: displayName,
    currentOwnerUserId: reqUser.id,
    currentOwnerRole: 'manufacturer',
    currentOwnerName: displayName,
  };
}

async function syncOwnershipAfterTransfer(productId, recipientUserId, chainOwner) {
  await ensureOwnershipColumns();
  const recipient = await getOwnerDisplayForUser(recipientUserId);
  if (!recipient) {
    throw new Error('Recipient user not found');
  }
  const appStatus =
    productStatusService.statusAfterAccept(recipient.role) ||
    productStatusService.STATUSES.MANUFACTURED;
  await pool.query(
    `UPDATE products
     SET owner = $2,
         status = $3,
         current_owner_user_id = $4,
         current_owner_role = $5,
         current_owner_name = $6,
         last_transferred_to_user_id = $4,
         last_transferred_at = CURRENT_TIMESTAMP
     WHERE product_id = $1`,
    [
      productId,
      chainOwner || recipient.displayName,
      appStatus,
      recipient.userId,
      recipient.role,
      recipient.displayName,
    ]
  );
}

async function listSupplyChainUsers({ q = '', role = '' } = {}) {
  await userService.ensureUsersTable();
  await organizationService.ensureOrganizationColumns();

  const params = [];
  const clauses = [`role IN ('manufacturer','distributor','retailer')`];
  let idx = 1;

  const roleFilter = role != null ? String(role).trim().toLowerCase() : '';
  if (roleFilter && TRANSFERABLE_ROLES.includes(roleFilter)) {
    clauses.push(`role = $${idx}`);
    params.push(roleFilter);
    idx += 1;
  }

  const search = q != null ? String(q).trim() : '';
  if (search) {
    clauses.push(`(
      name ILIKE $${idx}
      OR email ILIKE $${idx}
      OR company_name ILIKE $${idx}
    )`);
    params.push(`%${search}%`);
    idx += 1;
  }

  const result = await pool.query(
    `SELECT id, name, email, role, company_name, organization_verified, organization_flagged
     FROM users
     WHERE ${clauses.join(' AND ')}
     ORDER BY organization_verified DESC, company_name ASC NULLS LAST, name ASC
     LIMIT 50`,
    params
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    companyName: row.company_name ?? null,
    organizationVerified: Boolean(row.organization_verified),
    organizationFlagged: Boolean(row.organization_flagged),
    displayName: getUserDisplayName(row),
  }));
}

function listWhereForRole(role, userId) {
  switch (role) {
    case 'manufacturer':
      return {
        sql: `(
          (manufacturer_user_id = $1 AND manufacturer_user_id IS NOT NULL)
          OR current_owner_user_id = $1
        )`,
        params: [userId],
      };
    case 'distributor':
      return {
        sql: `current_owner_user_id = $1 AND LOWER(TRIM(current_owner_role)) = 'distributor'`,
        params: [userId],
      };
    case 'retailer':
      return {
        sql: `current_owner_user_id = $1 AND LOWER(TRIM(current_owner_role)) = 'retailer'`,
        params: [userId],
      };
    default:
      return { sql: '1=0', params: [] };
  }
}

async function listAssignedProducts(userId, role, { limit = 100 } = {}) {
  await ensureOwnershipColumns();
  const where = listWhereForRole(role, userId);
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 200);

  const result = await pool.query(
    `SELECT p.*, mu.organization_verified AS manufacturer_org_verified,
            mu.organization_flagged AS manufacturer_org_flagged
     FROM products p
     LEFT JOIN users mu ON mu.id = p.manufacturer_user_id
     WHERE ${where.sql}
     ORDER BY p.timestamp DESC NULLS LAST
     LIMIT $2`,
    [...where.params, safeLimit]
  );

  return result.rows;
}

module.exports = {
  TRANSFERABLE_ROLES,
  OUTBOUND_TRANSFER_ROLES,
  assertValidSupplyChainTransfer,
  ensureOwnershipColumns,
  getUserDisplayName,
  getOwnerDisplayForUser,
  applyCreateOwnership,
  assertCanTransfer,
  assertCanUpdateLocation,
  syncOwnershipAfterTransfer,
  listSupplyChainUsers,
  listAssignedProducts,
  listWhereForRole,
};
