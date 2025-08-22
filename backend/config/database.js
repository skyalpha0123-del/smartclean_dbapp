const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/database_app';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
})
.catch((error) => {
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
    } else {
    }
  } catch (error) {
  }
}

async function generateMockData() {
  try {
    const bcrypt = require('bcryptjs');
    
    await User.deleteMany({ email: { $regex: /^mockuser\d+@example\.com$/ } });
    
    const mockUsers = [];
    const baseDate = new Date('2025-01-01T00:00:00Z');
    const usedTimeSlots = new Set();
    
    for (let i = 1; i <= 30; i++) {
      const email = `mockuser${i}@example.com`;
      const password = bcrypt.hashSync('password123', 10);
      
      const randomDays = Math.random() * 30;
      const randomHours = Math.random() * 24;
      const randomMinutes = Math.random() * 60;
      const queueJoinTime = new Date(baseDate.getTime() + 
        (randomDays * 24 * 60 * 60 * 1000) + 
        (randomHours * 60 * 60 * 1000) + 
        (randomMinutes * 60 * 1000));
      
      let startTime = null;
      let endTime = null;
      
      if (Math.random() < 0.7) {
        const startTimeOffset = Math.random() * 30 * 60 * 1000;
        startTime = new Date(queueJoinTime.getTime() + startTimeOffset);
        
        const sessionDuration = Math.random() * 3.5 * 60 * 1000;
        endTime = new Date(startTime.getTime() + sessionDuration);
        
        const timeSlotKey = `${startTime.getTime()}-${endTime.getTime()}`;
        if (usedTimeSlots.has(timeSlotKey)) {
          endTime = new Date(startTime.getTime() + (2 * 60 * 1000));
        }
        usedTimeSlots.add(timeSlotKey);
      }
      
      mockUsers.push({
        email,
        password,
        queueJoinTime,
        startTime,
        endTime,
        isActive: startTime && !endTime
      });
    }
    
    const repeatedEmails = ['mockuser1@example.com', 'mockuser2@example.com', 'mockuser3@example.com', 'mockuser4@example.com', 'mockuser5@example.com'];
    
    for (let i = 0; i < 20; i++) {
      const email = repeatedEmails[i % repeatedEmails.length];
      const password = bcrypt.hashSync('password123', 10);
      
      const randomDays = Math.random() * 30;
      const randomHours = Math.random() * 24;
      const randomMinutes = Math.random() * 60;
      const queueJoinTime = new Date(baseDate.getTime() + 
        (randomDays * 24 * 60 * 60 * 1000) + 
        (randomHours * 60 * 60 * 1000) + 
        (randomMinutes * 60 * 1000));
      
      const startTimeOffset = Math.random() * 30 * 60 * 1000;
      const startTime = new Date(queueJoinTime.getTime() + startTimeOffset);
      
      const sessionDuration = Math.random() * 3.5 * 60 * 1000;
      const endTime = new Date(startTime.getTime() + sessionDuration);
      
      const timeSlotKey = `${startTime.getTime()}-${endTime.getTime()}`;
      if (usedTimeSlots.has(timeSlotKey)) {
        endTime = new Date(startTime.getTime() + (2 * 60 * 1000));
      }
      usedTimeSlots.add(timeSlotKey);
      
      mockUsers.push({
        email,
        password,
        queueJoinTime,
        startTime,
        endTime,
        isActive: false
      });
    }
    
    await User.create(mockUsers);
    
    return { 
      success: true, 
      count: mockUsers.length,
      uniqueUsers: 30,
      repeatedUsers: 20,
      repeatedEmails: repeatedEmails
    };
  } catch (error) {
    throw error;
  }
}

async function clearMockData() {
  try {
    const result = await User.deleteMany({ email: { $regex: /^mockuser\d+@example\.com$/ } });
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    throw error;
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
      throw error;
    }
  },

  getSiteStatus: async () => {
    try {
      const siteMonitor = require('../services/siteMonitor');
      return siteMonitor.getStatus();
    } catch (error) {
      return {
        isOnline: false,
        lastChecked: new Date(),
        siteUrl: 'https://smartclean-1333e.web.app'
      };
    }
  }
};

module.exports = { mongoose, dbHelpers, insertDemoUser, generateMockData, clearMockData };
