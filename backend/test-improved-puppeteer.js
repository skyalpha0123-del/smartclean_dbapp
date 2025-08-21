require('dotenv').config();
const puppeteerService = require('./services/puppeteerService');

async function testImprovedPuppeteer() {
  console.log('🧪 Testing Improved Puppeteer Error Handling...\n');
  
  try {
    console.log('1️⃣ Testing page element debugging...');
    
    // Launch browser
    await puppeteerService.launchBrowser({ headless: false });
    console.log('✅ Browser launched successfully');
    
    // Navigate to a simple test page first
    await puppeteerService.navigateToUrl('https://www.google.com');
    console.log('✅ Navigated to Google');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test the debug method
    console.log('\n2️⃣ Testing debugPageElements method...');
    const debugInfo = await puppeteerService.debugPageElements();
    console.log('✅ Debug info:', debugInfo);
    
    // Now test with the target site
    console.log('\n3️⃣ Testing with target site...');
    await puppeteerService.navigateToUrl('https://smartclean-1333e.web.app');
    console.log('✅ Navigated to target site');
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Debug the target site
    console.log('\n4️⃣ Debugging target site elements...');
    const targetDebugInfo = await puppeteerService.debugPageElements();
    console.log('✅ Target site debug info:', targetDebugInfo);
    
    console.log('\n5️⃣ Closing browser...');
    await puppeteerService.closeBrowser();
    console.log('✅ Browser closed successfully');
    
    console.log('\n🎉 Improved Puppeteer test completed!');
    console.log('💡 Check the debug output above to see what elements are available');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 This test helps identify:');
    console.log('   - What elements are available on the page');
    console.log('   - Why the button click might be failing');
    console.log('   - Page structure and available selectors');
    
    if (puppeteerService.isBrowserRunning()) {
      console.log('\n🔄 Closing browser due to error...');
      await puppeteerService.closeBrowser();
    }
    
    process.exit(1);
  }
}

testImprovedPuppeteer();
