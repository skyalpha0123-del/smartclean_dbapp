require('dotenv').config();
const emailService = require('./services/emailService');

async function testImprovedUrlExtraction() {
  console.log('🧪 Testing Improved URL Extraction from HTML...\n');
  
  try {
    console.log('1️⃣ Testing HTML URL extraction with Firebase auth URL...');
    
    // Test HTML content similar to what would be in a SmartClean email
    const testHtml = `
      <html>
        <body>
          <p>Please click the link below to verify your email:</p>
          <a href="https://smartclean-1333e.firebaseapp.com/__/auth/links?link=https://smartclean-1333e.firebaseapp.com/__/auth/action?apiKey%3DAIzaSyDOSs6UGQvLSfnH8UuanolcGxn6kGQw8C0%26mode%3DsignIn%26oobCode%3DUwu0HHt1JG3W6ls_DDQp2g37nQTPASNqPYVFK6k_BYUAAAGYy6_Jpw%26continueUrl%3Dhttps://smartclean-1333e.web.app/auth/verify%26lang%3Den">Verify Email</a>
          <p>Or visit our website: <a href="https://smartclean-1333e.web.app">SmartClean</a></p>
        </body>
      </html>
    `;
    
    // Test the HTML extraction method
    const extractedUrls = emailService.extractUrlsFromHtml(testHtml);
    
    console.log('✅ URLs extracted from HTML:', extractedUrls);
    console.log('📊 Total URLs found:', extractedUrls.length);
    
    if (extractedUrls.length > 0) {
      console.log('\n🔍 URL Details:');
      extractedUrls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
        try {
          const urlObj = new URL(url);
          console.log(`     Domain: ${urlObj.hostname}`);
          console.log(`     Path: ${urlObj.pathname}`);
          console.log(`     Valid URL: ✅`);
        } catch (error) {
          console.log(`     Valid URL: ❌ (${error.message})`);
        }
      });
    }
    
    console.log('\n2️⃣ Testing text fallback extraction...');
    
    const testText = `
      Please visit: https://smartclean-1333e.firebaseapp.com/__/auth/links?link=https://smartclean-1333e.firebaseapp.com/__/auth/action?apiKey%3DAIzaSyDOSs6UGQvLSfnH8UuanolcGxn6kGQw8C0%26mode%3DsignIn%26oobCode%3DUwu0HHt1JG3W6ls_DDQp2g37nQTPASNqPYVFK6k_BYUAAAGYy6_Jpw%26continueUrl%3Dhttps://smartclean-1333e.web.app/auth/verify%26lang%3Den
      Or check our website: https://smartclean-1333e.web.app
    `;
    
    const textUrls = emailService.extractUrlsFromText(testText);
    console.log('✅ URLs extracted from text:', textUrls);
    console.log('📊 Total URLs found in text:', textUrls.length);
    
    console.log('\n3️⃣ Testing combined extraction logic...');
    
    // Simulate the email processing logic
    const mockEmail = {
      html: testHtml,
      text: testText
    };
    
    // Test the getLastEmailUrls logic
    const combinedUrls = emailService.getLastEmailUrls.call({ lastEmail: mockEmail });
    console.log('✅ Combined extraction result:', combinedUrls);
    console.log('📊 Total URLs from combined logic:', combinedUrls.length);
    
    console.log('\n🎉 Improved URL extraction test completed!');
    
    // Summary
    console.log('\n📋 Summary:');
    console.log(`  HTML extraction: ${extractedUrls.length} URLs`);
    console.log(`  Text extraction: ${textUrls.length} URLs`);
    console.log(`  Combined logic: ${combinedUrls.length} URLs`);
    
    if (extractedUrls.length > 0 && extractedUrls.some(url => url.includes('firebaseapp.com'))) {
      console.log('✅ Firebase auth URL successfully extracted!');
    } else {
      console.log('❌ Firebase auth URL not found in extraction');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testImprovedUrlExtraction();
