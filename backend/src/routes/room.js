const express = require('express');
const {
    getRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom
} = require('../controllers/room');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router
    .route('/')
    .get(getRooms)
    .post(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'RH'), createRoom);

router
    .route('/:id')
    .get(getRoom)
    .put(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'RH'), updateRoom)
    .delete(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'RH'), deleteRoom);

module.exports = router;
