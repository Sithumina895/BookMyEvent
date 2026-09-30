const express = require('express');
const { body } = require('express-validator');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Validation rules for creating/updating events
const eventValidation = [
  body('title', 'Title is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty(),
  body('category', 'Category is required').not().isEmpty(),
  body('date', 'Valid date is required').isISO8601(),
  body('venue', 'Venue is required').not().isEmpty(),
  body('ticketPrice', 'Ticket price must be a positive number').isFloat({ min: 0 }),
  body('totalCapacity', 'Total capacity must be at least 1').isInt({ min: 1 })
];

router.route('/')
  .get(getEvents)
  .post(
    protect,
    upload.single('image'),
    eventValidation,
    validate,
    createEvent
  );

router.route('/:id')
  .get(getEventById)
  .put(
    protect,
    upload.single('image'),
    // Note: for PUT, fields might be optional, but we'll re-use basic validation 
    // depending on form submission (often all fields are sent)
    updateEvent
  )
  .delete(protect, deleteEvent);

module.exports = router;
