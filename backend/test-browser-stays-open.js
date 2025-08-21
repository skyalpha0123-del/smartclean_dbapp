require('dotenv').config();
const puppeteerService = require('./services/puppeteerService');

async function testBrowserStaysOpen() {
  console.log('🧪 Testing Browser Stays Open on Errors...\n');
  
  try {
    console.log('1️⃣ Launching browser...');
    await puppeteerService.launchBrowser({ headless: false });
    console.log('✅ Browser launched successfully');
    
    console.log('\n2️⃣ Testing target site initialization (this should fail but keep browser open)...');
    const result = await puppeteerService.initializeTargetSite();
    
    if (result) {
      console.log('✅ Target site initialization succeeded (unexpected!)');
    } else {
      console.log('⚠️  Target site initialization failed as expected');
      console.log('🔍 Browser should still be open for debugging');
    }
    
    console.log('\n3️⃣ Waiting 10 seconds so you can see the browser...');
    console.log('👁️  Look at the browser window - it should still be open!');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('\n4️⃣ Checking if browser is still running...');
    const isRunning = await puppeteerService.isBrowserRunning();
    console.log(`🔍 Browser running: ${isRunning}`);
    
    if (isRunning) {
      console.log('✅ Browser is still running - error handling is working!');
      console.log('\n5️⃣ Now closing browser manually...');
      await puppeteerService.closeBrowser();
      console.log('✅ Browser closed manually');
    } else {
      console.log('❌ Browser closed automatically - error handling needs fixing');
    }
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 This test verifies that:');
    console.log('   - Browser stays open even when errors occur');
    console.log('   - Error handling doesn\'t automatically close the browser');
    console.log('   - Manual browser control is maintained');
    
    if (puppeteerService.isBrowserRunning()) {
      console.log('\n🔄 Closing browser due to error...');
      await puppeteerService.closeBrowser();
    }
    
    process.exit(1);
  }
}

testBrowserStaysOpen();
