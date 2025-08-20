const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/database_app';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB database');
  console.log(`📊 Database: ${mongoose.connection.name}`);
  console.log(`🔗 URI: ${mongoose.connection.host}:${mongoose.connection.port}`);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.log('⚠️  Server will continue without database connection');
  console.log('⚠️  Some features may not work properly');
});

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
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
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

const User = mongoose.model('User', userSchema);

async function insertDemoUser() {
  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('demoSmart!@#', 10);
    
    const existingUser = await User.findOne({ email: 'demoe@smartclean.se' });
    
    if (!existingUser) {
      await User.create({
        name: 'demoSmartClean',
        email: 'demoe@smartclean.se',
        password: hashedPassword,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
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

mongoose.connection.once('open', () => {
  insertDemoUser();
});

const dbHelpers = {
  getAllUsers: async () => {
    try {
      if (!mongoose.connection.readyState) {
        console.log('⚠️  Database not connected, returning empty array');
        return [];
      }
      return await User.find({ 
        email: { $ne: 'demoe@smartclean.se' } 
      }, { password: 0 }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('❌ Error fetching users:', error.message);
      return [];
    }
  },

  getUserById: async (id) => {
    try {
      return await User.findById(id, { password: 0 });
    } catch (error) {
      throw error;
    }
  },

  getUserByEmail: async (email) => {
    try {
      return await User.findOne({ email });
    } catch (error) {
      throw error;
    }
  },

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

  deleteUser: async (id) => {
    try {
      const result = await User.findByIdAndDelete(id);
      return { deletedRows: result ? 1 : 0 };
    } catch (error) {
      throw error;
    }
  },

  startSession: async (userId) => {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          startTime: new Date(),
          isActive: true 
        },
        { new: true }
      );
      return user;
    } catch (error) {
      throw error;
    }
  },

  endSession: async (userId) => {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          endTime: new Date(),
          isActive: false 
        },
        { new: true }
      );
      return user;
    } catch (error) {
      throw error;
    }
  },

  getAnalyticsData: async () => {
    try {
      if (!mongoose.connection.readyState) {
        console.log('⚠️  Database not connected, returning default analytics');
        return {
          totalUsers: 0,
          activeQueue: 0,
          repeatUsers: 0,
          avgSessions: 0
        };
      }
      
      const demoUserFilter = { email: { $ne: 'demoe@smartclean.se' } };
      
      const totalUsers = await User.countDocuments(demoUserFilter);
      const activeUsers = await User.countDocuments({ 
        ...demoUserFilter, 
        isActive: true 
      });
      const repeatUsers = await User.countDocuments({ 
        ...demoUserFilter,
        startTime: { $exists: true, $ne: null },
        endTime: { $exists: true, $ne: null }
      });
      
      const usersWithSessions = await User.countDocuments({
        ...demoUserFilter,
        startTime: { $exists: true, $ne: null }
      });
      
      const avgSessions = usersWithSessions > 0 ? (totalUsers / usersWithSessions).toFixed(1) : 0;

      return {
        totalUsers,
        activeQueue: activeUsers,
        repeatUsers,
        avgSessions: parseFloat(avgSessions)
      };
    } catch (error) {
      console.error('❌ Error fetching analytics:', error.message);
      return {
        totalUsers: 0,
        activeQueue: 0,
        repeatUsers: 0,
        avgSessions: 0
      };
    }
  },

  getSiteStatus: async () => {
    try {
      const siteMonitor = require('../services/siteMonitor');
      return siteMonitor.getStatus();
    } catch (error) {
      console.error('❌ Error getting site status:', error.message);
      return {
        isOnline: false,
        lastChecked: new Date(),
        siteUrl: 'https://smartclean-1333e.web.app'
      };
    }
  }
};

module.exports = { mongoose, dbHelpers };
