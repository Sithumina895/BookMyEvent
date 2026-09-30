const Event = require('../models/Event');

// @desc    Get all events (with optional search/filtering)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 });
      
    res.json(events);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private (Organizer/Admin only ideally, but we'll use protect)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      date,
      venue,
      ticketPrice,
      totalCapacity,
    } = req.body;
    
    let imageUrl;
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    }

    const event = await Event.create({
      organizer: req.user._id,
      title,
      description,
      category,
      date,
      venue,
      ticketPrice,
      totalCapacity,
      availableSeats: totalCapacity, // initially available seats = total capacity
      imageUrl,
    });
    
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Organizer only)
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the organizer of the event
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to update this event' });
    }
    
    const updateData = { ...req.body };
    
    // If a new image is uploaded, update imageUrl
    if (req.file) {
      updateData.imageUrl = req.file.path;
    }
    
    // Prevent updating availableSeats directly, but adjust if totalCapacity changes
    if (updateData.totalCapacity) {
      const capacityDiff = updateData.totalCapacity - event.totalCapacity;
      updateData.availableSeats = event.availableSeats + capacityDiff;
      
      if (updateData.availableSeats < 0) {
         return res.status(400).json({ message: 'Total capacity cannot be less than already booked tickets' });
      }
    }
    
    event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Organizer only)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check ownership
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to delete this event' });
    }
    
    await event.deleteOne();
    
    res.json({ message: 'Event removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
