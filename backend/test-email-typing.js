require('dotenv').config();
const puppeteerService = require('./services/puppeteerService');

async function testEmailTyping() {
  console.log('🧪 Testing Email Typing Functionality...\n');
  
  try {
    console.log('1️⃣ Launching browser...');
    await puppeteerService.launchBrowser({ headless: false });
    console.log('✅ Browser launched successfully');
    
    console.log('\n2️⃣ Navigating to target site...');
    await puppeteerService.navigateToUrl('https://smartclean-1333e.web.app');
    console.log('✅ Navigated to target site');
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n3️⃣ Looking for email input field...');
    const page = puppeteerService.page;
    const emailInput = await page.$('input[type="email"]');
    
    if (emailInput) {
      console.log('✅ Email input field found');
      
      // Wait for the input to be ready
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Clear the input field first
      await page.click('input[type="email"]');
      await page.keyboard.down('Control');
      await page.keyboard.press('a');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      
      // Type the email
      await page.type('input[type="email"]', process.env.EMAIL_USER);
      console.log('📧 Email entered:', process.env.EMAIL_USER);
      
      // Wait a moment so you can see the email in the input field
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('👁️  You should now see the email in the input field');
      
      // Verify the email was actually typed
      const actualEmail = await page.$eval('input[type="email"]', el => el.value);
      console.log('🔍 Actual email in input field:', actualEmail);
      
      if (actualEmail === process.env.EMAIL_USER) {
        console.log('✅ Email typing successful!');
      } else {
        console.log('❌ Email typing failed!');
      }
      
      // Wait 5 seconds so you can see the result
      console.log('\n4️⃣ Waiting 5 seconds so you can see the email in the browser...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } else {
      console.log('❌ Email input field not found');
    }
    
    console.log('\n5️⃣ Closing browser...');
    await puppeteerService.closeBrowser();
    console.log('✅ Browser closed successfully');
    
    console.log('\n🎉 Email typing test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (puppeteerService.isBrowserRunning()) {
      console.log('\n🔄 Closing browser due to error...');
      await puppeteerService.closeBrowser();
    }
    
    process.exit(1);
  }
}

testEmailTyping();
