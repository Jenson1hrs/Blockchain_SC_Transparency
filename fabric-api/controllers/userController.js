const ownershipService = require('../services/ownershipService');

exports.listSupplyChainUsers = async (req, res) => {
  try {
    const q = req.query.q != null ? String(req.query.q) : '';
    const role = req.query.role != null ? String(req.query.role) : '';
    const data = await ownershipService.listSupplyChainUsers({ q, role });
    return res.json({ success: true, data });
  } catch (e) {
    console.error('listSupplyChainUsers', e);
    return res.status(500).json({ success: false, message: 'Failed to load users' });
  }
};
