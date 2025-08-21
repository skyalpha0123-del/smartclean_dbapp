require('dotenv').config();
const { insertDemoUser } = require('./config/database');

async function regenerateMockData() {
  console.log('🔄 Regenerating Mock Data with Queue Join Time...\n');
  
  try {
    console.log('1️⃣ Starting mock data regeneration...');
    
    await insertDemoUser();
    
    console.log('✅ Mock data regeneration completed successfully!');
    console.log('📊 New data includes:');
    console.log('   - 50 base users with queue join times');
    console.log('   - 30 repeat users (60% of base)');
    console.log('   - 15 additional repeat users (30% of base)');
    console.log('   - Queue join times 5-35 minutes before session start');
    console.log('   - Total: ~95 user records');
    
    console.log('\n💡 You can now:');
    console.log('   - View the new "Queue Join Time" column in the DataTable');
    console.log('   - See "Avg Queue Wait" metric in the InfoSection');
    console.log('   - Sort and filter by queue join time');
    
  } catch (error) {
    console.error('❌ Failed to regenerate mock data:', error.message);
    process.exit(1);
  }
}

regenerateMockData();
