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

    const totalUsers = await User.countDocuments();
    if (totalUsers < 50) {
      console.log(`⚠️  Database has ${totalUsers} users, adding ${50 - totalUsers} mock users for testing`);
      
      const mockUsers = [];
      const names = [
        'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown',
        'Emily Davis', 'James Miller', 'Lisa Anderson', 'Robert Taylor', 'Maria Garcia',
        'William Martinez', 'Jennifer Robinson', 'Christopher Lee', 'Amanda White',
        'Daniel Clark', 'Nicole Lewis', 'Matthew Hall', 'Stephanie Young',
        'Anthony Allen', 'Rebecca King', 'Kevin Wright', 'Michelle Green',
        'Joshua Baker', 'Ashley Adams', 'Ryan Nelson', 'Kimberly Carter',
        'Andrew Mitchell', 'Jessica Perez', 'Nathan Roberts', 'Amber Turner',
        'Steven Phillips', 'Melissa Campbell', 'Timothy Parker', 'Heather Evans',
        'Brian Edwards', 'Christina Collins', 'Jason Stewart', 'Rachel Sanchez',
        'Jeffrey Morris', 'Lauren Reed', 'Mark Cook', 'Danielle Morgan',
        'Donald Bell', 'Megan Murphy', 'Paul Bailey', 'Crystal Rivera',
        'Kenneth Cooper', 'Tiffany Richardson', 'Ronald Cox', 'Stephanie Ward',
        'Edward Torres', 'Natalie Peterson'
      ];
      
      const usersToCreate = 50 - totalUsers;
      for (let i = 0; i < usersToCreate; i++) {
        const isActive = Math.random() > 0.7;
        const hasStartTime = Math.random() > 0.2;
        const hasEndTime = hasStartTime && Math.random() > 0.3;
        
        const startTime = hasStartTime ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : null;
        const endTime = hasEndTime ? new Date(startTime.getTime() + Math.random() * 2 * 60 * 60 * 1000) : null;
        
        mockUsers.push({
          name: names[i],
          email: `user${totalUsers + i + 1}@example.com`,
          password: bcrypt.hashSync('password123', 10),
          startTime: startTime,
          endTime: endTime,
          isActive: isActive
        });
      }
      
      await User.create(mockUsers);
      console.log('✅ 50 mock users created successfully for testing');
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
      if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
        console.log('⚠️  Database not connected, returning mock data');
        return [
          {
            _id: 'mock1',
            name: 'John Doe',
            email: 'john@example.com',
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
            isActive: false,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          {
            _id: 'mock2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
            endTime: null,
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
          name: 'John Doe',
          email: 'john@example.com',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isActive: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          _id: 'mock2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
          endTime: null,
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
      if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
        console.log('⚠️  Database not connected, returning mock analytics');
        return {
          totalUsers: 2,
          activeQueue: 1,
          repeatUsers: 1,
          avgSessions: 1.5
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
      console.log('⚠️  Returning mock analytics due to error');
      return {
        totalUsers: 2,
        activeQueue: 1,
        repeatUsers: 1,
        avgSessions: 1.5
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
