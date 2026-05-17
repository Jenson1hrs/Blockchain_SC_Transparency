const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const transferController = require('../controllers/transferRequestController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

const MOVE_ROLES = ['manufacturer', 'distributor', 'retailer'];
const OVERSIGHT_ROLES = ['admin', 'regulator'];

// Routes
router.post(
  '/create',
  authenticateUser,
  authorizeRoles('manufacturer', 'admin'),
  controller.createProduct
);
router.get('/products/search', controller.searchProducts);
router.get(
  '/products/assigned',
  authenticateUser,
  authorizeRoles('manufacturer', 'distributor', 'retailer'),
  controller.listAssignedProducts
);
router.get('/product/:id', controller.getProduct);
router.get(
  '/expiring',
  authenticateUser,
  controller.getExpiringProducts
);
router.post(
  '/transfer/request',
  authenticateUser,
  authorizeRoles(...MOVE_ROLES),
  transferController.createRequest
);
router.get(
  '/transfer/requests/incoming',
  authenticateUser,
  authorizeRoles(...MOVE_ROLES),
  transferController.listIncoming
);
router.get(
  '/transfer/requests/outgoing',
  authenticateUser,
  authorizeRoles(...MOVE_ROLES),
  transferController.listOutgoing
);
router.get(
  '/transfer/requests',
  authenticateUser,
  authorizeRoles(...OVERSIGHT_ROLES),
  transferController.listAll
);
router.patch(
  '/transfer/requests/:id/accept',
  authenticateUser,
  authorizeRoles(...MOVE_ROLES),
  transferController.acceptRequest
);
router.patch(
  '/transfer/requests/:id/reject',
  authenticateUser,
  authorizeRoles(...MOVE_ROLES),
  transferController.rejectRequest
);
/** Legacy immediate transfer — admin/testing only; normal UI uses /transfer/request */
router.post(
  '/transfer',
  authenticateUser,
  authorizeRoles('admin'),
  controller.transferProduct
);
router.post(
  '/location',
  authenticateUser,
  authorizeRoles('manufacturer', 'distributor', 'retailer', 'admin'),
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