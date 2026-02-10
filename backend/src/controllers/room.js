const RoomService = require('../services/roomService');
const asyncHandler = require('../middlewares/async');

exports.getRooms = asyncHandler(async (req, res, next) => {
    let rooms;
    if (req.user.role_name === 'SUPER_ADMIN') {
        rooms = await RoomService.getAllRooms();
    } else if (req.user.department_id) {
        rooms = await RoomService.getRoomsByDepartment(req.user.department_id);
    } else {
        rooms = [];
    }
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
});

exports.getRoom = asyncHandler(async (req, res, next) => {
    const room = await RoomService.getRoomById(req.params.id);
    res.status(200).json({ success: true, data: room });
});

exports.createRoom = asyncHandler(async (req, res, next) => {
    // If not super admin, force department_id to own department
    if (req.user.role_name !== 'SUPER_ADMIN') {
        if (!req.user.department_id) {
            return res.status(403).json({ success: false, error: 'User does not belong to a department' });
        }
        req.body.department_id = req.user.department_id;
    }

    // Default capacity
    if (!req.body.capacity) req.body.capacity = 30;

    const room = await RoomService.createRoom(req.body);
    res.status(201).json({ success: true, data: room });
});

exports.updateRoom = asyncHandler(async (req, res, next) => {
    const room = await RoomService.updateRoom(req.params.id, req.body);
    res.status(200).json({ success: true, data: room });
});

exports.deleteRoom = asyncHandler(async (req, res, next) => {
    await RoomService.deleteRoom(req.params.id);
    res.status(200).json({ success: true, data: {} });
});
