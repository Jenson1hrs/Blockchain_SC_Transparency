const organizationService = require('../services/organizationService');

exports.getOrganization = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    const org = await organizationService.getPublicOrganizationByUserId(userId);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    return res.json({ success: true, data: org });
  } catch (e) {
    console.error('getOrganization error', e);
    return res.status(500).json({ success: false, message: 'Failed to load organization' });
  }
};

exports.resolveOrganization = async (req, res) => {
  try {
    const manufacturer = req.query.manufacturer ?? req.query.name ?? '';
    const userId = await organizationService.resolveOrganizationUserId({
      manufacturerName: manufacturer,
    });
    if (!userId) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    return res.json({ success: true, userId });
  } catch (e) {
    console.error('resolveOrganization error', e);
    return res.status(500).json({ success: false, message: 'Failed to resolve organization' });
  }
};
