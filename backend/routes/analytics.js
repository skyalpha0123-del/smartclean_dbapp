const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../config/database');

// GET analytics data
router.get('/', async (req, res) => {
  try {
    const analyticsData = await dbHelpers.getAnalyticsData();
    
    res.json({
      success: true,
      data: analyticsData
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
