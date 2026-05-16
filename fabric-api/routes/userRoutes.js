const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

router.get(
  '/supply-chain',
  authenticateUser,
  authorizeRoles('admin', 'manufacturer', 'distributor', 'retailer', 'regulator'),
  controller.listSupplyChainUsers
);

module.exports = router;
