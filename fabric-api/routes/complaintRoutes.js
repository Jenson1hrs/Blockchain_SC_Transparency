const express = require('express');
const router = express.Router();
const controller = require('../controllers/complaintController');
const {
  authenticateUser,
  authorizeRoles,
  optionalAuthenticateUser,
} = require('../middleware/authMiddleware');

router.post('/', optionalAuthenticateUser, controller.submit);
router.get(
  '/manufacturer/summary',
  authenticateUser,
  authorizeRoles('manufacturer'),
  controller.manufacturerSummary
);
router.get(
  '/manufacturer',
  authenticateUser,
  authorizeRoles('manufacturer'),
  controller.manufacturerList
);
router.get('/my-reports', authenticateUser, controller.reporterList);
router.patch(
  '/:id/status',
  authenticateUser,
  authorizeRoles('manufacturer'),
  controller.updateStatus
);

module.exports = router;
