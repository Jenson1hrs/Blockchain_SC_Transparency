const express = require('express');
const router = express.Router();
const controller = require('../controllers/regulatorController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

const REGULATOR_OR_ADMIN = authorizeRoles('regulator', 'admin');

router.get('/summary', authenticateUser, REGULATOR_OR_ADMIN, controller.summary);
router.get('/organizations', authenticateUser, REGULATOR_OR_ADMIN, controller.listOrganizations);
router.patch(
  '/organizations/:id/verification',
  authenticateUser,
  REGULATOR_OR_ADMIN,
  controller.setOrganizationVerification
);
router.patch(
  '/organizations/:id/flag',
  authenticateUser,
  REGULATOR_OR_ADMIN,
  controller.setOrganizationFlag
);
router.get('/products', authenticateUser, REGULATOR_OR_ADMIN, controller.listProducts);

module.exports = router;
