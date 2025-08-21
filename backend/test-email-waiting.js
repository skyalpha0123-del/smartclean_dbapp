require('dotenv').config();
const puppeteerService = require('./services/puppeteerService');

async function testEmailWaiting() {
  console.log('🧪 Testing Email Waiting Functionality...\n');
  
  try {
    console.log('1️⃣ Testing email waiting functionality...');
    
    // Test with custom timeout and interval
    const result = await puppeteerService.waitForEmailUpdate(30000, 1000);
    
    if (result) {
      console.log('✅ Email received successfully within timeout!');
    } else {
      console.log('⏰ Timeout reached - no email received');
    }
    
    console.log('\n🎉 Email waiting test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('   - Email service running');
    console.log('   - Valid email credentials');
    console.log('   - SmartClean emails being sent');
    
    process.exit(1);
  }
}

testEmailWaiting();
