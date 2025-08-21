require('dotenv').config();
const emailService = require('./services/emailService');

async function testIMAP() {
  console.log('🧪 Testing IMAP Integration...\n');
  
  try {
    console.log('1️⃣ Testing connection...');
    const connectionResult = await emailService.testConnection();
    console.log('Connection Result:', JSON.stringify(connectionResult, null, 2));
    
    if (connectionResult.success) {
      console.log('\n2️⃣ Testing folder listing...');
      const folders = await emailService.getFolders();
      console.log('Available folders:', Object.keys(folders));
      
      console.log('\n3️⃣ Testing email fetching (first 5 emails)...');
      const emails = await emailService.getEmails(5, 'INBOX');
      console.log(`Found ${emails.length} emails:`);
      emails.forEach((email, index) => {
        console.log(`\nEmail ${index + 1}:`);
        console.log(`  Subject: ${email.subject}`);
        console.log(`  From: ${email.from}`);
        console.log(`  Date: ${email.date}`);
        console.log(`  ID: ${email.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure you have set the following environment variables:');
    console.log('   EMAIL_USER=your_email@gmail.com');
    console.log('   EMAIL_PASSWORD=your_app_password');
    console.log('   EMAIL_HOST=imap.gmail.com (default)');
    console.log('   EMAIL_PORT=993 (default)');
    console.log('\n🔐 For Gmail, you need to use an App Password, not your regular password.');
    console.log('   Enable 2FA and generate an App Password in your Google Account settings.');
  }
}

testIMAP();
