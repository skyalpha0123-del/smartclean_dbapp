const puppeteer = require('puppeteer');
const imap = require('./emailService');

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
        headless: false,
        args: [
          '--disable-web-security',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--start-maximized',
          '--disable-notifications',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          '--disable-infobars',
          '--window-position=0,0',
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
          '--disable-features=IsolateOrigins,site-per-process',
          '--profile-directory=Profile 1'
        ],
        ignoreDefaultArgs: ['--enable-automation'],
        userDataDir: './chrome-automation-profile',
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        defaultViewport: null,
        ...options
      };

      this.browser = await puppeteer.launch(defaultOptions);
      this.page = await this.browser.newPage();
      
      // Set a reasonable viewport for visibility
      await this.page.setViewport({ width: 1366, height: 768 });
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Bring browser window to front
      if (this.browser.process()) {
        console.log('🔍 Browser process ID:', this.browser.process().pid);
      }
      
      console.log('👁️  Browser launched in visible mode - you should see the browser window!');
      
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

  async takeScreenshot(options = {}) {
    try {
      if (!this.page) {
        throw new Error('Browser not launched. Call launchBrowser() first.');
      }

      const defaultOptions = {
        path: options.path || `screenshot_${Date.now()}.png`,
        fullPage: options.fullPage || false,
        quality: options.quality || 80
      };

      const screenshot = await this.page.screenshot(defaultOptions);
      return screenshot;
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error.message}`);
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
      console.error('❌ Failed to debug page elements:', error.message);
      throw error;
    }
  }

  async debugPageElementsForPage(page) {
    try {
      console.log('🔍 Debugging page elements...');
      
      // Get all input fields
      const inputs = await page.$$('input');
      console.log(`📝 Found ${inputs.length} input fields:`);
      
      for (let i = 0; i < inputs.length; i++) {
        try {
          const input = await page.$(`input:nth-child(${i + 1})`);
          if (input) {
            const type = await input.evaluate(el => el.type || 'No type');
            const placeholder = await input.evaluate(el => el.placeholder || 'No placeholder');
            const id = await input.evaluate(el => el.id || 'No id');
            const className = await input.evaluate(el => el.className || 'No class');
            console.log(`  Input ${i + 1}: type=${type}, placeholder="${placeholder}", id="${id}", class="${className}"`);
          }
        } catch (e) {
          console.log(`  Input ${i + 1}: Could not read - ${e.message}`);
        }
      }
      
      // Get all buttons
      const buttons = await page.$$('button');
      console.log(`🔘 Found ${buttons.length} buttons:`);
      
      for (let i = 0; i < buttons.length; i++) {
        try {
          const button = await page.$(`button:nth-child(${i + 1})`);
          if (button) {
            const text = await button.evaluate(el => el.textContent?.trim() || 'No text');
            const type = await button.evaluate(el => el.type || 'No type');
            const id = await button.evaluate(el => el.id || 'No id');
            const className = await button.evaluate(el => el.className || 'No class');
            console.log(`  Button ${i + 1}: text="${text}", type=${type}, id="${id}", class="${className}"`);
          }
        } catch (e) {
          console.log(`  Button ${i + 1}: Could not read - ${e.message}`);
        }
      }
      
      // Get page title and URL
      const title = await page.title();
      const url = await page.url();
      console.log(`📄 Page Title: ${title}`);
      console.log(`🌐 Page URL: ${url}`);
      
      return { inputs: inputs.length, buttons: buttons.length, title, url };
    } catch (error) {
      console.error('❌ Failed to debug page elements:', error.message);
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
        console.log('✅ Puppeteer already initialized with target site');
        return true;
      }

      console.log('🚀 Initializing Puppeteer for target site...');
      
      await this.launchBrowser({ headless: false });
      console.log('✅ Browser launched successfully');

      const page = await this.browser.newPage();
      await page.goto(this.targetSite);
      console.log(`✅ Connected to target site: ${this.targetSite}`);
      
      // Add a small delay so you can see the navigation
      await new Promise(resolve => setTimeout(resolve, 10000));
      console.log('👁️  You should now see the target site in the browser window');

      console.log('🔍 Looking for email input field...');
      const inputs = await page.$$('input#email');

      if (inputs.length) {
        console.log('✅ Email input field found');
        
        // Wait for the input to be ready
        await page.waitForSelector('input[id="email"]', { timeout: 10000 });
        if (inputs.length > 1) {
          await inputs[1].type(process.env.EMAIL_USER); // index 1 = second input
        } else {
          await inputs[0].type(process.env.EMAIL_USER); // index 0 = first input
        }
        console.log('📧 Email entered:', process.env.EMAIL_USER);
        
        // Wait a moment so you can see the email in the input field
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('👁️  You should now see the email in the input field');

        console.log('🔍 Looking for submit button...');
        const buttonSelectors ='button[class*="glass-button"]';
        const submitButton = await page.$$(buttonSelectors);

        if (submitButton.length > 1) {
          await submitButton[1].click();
        } else {
          await submitButton[0].click();
        }

        const emailResult = await this.waitForEmailUpdate();
        
        if (emailResult && emailResult.success && emailResult.url) {
          console.log('🔗 Navigating to extracted URL from email...');
          
          try {
            const url = emailResult.url;
            console.log(`🌐 Navigating to: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2' });
            console.log(await this.page.content(), '!@!@!@!@!@!@content');
            console.log('✅ URL navigation completed successfully!');
          } catch (navigationError) {
            console.error(`❌ Failed to navigate to ${emailResult.url}:`, navigationError.message);
          }
        } else {
          console.log('⚠️  No URL found in email or email processing failed');
        }
        
        console.log('✅ Email received and processed successfully!');
      } else {
        console.log('❌ Email input field not found');
      }

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
      
      // Set up DOM monitoring for the target selector
      console.log('🔍 Setting up DOM monitoring after admin login...');
      await this.setupDOMMonitoring('div[class*="bg-black rounded-2xl p-4 min-h-[300px] font-mono text-sm"]');
      
      console.log('✅ DOM monitoring is now active');
      
      this.isInitialized = true;
      console.log('🎉 Puppeteer initialization completed successfully!');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Puppeteer with target site:', error.message);
      console.log('🔍 Browser will remain open for debugging purposes');
      console.log('💡 You can manually close it or use puppeteerService.closeBrowser()');
      
      // Don't automatically close the browser - let user see what happened
      // this.isInitialized = false; // Keep it false since initialization failed
      
      // Return false instead of throwing error to prevent cascading failures
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

      console.log('🔄 Refreshing target site...');
      await this.navigateToUrl(this.targetSite);
      
      const pageInfo = await this.getPageInfo();
      console.log(`✅ Target site refreshed. Current page: ${pageInfo.title}`);
      
      return {
        success: true,
        message: 'Target site refreshed successfully',
        pageInfo
      };
    } catch (error) {
      throw new Error(`Failed to refresh target site: ${error.message}`);
    }
  }

  async takeTargetSiteScreenshot(options = {}) {
    try {
      if (!this.isInitialized || !this.isBrowserRunning()) {
        throw new Error('Puppeteer not initialized. Call initializeTargetSite() first.');
      }

      const screenshot = await this.takeScreenshot({
        fullPage: options.fullPage || true,
        quality: options.quality || 90,
        ...options
      });

      return {
        success: true,
        message: 'Target site screenshot taken successfully',
        screenshot,
        targetSite: this.targetSite,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to take target site screenshot: ${error.message}`);
    }
  }

  async waitForEmailUpdate(maxWaitTime = 60000, checkInterval = 2000) {
    try {
      console.log('⏳ Waiting for email service to receive new email...');
      
      const startTime = Date.now();
      let lastEmailBefore = null;
      
      // Get initial email state
      try {
        const emailService = require('./emailService');
        lastEmailBefore = emailService.lastEmail;
        console.log('📧 Initial email state:', lastEmailBefore ? 'Email exists' : 'No email');
      } catch (error) {
        console.log('⚠️  Could not access email service, continuing without email check');
        return true;
      }
      
      // Poll for email updates
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
              console.log('⚠️  No URL found in the email');
              return { success: true, url: null };
            }
          }
          
          // Wait before next check
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          console.log(`⏳ Still waiting... (${elapsed}s elapsed)`);
          
        } catch (error) {
          console.log('⚠️  Error checking email service:', error.message);
          await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
      }
      
      console.log('⏰ Timeout reached while waiting for email');
      return { success: false, url: null };
      
    } catch (error) {
      console.error('❌ Error in waitForEmailUpdate:', error.message);
      return { success: false, url: null };
    }
  }

  async setupDOMMonitoring(targetSelector = 'div[class*="bg-black"]') {
    try {
      if (!this.page) {
        throw new Error('Page not available. Call launchBrowser() first.');
      }

      console.log('🔍 Setting up DOM monitoring for selector:', targetSelector);
      
      // Set up MutationObserver to watch for DOM changes
      await this.page.evaluate((selector) => {
        // Store initial elements
        window.initialElements = Array.from(document.querySelectorAll(selector));
        console.log('📋 Initial elements found:', window.initialElements.length);
        
        // Set up MutationObserver
        window.domObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              // Check for new nodes added
              mutation.addedNodes.forEach((node) => {
                console.log(node, '!@!@!@!@!@!@node');
                if (node.nodeType === Node.ELEMENT_NODE) {
                  // Check if the new node matches our selector
                  if (node.matches && node.matches(selector)) {
                    console.log('🆕 New matching element added:', node);
                    window.newElements = window.newElements || [];
                    window.newElements.push(node);
                  }
                  
                  // Check if any descendants match our selector
                  const descendants = node.querySelectorAll ? node.querySelectorAll(selector) : [];
                  descendants.forEach((descendant) => {
                    if (!window.initialElements.includes(descendant)) {
                      console.log('🆕 New descendant element found:', descendant);
                      window.newElements = window.newElements || [];
                      window.newElements.push(descendant);
                    }
                  });
                }
              });
            }
          });
        });
        
        // Start observing
        window.domObserver.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        console.log('✅ DOM monitoring started');
      }, targetSelector);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to setup DOM monitoring:', error.message);
      throw error;
    }
  }

  async getNewElements() {
    try {
      if (!this.page) {
        throw new Error('Page not available. Call launchBrowser() first.');
      }

      const newElements = await this.page.evaluate(() => {
        return window.newElements || [];
      });
      
      return newElements;
    } catch (error) {
      console.error('❌ Failed to get new elements:', error.message);
      throw error;
    }
  }

  async waitForNewElements(targetSelector = 'div[class*="bg-black rounded-2xl p-4 min-h-[300px] font-mono text-sm"]', maxWaitTime = 30000) {
    try {
      console.log('⏳ Waiting for new DOM elements matching selector:', targetSelector);
      
      const startTime = Date.now();
      
      while (Date.now() - startTime < maxWaitTime) {
        const newElements = await this.getNewElements();
        
        if (newElements && newElements.length > 0) {
          console.log('✅ New elements detected:', newElements.length);
          return {
            success: true,
            count: newElements.length,
            elements: newElements
          };
        }
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        console.log(`⏳ Still waiting for new elements... (${elapsed}s elapsed)`);
      }
      
      console.log('⏰ Timeout reached while waiting for new elements');
      return { success: false, count: 0, elements: [] };
      
    } catch (error) {
      console.error('❌ Error in waitForNewElements:', error.message);
      return { success: false, count: 0, elements: [] };
    }
  }

  async stopDOMMonitoring() {
    try {
      if (!this.page) {
        throw new Error('Page not available. Call launchBrowser() first.');
      }

      console.log('🛑 Stopping DOM monitoring...');
      
      await this.page.evaluate(() => {
        if (window.domObserver) {
          window.domObserver.disconnect();
          window.domObserver = null;
          console.log('✅ DOM monitoring stopped');
        }
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to stop DOM monitoring:', error.message);
      throw error;
    }
  }
}

module.exports = new PuppeteerService();
