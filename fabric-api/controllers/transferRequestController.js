const transferRequestService = require('../services/transferRequestService');

function handleError(res, error, context) {
  const status = error.statusCode || 500;
  if (status >= 500) console.error(context, error);
  return res.status(status).json({ success: false, message: error.message });
}

exports.createRequest = async (req, res) => {
  try {
    const productId = req.body.productId ?? req.body.id;
    const toUserId = req.body.toUserId ?? req.body.newOwnerUserId;
    const { message } = req.body;

    const data = await transferRequestService.createTransferRequest(req.user, {
      productId,
      toUserId,
      message,
    });

    return res.status(201).json({
      success: true,
      message:
        'Transfer request sent. Ownership will change after receiver acceptance.',
      data,
    });
  } catch (e) {
    return handleError(res, e, 'createTransferRequest');
  }
};

exports.listIncoming = async (req, res) => {
  try {
    const data = await transferRequestService.listRequestsForUser(req.user.id, 'incoming');
    return res.json({ success: true, data, count: data.length });
  } catch (e) {
    return handleError(res, e, 'listIncomingTransferRequests');
  }
};

exports.listOutgoing = async (req, res) => {
  try {
    const data = await transferRequestService.listRequestsForUser(req.user.id, 'outgoing');
    return res.json({ success: true, data, count: data.length });
  } catch (e) {
    return handleError(res, e, 'listOutgoingTransferRequests');
  }
};

exports.listAll = async (req, res) => {
  try {
    const data = await transferRequestService.listAllRequestsForOversight();
    return res.json({ success: true, data, count: data.length });
  } catch (e) {
    return handleError(res, e, 'listAllTransferRequests');
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    if (!Number.isFinite(requestId)) {
      return res.status(400).json({ success: false, message: 'Invalid request id' });
    }
    const data = await transferRequestService.acceptTransferRequest(requestId, req.user);
    return res.json({
      success: true,
      message: 'Transfer accepted. Product ownership has been updated on-chain.',
      data,
    });
  } catch (e) {
    return handleError(res, e, 'acceptTransferRequest');
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    if (!Number.isFinite(requestId)) {
      return res.status(400).json({ success: false, message: 'Invalid request id' });
    }
    const rejectionReason = req.body.rejectionReason ?? req.body.reason ?? null;
    const data = await transferRequestService.rejectTransferRequest(
      requestId,
      req.user,
      rejectionReason
    );
    return res.json({
      success: true,
      message: 'Transfer request rejected. Product ownership is unchanged.',
      data,
    });
  } catch (e) {
    return handleError(res, e, 'rejectTransferRequest');
  }
};
