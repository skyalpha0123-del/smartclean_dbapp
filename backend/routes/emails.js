const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

router.get('/test', (req, res) => {
  res.json({
    message: 'Email routes are working!',
    timestamp: new Date().toISOString(),
    test: 'success'
  });
});

router.get('/connection-test', async (req, res) => {
  try {
    const result = await emailService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test connection',
      message: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { limit = 10, folder = 'INBOX' } = req.query;
    const emails = await emailService.getEmails(parseInt(limit), folder);
    
    res.json({
      success: true,
      data: emails,
      count: emails.length,
      folder,
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch emails',
      message: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { folder = 'INBOX' } = req.query;
    
    const email = await emailService.getEmailById(id, folder);
    
    res.json({
      success: true,
      data: email
    });
  } catch (error) {
    if (error.message === 'Email not found') {
      return res.status(404).json({
        success: false,
        error: 'Email not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email',
      message: error.message
    });
  }
});

router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { folder = 'INBOX' } = req.query;
    
    const emails = await emailService.searchEmails(term, folder);
    
    res.json({
      success: true,
      data: emails,
      count: emails.length,
      searchTerm: term,
      folder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search emails',
      message: error.message
    });
  }
});

router.get('/folders/list', async (req, res) => {
  try {
    const folders = await emailService.getFolders();
    
    res.json({
      success: true,
      data: folders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch folders',
      message: error.message
    });
  }
});

module.exports = router;
