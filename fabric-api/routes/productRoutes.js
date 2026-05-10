const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

// Routes
router.post(
  '/create',
  authenticateUser,
  authorizeRoles('manufacturer', 'admin'),
  controller.createProduct
);
router.get('/product/:id', controller.getProduct);
router.get('/expiring', controller.getExpiringProducts);
router.post(
  '/transfer',
  authenticateUser,
  authorizeRoles('distributor', 'retailer', 'admin'),
  controller.transferProduct
);
router.post(
  '/location',
  authenticateUser,
  authorizeRoles('distributor', 'retailer', 'admin'),
  controller.updateLocation
);
router.get('/history/:id', controller.getHistory);
router.post('/verifyQR', controller.verifyQR);
router.get('/qr/:id', controller.getProductQr);

// Root endpoint
router.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'Anti-Counterfeit Supply Chain API',
        endpoints: [
            'POST /auth/register - Register (app user)',
            'POST /auth/login - Login',
            'GET /auth/me - Current user (Bearer token)',
            'POST /create - Create product (manufacturer/admin + JWT)',
            'GET /product/:id - Get product details',
            'GET /expiring?days=7 - Get products expiring soon',
            'POST /transfer - Transfer (distributor/retailer/admin + JWT)',
            'POST /location - Update location (distributor/retailer/admin + JWT)',
            'GET /history/:id - Get product transaction history',
            'POST /verifyQR - Verify QR payload',
            'GET /qr/:id - Regenerate QR for existing product',
            'GET /inventory - List current user saved product IDs (JWT)',
            'POST /inventory - Add product to user inventory (JWT) body: { productId }',
            'DELETE /inventory/:productId - Remove from user inventory (JWT)',
        ]
    });
});

module.exports = router;