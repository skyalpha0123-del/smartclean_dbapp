const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/database_app';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB database');
  console.log(`📊 Database: ${mongoose.connection.name}`);
  console.log(`🔗 URI: ${mongoose.connection.host}:${mongoose.connection.port}`);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  process.exit(1);
});

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  startSessionTime: {
    type: Date,
    default: null
  },
  endSessionTime: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create User model
const User = mongoose.model('User', userSchema);

// Insert demo user
async function insertDemoUser() {
  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('demoSmart!@#', 10);
    
    // Check if demo user exists
    const existingUser = await User.findOne({ email: 'demoe@smartclean.se' });
    
    if (!existingUser) {
      // Create demo user with session data
      await User.create({
        name: 'demoSmartClean',
        email: 'demoe@smartclean.se',
        password: hashedPassword,
        startSessionTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endSessionTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isActive: false
      });
      console.log('✅ Demo user created successfully with session data');
    } else {
      console.log('✅ Demo user already exists');
    }
  } catch (error) {
    console.error('❌ Error initializing demo user:', error.message);
  }
}

// Initialize demo user after connection
mongoose.connection.once('open', () => {
  insertDemoUser();
});

// Database helper functions
const dbHelpers = {
  // Get all users with session data
  getAllUsers: async () => {
    try {
      return await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      return await User.findById(id, { password: 0 });
    } catch (error) {
      throw error;
    }
  },

  // Get user by email (for authentication)
  getUserByEmail: async (email) => {
    try {
      return await User.findOne({ email });
    } catch (error) {
      throw error;
    }
  },

  // Create new user
  createUser: async (name, email, password) => {
    try {
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      const user = await User.create({
        name,
        email,
        password: hashedPassword
      });
      
      return {
        id: user._id,
        name: user.name,
        email: user.email
      };
    } catch (error) {
      throw error;
    }
  },

  // Update user
  updateUser: async (id, name, email) => {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { name, email },
        { new: true, runValidators: true }
      ).select('-password');
      
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const result = await User.findByIdAndDelete(id);
      return { deletedRows: result ? 1 : 0 };
    } catch (error) {
      throw error;
    }
  },

  // Start user session
  startSession: async (userId) => {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          startSessionTime: new Date(),
          isActive: true 
        },
        { new: true }
      );
      return user;
    } catch (error) {
      throw error;
    }
  },

  // End user session
  endSession: async (userId) => {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          endSessionTime: new Date(),
          isActive: false 
        },
        { new: true }
      );
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Get analytics data
  getAnalyticsData: async () => {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const repeatUsers = await User.countDocuments({ 
        startSessionTime: { $exists: true, $ne: null },
        endSessionTime: { $exists: true, $ne: null }
      });
      
      // Calculate average sessions per user
      const usersWithSessions = await User.countDocuments({
        startSessionTime: { $exists: true, $ne: null }
      });
      
      const avgSessions = usersWithSessions > 0 ? (totalUsers / usersWithSessions).toFixed(1) : 0;

      return {
        totalUsers,
        activeQueue: activeUsers,
        repeatUsers,
        avgSessions: parseFloat(avgSessions)
      };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = { mongoose, dbHelpers };
