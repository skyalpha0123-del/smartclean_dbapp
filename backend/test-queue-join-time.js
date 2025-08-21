require('dotenv').config();
const { dbHelpers } = require('./config/database');

async function testQueueJoinTime() {
  console.log('🧪 Testing Queue Join Time Functionality...\n');
  
  try {
    console.log('1️⃣ Testing analytics data with queue join time...');
    
    const analyticsData = await dbHelpers.getAnalyticsData();
    console.log('✅ Analytics data:', analyticsData);
    
    if (analyticsData.avgQueueWaitTime !== undefined) {
      console.log('✅ Queue wait time metric is working!');
      console.log(`📊 Average Queue Wait Time: ${analyticsData.avgQueueWaitTime} minutes`);
    } else {
      console.log('❌ Queue wait time metric is missing');
    }
    
    console.log('\n2️⃣ Testing user data with queue join time...');
    
    const users = await dbHelpers.getAllUsers();
    console.log(`✅ Found ${users.length} users`);
    
    if (users.length > 0) {
      const firstUser = users[0];
      console.log('📋 First user data:', {
        email: firstUser.email,
        startTime: firstUser.startTime,
        endTime: firstUser.endTime,
        queueJoinTime: firstUser.queueJoinTime,
        isActive: firstUser.isActive
      });
      
      if (firstUser.queueJoinTime) {
        console.log('✅ Queue join time is present in user data');
        
        // Calculate queue wait time for this user
        if (firstUser.startTime) {
          const queueWaitTime = (firstUser.startTime.getTime() - firstUser.queueJoinTime.getTime()) / (1000 * 60);
          console.log(`⏱️  Queue wait time for ${firstUser.email}: ${queueWaitTime.toFixed(1)} minutes`);
        }
      } else {
        console.log('⚠️  Queue join time is missing from user data');
      }
    }
    
    console.log('\n3️⃣ Testing mock data regeneration...');
    
    // Test the insertDemoUser function
    const { insertDemoUser } = require('./config/database');
    await insertDemoUser();
    console.log('✅ Mock data regeneration completed');
    
    // Check analytics again
    const newAnalyticsData = await dbHelpers.getAnalyticsData();
    console.log('📊 New analytics data:', newAnalyticsData);
    
    console.log('\n🎉 Queue join time test completed!');
    console.log('💡 Check the frontend to see the new queue join time column and metrics');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Error stack:', error.stack);
    process.exit(1);
  }
}

testQueueJoinTime();
