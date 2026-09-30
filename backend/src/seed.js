const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const User = require('./models/User');

// Load env variables
dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing events
    await Event.deleteMany({});
    console.log('Old events cleared.');

    // We need an organizer ID for the events. Let's create a dummy organizer if one doesn't exist.
    let organizer = await User.findOne({ email: 'organizer@bookmyevent.com' });
    if (!organizer) {
      organizer = await User.create({
        name: 'Event Master',
        email: 'organizer@bookmyevent.com',
        password: 'password123', // Will be hashed by pre-save hook
        role: 'organizer'
      });
      console.log('Created default organizer account.');
    }

    const events = [
      {
        title: 'Neon Nights Music Festival',
        description: 'Experience the ultimate electronic dance music festival under the stars. Featuring top DJs from around the world, immersive light shows, and unforgettable vibes. Bring your friends and dance until dawn.',
        category: 'Music',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        venue: 'Central Park Main Meadow, NY',
        ticketPrice: 149.99,
        totalCapacity: 5000,
        availableSeats: 1580, // 3,420 sold (68%)
        organizer: organizer._id,
        imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2000&auto=format&fit=crop'
      },
      {
        title: 'Global Tech Summit 2026',
        description: 'Join industry leaders and innovators for a three-day deep dive into the future of Artificial Intelligence, Web3, and Sustainable Tech. Includes keynote speeches, networking sessions, and hands-on workshops.',
        category: 'Tech',
        date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), 
        venue: 'Moscone Center, San Francisco',
        ticketPrice: 499.00,
        totalCapacity: 1200,
        availableSeats: 310, // 890 sold (74%)
        organizer: organizer._id,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop'
      },
      {
        title: 'Food & Wine Expo',
        description: 'Taste exquisite dishes from Michelin-starred chefs and sample award-winning wines from premier vineyards. A culinary journey you do not want to miss.',
        category: 'Food',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 
        venue: 'Downtown Convention Center',
        ticketPrice: 85.50,
        totalCapacity: 800,
        availableSeats: 260, // 540 sold (68%)
        organizer: organizer._id,
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop'
      },
      {
        title: 'Startup Pitch Night',
        description: 'Watch 10 promising startups pitch their ideas to a panel of top venture capitalists. Great opportunity for networking and finding your next big investment.',
        category: 'Business',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 
        venue: 'The Innovation Hub',
        ticketPrice: 0, // Free event
        totalCapacity: 200,
        availableSeats: 45, // 155 booked (78%)
        organizer: organizer._id,
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?q=80&w=2000&auto=format&fit=crop'
      },
      {
        title: 'Artisan Workshop: Pottery for Beginners',
        description: 'Learn the fundamentals of wheel throwing and hand-building in this relaxing weekend workshop. All materials provided. Take home your own ceramic masterpiece.',
        category: 'Art',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 
        venue: 'Creative Studios, Brooklyn',
        ticketPrice: 65.00,
        totalCapacity: 30,
        availableSeats: 6, // 24 sold (80%)
        organizer: organizer._id,
        imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2000&auto=format&fit=crop'
      }
    ];

    await Event.insertMany(events);
    console.log('Successfully seeded 5 events!');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
