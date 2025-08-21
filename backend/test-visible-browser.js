require('dotenv').config();
const puppeteerService = require('./services/puppeteerService');

async function testVisibleBrowser() {
  console.log('🧪 Testing Visible Puppeteer Browser...\n');
  
  try {
    console.log('1️⃣ Launching browser in visible mode...');
    
    // Launch browser with visible mode
    await puppeteerService.launchBrowser({ headless: false });
    console.log('✅ Browser launched successfully in visible mode');
    
    console.log('\n2️⃣ Navigating to a test page...');
    
    // Navigate to a simple test page
    await puppeteerService.navigateToUrl('https://www.google.com');
    console.log('✅ Navigated to Google');
    
    // Wait a bit so you can see the page
    console.log('👁️  You should see Google in the browser window');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n3️⃣ Taking a screenshot...');
    
    // Take a screenshot
    const screenshot = await puppeteerService.takeScreenshot({
      path: `./screenshots/visible_test_${Date.now()}.png`,
      fullPage: true
    });
    
    console.log('✅ Screenshot taken:', screenshot);
    
    console.log('\n4️⃣ Closing browser...');
    
    // Close the browser
    await puppeteerService.closeBrowser();
    console.log('✅ Browser closed successfully');
    
    console.log('\n🎉 Visible browser test completed!');
    console.log('💡 You should have seen the browser window open and navigate to Google');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('   - Puppeteer service working');
    console.log('   - No other browser instances running');
    
    process.exit(1);
  }
}

testVisibleBrowser();
