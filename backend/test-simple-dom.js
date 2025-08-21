require('dotenv').config();
const puppeteerService = require('./services/puppeteerService');

async function testSimpleDOMListener() {
  console.log('🧪 Testing Simple DOM Change Listener...\n');
  
  try {
    console.log('1️⃣ Launching browser...');
    await puppeteerService.launchBrowser({ headless: false });
    console.log('✅ Browser launched successfully');
    
    console.log('\n2️⃣ Navigating to target site...');
    await puppeteerService.navigateToUrl('https://smartclean-1333e.web.app');
    console.log('✅ Navigated to target site');
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n3️⃣ Setting up simple DOM change listener...');
    await puppeteerService.setupSimpleDOMListener('div[class*="space-y-1 max-h-64"]');
    console.log('✅ Simple DOM change listener is now active');
    
    console.log('\n4️⃣ DOM change listener is active!');
    console.log('👁️  Watch the console for DOM change notifications');
    console.log('💡 Any new elements matching the selector will trigger logs');
    console.log('💡 The exposed function should show: "💡 DOM Change Detected:"');
    
    console.log('\n5️⃣ Waiting 30 seconds for you to interact with the page...');
    console.log('💡 Try clicking buttons, typing, or navigating to trigger DOM changes');
    console.log('💡 Look for new elements being added that match the selector');
    
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log('\n6️⃣ Getting current DOM state...');
    const currentState = await puppeteerService.getAllDOMChanges();
    console.log('📋 Current state:', {
      initialElements: currentState.initialElementsCount,
      newElements: currentState.newElements.length,
      contentChanges: currentState.contentChanges.length
    });
    
    console.log('\n7️⃣ Stopping DOM change listener...');
    await puppeteerService.stopSimpleDOMListener();
    console.log('✅ DOM change listener stopped');
    
    console.log('\n8️⃣ Closing browser...');
    await puppeteerService.closeBrowser();
    console.log('✅ Browser closed successfully');
    
    console.log('\n🎉 Simple DOM change listener test completed!');
    console.log('💡 Check the console above for any DOM change notifications');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    if (puppeteerService.isBrowserRunning()) {
      console.log('\n🔄 Closing browser due to error...');
      await puppeteerService.closeBrowser();
    }
    
    process.exit(1);
  }
}

testSimpleDOMListener();
