require('dotenv').config();
const puppeteerService = require('./services/puppeteerService');

async function testTargetSite() {
  console.log('🧪 Testing Puppeteer Target Site Integration...\n');
  
  try {
    console.log('1️⃣ Initializing Puppeteer for target site...');
    await puppeteerService.initializeTargetSite();
    console.log('✅ Target site initialization successful');
    
    console.log('\n2️⃣ Getting target site status...');
    const status = await puppeteerService.getTargetSiteStatus();
    console.log('Target Site Status:', JSON.stringify(status, null, 2));
    
    console.log('\n3️⃣ Taking target site screenshot...');
    const screenshotResult = await puppeteerService.takeTargetSiteScreenshot({
      fullPage: true,
      quality: 90
    });
    console.log('✅ Screenshot taken successfully');
    console.log('Screenshot Result:', JSON.stringify(screenshotResult, null, 2));
    
    console.log('\n4️⃣ Refreshing target site...');
    const refreshResult = await puppeteerService.refreshTargetSite();
    console.log('✅ Target site refreshed successfully');
    console.log('Refresh Result:', JSON.stringify(refreshResult, null, 2));
    
    console.log('\n5️⃣ Getting updated page info...');
    const pageInfo = await puppeteerService.getPageInfo();
    console.log('Updated Page Info:', JSON.stringify(pageInfo, null, 2));
    
    console.log('\n6️⃣ Closing browser...');
    await puppeteerService.closeBrowser();
    console.log('✅ Browser closed successfully');
    
    console.log('\n🎉 All target site tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('   - Stable internet connection');
    console.log('   - Sufficient system resources');
    console.log('   - No firewall blocking the connection');
    console.log('   - Target site is accessible');
    
    if (puppeteerService.isBrowserRunning()) {
      console.log('\n🔄 Closing browser due to error...');
      await puppeteerService.closeBrowser();
    }
  }
}

testTargetSite();
