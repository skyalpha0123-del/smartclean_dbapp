require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service Integration...\n');
  
  try {
    console.log('1️⃣ Testing email service initialization...');
    const initialized = await emailService.initialize();
    console.log('Initialization result:', initialized);
    
    if (initialized) {
      console.log('\n2️⃣ Testing connection status...');
      const status = await emailService.getConnectionStatus();
      console.log('Connection Status:', JSON.stringify(status, null, 2));
      
      console.log('\n3️⃣ Testing IMAP connection...');
      const testResult = await emailService.testConnection();
      console.log('Connection Test:', JSON.stringify(testResult, null, 2));
      
      console.log('\n4️⃣ Getting last email (if any)...');
      const lastEmail = await emailService.getLastEmail();
      console.log('Last Email:', lastEmail ? 'Email found' : 'No emails yet');
      
      console.log('\n5️⃣ Waiting for new emails (30 seconds)...');
      console.log('📧 Email listener is active and monitoring for new emails...');
      
      setTimeout(async () => {
        console.log('\n6️⃣ Final status check...');
        const finalStatus = await emailService.getConnectionStatus();
        console.log('Final Status:', JSON.stringify(finalStatus, null, 2));
        
        console.log('\n7️⃣ Closing email connection...');
        await emailService.closeConnection();
        console.log('✅ Email service test completed successfully!');
        
        process.exit(0);
      }, 30000);
      
    } else {
      console.log('⚠️  Email service not initialized, check your environment variables:');
      console.log('   - EMAIL_USER');
      console.log('   - EMAIL_PASSWORD');
      console.log('   - EMAIL_HOST (optional, defaults to imap.gmail.com)');
      console.log('   - EMAIL_PORT (optional, defaults to 993)');
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('   - Valid Gmail credentials');
    console.log('   - IMAP enabled in Gmail settings');
    console.log('   - 2FA enabled with app password');
    console.log('   - Stable internet connection');
    
    process.exit(1);
  }
}

testEmailService();
