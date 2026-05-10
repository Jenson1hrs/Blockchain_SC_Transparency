const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/users', authenticateUser, authorizeRoles('admin'), adminController.listUsers);
router.get(
  '/system-status',
  authenticateUser,
  authorizeRoles('admin'),
  adminController.systemStatus
);

module.exports = router;
