const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const bookingValidation = [
  body('eventId', 'Event ID is required').not().isEmpty(),
  body('numberOfTickets', 'Number of tickets must be at least 1').isInt({ min: 1 })
];

router.route('/')
  .post(protect, bookingValidation, validate, createBooking)
  .get(protect, getUserBookings);

router.route('/:id')
  .get(protect, getBookingById)
  .delete(protect, deleteBooking);

router.patch('/:id/status', 
  protect, 
  body('status', 'Status is required').not().isEmpty(),
  validate,
  updateBookingStatus
);

module.exports = router;
