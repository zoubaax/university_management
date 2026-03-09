const express = require('express');
const router = express.Router();
const {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    getWallet,
    placeOrder,
    getOrders,
    updateOrderStatus
} = require('../controllers/cafeteria');

const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// All routes are protected
router.use(protect);

// Menu Routes
router.get('/items', getItems);
router.get('/items/:id', getItem);
router.post('/items', authorize('SUPER_ADMIN', 'CAFETERIA_STAFF'), upload.single('meal_photo'), createItem);
router.put('/items/:id', authorize('SUPER_ADMIN', 'CAFETERIA_STAFF'), upload.single('meal_photo'), updateItem);
router.delete('/items/:id', authorize('SUPER_ADMIN', 'CAFETERIA_STAFF'), deleteItem);

// Wallet & Ordering
router.get('/wallet', getWallet);
router.post('/wallets/:userId/recharge', authorize('SUPER_ADMIN', 'FINANCIER'), require('../controllers/cafeteria').rechargeWallet);
router.post('/orders', placeOrder);
router.get('/orders', getOrders);

// Staff Order Management
router.patch('/orders/:id/status', authorize('SUPER_ADMIN', 'CAFETERIA_STAFF'), updateOrderStatus);

module.exports = router;
