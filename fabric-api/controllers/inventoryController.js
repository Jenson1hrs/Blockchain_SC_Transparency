const inventoryService = require('../services/inventoryService');

exports.listInventory = async (req, res) => {
  try {
    const items = await inventoryService.listForUser(req.user.id);
    return res.json({ success: true, data: items });
  } catch (e) {
    console.error('listInventory', e);
    return res.status(500).json({ success: false, message: 'Failed to load inventory' });
  }
};

exports.addInventory = async (req, res) => {
  try {
    const productId = req.body?.productId ?? req.body?.product_id;
    const { added } = await inventoryService.addForUser(req.user.id, productId);
    return res.status(added ? 201 : 200).json({
      success: true,
      added,
      message: added ? 'Added to inventory' : 'Already in inventory',
    });
  } catch (e) {
    const code = e.statusCode === 400 ? 400 : 500;
    return res.status(code).json({
      success: false,
      message: e.message || 'Failed to add to inventory',
    });
  }
};

exports.removeInventory = async (req, res) => {
  try {
    const productId = req.params.productId;
    await inventoryService.removeForUser(req.user.id, productId);
    return res.json({ success: true });
  } catch (e) {
    const code = e.statusCode === 400 ? 400 : 500;
    return res.status(code).json({
      success: false,
      message: e.message || 'Failed to remove from inventory',
    });
  }
};
