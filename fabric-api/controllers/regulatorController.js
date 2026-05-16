const regulatorService = require('../services/regulatorService');

exports.summary = async (req, res) => {
  try {
    const data = await regulatorService.getRegulatorSummary();
    return res.json({ success: true, data });
  } catch (e) {
    console.error('regulator summary', e);
    return res.status(500).json({ success: false, message: 'Failed to load regulator summary' });
  }
};

exports.listOrganizations = async (req, res) => {
  try {
    const data = await regulatorService.listOrganizations();
    return res.json({ success: true, data });
  } catch (e) {
    console.error('regulator listOrganizations', e);
    return res.status(500).json({ success: false, message: 'Failed to load organizations' });
  }
};

exports.setOrganizationFlag = async (req, res) => {
  try {
    const orgId = parseInt(req.params.id, 10);
    if (!Number.isFinite(orgId)) {
      return res.status(400).json({ success: false, message: 'Invalid organization id' });
    }
    const flagged = req.body?.flagged;
    if (typeof flagged !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Body must include flagged: boolean' });
    }
    const reason = req.body?.reason;
    const updated = await regulatorService.setOrganizationFlag(orgId, flagged, reason);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    return res.json({
      success: true,
      data: updated,
      message: flagged ? 'Organization flagged for review' : 'Organization flag removed',
    });
  } catch (e) {
    console.error('regulator setOrganizationFlag', e);
    return res.status(500).json({ success: false, message: 'Failed to update organization flag' });
  }
};

exports.setOrganizationVerification = async (req, res) => {
  try {
    const orgId = parseInt(req.params.id, 10);
    if (!Number.isFinite(orgId)) {
      return res.status(400).json({ success: false, message: 'Invalid organization id' });
    }
    const verified = req.body?.verified;
    if (typeof verified !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Body must include verified: boolean' });
    }
    const updated = await regulatorService.setOrganizationVerification(
      orgId,
      verified,
      req.user.id
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    return res.json({
      success: true,
      data: updated,
      message: verified ? 'Organization approved' : 'Organization verification revoked',
    });
  } catch (e) {
    console.error('regulator setOrganizationVerification', e);
    return res.status(500).json({ success: false, message: 'Failed to update verification' });
  }
};

exports.listProducts = async (req, res) => {
  try {
    const filter = req.query.filter != null ? String(req.query.filter) : 'all';
    const limit = req.query.limit;
    const q = req.query.q;
    const status = req.query.status;
    const manufacturer = req.query.manufacturer;
    const data = await regulatorService.listProductsForOversight({
      filter,
      limit,
      q,
      status,
      manufacturer,
    });
    return res.json({ success: true, data, filter });
  } catch (e) {
    console.error('regulator listProducts', e);
    return res.status(500).json({ success: false, message: 'Failed to load products' });
  }
};
