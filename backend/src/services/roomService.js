const Room = require('../models/Room');
const ErrorResponse = require('../utils/ErrorResponse');

class RoomService {
    static async getAllRooms() {
        return await Room.findAll();
    }

    static async getRoomById(id) {
        const room = await Room.findById(id);
        if (!room) {
            throw new ErrorResponse('Room not found', 404);
        }
        return room;
    }

    static async getRoomsByDepartment(departmentId) {
        return await Room.findByDepartment(departmentId);
    }

    static async createRoom(data) {
        return await Room.create(data);
    }

    static async updateRoom(id, data) {
        const room = await Room.update(id, data);
        if (!room) {
            throw new ErrorResponse('Room not found', 404);
        }
        return room;
    }

    static async deleteRoom(id) {
        const room = await Room.softDelete(id);
        if (!room) {
            throw new ErrorResponse('Room not found', 404);
        }
        return room;
    }
}

module.exports = RoomService;
