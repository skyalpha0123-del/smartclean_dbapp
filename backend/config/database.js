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
  email: {
    type: String,
    required: [true, 'Email is required'],
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
  queueJoinTime: {
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
        email: 'demoe@smartclean.se',
        password: hashedPassword,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        queueJoinTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
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
      return await User.find({ 
        email: { $ne: 'demoe@smartclean.se' } 
      }, { password: 0 }).sort({ queueJoinTime: -1 });
    } catch (error) {
      console.error('❌ Error fetching users:', error.message);
      throw error;
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

  getActiveUserByEmail: async (email) => {
    try {
      // Find the most recent user record that doesn't have a completed session
      // (missing startTime or endTime) and has the most recent queueJoinTime
      return await User.findOne({ 
        email,
        $or: [
          { startTime: { $exists: false } },
          { startTime: null },
          { endTime: { $exists: false } },
          { endTime: null }
        ]
      }).sort({ queueJoinTime: -1 });
    } catch (error) {
      throw error;
    }
  },

  createUser: async (email, password) => {
    try {
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      const user = await User.create({
        email,
        password: hashedPassword
      });
      
      return {
        id: user._id,
        email: user.email
      };
    } catch (error) {
      throw error;
    }
  },

  createUserWithFields: async (userData) => {
    try {
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync(userData.password, 10);
      
      const user = await User.create({
        email: userData.email,
        password: hashedPassword,
        queueJoinTime: userData.queueJoinTime,
        startTime: userData.startTime,
        endTime: userData.endTime,
        isActive: userData.isActive
      });
      
      if (global.broadcastDatabaseChange) {
        global.broadcastDatabaseChange('user_created', { userId: user._id, email: user.email });
      }
      
      return {
        id: user._id,
        email: user.email
      };
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (id, email) => {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { email },
        { new: true, runValidators: true }
      ).select('-password');
      
      return user;
    } catch (error) {
      throw error;
    }
  },

  updateUserFields: async (id, updateData) => {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
      
      if (global.broadcastDatabaseChange && user) {
        global.broadcastDatabaseChange('user_updated', { userId: user._id, email: user.email, changes: updateData });
      }
      
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
      
      if (global.broadcastDatabaseChange && user) {
        global.broadcastDatabaseChange('session_started', { userId: user._id, email: user.email, startTime: user.startTime });
      }
      
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
      
      if (global.broadcastDatabaseChange && user) {
        global.broadcastDatabaseChange('session_ended', { userId: user._id, email: user.email, endTime: user.endTime });
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  },

  getAnalyticsData: async () => {
    try {
      const demoUserFilter = { email: { $ne: 'demoe@smartclean.se' } };
      
      const totalUsers = await User.countDocuments(demoUserFilter);
      
      // Count users who joined queue but haven't started session yet
      const activeQueueUsers = await User.countDocuments({ 
        ...demoUserFilter, 
        queueJoinTime: { $exists: true, $ne: null },
        $or: [
          { startTime: { $exists: false } },
          { startTime: null }
        ]
      });
      
      const usersWithMultipleSessions = await User.aggregate([
        { $match: { ...demoUserFilter } },
        { $group: { _id: '$email', sessionCount: { $sum: 1 } } },
        { $match: { sessionCount: { $gte: 2 } } },
        { $count: 'repeatUsers' }
      ]);
      
      const repeatUsers = usersWithMultipleSessions[0]?.repeatUsers || 0;
      
      const usersWithCompletedSessions = await User.find({
        ...demoUserFilter,
        startTime: { $exists: true, $ne: null },
        endTime: { $exists: true, $ne: null }
      });
      
      let totalSessionTime = 0;
      let validSessions = 0;
      
      usersWithCompletedSessions.forEach(user => {
        if (user.startTime && user.endTime) {
          const sessionTime = user.endTime.getTime() - user.startTime.getTime();
          totalSessionTime += sessionTime;
          validSessions++;
        }
      });
      
      const avgSessions = validSessions > 0 ? (totalSessionTime / validSessions / (1000 * 60)) : 0;

      // Calculate average queue wait time (time between queueJoinTime and startTime)
      const usersWithQueueData = await User.find({
        ...demoUserFilter,
        queueJoinTime: { $exists: true, $ne: null },
        startTime: { $exists: true, $ne: null }
      });
      
      let totalQueueWaitTime = 0;
      let validQueueWaits = 0;
      
      usersWithQueueData.forEach(user => {
        if (user.queueJoinTime && user.startTime) {
          const queueWaitTime = user.startTime.getTime() - user.queueJoinTime.getTime();
          totalQueueWaitTime += queueWaitTime;
          validQueueWaits++;
        }
      });
      
      const avgQueueWaitTime = validQueueWaits > 0 ? (totalQueueWaitTime / validQueueWaits / (1000 * 60)) : 0;

      return {
        totalUsers,
        activeQueue: activeQueueUsers,
        repeatUsers,
        avgSessions: Math.round(avgSessions * 100) / 100,
        avgQueueWaitTime: Math.round(avgQueueWaitTime * 100) / 100
      };
    } catch (error) {
      console.error('❌ Error fetching analytics:', error.message);
      throw error;
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

module.exports = { mongoose, dbHelpers, insertDemoUser };
