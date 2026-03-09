const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');
const CafeteriaItem = require('../models/CafeteriaItem');
const CafeteriaWallet = require('../models/CafeteriaWallet');
const CafeteriaOrder = require('../models/CafeteriaOrder');
const Notification = require('../models/Notification');

// Initialize tables in dev
if (process.env.NODE_ENV === 'development') {
    CafeteriaItem.initTable();
    CafeteriaWallet.initTable();
    CafeteriaOrder.initTable();
}

// @desc    Get all menu items
// @route   GET /api/v1/cafeteria/items
// @access  Private
exports.getItems = asyncHandler(async (req, res, next) => {
    const items = await CafeteriaItem.findAll(req.query);
    res.status(200).json({ success: true, data: items });
});

// @desc    Get single menu item
// @route   GET /api/v1/cafeteria/items/:id
// @access  Private
exports.getItem = asyncHandler(async (req, res, next) => {
    const item = await CafeteriaItem.findById(req.params.id);
    if (!item) return next(new ErrorResponse('Item not found', 404));
    res.status(200).json({ success: true, data: item });
});

// @desc    Create meal (Staff only)
// @route   POST /api/v1/cafeteria/items
// @access  Private/Admin
exports.createItem = asyncHandler(async (req, res, next) => {
    const data = { ...req.body };
    if (req.file) {
        data.image_url = `/api/v1/uploads/cafeteria/${req.file.filename}`;
    }
    const item = await CafeteriaItem.create(data);
    res.status(201).json({ success: true, data: item });
});

// @desc    Update meal (Staff only)
// @route   PUT /api/v1/cafeteria/items/:id
// @access  Private/Admin
exports.updateItem = asyncHandler(async (req, res, next) => {
    const data = { ...req.body };
    if (req.file) {
        data.image_url = `/api/v1/uploads/cafeteria/${req.file.filename}`;
    }
    const item = await CafeteriaItem.update(req.params.id, data);
    if (!item) return next(new ErrorResponse('Item not found', 404));
    res.status(200).json({ success: true, data: item });
});

// @desc    Delete meal (Staff only)
// @route   DELETE /api/v1/cafeteria/items/:id
// @access  Private/Admin
exports.deleteItem = asyncHandler(async (req, res, next) => {
    await CafeteriaItem.delete(req.params.id);
    res.status(200).json({ success: true, data: {} });
});

// @desc    Get current user wallet
// @route   GET /api/v1/cafeteria/wallet
// @access  Private
exports.getWallet = asyncHandler(async (req, res, next) => {
    const wallet = await CafeteriaWallet.getByUserId(req.user.id);
    res.status(200).json({ success: true, data: wallet });
});

// @desc    Place order from wallet
// @route   POST /api/v1/cafeteria/orders
// @access  Private
exports.placeOrder = asyncHandler(async (req, res, next) => {
    const { items, notes } = req.body;

    if (!items || items.length === 0) {
        return next(new ErrorResponse('No items in order', 400));
    }

    // 1. Calculate total and verify availability
    let total = 0;
    const validatedItems = [];

    for (const itemRequest of items) {
        const item = await CafeteriaItem.findById(itemRequest.id);
        if (!item || !item.is_available) {
            return next(new ErrorResponse(`Item ${itemRequest.id} is not available`, 400));
        }

        const subtotal = parseFloat(item.price) * itemRequest.quantity;
        total += subtotal;

        validatedItems.push({
            item_id: item.id,
            quantity: itemRequest.quantity,
            unit_price: item.price,
            subtotal
        });
    }

    // 2. Atomic Wallet Deduction
    try {
        await CafeteriaWallet.deduct(req.user.id, total);
    } catch (err) {
        return next(new ErrorResponse(err.message, 400));
    }

    // 3. Create Order
    const order = await CafeteriaOrder.create({
        user_id: req.user.id,
        items: validatedItems,
        total_amount: total,
        notes,
        status: 'PENDING'
    });

    res.status(201).json({ success: true, data: order });
});

// @desc    Get order history
// @route   GET /api/v1/cafeteria/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res, next) => {
    // If staff/admin, can see all orders, else only own
    const filters = {};
    const isStaff = ['SUPER_ADMIN', 'CAFETERIA_STAFF', 'DIRECTOR'].includes(req.user.role_name);

    if (!isStaff) {
        filters.user_id = req.user.id;
    }

    if (req.query.status) filters.status = req.query.status;

    const orders = await CafeteriaOrder.findAll(filters);
    res.status(200).json({ success: true, data: orders });
});

// @desc    Update order status (Staff only)
// @route   PATCH /api/v1/cafeteria/orders/:id/status
// @access  Private/Staff
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;
    const order = await CafeteriaOrder.updateStatus(req.params.id, status);

    if (!order) return next(new ErrorResponse('Order not found', 404));

    // Notify User if Ready
    if (status === 'READY') {
        await Notification.create({
            user_id: order.user_id,
            title: '🍔 Order Ready!',
            message: `Your cafeteria order #${order.id.slice(-4)} is ready for pickup. Bon appétit!`,
            type: 'CAFETERIA',
            priority: 'HIGH'
        });
    }

    res.status(200).json({ success: true, data: order });
});

// @desc    Recharge user wallet (Admin only)
// @route   POST /api/v1/cafeteria/wallets/:userId/recharge
// @access  Private/Admin
exports.rechargeWallet = asyncHandler(async (req, res, next) => {
    const { amount } = req.body;
    const wallet = await CafeteriaWallet.recharge(req.params.userId, amount);
    res.status(200).json({ success: true, data: wallet });
});
