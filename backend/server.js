const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

require('dotenv').config();

require('./config/database');
require('./services/siteMonitor');

const puppeteerService = require('./services/puppeteerService');
const emailService = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

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
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const connectedClients = new Set();

wss.on('connection', (ws) => {
  connectedClients.add(ws);
  
  ws.on('close', () => {
    connectedClients.delete(ws);
  });
});

const broadcastDatabaseChange = (changeType, data) => {
  const message = JSON.stringify({
    type: 'database_change',
    changeType,
    data,
    timestamp: new Date().toISOString()
  });
  
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

global.broadcastDatabaseChange = broadcastDatabaseChange;

server.listen(PORT, async () => {
  try {
    const emailInitialized = await emailService.initialize();
    
    if (emailInitialized) {
      await puppeteerService.initializeTargetSite();
    } else {
      await puppeteerService.initializeTargetSite();
    }
  } catch (error) {
  }
});

module.exports = app;
