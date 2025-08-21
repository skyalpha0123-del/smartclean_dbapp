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

    const totalUsers = await User.countDocuments();
    const mockUsersCount = await User.countDocuments({ email: { $regex: /^user\d+@example\.com$/ } });
    console.log(`🔍 Found ${mockUsersCount} existing mock users`);
    
    console.log(`🗑️  Deleting all existing mock data`);
    await User.deleteMany({ email: { $regex: /^user\d+@example\.com$/ } });
    
    console.log(`🔄  Creating new mock data with repeat emails`);
    const mockUsers = [];
    
    const baseUsersCount = 50;
    const baseDate = new Date('2025-08-01T00:00:00Z');
    
    for (let i = 0; i < baseUsersCount; i++) {
      const randomDays = Math.random() * 20;
      const randomHours = Math.random() * 24;
      const randomMinutes = Math.random() * 60;
      
      const startTime = new Date(baseDate.getTime() + 
        (randomDays * 24 * 60 * 60 * 1000) + 
        (randomHours * 60 * 60 * 1000) + 
        (randomMinutes * 60 * 1000));
      
      // Queue join time is before start time (user joins queue first, then starts session)
      const queueJoinTime = new Date(startTime.getTime() - (Math.random() * 30 + 5) * 60 * 1000);
      
      let endTime = null;
      if (Math.random() > 0.3) {
        const sessionDuration = Math.random() * 4 * 60 * 1000;
        endTime = new Date(startTime.getTime() + sessionDuration);
      }
      
      mockUsers.push({
        email: `user${i + 1}@example.com`,
        password: bcrypt.hashSync('password123', 10),
        startTime: startTime,
        endTime: endTime,
        queueJoinTime: queueJoinTime,
        isActive: Math.random() > 0.7
      });
    }
    
    const repeatEmailsCount = Math.floor(baseUsersCount * 0.6);
    for (let i = 0; i < repeatEmailsCount; i++) {
      const baseUser = mockUsers[i];
      const repeatStartTime = new Date(baseUser.startTime.getTime() + (24 * 60 * 60 * 1000));
      const sessionDuration = Math.random() * 4 * 60 * 1000;
      const repeatEndTime = new Date(repeatStartTime.getTime() + sessionDuration);
      
      // Queue join time for repeat users is before their repeat start time
      const repeatQueueJoinTime = new Date(repeatStartTime.getTime() - (Math.random() * 30 + 5) * 60 * 1000);
      
      mockUsers.push({
        email: baseUser.email,
        password: baseUser.password,
        startTime: repeatStartTime,
        endTime: repeatEndTime,
        queueJoinTime: repeatQueueJoinTime,
        isActive: false
      });
    }
    
    const additionalRepeatEmailsCount = Math.floor(baseUsersCount * 0.3);
    for (let i = 0; i < additionalRepeatEmailsCount; i++) {
      const baseUser = mockUsers[i + repeatEmailsCount];
      if (baseUser) {
        const secondRepeatStartTime = new Date(baseUser.startTime.getTime() + (48 * 60 * 60 * 1000));
        const sessionDuration = Math.random() * 4 * 60 * 1000;
        const secondRepeatEndTime = new Date(secondRepeatStartTime.getTime() + sessionDuration);
        
        // Queue join time for additional repeat users
        const secondRepeatQueueJoinTime = new Date(secondRepeatStartTime.getTime() - (Math.random() * 30 + 5) * 60 * 1000);
        
        mockUsers.push({
          email: baseUser.email,
          password: baseUser.password,
          startTime: secondRepeatStartTime,
          endTime: secondRepeatEndTime,
          queueJoinTime: secondRepeatQueueJoinTime,
          isActive: false
        });
      }
    }
    
    await User.create(mockUsers);
    console.log(`✅ Created ${mockUsers.length} mock users with repeat emails`);
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
      if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
        console.log('⚠️  Database not connected, returning mock data');
        return [
          {
            _id: 'mock1',
            email: 'john@example.com',
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
            queueJoinTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
            isActive: false,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          {
            _id: 'mock2',
            email: 'jane@example.com',
            startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
            endTime: null,
            queueJoinTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            isActive: true,
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
          }
        ];
      }
      return await User.find({ 
        email: { $ne: 'demoe@smartclean.se' } 
      }, { password: 0 }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('❌ Error fetching users:', error.message);
      console.log('⚠️  Returning mock data due to error');
      return [
        {
          _id: 'mock1',
          email: 'john@example.com',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
          queueJoinTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
          isActive: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          _id: 'mock2',
          email: 'jane@example.com',
          startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
          endTime: null,
          queueJoinTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isActive: true,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
        }
      ];
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
      if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
        console.log('⚠️  Database not connected, returning mock analytics');
        return {
          totalUsers: 2,
          activeQueue: 1,
          repeatUsers: 1,
          avgSessions: 0,
          avgQueueWaitTime: 15.5
        };
      }
      
      const demoUserFilter = { email: { $ne: 'demoe@smartclean.se' } };
      
      const totalUsers = await User.countDocuments(demoUserFilter);
      const activeUsers = await User.countDocuments({ 
        ...demoUserFilter, 
        isActive: true 
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
        activeQueue: activeUsers,
        repeatUsers,
        avgSessions: Math.round(avgSessions * 100) / 100,
        avgQueueWaitTime: Math.round(avgQueueWaitTime * 100) / 100
      };
    } catch (error) {
      console.error('❌ Error fetching analytics:', error.message);
      console.log('⚠️  Returning mock analytics due to error');
      return {
        totalUsers: 2,
        activeQueue: 1,
        repeatUsers: 1,
        avgSessions: 0,
        avgQueueWaitTime: 15.5
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

module.exports = { mongoose, dbHelpers, insertDemoUser };
