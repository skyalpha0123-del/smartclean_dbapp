const axios = require('axios');

class SiteMonitor {
  constructor() {
    this.siteUrl = 'https://smartclean-1333e.web.app';
    this.isOnline = false;
    this.lastChecked = null;
    this.checkInterval = 30000;
    this.startMonitoring();
  }

  async checkSiteStatus() {
    try {
      const response = await axios.get(this.siteUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'SmartClean-Monitor/1.0'
        }
      });
      
      this.isOnline = response.status >= 200 && response.status < 400;
      this.lastChecked = new Date();
      
      
    } catch (error) {
      this.isOnline = false;
      this.lastChecked = new Date();
      
    }
  }

  startMonitoring() {
    this.checkSiteStatus();
    
    setInterval(() => {
      this.checkSiteStatus();
    }, this.checkInterval);
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      lastChecked: this.lastChecked,
      siteUrl: this.siteUrl
    };
  }
}

const siteMonitor = new SiteMonitor();

module.exports = siteMonitor;
