const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

require('dotenv').config();

require('./config/database');
require('./services/siteMonitor');

const puppeteerService = require('./services/puppeteerService');
const emailService = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 5000;

const trustProxy = process.env.TRUST_PROXY || 1;
app.set('trust proxy', trustProxy);

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(morgan('combined'));

app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - IP: ${req.ip} - X-Forwarded-For: ${req.get('X-Forwarded-For') || 'Not set'}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



app.get('/', (req, res) => {
  res.json({ message: 'Database App Backend API' });
});

app.use('/api/health', require('./routes/health'));
app.use('/api/users', require('./routes/users'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/emails', require('./routes/emails'));
app.use('/api/puppeteer', require('./routes/puppeteer'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database: MongoDB`);
  console.log(`🔒 Trust Proxy: Enabled`);
  
  try {
    console.log('\n📧 Initializing IMAP email service...');
    const emailInitialized = await emailService.initialize();
    
    if (emailInitialized) {
      console.log('✅ Email service initialization completed successfully!');
      
      console.log('\n🤖 Initializing Puppeteer for target site...');
      const puppeteerInitialized = await puppeteerService.initializeTargetSite();
      
      if (puppeteerInitialized) {
        console.log('✅ Puppeteer initialization completed successfully!');
      } else {
        console.log('⚠️  Puppeteer initialization failed, but browser remains open for debugging');
        console.log('💡 You can manually inspect the browser window to see what went wrong');
      }
    } else {
      console.log('⚠️  Email service not initialized, initializing Puppeteer anyway...');
      
      console.log('\n🤖 Initializing Puppeteer for target site...');
      const puppeteerInitialized = await puppeteerService.initializeTargetSite();
      
      if (puppeteerInitialized) {
        console.log('✅ Puppeteer initialization completed successfully!');
      } else {
        console.log('⚠️  Puppeteer initialization failed, but browser remains open for debugging');
        console.log('💡 You can manually inspect the browser window to see what went wrong');
      }
    }
    
    console.log('\n🎉 All services initialized successfully!');
  } catch (error) {
    console.error('❌ Service initialization failed:', error.message);
    console.log('⚠️  Server will continue with limited functionality');
  }
});

module.exports = app;
