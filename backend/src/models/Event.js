const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
    },
    venue: {
      type: String,
      required: [true, 'Please add a venue'],
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Please add a ticket price'],
      min: [0, 'Price must be positive'],
    },
    totalCapacity: {
      type: Number,
      required: [true, 'Please add total capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      default: 'https://via.placeholder.com/500x300?text=No+Image',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);
