const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');

// Routes
router.post('/create', controller.createProduct);
router.get('/product/:id', controller.getProduct);
router.post('/transfer', controller.transferProduct);
router.post('/location', controller.updateLocation);
router.get('/history/:id', controller.getHistory);

// Root endpoint
router.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'Anti-Counterfeit Supply Chain API',
        endpoints: [
            'POST /create - Create a new product',
            'GET /product/:id - Get product details',
            'POST /transfer - Transfer product ownership',
            'POST /location - Update product location',
            'GET /history/:id - Get product transaction history'
        ]
    });
});

module.exports = router;