const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateUser, authorizeRoles('consumer'), inventoryController.listInventory);
router.post('/', authenticateUser, authorizeRoles('consumer'), inventoryController.addInventory);
router.delete(
  '/:productId',
  authenticateUser,
  authorizeRoles('consumer'),
  inventoryController.removeInventory
);

module.exports = router;
