const complaintService = require('../services/complaintService');
const notificationTriggers = require('../services/notificationTriggers');

exports.submit = async (req, res) => {
  try {
    const { productId, category, message } = req.body ?? {};
    const row = await complaintService.createComplaint({
      productId,
      category,
      message,
      reporterUserId: req.user?.id ?? null,
      reporterRole: req.user?.role ?? null,
    });
    void notificationTriggers
      .onProductComplaintReceived({
        manufacturerUserId: row.manufacturerUserId,
        productId: row.productId,
        complaintId: row.id,
      })
      .catch(() => {});
    if (row.reporterUserId) {
      void notificationTriggers
        .onProductComplaintSubmitted({
          reporterUserId: row.reporterUserId,
          productId: row.productId,
          complaintId: row.id,
        })
        .catch(() => {});
    }
    return res.status(201).json({
      success: true,
      message: 'Thank you. Your report has been sent to the product brand.',
      data: row,
    });
  } catch (e) {
    const status = e.statusCode || 500;
    if (status >= 500) console.error('complaint submit', e);
    return res.status(status).json({ success: false, message: e.message });
  }
};

exports.manufacturerSummary = async (req, res) => {
  try {
    const data = await complaintService.getManufacturerSummary(req.user.id);
    return res.json({ success: true, data });
  } catch (e) {
    console.error('complaint manufacturerSummary', e);
    return res.status(500).json({ success: false, message: 'Failed to load complaint summary' });
  }
};

exports.manufacturerList = async (req, res) => {
  try {
    const status = req.query.status;
    const productId = req.query.productId;
    const limit = req.query.limit;
    const rows = await complaintService.listForManufacturer(req.user.id, {
      status,
      productId,
      limit,
    });
    return res.json({ success: true, data: rows, count: rows.length });
  } catch (e) {
    console.error('complaint manufacturerList', e);
    return res.status(500).json({ success: false, message: 'Failed to load complaints' });
  }
};

exports.reporterList = async (req, res) => {
  try {
    const limit = req.query.limit;
    const rows = await complaintService.listForReporter(req.user.id, { limit });
    return res.json({ success: true, data: rows, count: rows.length });
  } catch (e) {
    console.error('complaint reporterList', e);
    return res.status(500).json({ success: false, message: 'Failed to load your reports' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, manufacturerResponse } = req.body ?? {};
    const row = await complaintService.updateStatus(
      req.user.id,
      req.params.id,
      status,
      manufacturerResponse
    );
    if (row.reporterUserId) {
      void notificationTriggers
        .onProductComplaintStatusUpdated({
          reporterUserId: row.reporterUserId,
          productId: row.productId,
          complaintId: row.id,
          status: row.status,
          manufacturerResponse: row.manufacturerResponse,
        })
        .catch(() => {});
    }
    return res.json({ success: true, data: row, message: 'Complaint status updated' });
  } catch (e) {
    const code = e.statusCode || 500;
    if (code >= 500) console.error('complaint updateStatus', e);
    return res.status(code).json({ success: false, message: e.message });
  }
};
