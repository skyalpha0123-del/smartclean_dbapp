const cheerio = require('cheerio');

console.log('🧪 Testing Cheerio Import and Functionality...\n');

try {
  console.log('1️⃣ Testing cheerio import...');
  console.log('✅ Cheerio imported successfully:', typeof cheerio);
  console.log('✅ Cheerio.load function available:', typeof cheerio.load);
  
  console.log('\n2️⃣ Testing HTML parsing...');
  
  const testHtml = `
    <html>
      <body>
        <h1>Test Email</h1>
        <p>Click here: <a href="https://smartclean-1333e.firebaseapp.com/__/auth/links?link=https://smartclean-1333e.firebaseapp.com/__/auth/action?apiKey%3DAIzaSyDOSs6UGQvLSfnH8UuanolcGxn6kGQw8C0%26mode%3DsignIn%26oobCode%3DUwu0HHt1JG3W6ls_DDQp2g37nQTPASNqPYVFK6k_BYUAAAGYy6_Jpw%26continueUrl%3Dhttps://smartclean-1333e.web.app/auth/verify%26lang%3Den">Verify Email</a></p>
        <p>Or visit: <a href="https://smartclean-1333e.web.app">Website</a></p>
      </body>
    </html>
  `;
  
  const $ = cheerio.load(testHtml);
  console.log('✅ Cheerio.load() executed successfully');
  
  const anchorTags = $('a');
  console.log('✅ Found anchor tags:', anchorTags.length);
  
  if (anchorTags.length > 0) {
    const firstUrl = anchorTags.first().attr('href');
    console.log('✅ First URL extracted:', firstUrl);
    
    const allUrls = [];
    anchorTags.each((index, element) => {
      const href = $(element).attr('href');
      if (href) allUrls.push(href);
    });
    
    console.log('✅ All URLs extracted:', allUrls);
  }
  
  console.log('\n🎉 Cheerio test completed successfully!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('❌ Error stack:', error.stack);
  process.exit(1);
}
