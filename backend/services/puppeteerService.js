const puppeteer = require('puppeteer');
const imap = require('./emailService');
const { dbHelpers } = require('../config/database');

class PuppeteerService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.targetSite = 'https://smartclean-1333e.web.app';
    this.isInitialized = false;
  }

  async launchBrowser(options = {}) {
    try {
      const defaultOptions = {
        headless: true,
        args: [
          '--disable-web-security',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-notifications',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          '--disable-infobars',
          '--ignore-certificate-errors',
          '--ignore-certificate-errors-spki-list',
          '--lang=en-US,en',
          '--enable-javascript',
          '--enable-cookies',
          '--enable-dom-storage',
          '--enable-webgl',
          '--enable-gpu',
          '--hide-scrollbars',
          '--mute-audio',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=IsolateOrigins,site-per-process'
        ],
        ignoreDefaultArgs: ['--enable-automation'],
        userDataDir: './chrome-automation-profile',
        // Use system default Chrome in headless mode for better compatibility
        // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        defaultViewport: { width: 1366, height: 768 },
        ...options
      };

      this.browser = await puppeteer.launch(defaultOptions);
      this.page = await this.browser.newPage();
      
      // Set viewport for headless mode
      await this.page.setViewport({ width: 1366, height: 768 });
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Bring browser window to front
      if (this.browser.process()) {
      }
      
      return this.browser;
    } catch (error) {
      throw new Error(`Failed to launch browser: ${error.message}`);
    }
  }

  async navigateToUrl(url, waitForSelector = null) {
    try {
      if (!this.page) {
        throw new Error('Browser not launched. Call launchBrowser() first.');
      }

      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      if (waitForSelector) {
        await this.page.waitForSelector(waitForSelector, { timeout: 10000 });
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to navigate to ${url}: ${error.message}`);
    }
  }



  async extractText(selector) {
    try {
      if (!this.page) {
        throw new Error('Browser not launched. Call launchBrowser() first.');
      }

      const text = await this.page.$eval(selector, element => element.textContent);
      return text.trim();
    } catch (error) {
      throw new Error(`Failed to extract text from ${selector}: ${error.message}`);
    }
  }

  async extractMultipleText(selector) {
    try {
      if (!this.page) {
        throw new Error('Browser not launched. Call launchBrowser() first.');
      }

      const texts = await this.page.$$eval(selector, elements => 
        elements.map(element => element.textContent.trim())
      );
      return texts;
    } catch (error) {
      throw new Error(`Failed to extract multiple texts from ${selector}: ${error.message}`);
    }
  }

  async extractAttribute(selector, attribute) {
    try {
      if (!this.page) {
        throw new Error('Browser not launched. Call launchBrowser() first.');
      }

      const value = await this.page.$eval(selector, (element, attr) => 
        element.getAttribute(attr), attribute
      );
      return value;
    } catch (error) {
      throw new Error(`Failed to extract ${attribute} from ${selector}: ${error.message}`);
    }
  }

  async clickElement(selector, waitForNavigation = false) {
    try {
      if (!this.page) {
        throw new Error('Browser not launched. Call launchBrowser() first.');
      }

      if (waitForNavigation) {
        await Promise.all([
          this.page.waitForNavigation({ waitUntil: 'networkidle2' }),
          this.page.click(selector)
        ]);
      } else {
        await this.page.click(selector);
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to click element ${selector}: ${error.message}`);
    }
  }

  async typeText(selector, text, clearFirst = true) {
    try {
      if (!this.page) {
        throw new Error('Browser not launched. Call launchBrowser() first.');
      }

      if (clearFirst) {
        await this.page.click(selector, { clickCount: 3 });
        await this.page.keyboard.press('Backspace');
      }

      await this.page.type(selector, text);
      return true;
    } catch (error) {
      throw new Error(`Failed to type text in ${selector}: ${error.message}`);
    }
  }

  async waitForElement(selector, timeout = 10000) {
    try {
      if (!this.page) {
        throw new Error('Browser not launched. Call launchBrowser() first.');
      }

      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      throw new Error(`Element ${selector} not found within ${timeout}ms: ${error.message}`);
    }
  }

  async evaluateFunction(pageFunction, ...args) {
    try {
      if (!this.page) {
        throw new Error('Browser not launched. Call launchBrowser() first.');
      }

      const result = await this.page.evaluate(pageFunction, ...args);
      return result;
    } catch (error) {
      throw new Error(`Failed to evaluate function: ${error.message}`);
    }
  }

  async getPageInfo() {
    try {
      if (!this.page) {
        throw new Error('Browser not launched. Call launchBrowser() first.');
      }

      const title = await this.page.title();
      const url = this.page.url();
      
      return {
        title,
        url,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get page info: ${error.message}`);
    }
  }

  async debugPageElements() {
    try {
      if (!this.page) {
        throw new Error('Browser not launched. Call launchBrowser() first.');
      }

      return await this.debugPageElementsForPage(this.page);
    } catch (error) {
      throw error;
    }
  }

  async debugPageElementsForPage(page) {
    try {
      const inputs = await page.$$('input');
      
      for (let i = 0; i < inputs.length; i++) {
        try {
          const input = await page.$(`input:nth-child(${i + 1})`);
          if (input) {
            const type = await input.evaluate(el => el.type || 'No type');
            const placeholder = await input.evaluate(el => el.placeholder || 'No placeholder');
            const id = await input.evaluate(el => el.id || 'No id');
            const className = await input.evaluate(el => el.className || 'No class');
          }
        } catch (e) {
        }
      }
      
      const buttons = await page.$$('button');
      
      for (let i = 0; i < buttons.length; i++) {
        try {
          const button = await page.$(`button:nth-child(${i + 1})`);
          if (button) {
            const text = await button.evaluate(el => el.textContent?.trim() || 'No text');
            const type = await button.evaluate(el => el.type || 'No type');
            const id = await button.evaluate(el => el.id || 'No id');
            const className = await button.evaluate(el => el.className || 'No class');
          }
        } catch (e) {
        }
      }
      
      const title = await page.title();
      const url = await page.url();
      
      return { inputs: inputs.length, buttons: buttons.length, title, url };
    } catch (error) {
      throw error;
    }
  }

  async scrapeTable(selector) {
    try {
      if (!this.page) {
        throw new Error('Browser not launched. Call launchBrowser() first.');
      }

      const tableData = await this.page.evaluate((tableSelector) => {
        const table = document.querySelector(tableSelector);
        if (!table) return null;

        const rows = Array.from(table.querySelectorAll('tr'));
        const headers = Array.from(rows[0].querySelectorAll('th, td')).map(cell => 
          cell.textContent.trim()
        );

        const data = rows.slice(1).map(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = cells[index] ? cells[index].textContent.trim() : '';
          });
          return rowData;
        });

        return { headers, data };
      }, selector);

      return tableData;
    } catch (error) {
      throw new Error(`Failed to scrape table from ${selector}: ${error.message}`);
    }
  }

  async closeBrowser() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        this.isInitialized = false;
        console.log('🔒 Browser closed successfully');
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to close browser: ${error.message}`);
    }
  }

  async keepBrowserOpen() {
    console.log('🔍 Browser will remain open for manual inspection');
    console.log('💡 Use puppeteerService.closeBrowser() when you\'re done');
    return true;
  }

  async isBrowserRunning() {
    return this.browser !== null && this.browser.isConnected();
  }

  async initializeTargetSite() {
    try {
      if (this.isInitialized) {
        return true;
      }

      await this.launchBrowser({ headless: true });

      const page = await this.browser.newPage();
      await page.goto(this.targetSite);

      // const logSelector = ".space-y-1.max-h-64.overflow-y-auto";
      const logSelector = ".space-y-1.max-h-64.overflow-y-auto";

      await new Promise(resolve => setTimeout(resolve, 10000));

      const inputs = await page.$$('input#email');

      if (inputs.length) {
        
        await page.waitForSelector('input[id="email"]', { timeout: 10000 });
        if (inputs.length > 1) {
          await inputs[1].type(process.env.EMAIL_USER);
        } else {
          await inputs[0].type(process.env.EMAIL_USER);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        const buttonSelectors ='button[class*="glass-button"]';
        const submitButton = await page.$$(buttonSelectors);

        if (submitButton.length > 1) {
          await submitButton[1].click();
        } else {
          await submitButton[0].click();
        }

        const emailResult = await this.waitForEmailUpdate();
        
        if (emailResult && emailResult.success && emailResult.url) {
          try {
            const url = emailResult.url;
            await page.goto(url, { waitUntil: 'networkidle2' });
          } catch (navigationError) {
          }
        }
      } else {
      }

      await page.waitForSelector('button[class*="inline-flex items-center justify-center gap-2 whitespace-nowrap"]', { timeout: 30000 });
      const adminBtn = await page.$$('button[class *= "inline-flex items-center justify-center gap-2 whitespace-nowrap"]');
      await adminBtn[0].click();
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      const inputEmail = await page.$('input[id="email"]');

      if (inputEmail) {
        // Wait for the email input, then type
        await page.waitForSelector('input[id="email"]', { timeout: 10000 });
        await page.type('input[id="email"]', process.env.ADMIN_EMAIL);
  
        // Wait for the password input, then type
        await page.waitForSelector('input[id="password"]', { timeout: 10000 });
        await page.type('input[id="password"]', process.env.ADMIN_PASSWORD);
  
        await page.click('button[type="submit"]');
      } 

      console.log('admin logged in');

      // Wait for page to load after login
      await new Promise(resolve => setTimeout(resolve, 3000));

      await page.waitForSelector(logSelector);
      await page.exposeFunction("onLogChanged", async (newLog) => {
        console.log("New log detected:", newLog);
        // Process the DOM change event
        await this.handleDomChangeEvent(newLog);
      });

      await page.evaluate((logSelector) => {
        const targetNode = document.querySelector(logSelector);

        console.log('🔍 Target node:', targetNode);

        if (!targetNode) return;

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1 && node.classList.contains("text-gray-300")) {
                const text = Array.from(node.children).map(child => child.innerText.trim());
                window.onLogChanged(text);
              }
            });
          });
        });

        observer.observe(targetNode, { childList: true });
      }, logSelector);
      
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async getTargetSiteStatus() {
    try {
      if (!this.isInitialized || !this.isBrowserRunning()) {
        return {
          status: 'not_initialized',
          message: 'Puppeteer not initialized or browser not running',
          targetSite: this.targetSite
        };
      }

      const pageInfo = await this.getPageInfo();
      const isOnTargetSite = pageInfo.url.includes('smartclean-1333e.web.app');
      
      return {
        status: isOnTargetSite ? 'connected' : 'disconnected',
        message: isOnTargetSite ? 'Connected to target site' : 'Not on target site',
        targetSite: this.targetSite,
        currentUrl: pageInfo.url,
        pageTitle: pageInfo.title,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to get target site status',
        error: error.message,
        targetSite: this.targetSite,
        timestamp: new Date().toISOString()
      };
    }
  }

  async refreshTargetSite() {
    try {
      if (!this.isInitialized || !this.isBrowserRunning()) {
        throw new Error('Puppeteer not initialized. Call initializeTargetSite() first.');
      }

      await this.navigateToUrl(this.targetSite);
      
      const pageInfo = await this.getPageInfo();
      
      return {
        success: true,
        message: 'Target site refreshed successfully',
        pageInfo
      };
    } catch (error) {
      throw new Error(`Failed to refresh target site: ${error.message}`);
    }
  }

  async waitForEmailUpdate(maxWaitTime = 60000, checkInterval = 2000) {
    try {
      const startTime = Date.now();
      let lastEmailBefore = null;
      
      try {
        const emailService = require('./emailService');
        lastEmailBefore = emailService.lastEmail;
      } catch (error) {
        return true;
      }
      
      while (Date.now() - startTime < maxWaitTime) {
        try {
          const emailService = require('./emailService');
          const currentEmail = emailService.lastEmail;
          
          // Check if email has changed
          if (currentEmail && (!lastEmailBefore || 
              currentEmail.timestamp !== lastEmailBefore.timestamp ||
              currentEmail.headers.subject[0] !== lastEmailBefore.headers.subject[0])) {
            
            console.log('✅ New email detected!');
            console.log('📧 Email details:', {
              subject: currentEmail.headers.subject[0],
              from: currentEmail.headers.from[0],
              timestamp: currentEmail.timestamp
            });
            
            // Extract URL from the new email
            if (currentEmail.urls) {
              console.log('🔗 URL found in email:', currentEmail.urls);
              return { success: true, url: currentEmail.urls };
            } else {
              return { success: true, url: null };
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          
        } catch (error) {
          await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
      }
      
      return { success: false, url: null };
      
    } catch (error) {
      return { success: false, url: null };
    }
  }

  async handleDomChangeEvent(eventData) {
    try {
      // Parse the event data: [time, actionType, description]
      const [timeString, actionType, description] = eventData;
      
      // Create a unique event identifier for deduplication
      const eventId = `${actionType}_${description}_${timeString}`;
      
      if (this.processedEvents && this.processedEvents.has(eventId)) {
        return;
      }
      
      if (!this.processedEvents) {
        this.processedEvents = new Set();
      }
      
      this.processedEvents.add(eventId);
      
      if (actionType === 'SESSION_PREFLIGHT') {
        return;
      }
      
      const userMatch = description.match(/^([^\s]+)/);
      if (!userMatch) {
        return;
      }
      
      const username = userMatch[1];
      
      const today = new Date();
      const timeParts = timeString.match(/(\d+):(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeParts) {
        return;
      }
      
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const seconds = parseInt(timeParts[3]);
      const period = timeParts[4].toUpperCase();
      
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      const timestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds);
      
      // Handle different action types
      switch (actionType) {
        case 'QUEUE_JOIN':
          await this.handleQueueJoin(username, timestamp);
          break;
          
        case 'SESSION_START':
          await this.handleSessionStart(username, timestamp);
          break;
          
        case 'SESSION_END':
          await this.handleSessionEnd(username, timestamp);
          break;
          
        case 'QUEUE_CANCEL':
          await this.handleQueueCancel(username, timestamp);
          break;
          
        default:
          console.log(`⚠️  Unknown action type: ${actionType}`);
      }
      
    } catch (error) {
      console.error('❌ Error handling DOM change event:', error.message);
    }
  }
  
  async handleQueueJoin(username, timestamp) {
    try {
      const userData = {
        email: `${username}@smartclean.se`,
        password: 'temp_password',
        queueJoinTime: timestamp,
        startTime: null,
        endTime: null,
        isActive: false
      };
      
      console.log(`🔍 Checking if user exists: ${userData.email}`);
      
      // Check if user already exists
      const existingUser = await dbHelpers.getUserByEmail(userData.email);
      
      if (existingUser) {
        // Check if the user has a completed session (all three timestamps present)
        const hasCompletedSession = existingUser.queueJoinTime && existingUser.startTime && existingUser.endTime;
        
        if (hasCompletedSession) {
          console.log(`🔄 User ${username} has completed session, creating new record for new queue join`);
          // Create new user record for new session
          const result = await dbHelpers.createUserWithFields(userData);
          console.log(`✅ Created new user record for ${username} with new queue join time. User ID: ${result.id}`);
        } else {
          console.log(`📝 User ${username} has incomplete session, updating existing record`);
          // Update existing user with new queue join time (for incomplete sessions)
          await dbHelpers.updateUserFields(existingUser._id, {
            queueJoinTime: timestamp,
            startTime: null,
            endTime: null,
            isActive: false
          });
          console.log(`✅ Updated existing user ${username} with new queue join time`);
        }
      } else {
        console.log(`🆕 User doesn't exist, creating new user`);
        // Create new user
        const result = await dbHelpers.createUserWithFields(userData);
        console.log(`✅ Created new user ${username} with queue join time. User ID: ${result.id}`);
      }
      
    } catch (error) {
      console.error(`❌ Error handling QUEUE_JOIN for ${username}:`, error.message);
    }
  }
  
  async handleSessionStart(username, timestamp) {
    try {
      console.log(`🚀 Processing SESSION_START for user: ${username}`);
      
      const email = `${username}@smartclean.se`;
      // Find the active user record (most recent incomplete session)
      const user = await dbHelpers.getActiveUserByEmail(email);
      
      if (user) {
        console.log(`📝 Found active user record for ${username}, updating start time`);
        // Update startTime for the user
        await dbHelpers.startSession(user._id);
        console.log(`✅ Updated start time for user ${username}`);
      } else {
        console.log(`⚠️  No active user record found for ${username} in SESSION_START`);
      }
      
    } catch (error) {
      console.error(`❌ Error handling SESSION_START for ${username}:`, error.message);
    }
  }
  
  async handleSessionEnd(username, timestamp) {
    try {
      console.log(`🏁 Processing SESSION_END for user: ${username}`);
      
      const email = `${username}@smartclean.se`;
      // Find the active user record (most recent incomplete session)
      const user = await dbHelpers.getActiveUserByEmail(email);
      
      if (user && user.startTime) {
        console.log(`📝 Found active user record for ${username}, updating end time`);
        // Update endTime for the user
        await dbHelpers.endSession(user._id);
        console.log(`✅ Updated end time for user ${username}`);
      } else {
        console.log(`⚠️  No active user record found for ${username} or missing start time for SESSION_END`);
      }
      
    } catch (error) {
      console.error(`❌ Error handling SESSION_END for ${username}:`, error.message);
    }
  }

  async handleQueueCancel(username, timestamp) {
    try {
      console.log(`❌ Processing QUEUE_CANCEL for user: ${username}`);
      
      const email = `${username}@smartclean.se`;
      // Find the active user record (most recent incomplete session)
      const user = await dbHelpers.getActiveUserByEmail(email);
      
      if (user) {
        console.log(`📝 Found active user record for ${username}, updating for queue cancel`);
        // Update endTime to current time and set startTime to null
        await dbHelpers.updateUserFields(user._id, {
          endTime: timestamp,
          startTime: null,
          isActive: false
        });
        console.log(`✅ Updated user ${username} for queue cancel`);
      } else {
        console.log(`⚠️  No active user record found for ${username} in QUEUE_CANCEL`);
      }
      
    } catch (error) {
      console.error(`❌ Error handling QUEUE_CANCEL for ${username}:`, error.message);
    }
  }


}

module.exports = new PuppeteerService();
