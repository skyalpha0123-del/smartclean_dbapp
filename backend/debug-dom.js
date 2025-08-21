require('dotenv').config();
const puppeteerService = require('./services/puppeteerService');

async function debugDOM() {
  console.log('🔍 Debugging DOM Monitoring...\n');
  
  try {
    await puppeteerService.launchBrowser({ headless: false });
    await puppeteerService.navigateToUrl('https://smartclean-1333e.web.app');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const page = puppeteerService.page;
    
    // Check if elements exist
    const elementCount = await page.evaluate(() => {
      const selector = 'div[class*="space-y-1 max-h-64"] > :first-child';
      const elements = document.querySelectorAll(selector);
      console.log('Elements found:', elements.length);
      return elements.length;
    });
    
    console.log(`Found ${elementCount} elements`);
    
    if (elementCount === 0) {
      console.log('❌ No elements found! Check your selector.');
      return;
    }
    
    // Set up monitoring
    await puppeteerService.setupDOMMonitoring('div[class*="space-y-1 max-h-64"] > :first-child');
    
    console.log('✅ Monitoring active. Check browser console for logs.');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    await puppeteerService.closeBrowser();
    
  } catch (error) {
    console.error('Error:', error.message);
    if (puppeteerService.isBrowserRunning()) {
      await puppeteerService.closeBrowser();
    }
  }
}

debugDOM();
