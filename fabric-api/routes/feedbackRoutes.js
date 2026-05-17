const express = require('express');
const router = express.Router();
const controller = require('../controllers/feedbackController');
const {
  authenticateUser,
  authorizeRoles,
  optionalAuthenticateUser,
} = require('../middleware/authMiddleware');

router.post('/', optionalAuthenticateUser, controller.submit);
router.get(
  '/',
  authenticateUser,
  authorizeRoles('admin', 'regulator'),
  controller.list
);

module.exports = router;
