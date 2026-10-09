const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { protectUser } = require('../middleware/auth');

// Public check availability
router.get('/check-availability', reservationController.checkAvailability);

// Public or Customer or Staff create reservation
router.post('/', reservationController.createReservation);

// Staff/Admin list & manage reservations
router.get('/', protectUser, reservationController.getReservations);
router.patch('/:id/status', protectUser, reservationController.updateReservationStatus);

module.exports = router;
