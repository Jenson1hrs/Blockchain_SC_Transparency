const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');

router.post('/create', controller.createProduct);
router.get('/product/:id', controller.getProduct);
router.post('/transfer', controller.transferProduct);
router.post('/location', controller.updateLocation);
router.get('/history/:id', controller.getHistory);

module.exports = router;