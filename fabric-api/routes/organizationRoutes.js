const express = require('express');
const router = express.Router();
const controller = require('../controllers/organizationController');

router.get('/resolve', controller.resolveOrganization);
router.get('/:userId', controller.getOrganization);

module.exports = router;
