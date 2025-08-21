const express = require('express');
const router = express.Router();
const puppeteerService = require('../services/puppeteerService');



router.get('/test', (req, res) => {
  res.json({
    message: 'Puppeteer routes are working!',
    timestamp: new Date().toISOString(),
    test: 'success'
  });
});

router.post('/launch', async (req, res) => {
  try {
    const { headless = false, ...options } = req.body;
    
    if (puppeteerService.isBrowserRunning()) {
      return res.json({
        success: true,
        message: 'Browser already running',
        browserStatus: 'running'
      });
    }

    await puppeteerService.launchBrowser({ headless, ...options });
    
    res.json({
      success: true,
      message: 'Browser launched successfully',
      browserStatus: 'running',
      headless
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to launch browser',
      message: error.message
    });
  }
});

router.post('/navigate', async (req, res) => {
  try {
    const { url, waitForSelector } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    await puppeteerService.navigateToUrl(url, waitForSelector);
    const pageInfo = await puppeteerService.getPageInfo();
    
    res.json({
      success: true,
      message: 'Navigation successful',
      pageInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to navigate',
      message: error.message
    });
  }
});



router.post('/extract-text', async (req, res) => {
  try {
    const { selector, multiple = false } = req.body;
    
    if (!selector) {
      return res.status(400).json({
        success: false,
        error: 'Selector is required'
      });
    }

    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    let text;
    if (multiple) {
      text = await puppeteerService.extractMultipleText(selector);
    } else {
      text = await puppeteerService.extractText(selector);
    }
    
    res.json({
      success: true,
      message: 'Text extracted successfully',
      selector,
      multiple,
      data: text
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to extract text',
      message: error.message
    });
  }
});

router.post('/extract-attribute', async (req, res) => {
  try {
    const { selector, attribute } = req.body;
    
    if (!selector || !attribute) {
      return res.status(400).json({
        success: false,
        error: 'Selector and attribute are required'
      });
    }

    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    const value = await puppeteerService.extractAttribute(selector, attribute);
    
    res.json({
      success: true,
      message: 'Attribute extracted successfully',
      selector,
      attribute,
      value
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to extract attribute',
      message: error.message
    });
  }
});

router.post('/click', async (req, res) => {
  try {
    const { selector, waitForNavigation = false } = req.body;
    
    if (!selector) {
      return res.status(400).json({
        success: false,
        error: 'Selector is required'
      });
    }

    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    await puppeteerService.clickElement(selector, waitForNavigation);
    
    res.json({
      success: true,
      message: 'Element clicked successfully',
      selector,
      waitForNavigation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to click element',
      message: error.message
    });
  }
});

router.post('/type', async (req, res) => {
  try {
    const { selector, text, clearFirst = true } = req.body;
    
    if (!selector || !text) {
      return res.status(400).json({
        success: false,
        error: 'Selector and text are required'
      });
    }

    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    await puppeteerService.typeText(selector, text, clearFirst);
    
    res.json({
      success: true,
      message: 'Text typed successfully',
      selector,
      text,
      clearFirst
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to type text',
      message: error.message
    });
  }
});

router.post('/scrape-table', async (req, res) => {
  try {
    const { selector } = req.body;
    
    if (!selector) {
      return res.status(400).json({
        success: false,
        error: 'Table selector is required'
      });
    }

    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    const tableData = await puppeteerService.scrapeTable(selector);
    
    if (!tableData) {
      return res.status(404).json({
        success: false,
        error: 'Table not found with the specified selector'
      });
    }
    
    res.json({
      success: true,
      message: 'Table scraped successfully',
      selector,
      data: tableData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to scrape table',
      message: error.message
    });
  }
});

router.post('/evaluate', async (req, res) => {
  try {
    const { functionCode, args = [] } = req.body;
    
    if (!functionCode) {
      return res.status(400).json({
        success: false,
        error: 'Function code is required'
      });
    }

    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    const pageFunction = new Function('...args', functionCode);
    const result = await puppeteerService.evaluateFunction(pageFunction, ...args);
    
    res.json({
      success: true,
      message: 'Function evaluated successfully',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to evaluate function',
      message: error.message
    });
  }
});

router.get('/page-info', async (req, res) => {
  try {
    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    const pageInfo = await puppeteerService.getPageInfo();
    
    res.json({
      success: true,
      message: 'Page info retrieved successfully',
      data: pageInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get page info',
      message: error.message
    });
  }
});

router.get('/browser-status', async (req, res) => {
  try {
    const isRunning = await puppeteerService.isBrowserRunning();
    
    res.json({
      success: true,
      browserStatus: isRunning ? 'running' : 'stopped',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get browser status',
      message: error.message
    });
  }
});

router.post('/close', async (req, res) => {
  try {
    if (!puppeteerService.isBrowserRunning()) {
      return res.json({
        success: true,
        message: 'Browser already closed',
        browserStatus: 'stopped'
      });
    }

    await puppeteerService.closeBrowser();
    
    res.json({
      success: true,
      message: 'Browser closed successfully',
      browserStatus: 'stopped'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to close browser',
      message: error.message
    });
  }
});

router.post('/initialize-target', async (req, res) => {
  try {
    const result = await puppeteerService.initializeTargetSite();
    
    res.json({
      success: true,
      message: 'Target site initialization successful',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to initialize target site',
      message: error.message
    });
  }
});

router.get('/target-status', async (req, res) => {
  try {
    const status = await puppeteerService.getTargetSiteStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get target site status',
      message: error.message
    });
  }
});

router.post('/refresh-target', async (req, res) => {
  try {
    const result = await puppeteerService.refreshTargetSite();
    
    res.json({
      success: true,
      message: 'Target site refreshed successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to refresh target site',
      message: error.message
    });
  }
});



router.get('/email-status', async (req, res) => {
  try {
    const emailService = require('../services/emailService');
    const status = await emailService.getConnectionStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get email service status',
      message: error.message
    });
  }
});

router.get('/last-email', async (req, res) => {
  try {
    const emailService = require('../services/emailService');
    const lastEmail = await emailService.getLastEmail();
    
    res.json({
      success: true,
      data: lastEmail
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get last email',
      message: error.message
    });
  }
});

router.get('/last-email-urls', async (req, res) => {
  try {
    const emailService = require('../services/emailService');
    const url = emailService.getLastEmailUrls();
    res.json({ 
      success: true, 
      data: { 
        url,
        hasUrl: !!url
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get last email URL', message: error.message });
  }
});

router.post('/test-email-connection', async (req, res) => {
  try {
    const emailService = require('../services/emailService');
    const result = await emailService.testConnection();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test email connection',
      message: error.message
    });
  }
});

router.post('/wait-for-email', async (req, res) => {
  try {
    const { maxWaitTime = 60000, checkInterval = 2000 } = req.body;
    
    const result = await puppeteerService.waitForEmailUpdate(maxWaitTime, checkInterval);
    
    res.json({
      success: true,
      message: result.success ? 'Email received successfully' : 'Timeout reached',
      data: {
        emailReceived: result.success,
        url: result.url || null,
        maxWaitTime,
        checkInterval
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to wait for email',
      message: error.message
    });
  }
});

router.post('/navigate-to-email-urls', async (req, res) => {
  try {
    const emailService = require('../services/emailService');
    const url = emailService.getLastEmailUrls();
    
    if (!url) {
      return res.json({
        success: false,
        message: 'No URL found in last email',
        data: { url: null }
      });
    }
    
    console.log('🔗 Navigating to URL from last email:', url);
    
    try {
      const page = await puppeteerService.browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      await page.close();
      
      res.json({
        success: true,
        message: 'URL navigation completed',
        data: {
          url,
          navigationSuccess: true
        }
      });
      
    } catch (navigationError) {
      res.json({
        success: false,
        message: 'Navigation failed',
        data: {
          url,
          navigationSuccess: false,
          error: navigationError.message
        }
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to navigate to email URL',
      message: error.message
    });
  }
});

// DOM Monitoring Routes
router.post('/setup-dom-monitoring', async (req, res) => {
  try {
    const { targetSelector = 'div[class*="bg-black rounded-2xl p-4 min-h-[300px] font-mono text-sm"]' } = req.body;
    
    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    await puppeteerService.setupDOMMonitoring(targetSelector);
    
    res.json({
      success: true,
      message: 'DOM monitoring setup successfully',
      targetSelector
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to setup DOM monitoring',
      message: error.message
    });
  }
});

router.get('/get-new-elements', async (req, res) => {
  try {
    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    const newElements = await puppeteerService.getNewElements();
    
    res.json({
      success: true,
      message: 'New elements retrieved successfully',
      count: newElements.length,
      elements: newElements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get new elements',
      message: error.message
    });
  }
});

router.get('/get-content-changes', async (req, res) => {
  try {
    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    const contentChanges = await puppeteerService.getContentChanges();
    
    res.json({
      success: true,
      message: 'Content changes retrieved successfully',
      count: contentChanges.length,
      changes: contentChanges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get content changes',
      message: error.message
    });
  }
});

router.get('/get-all-dom-changes', async (req, res) => {
  try {
    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    const allChanges = await puppeteerService.getAllDOMChanges();
    
    res.json({
      success: true,
      message: 'All DOM changes retrieved successfully',
      data: allChanges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get all DOM changes',
      message: error.message
    });
  }
});

router.post('/wait-for-new-elements', async (req, res) => {
  try {
    const { 
      targetSelector = 'div[class*="bg-black rounded-2xl p-4 min-h-[300px] font-mono text-sm"]',
      maxWaitTime = 30000 
    } = req.body;
    
    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    const result = await puppeteerService.waitForNewElements(targetSelector, maxWaitTime);
    
    res.json({
      success: true,
      message: 'Wait for new elements completed',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to wait for new elements',
      message: error.message
    });
  }
});

router.post('/wait-for-content-changes', async (req, res) => {
  try {
    const { 
      targetSelector = 'div[class*="bg-black rounded-2xl p-4 min-h-[300px] font-mono text-sm"]',
      maxWaitTime = 30000 
    } = req.body;
    
    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    const result = await puppeteerService.waitForContentChanges(targetSelector, maxWaitTime);
    
    res.json({
      success: true,
      message: 'Wait for content changes completed',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to wait for content changes',
      message: error.message
    });
  }
});

router.post('/stop-dom-monitoring', async (req, res) => {
  try {
    if (!puppeteerService.isBrowserRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Browser not running. Launch browser first.'
      });
    }

    await puppeteerService.stopDOMMonitoring();
    
    res.json({
      success: true,
      message: 'DOM monitoring stopped successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to stop DOM monitoring',
      message: error.message
    });
  }
});

module.exports = router;
