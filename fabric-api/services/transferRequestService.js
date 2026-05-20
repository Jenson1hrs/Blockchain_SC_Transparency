const pool = require('../config/db');
const fabricService = require('./fabricService');
const ownershipService = require('./ownershipService');
const productStatusService = require('./productStatusService');
const notificationTriggers = require('./notificationTriggers');

const STATUSES = ['pending', 'accepted', 'rejected', 'cancelled'];

async function ensureTransferRequestsTable() {
  await ownershipService.ensureOwnershipColumns();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transfer_requests (
      id SERIAL PRIMARY KEY,
      product_id TEXT NOT NULL,
      from_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      from_org_name TEXT,
      to_org_name TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      message TEXT,
      rejection_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      responded_at TIMESTAMP
    )
  `);
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'transfer_requests_status_check'
      ) THEN
        ALTER TABLE transfer_requests
          ADD CONSTRAINT transfer_requests_status_check
          CHECK (status IN ('pending','accepted','rejected','cancelled'));
      END IF;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await pool.query(`
    ALTER TABLE transfer_requests
      ADD COLUMN IF NOT EXISTS previous_status TEXT
  `);
}

function mapRequestRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name ?? null,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    fromOrgName: row.from_org_name,
    toOrgName: row.to_org_name,
    status: row.status,
    message: row.message ?? null,
    rejectionReason: row.rejection_reason ?? null,
    createdAt: row.created_at,
    respondedAt: row.responded_at ?? null,
  };
}

async function getProductRow(productId) {
  const res = await pool.query(
    `SELECT product_id, name, status, current_owner_user_id, current_owner_role, current_owner_name
     FROM products WHERE product_id = $1`,
    [productId]
  );
  return res.rows[0] || null;
}

async function createTransferRequest(actorUser, { productId, toUserId, message }) {
  await ensureTransferRequestsTable();
  const pid = productId != null ? String(productId).trim() : '';
  if (!pid) {
    const err = new Error('Product id is required');
    err.statusCode = 400;
    throw err;
  }

  const recipientId = Number(toUserId);
  if (!Number.isFinite(recipientId)) {
    const err = new Error('Valid recipient user id is required');
    err.statusCode = 400;
    throw err;
  }

  if (recipientId === actorUser.id) {
    const err = new Error('Cannot send a transfer request to yourself');
    err.statusCode = 400;
    throw err;
  }

  await ownershipService.assertCanTransfer(actorUser, pid);

  const recipient = await ownershipService.getOwnerDisplayForUser(recipientId);
  if (!recipient) {
    const err = new Error('Recipient user not found');
    err.statusCode = 404;
    throw err;
  }
  if (!ownershipService.TRANSFERABLE_ROLES.includes(recipient.role)) {
    const err = new Error('Recipient must be a manufacturer, distributor, or retailer');
    err.statusCode = 400;
    throw err;
  }
  if (recipient.role === 'admin' || recipient.role === 'regulator' || recipient.role === 'consumer') {
    const err = new Error('Recipient cannot accept supply-chain custody');
    err.statusCode = 400;
    throw err;
  }

  ownershipService.assertValidSupplyChainTransfer(actorUser.role, recipient.role);

  const pendingRes = await pool.query(
    `SELECT id FROM transfer_requests
     WHERE product_id = $1 AND status = 'pending'
       AND from_user_id = $2 AND to_user_id = $3
     LIMIT 1`,
    [pid, actorUser.id, recipientId]
  );
  if (pendingRes.rows.length > 0) {
    const err = new Error('A pending transfer request to this organization already exists for this product');
    err.statusCode = 409;
    throw err;
  }

  const sender = await ownershipService.getOwnerDisplayForUser(actorUser.id);
  const fromOrgName = sender?.displayName || '';

  const productBefore = await getProductRow(pid);
  const previousStatus =
    productBefore?.status != null && String(productBefore.status).trim() !== ''
      ? String(productBefore.status).trim()
      : productStatusService.statusForOwnerRole(productBefore?.current_owner_role);

  const insertRes = await pool.query(
    `INSERT INTO transfer_requests
     (product_id, from_user_id, to_user_id, from_org_name, to_org_name, status, message, previous_status)
     VALUES ($1,$2,$3,$4,$5,'pending',$6,$7)
     RETURNING id`,
    [
      pid,
      actorUser.id,
      recipientId,
      fromOrgName,
      recipient.displayName,
      message || null,
      previousStatus,
    ]
  );

  const newId = insertRes.rows[0].id;
  const pendingStatus = productStatusService.statusOnOutboundRequest(
    actorUser.role,
    recipient.role
  );
  if (pendingStatus) {
    await productStatusService.updateProductStatus(pid, pendingStatus);
  }
  const full = await getRequestById(newId);
  const mapped = mapRequestRow(full);
  void notificationTriggers.onTransferRequestSent(mapped).catch(() => {});
  return mapped;
}

async function listRequestsForUser(userId, direction) {
  await ensureTransferRequestsTable();
  const isIncoming = direction === 'incoming';
  const clause = isIncoming ? 'tr.to_user_id = $1' : 'tr.from_user_id = $1';

  const result = await pool.query(
    `SELECT tr.*, p.name AS product_name
     FROM transfer_requests tr
     LEFT JOIN products p ON p.product_id = tr.product_id
     WHERE ${clause}
     ORDER BY tr.created_at DESC
     LIMIT 100`,
    [userId]
  );
  return result.rows.map(mapRequestRow);
}

async function listAllRequestsForOversight() {
  await ensureTransferRequestsTable();
  const result = await pool.query(
    `SELECT tr.*, p.name AS product_name
     FROM transfer_requests tr
     LEFT JOIN products p ON p.product_id = tr.product_id
     ORDER BY tr.created_at DESC
     LIMIT 200`
  );
  return result.rows.map(mapRequestRow);
}

async function getRequestById(requestId) {
  await ensureTransferRequestsTable();
  const res = await pool.query(
    `SELECT tr.*, p.name AS product_name
     FROM transfer_requests tr
     LEFT JOIN products p ON p.product_id = tr.product_id
     WHERE tr.id = $1`,
    [requestId]
  );
  return res.rows[0] || null;
}

async function acceptTransferRequest(requestId, actorUser) {
  await ensureTransferRequestsTable();
  const row = await getRequestById(requestId);
  if (!row) {
    const err = new Error('Transfer request not found');
    err.statusCode = 404;
    throw err;
  }
  if (Number(row.to_user_id) !== Number(actorUser.id)) {
    const err = new Error('Only the receiving organization can accept this transfer');
    err.statusCode = 403;
    throw err;
  }
  if (row.status !== 'pending') {
    const err = new Error(`Transfer request is already ${row.status}`);
    err.statusCode = 400;
    throw err;
  }

  const recipient = await ownershipService.getOwnerDisplayForUser(actorUser.id);
  if (!recipient) {
    const err = new Error('Recipient profile not found');
    err.statusCode = 404;
    throw err;
  }

  const product = await getProductRow(row.product_id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  if (Number(product.current_owner_user_id) !== Number(row.from_user_id)) {
    const err = new Error(
      'Cannot accept: product ownership has changed since this request was sent'
    );
    err.statusCode = 409;
    throw err;
  }

  const chainResult = await fabricService.transferProduct(
    row.product_id,
    recipient.displayName
  );

  await ownershipService.syncOwnershipAfterTransfer(
    row.product_id,
    actorUser.id,
    chainResult.owner || recipient.displayName
  );

  await pool.query(
    `UPDATE transfer_requests
     SET status = 'accepted', responded_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [requestId]
  );

  const updated = await getRequestById(requestId);
  const mapped = mapRequestRow(updated);
  void notificationTriggers.onTransferAccepted(mapped).catch(() => {});
  return mapped;
}

async function rejectTransferRequest(requestId, actorUser, rejectionReason) {
  await ensureTransferRequestsTable();
  const row = await getRequestById(requestId);
  if (!row) {
    const err = new Error('Transfer request not found');
    err.statusCode = 404;
    throw err;
  }
  if (Number(row.to_user_id) !== Number(actorUser.id)) {
    const err = new Error('Only the receiving organization can reject this transfer');
    err.statusCode = 403;
    throw err;
  }
  if (row.status !== 'pending') {
    const err = new Error(`Transfer request is already ${row.status}`);
    err.statusCode = 400;
    throw err;
  }

  const reason =
    rejectionReason != null && String(rejectionReason).trim() !== ''
      ? String(rejectionReason).trim()
      : null;

  await pool.query(
    `UPDATE transfer_requests
     SET status = 'rejected',
         rejection_reason = $2,
         responded_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [requestId, reason]
  );

  const product = await getProductRow(row.product_id);
  if (product && Number(product.current_owner_user_id) === Number(row.from_user_id)) {
    const pendingStatuses = new Set([
      productStatusService.STATUSES.TRANSFER_PENDING,
      productStatusService.STATUSES.IN_TRANSIT,
    ]);
    let revertStatus =
      row.previous_status != null && String(row.previous_status).trim() !== ''
        ? String(row.previous_status).trim()
        : null;
    if (!revertStatus || pendingStatuses.has(revertStatus)) {
      revertStatus = productStatusService.statusForOwnerRole(product.current_owner_role);
    }
    await productStatusService.updateProductStatus(row.product_id, revertStatus);
  }

  const updated = await getRequestById(requestId);
  const mapped = mapRequestRow(updated);
  void notificationTriggers.onTransferRejected(mapped).catch(() => {});
  return mapped;
}

function chainEntryLabel(status, prevStatus, { isLocationOnly = false } = {}) {
  if (isLocationOnly) {
    return 'Location Updated';
  }
  const s = (status || '').trim();
  const lower = s.toLowerCase();
  if (lower === 'manufactured' || !prevStatus) {
    return 'Product Created';
  }
  if (lower === 'received by distributor') {
    return 'Received by Distributor';
  }
  if (lower === 'received by retailer') {
    return 'Received by Retailer';
  }
  if (lower === 'retail ready') {
    return 'Retail Ready';
  }
  if (lower === 'in transit') {
    return 'In Transit';
  }
  return 'Ownership Transferred';
}

function milestoneForRecipientRole(role) {
  const r = String(role || '').toLowerCase();
  if (r === 'distributor') {
    return {
      label: 'Received by Distributor',
      status: productStatusService.STATUSES.RECEIVED_DISTRIBUTOR,
      notesSuffix: 'Distributor custody — stock held for downstream retail shipment.',
    };
  }
  if (r === 'retailer') {
    return {
      label: 'Received by Retailer',
      status: productStatusService.STATUSES.RECEIVED_RETAILER,
      notesSuffix:
        'Final business custody point — product is at the retailer before consumer sale.',
    };
  }
  return {
    label: 'Transfer Accepted',
    status: 'Transfer Accepted',
    notesSuffix: 'Blockchain custody updated.',
  };
}

/** Align on-chain "In Transit" rows with the workflow accept milestone that follows. */
function enrichTimelineMilestones(timeline, productContext) {
  if (!timeline?.length) return timeline;

  const accepts = timeline.filter(
    (e) =>
      e.source === 'workflow' &&
      (e.status === productStatusService.STATUSES.RECEIVED_DISTRIBUTOR ||
        e.status === productStatusService.STATUSES.RECEIVED_RETAILER ||
        e.label === 'Received by Distributor' ||
        e.label === 'Received by Retailer'),
  );

  for (const accept of accepts) {
    const acceptTs = new Date(accept.timestamp).getTime();
    if (Number.isNaN(acceptTs)) continue;

    let best = null;
    let bestDelta = Infinity;
    for (const entry of timeline) {
      if (entry.source !== 'on-chain') continue;
      const st = String(entry.status || '').toLowerCase();
      if (st !== 'in transit' && st !== 'ownership transferred') continue;
      const entryTs = new Date(entry.timestamp).getTime();
      if (Number.isNaN(entryTs) || entryTs > acceptTs) continue;
      const delta = acceptTs - entryTs;
      if (delta < bestDelta) {
        bestDelta = delta;
        best = entry;
      }
    }
    if (best && bestDelta < 7 * 24 * 60 * 60 * 1000) {
      best.label = accept.label;
      best.status = accept.status;
    }
  }

  const status = productContext?.status != null ? String(productContext.status).trim() : '';

  if (status.toLowerCase() === productStatusService.STATUSES.RETAIL_READY.toLowerCase()) {
    for (let i = timeline.length - 1; i >= 0; i -= 1) {
      const entry = timeline[i];
      if (entry.source !== 'on-chain') continue;
      if (entry.label === 'Location Updated' || entry.location) {
        entry.label = 'Retail Ready';
        entry.status = productStatusService.STATUSES.RETAIL_READY;
        entry.notes =
          'Store or shelf location recorded — available for consumer verification before sale.';
        break;
      }
    }
  }

  return timeline;
}

function parseChainTimestamp(entry) {
  if (entry.timestamp?.seconds != null) {
    return new Date(entry.timestamp.seconds * 1000).toISOString();
  }
  const dataTs = entry.data?.timestamp;
  if (dataTs) {
    const d = new Date(dataTs);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return new Date(0).toISOString();
}

async function getProductTimelineContext(productId) {
  const res = await pool.query(
    `SELECT status, current_owner_role, current_owner_name
     FROM products WHERE product_id = $1`,
    [productId],
  );
  return res.rows[0] || null;
}

async function getWorkflowEventsForProduct(productId) {
  await ensureTransferRequestsTable();
  const res = await pool.query(
    `SELECT tr.*, tu.role AS to_role
     FROM transfer_requests tr
     LEFT JOIN users tu ON tu.id = tr.to_user_id
     WHERE tr.product_id = $1
     ORDER BY tr.created_at ASC`,
    [productId]
  );

  const events = [];
  for (const row of res.rows) {
    const base = {
      productId: row.product_id,
      actor: row.from_org_name,
      toActor: row.to_org_name,
    };
    const createdIso = row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date(0).toISOString();

    events.push({
      id: `wf-req-${row.id}`,
      source: 'workflow',
      label: 'Transfer Requested',
      status: 'Transfer Requested',
      timestamp: createdIso,
      actor: row.from_org_name,
      notes: row.message
        ? `To ${row.to_org_name}: ${row.message}`
        : `To ${row.to_org_name}`,
    });

    if (row.status === 'accepted' && row.responded_at) {
      const milestone = milestoneForRecipientRole(row.to_role);
      events.push({
        id: `wf-acc-${row.id}`,
        source: 'workflow',
        label: milestone.label,
        status: milestone.status,
        timestamp: new Date(row.responded_at).toISOString(),
        actor: row.to_org_name,
        notes: `Custody accepted from ${row.from_org_name}. ${milestone.notesSuffix}`,
      });
    } else if (row.status === 'rejected' && row.responded_at) {
      events.push({
        id: `wf-rej-${row.id}`,
        source: 'workflow',
        label: 'Transfer Rejected',
        status: 'Transfer Rejected',
        timestamp: new Date(row.responded_at).toISOString(),
        actor: row.to_org_name,
        notes: row.rejection_reason
          ? `Reason: ${row.rejection_reason}`
          : `Rejected by ${row.to_org_name}`,
      });
    }
  }
  return events;
}

async function getCombinedProductTimeline(productId) {
  let chainEntries = [];
  try {
    chainEntries = await fabricService.getHistory(productId);
    if (!Array.isArray(chainEntries)) chainEntries = [];
  } catch {
    chainEntries = [];
  }

  const timeline = [];
  let prevStatus = null;

  for (let i = 0; i < chainEntries.length; i += 1) {
    const entry = chainEntries[i];
    const data = entry.data || {};
    const status = data.status || 'Unknown';
    const ts = parseChainTimestamp(entry);
    const isLocationOnly =
      i > 0 &&
      data.owner === chainEntries[i - 1]?.data?.owner &&
      data.location !== chainEntries[i - 1]?.data?.location;
    const label = chainEntryLabel(status, prevStatus, { isLocationOnly });

    timeline.push({
      id: entry.txId ? `chain-${entry.txId}` : `chain-${i}`,
      source: 'on-chain',
      label,
      status,
      timestamp: ts,
      location: data.location,
      actor: data.owner,
      notes: entry.txId ? `On-chain transaction ${String(entry.txId).slice(0, 16)}…` : 'On-chain Event',
      txId: entry.txId,
    });
    prevStatus = status;
  }

  const workflowEvents = await getWorkflowEventsForProduct(productId);
  timeline.push(...workflowEvents);

  timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const productContext = await getProductTimelineContext(productId);
  enrichTimelineMilestones(timeline, productContext);
  timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return { timeline, chain: chainEntries };
}

module.exports = {
  STATUSES,
  ensureTransferRequestsTable,
  createTransferRequest,
  listRequestsForUser,
  listAllRequestsForOversight,
  acceptTransferRequest,
  rejectTransferRequest,
  getCombinedProductTimeline,
};
