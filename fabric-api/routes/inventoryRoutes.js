const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/', authenticateUser, inventoryController.listInventory);
router.post('/', authenticateUser, inventoryController.addInventory);
router.delete('/:productId', authenticateUser, inventoryController.removeInventory);

module.exports = router;
