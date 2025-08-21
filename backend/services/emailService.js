const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const cheerio = require('cheerio');

class EmailService {
  constructor() {
    this.config = {
      imap: {
        user: process.env.EMAIL_USER || '',
        password: process.env.EMAIL_PASSWORD || '',
        host: process.env.EMAIL_HOST || 'imap.gmail.com',
        port: process.env.EMAIL_PORT || 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        connectTimeout: parseInt(process.env.EMAIL_CONNECT_TIMEOUT) || 60000,
        authTimeout: parseInt(process.env.EMAIL_AUTH_TIMEOUT) || 30000,
        greetingTimeout: parseInt(process.env.EMAIL_GREETING_TIMEOUT) || 20000,
        socketTimeout: parseInt(process.env.EMAIL_SOCKET_TIMEOUT) || 30000
      }
    };
    this.lastEmail = null;
    this.connection = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      if (this.isInitialized) {
        console.log('✅ Email service already initialized');
        return true;
      }

      console.log('📧 Initializing IMAP email service...');
      
      if (!this.config.imap.user || !this.config.imap.password) {
        console.log('⚠️  Email credentials not configured, skipping email service initialization');
        return false;
      }

      this.connection = await imaps.connect(this.config);
      await this.connection.openBox('[Gmail]/Spam');
      console.log('✅ Connected to Gmail [Gmail]/Spam, waiting for new emails...');

      this.setupEmailListener();
      this.isInitialized = true;
      console.log('🎉 Email service initialization completed successfully!');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      return false;
    }
  }

  setupEmailListener() {
    if (!this.connection) {
      console.error('❌ Cannot setup email listener: no connection');
      return;
    }

    this.connection.on('mail', async (mail) => {
      try {
        console.log('📨 New email received:', mail);
        await this.processNewEmails();
      } catch (error) {
        console.error('❌ Error processing new email:', error.message);
      }
    });

    console.log('👂 Email event listener set up successfully');
  }

  async processNewEmails() {
    try {
      const searchCriteria = ['UNSEEN'];
      const fetchOptions = {
        bodies: [''],
        markSeen: true
      };

      const messages = await this.connection.search(searchCriteria, fetchOptions);
      console.log(messages, '!@!@!@!@!@!@messages');

      for (const message of messages) {
        try {
          console.log(message, '!@!@!@!@!@!@message');
          const all = message.parts.find(part => part.which === '');
          const parsed = await simpleParser(all.body);
          
          const headers = {
            from: [parsed.from?.text || ''],
            subject: [parsed.subject || ''],
            date: [parsed.date?.toISOString() || ''],
            to: [parsed.to?.text || '']
          };
          
          const text = parsed.text || '';
          const html = parsed.html || '';

          console.log('📧 Processing email:', {
            from: headers.from[0],
            subject: headers.subject[0],
            date: headers.date[0],
            text: text,
            html: html ? 'HTML content available' : 'No HTML content'
          });

          if (this.isSmartCleanEmail(headers, text)) {
            console.log('✅ SmartClean email detected!');
            console.log('📧 HTML content available:', !!html);
            console.log('📧 Text content available:', !!text);
            
            // Try to extract URLs from HTML first, then fall back to text
            let extractedUrl = null;
            if (html) {
              console.log('🔍 Attempting HTML URL extraction...');
              extractedUrl = this.extractUrlsFromHtml(html);
              console.log('🔗 HTML extraction result:', extractedUrl);
            }
            
            // Fall back to text if HTML extraction failed
            if (!extractedUrl && text) {
              console.log('🔍 Attempting text URL extraction...');
              const textUrls = this.extractUrlsFromText(text);
              extractedUrl = textUrls && textUrls.length > 0 ? textUrls[0] : null;
              console.log('🔗 Text extraction result:', extractedUrl);
            }
            
            this.lastEmail = {
              headers,
              text,
              html,
              timestamp: new Date().toISOString(),
              urls: extractedUrl
            };
            
            console.log('✅ SmartClean email processed and stored');
            console.log('🔗 Final extracted URL:', extractedUrl);
            break;
          }
        } catch (error) {
          console.error('❌ Error processing individual email:', error.message);
        }
      }
    } catch (error) {
      console.error('❌ Error processing new emails:', error.message);
    }
  }

  isSmartCleanEmail(headers, text) {
    try {
      const from = (headers.from[0] || '').toLowerCase();
      const subject = (headers.subject[0] || '').toLowerCase();
      const to = (text || '').toLowerCase();

      return from.includes('noreply@smartclean-1333e') &&
             subject.includes('smartclean-1333e') &&
             to.includes('smartclean-1333e');
    } catch (error) {
      console.error('❌ Error checking if email is SmartClean:', error.message);
      return false;
    }
  }

  extractUrlsFromHtml(html) {
    try {
      // Check if HTML content is valid
      if (!html || typeof html !== 'string') {
        console.log('⚠️  Invalid HTML content:', html);
        return null;
      }

      console.log('📧 HTML content received:', html.substring(0, 200) + '...');
      
      // Use cheerio for better HTML parsing
      const $ = cheerio.load(html);
      console.log('🔍 Cheerio loaded successfully');
      
      // Find all anchor tags
      const anchorTags = $('a');
      console.log('🔗 Found anchor tags:', anchorTags.length);
      
      if (anchorTags.length > 0) {
        // Get the first anchor tag's href
        const cleanUrl = anchorTags.first().attr('href');
        console.log('🔗 Extracted URL:', cleanUrl);
        
        if (cleanUrl) {
          console.log('✅ Single URL extracted from HTML successfully');
          return cleanUrl;
        } else {
          console.log('⚠️  Anchor tag found but no href attribute');
          return null;
        }
      } else {
        console.log('⚠️  No anchor tags found in HTML');
        return null;
      }
    } catch (error) {
      console.error('❌ Error extracting URLs from HTML:', error.message);
      console.error('❌ Error stack:', error.stack);
      return null;
    }
  }

  extractUrlsFromText(text) {
    try {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = text.match(urlRegex) || [];
      
      // Filter and clean URLs
      const cleanUrls = urls
        .map(url => url.trim())
        .filter(url => {
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        });
      
      console.log('🔗 Extracted URLs from email text:', cleanUrls);
      return cleanUrls;
    } catch (error) {
      console.error('❌ Error extracting URLs from email text:', error.message);
      return [];
    }
  }

  getLastEmailUrls() {
    try {
      if (!this.lastEmail) {
        return null;
      }
      
      // Try HTML first, then fall back to text
      if (this.lastEmail.html) {
        const url = this.extractUrlsFromHtml(this.lastEmail.html);
        if (url) {
          console.log('🔗 URL extracted from HTML content');
          return url;
        }
      }
      
      // Fall back to text extraction if no HTML or no URL found in HTML
      if (this.lastEmail.text) {
        const urls = this.extractUrlsFromText(this.lastEmail.text);
        if (urls && urls.length > 0) {
          console.log('🔗 URL extracted from text content (fallback)');
          return urls[0]; // Return first URL from text
        }
      }
      
      console.log('⚠️  No content available for URL extraction');
      return null;
    } catch (error) {
      console.error('❌ Error getting URL from last email:', error.message);
      return null;
    }
  }

  async testConnection() {
    try {
      if (!this.connection || !this.isInitialized) {
        return {
          success: false,
          message: 'Email service not initialized',
          error: 'Service not ready'
        };
      }

      const folders = await this.connection.getBoxes();
      return {
        success: true,
        message: 'IMAP connection successful',
        folders: Object.keys(folders),
        status: 'connected'
      };
    } catch (error) {
      return {
        success: false,
        message: 'IMAP connection failed',
        error: error.message,
        status: 'disconnected'
      };
    }
  }

  async getLastEmail() {
    return this.lastEmail;
  }

  async getConnectionStatus() {
    return {
      isInitialized: this.isInitialized,
      isConnected: this.connection !== null && this.connection.isConnected(),
      hasCredentials: !!(this.config.imap.user && this.config.imap.password),
      timestamp: new Date().toISOString()
    };
  }

  async closeConnection() {
    try {
      if (this.connection) {
        this.connection.end();
        this.connection = null;
        this.isInitialized = false;
        console.log('✅ Email service connection closed');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error closing email connection:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
