const pool = require('../config/db');

/** Application-level product statuses (PostgreSQL; may differ from chain ledger status). */
const STATUSES = {
  MANUFACTURED: 'Manufactured',
  TRANSFER_PENDING: 'Transfer Pending',
  IN_TRANSIT: 'In Transit',
  RECEIVED_DISTRIBUTOR: 'Received by Distributor',
  RECEIVED_RETAILER: 'Received by Retailer',
  RETAIL_READY: 'Retail Ready',
};

function statusAfterAccept(recipientRole) {
  const role = String(recipientRole || '').toLowerCase();
  if (role === 'distributor') return STATUSES.RECEIVED_DISTRIBUTOR;
  if (role === 'retailer') return STATUSES.RECEIVED_RETAILER;
  return null;
}

/** Sensible app status when reverting after a rejected outbound transfer. */
function statusForOwnerRole(ownerRole) {
  const role = String(ownerRole || '').toLowerCase();
  if (role === 'distributor') return STATUSES.RECEIVED_DISTRIBUTOR;
  if (role === 'retailer') return STATUSES.RECEIVED_RETAILER;
  return STATUSES.MANUFACTURED;
}

function statusOnOutboundRequest(senderRole, recipientRole) {
  const sender = String(senderRole || '').toLowerCase();
  const recipient = String(recipientRole || '').toLowerCase();
  if (sender === 'manufacturer' && recipient === 'distributor') {
    return STATUSES.TRANSFER_PENDING;
  }
  if (sender === 'distributor' && recipient === 'retailer') {
    return STATUSES.IN_TRANSIT;
  }
  return null;
}

async function updateProductStatus(productId, status) {
  if (!productId || !status) return;
  await pool.query(`UPDATE products SET status = $2 WHERE product_id = $1`, [productId, status]);
}

/** Correct legacy rows where chain sync left "In Transit" after custody moved. */
function reconcileDisplayStatus(row) {
  if (!row) return null;
  const status = String(row.status || '').trim();
  const role = String(row.current_owner_role || '').toLowerCase();
  const inFlight = status === STATUSES.IN_TRANSIT || status === STATUSES.TRANSFER_PENDING;

  if (role === 'retailer') {
    if (status === STATUSES.RETAIL_READY) return status;
    if (inFlight || status === STATUSES.RECEIVED_DISTRIBUTOR) {
      return STATUSES.RECEIVED_RETAILER;
    }
  }
  if (role === 'distributor' && inFlight) {
    return STATUSES.RECEIVED_DISTRIBUTOR;
  }
  if (role === 'manufacturer' && status === STATUSES.IN_TRANSIT) {
    return STATUSES.MANUFACTURED;
  }
  return status || STATUSES.MANUFACTURED;
}

module.exports = {
  STATUSES,
  statusAfterAccept,
  statusOnOutboundRequest,
  statusForOwnerRole,
  updateProductStatus,
  reconcileDisplayStatus,
};
