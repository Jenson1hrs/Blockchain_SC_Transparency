const notificationService = require('./notificationService');

async function onProductCreated(manufacturerUserId, productId) {
  if (!manufacturerUserId) return;
  await notificationService.createNotification({
    userId: manufacturerUserId,
    type: 'product_created',
    title: 'Product registered',
    message: `Product ${productId} has been registered successfully.`,
    severity: 'success',
    relatedProductId: productId,
  });
}

async function onQrReady(manufacturerUserId, productId) {
  if (!manufacturerUserId) return;
  await notificationService.createNotificationIfNew({
    userId: manufacturerUserId,
    type: 'qr_ready',
    title: 'QR code ready',
    message: `QR code is ready for Product ${productId}.`,
    severity: 'info',
    relatedProductId: productId,
    withinHours: 12,
  });
}

async function onTransferRequestSent(request) {
  const pid = request.productId;
  const receiverOrg = request.toOrgName || 'the recipient';
  const senderOrg = request.fromOrgName || 'the sender';

  if (request.toUserId) {
    await notificationService.createNotification({
      userId: request.toUserId,
      type: 'transfer_request_received',
      title: 'Incoming transfer request',
      message: `You have received a transfer request for Product ${pid} from ${senderOrg}.`,
      severity: 'info',
      relatedProductId: pid,
      relatedEntityId: request.id,
    });
  }
  if (request.fromUserId) {
    await notificationService.createNotification({
      userId: request.fromUserId,
      type: 'transfer_request_sent',
      title: 'Transfer request sent',
      message: `Transfer request for Product ${pid} was sent to ${receiverOrg}.`,
      severity: 'info',
      relatedProductId: pid,
      relatedEntityId: request.id,
    });
  }
}

async function onTransferAccepted(request) {
  const pid = request.productId;
  const receiverOrg = request.toOrgName || 'the receiver';

  if (request.fromUserId) {
    await notificationService.createNotification({
      userId: request.fromUserId,
      type: 'transfer_accepted',
      title: 'Transfer accepted',
      message: `${receiverOrg} accepted Product ${pid}.`,
      severity: 'success',
      relatedProductId: pid,
      relatedEntityId: request.id,
    });
  }
  if (request.toUserId) {
    await notificationService.createNotification({
      userId: request.toUserId,
      type: 'transfer_accepted',
      title: 'Transfer accepted',
      message: `You accepted Product ${pid}. Your organization is now responsible for it.`,
      severity: 'success',
      relatedProductId: pid,
      relatedEntityId: request.id,
    });
  }
}

async function onTransferRejected(request) {
  const pid = request.productId;
  const receiverOrg = request.toOrgName || 'the receiver';

  if (request.fromUserId) {
    await notificationService.createNotification({
      userId: request.fromUserId,
      type: 'transfer_rejected',
      title: 'Transfer rejected',
      message: `${receiverOrg} rejected Product ${pid}.`,
      severity: 'warning',
      relatedProductId: pid,
      relatedEntityId: request.id,
    });
  }
  if (request.toUserId) {
    await notificationService.createNotification({
      userId: request.toUserId,
      type: 'transfer_rejected',
      title: 'Transfer rejected',
      message: `You rejected the transfer request for Product ${pid}.`,
      severity: 'info',
      relatedProductId: pid,
      relatedEntityId: request.id,
    });
  }
}

async function onLocationUpdated(ownerUserId, productId) {
  if (!ownerUserId) return;
  await notificationService.createNotificationIfNew({
    userId: ownerUserId,
    type: 'location_updated',
    title: 'Location updated',
    message: `Location updated for Product ${productId}.`,
    severity: 'info',
    relatedProductId: productId,
    withinHours: 6,
  });
}

async function onInventoryAdded(userId, productId) {
  await notificationService.createNotification({
    userId,
    type: 'inventory_added',
    title: 'Added to inventory',
    message: `Product ${productId} was added to your inventory.`,
    severity: 'success',
    relatedProductId: productId,
  });
}

async function onOrganizationApproved(orgUserId) {
  if (!orgUserId) return;
  await notificationService.createNotification({
    userId: orgUserId,
    type: 'org_approved',
    title: 'Organization approved',
    message: 'Your organization has been approved by a regulator. A verified trust badge is now visible on verification pages.',
    severity: 'success',
    relatedEntityId: orgUserId,
  });
}

async function onOrganizationRevoked(orgUserId) {
  if (!orgUserId) return;
  await notificationService.createNotification({
    userId: orgUserId,
    type: 'org_revoked',
    title: 'Verification revoked',
    message: 'Regulatory verification for your organization has been revoked.',
    severity: 'warning',
    relatedEntityId: orgUserId,
  });
}

async function onOrganizationFlagged(orgUserId, reason) {
  if (!orgUserId) return;
  const extra = reason ? ` Reason: ${reason}` : '';
  await notificationService.createNotification({
    userId: orgUserId,
    type: 'org_flagged',
    title: 'Organization flagged',
    message: `Your organization has been flagged for regulatory review.${extra}`,
    severity: 'danger',
    relatedEntityId: orgUserId,
  });
}

async function onOrganizationUnflagged(orgUserId) {
  if (!orgUserId) return;
  await notificationService.createNotification({
    userId: orgUserId,
    type: 'org_unflagged',
    title: 'Flag removed',
    message: 'The regulatory flag on your organization has been removed.',
    severity: 'info',
    relatedEntityId: orgUserId,
  });
}

async function onFakeQrDetected(productId) {
  await notificationService.notifyUsersByRoles(
    ['regulator', 'admin'],
    {
      type: 'fake_qr_detected',
      title: 'Fake QR detected',
      message: `Fake QR verification attempt detected for Product ${productId}.`,
      severity: 'danger',
      relatedProductId: productId,
    },
    { withinHours: 12 }
  );
}

async function onUserRegistered(userName, userEmail, role) {
  await notificationService.notifyUsersByRoles(
    ['admin'],
    {
      type: 'user_registered',
      title: 'New user registration',
      message: `New ${role} account registered: ${userName} (${userEmail}).`,
      severity: 'info',
    },
    { dedupe: false }
  );
}

module.exports = {
  onProductCreated,
  onQrReady,
  onTransferRequestSent,
  onTransferAccepted,
  onTransferRejected,
  onLocationUpdated,
  onInventoryAdded,
  onOrganizationApproved,
  onOrganizationRevoked,
  onOrganizationFlagged,
  onOrganizationUnflagged,
  onFakeQrDetected,
  onUserRegistered,
};
