const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../config/database');

router.get('/test', (req, res) => {
  res.json({
    message: 'Analytics route is working!',
    timestamp: new Date().toISOString(),
    test: 'success'
  });
});

router.get('/', async (req, res) => {
  try {
    const analyticsData = await dbHelpers.getAnalyticsData();
    const siteStatus = await dbHelpers.getSiteStatus();
    
    res.json({
      success: true,
      data: {
        ...analyticsData,
        siteStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data',
      message: error.message
    });
  }
});

module.exports = router;
