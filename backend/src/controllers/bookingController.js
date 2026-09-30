const Booking = require('../models/Booking');
const Event = require('../models/Event');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { eventId, numberOfTickets, specialRequests } = req.body;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Business Logic Rule 2: Prevent booking for past events
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot book tickets for a past event' });
    }

    // Business Logic Rule 1: Capacity & Seat Availability Check
    if (numberOfTickets > event.availableSeats) {
      return res.status(400).json({ 
        message: `Not enough seats available. Remaining seats: ${event.availableSeats}` 
      });
    }

    // Business Logic Rule 3: Server-side dynamic price calculation
    const unitPrice = event.ticketPrice;
    const totalPrice = unitPrice * numberOfTickets;

    // Create the booking
    const booking = await Booking.create({
      event: eventId,
      user: req.user._id,
      numberOfTickets,
      unitPrice,
      totalPrice,
      specialRequests
    });

    // Deduct available seats
    event.availableSeats -= numberOfTickets;
    await event.save();

    // Fetch user for email
    const User = require('../models/User');
    const user = await User.findById(req.user._id);

    // Send confirmation email asynchronously (fire and forget)
    if (user) {
      sendEmail({
        email: user.email,
        subject: `Booking Confirmed: ${event.title}`,
        message: `Hello ${user.name},\n\nYour booking for ${event.title} is confirmed!\n\nDetails:\nEvent Date: ${new Date(event.date).toLocaleDateString()}\nVenue: ${event.venue}\nTickets: ${numberOfTickets}\nTotal Paid: $${totalPrice.toFixed(2)}\n\nThank you for using BookMyEvent!`,
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings
// @access  Private
const getUserBookings = async (req, res, next) => {
  try {
    // If admin or organizer, they might need to see all bookings for their events, 
    // but for simplicity, this returns the bookings placed by the current user.
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date venue imageUrl')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title date venue imageUrl ticketPrice organizer')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure the user owns this booking (or is an admin/organizer of the event)
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isEventOrganizer = booking.event.organizer.toString() === req.user._id.toString();
    
    if (!isOwner && !isEventOrganizer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (e.g. Cancel)
// @route   PATCH /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['CONFIRMED', 'CANCELLED', 'ATTENDED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization: users can cancel their own, organizers can mark attended
    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin' && req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Business Logic Rule 4: Seat Restoration on Cancellation
    if (status === 'CANCELLED' && booking.status !== 'CANCELLED') {
      const event = await Event.findById(booking.event);
      if (event) {
        event.availableSeats += booking.numberOfTickets;
        await event.save();
      }
    } 
    // If they somehow un-cancel (e.g., admin override), we'd deduct seats again, but normally we just allow one-way cancel.
    else if (booking.status === 'CANCELLED' && status !== 'CANCELLED') {
       const event = await Event.findById(booking.event);
       if (event) {
         if(event.availableSeats < booking.numberOfTickets) {
            return res.status(400).json({ message: 'Cannot un-cancel: Not enough seats available.' });
         }
         event.availableSeats -= booking.numberOfTickets;
         await event.save();
       }
    }

    booking.status = status;
    await booking.save();

    // Send cancellation email if cancelled
    if (status === 'CANCELLED') {
      const User = require('../models/User');
      const user = await User.findById(booking.user);
      const event = await Event.findById(booking.event);
      if (user && event) {
        sendEmail({
          email: user.email,
          subject: `Booking Cancelled: ${event.title}`,
          message: `Hello ${user.name},\n\nYour booking for ${event.title} has been successfully cancelled.\n\nRefund processing (if applicable) will follow our standard policy.\n\nThank you,\nBookMyEvent`,
        });
      }
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization
    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }

    // Business Logic Rule 4: Seat Restoration on Deletion (if it wasn't already cancelled)
    if (booking.status !== 'CANCELLED') {
      const event = await Event.findById(booking.event);
      if (event) {
        event.availableSeats += booking.numberOfTickets;
        await event.save();
      }
    }

    await booking.deleteOne();
    
    res.json({ message: 'Booking removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking
};
