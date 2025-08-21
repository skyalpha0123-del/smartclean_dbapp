require('dotenv').config();
const { simpleParser } = require('mailparser');
const cheerio = require('cheerio');

async function testMailParserIntegration() {
  console.log('🧪 Testing MailParser and Cheerio Integration...\n');
  
  try {
    console.log('1️⃣ Testing email parsing with Firebase auth URL...');
    
    // Simulate raw email content (similar to what imap-simple would provide)
    const rawEmailContent = `From: noreply@smartclean-1333e.firebaseapp.com
To: user@example.com
Subject: Verify your email - SmartClean
Date: ${new Date().toISOString()}
Content-Type: text/html; charset=UTF-8

<html>
<head>
  <title>Email Verification</title>
</head>
<body>
  <h2>Welcome to SmartClean!</h2>
  <p>Please click the link below to verify your email address:</p>
  <a href="https://smartclean-1333e.firebaseapp.com/__/auth/links?link=https://smartclean-1333e.firebaseapp.com/__/auth/action?apiKey%3DAIzaSyDOSs6UGQvLSfnH8UuanolcGxn6kGQw8C0%26mode%3DsignIn%26oobCode%3DUwu0HHt1JG3W6ls_DDQp2g37nQTPASNqPYVFK6k_BYUAAAGYy6_Jpw%26continueUrl%3Dhttps://smartclean-1333e.web.app/auth/verify%26lang%3Den">Verify Email</a>
  <p>Or visit our website: <a href="https://smartclean-1333e.web.app">SmartClean</a></p>
  <p>If you didn't create an account, you can safely ignore this email.</p>
</body>
</html>`;
    
    // Parse the email using mailparser
    const parsed = await simpleParser(rawEmailContent);
    
    console.log('✅ Email parsed successfully!');
    console.log('📧 Parsed email details:');
    console.log(`  From: ${parsed.from?.text || 'N/A'}`);
    console.log(`  Subject: ${parsed.subject || 'N/A'}`);
    console.log(`  Date: ${parsed.date?.toISOString() || 'N/A'}`);
    console.log(`  Has HTML: ${!!parsed.html}`);
    console.log(`  Has Text: ${!!parsed.text}`);
    
    if (parsed.html) {
      console.log('\n2️⃣ Testing HTML URL extraction with Cheerio...');
      
      // Use cheerio to extract URLs from HTML
      const $ = cheerio.load(parsed.html);
      const urls = [];
      
      $('a[href]').each((index, element) => {
        const href = $(element).attr('href');
        if (href) {
          urls.push(href);
        }
      });
      
      console.log('✅ URLs extracted using Cheerio:', urls);
      console.log('📊 Total URLs found:', urls.length);
      
      if (urls.length > 0) {
        console.log('\n🔍 URL Details:');
        urls.forEach((url, index) => {
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
      
      // Test the specific Firebase auth URL
      const firebaseUrl = urls.find(url => url.includes('firebaseapp.com'));
      if (firebaseUrl) {
        console.log('\n✅ Firebase auth URL successfully extracted!');
        console.log('🔗 URL:', firebaseUrl);
      } else {
        console.log('\n❌ Firebase auth URL not found');
      }
    }
    
    if (parsed.text) {
      console.log('\n3️⃣ Text content available:');
      console.log('📝 Text preview:', parsed.text.substring(0, 200) + '...');
    }
    
    console.log('\n🎉 MailParser and Cheerio integration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('   - mailparser and cheerio packages installed');
    console.log('   - Valid email content to parse');
    
    process.exit(1);
  }
}

testMailParserIntegration();
