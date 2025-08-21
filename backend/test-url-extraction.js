require('dotenv').config();
const emailService = require('./services/emailService');
const puppeteerService = require('./services/puppeteerService');

async function testUrlExtraction() {
  console.log('🧪 Testing URL Extraction and Navigation...\n');
  
  try {
    console.log('1️⃣ Testing URL extraction from email service...');
    
    // Get URLs from last email
    const urls = emailService.getLastEmailUrls();
    
    if (urls && urls.length > 0) {
      console.log('✅ URLs found in last email:', urls);
      
      console.log('\n2️⃣ Testing manual navigation to extracted URLs...');
      
      // Test navigation to each URL
      for (const url of urls) {
        try {
          console.log(`🌐 Testing navigation to: ${url}`);
          
          // Create a new page for testing
          const page = await puppeteerService.browser.newPage();
          await page.goto(url, { waitUntil: 'networkidle2' });
          
          // Get page title
          const title = await page.title();
          console.log(`📄 Page title: ${title}`);
          
          // Take screenshot
          const screenshotName = `test_navigation_${Date.now()}.png`;
          await page.screenshot({ 
            path: `./screenshots/${screenshotName}`,
            fullPage: true 
          });
          
          console.log(`📸 Screenshot saved: ${screenshotName}`);
          
          await page.close();
          
          // Wait between navigations
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`❌ Failed to navigate to ${url}:`, error.message);
        }
      }
      
      console.log('\n✅ URL navigation testing completed!');
      
    } else {
      console.log('⚠️  No URLs found in last email');
      console.log('💡 Send a SmartClean email with URLs to test this functionality');
    }
    
    console.log('\n🎉 URL extraction test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('   - Email service running');
    console.log('   - Valid email credentials');
    console.log('   - SmartClean emails with URLs');
    console.log('   - Puppeteer service initialized');
    
    process.exit(1);
  }
}

testUrlExtraction();
