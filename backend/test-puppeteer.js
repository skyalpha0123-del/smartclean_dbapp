require('dotenv').config();
const puppeteerService = require('./services/puppeteerService');

async function testPuppeteer() {
  console.log('🧪 Testing Puppeteer Integration...\n');
  
  try {
    console.log('1️⃣ Launching browser...');
    await puppeteerService.launchBrowser({ headless: false });
    console.log('✅ Browser launched successfully');
    
    console.log('\n2️⃣ Navigating to Google...');
    await puppeteerService.navigateToUrl('https://www.google.com');
    console.log('✅ Navigation successful');
    
    console.log('\n3️⃣ Getting page info...');
    const pageInfo = await puppeteerService.getPageInfo();
    console.log('Page Info:', pageInfo);
    
    console.log('\n4️⃣ Taking screenshot...');
    const screenshot = await puppeteerService.takeScreenshot({
      path: `test_screenshot_${Date.now()}.png`
    });
    console.log('✅ Screenshot taken successfully');
    
    console.log('\n5️⃣ Extracting page title...');
    const title = await puppeteerService.extractText('title');
    console.log('Page Title:', title);
    
    console.log('\n6️⃣ Closing browser...');
    await puppeteerService.closeBrowser();
    console.log('✅ Browser closed successfully');
    
    console.log('\n🎉 All Puppeteer tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('   - Stable internet connection');
    console.log('   - Sufficient system resources');
    console.log('   - No firewall blocking the connection');
    
    if (puppeteerService.isBrowserRunning()) {
      console.log('\n🔄 Closing browser due to error...');
      await puppeteerService.closeBrowser();
    }
  }
}

testPuppeteer();
