const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/summary', authenticateUser, dashboardController.summary);

module.exports = router;
