# IMAP Integration with imap-simple

This backend now includes IMAP email functionality using the `imap-simple` library.

## Features

- ✅ **IMAP Connection**: Connect to IMAP servers (Gmail, Outlook, Yahoo, etc.)
- ✅ **Email Monitoring**: Real-time monitoring for new emails
- ✅ **SmartClean Email Filtering**: Automatically detect SmartClean emails
- ✅ **Email Search**: Search emails with custom criteria
- ✅ **Email Fetching**: Get email headers and content
- ✅ **Folder Management**: List and navigate email folders
- ✅ **Connection Testing**: Test IMAP connection status
- ✅ **Auto-Initialization**: Starts automatically when backend starts
- ✅ **Event Listener**: Real-time email event handling

## Auto-Initialization

When the backend server starts, the email service automatically:
1. Connects to the configured IMAP server
2. Opens the INBOX folder
3. Sets up event listeners for new emails
4. Filters emails for SmartClean-related content
5. Logs the initialization status

This ensures the email service is always ready to monitor for SmartClean emails.

## SmartClean Email Filtering

The service automatically detects and processes emails that match these criteria:
- **FROM**: Contains `noreply@smartclean-1333e`
- **SUBJECT**: Contains `smartclean-1333e`
- **TO**: Contains `smartclean-1333e`

Matching emails are stored and can be accessed via API endpoints.

## Email-Puppeteer Integration

The system now includes automatic email waiting functionality and URL extraction:

### Automatic Email Waiting & URL Navigation
When Puppeteer initializes the target site and clicks the submit button, it automatically:
1. Waits for the IMAP service to receive a new SmartClean email
2. Extracts all hyperlink URLs from the email content
3. Navigates to each extracted URL using Puppeteer
4. Takes screenshots of each navigated page
5. Completes initialization only after all URLs are processed

### URL Extraction Features
- **HTML Priority**: Primarily extracts URLs from `<a>` tag `href` attributes for accuracy
- **Text Fallback**: Falls back to regex pattern matching if HTML content is not available
- **Smart Detection**: Handles complex URLs like Firebase authentication links correctly
- **URL Validation**: Ensures extracted URLs are valid before navigation
- **Multiple URLs**: Handles emails with multiple links sequentially
- **Screenshot Capture**: Automatically saves screenshots of navigated pages
- **Error Handling**: Continues processing even if some URLs fail

### How URL Extraction Works
1. **HTML Content Priority**: When HTML content is available, the system extracts URLs from `<a>` tag `href` attributes
2. **Text Fallback**: If HTML is not available or no URLs found, falls back to regex pattern matching in text content
3. **Complex URL Support**: Handles complex URLs with query parameters, encoded characters, and nested redirects
4. **Validation**: Each extracted URL is validated using the `URL` constructor before processing

### Manual Email Waiting
You can manually trigger email waiting using the API endpoint:
```http
POST /api/puppeteer/wait-for-email
```

**Parameters:**
- `maxWaitTime`: Maximum time to wait in milliseconds (default: 60000 = 60 seconds)
- `checkInterval`: Time between checks in milliseconds (default: 2000 = 2 seconds)

**Response:**
```json
{
  "success": true,
  "message": "Email received successfully",
  "data": {
    "emailReceived": true,
    "url": "https://example.com",
    "maxWaitTime": 60000,
    "checkInterval": 2000
  }
}
```

## Setup

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Email Configuration (IMAP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993

# Email Connection Timeouts (in milliseconds)
EMAIL_CONNECT_TIMEOUT=60000      # Connection timeout (60 seconds)
EMAIL_AUTH_TIMEOUT=30000         # Authentication timeout (30 seconds)
EMAIL_GREETING_TIMEOUT=20000     # Greeting timeout (20 seconds)
EMAIL_SOCKET_TIMEOUT=30000       # Socket timeout (30 seconds)
```

### 2. Gmail Setup (Recommended)

For Gmail, you need to:

1. Enable 2-Factor Authentication in your Google Account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

### 3. Other Email Providers

- **Outlook/Hotmail**: `outlook.office365.com:993`
- **Yahoo**: `imap.mail.yahoo.com:993`
- **Custom IMAP**: Use your provider's IMAP settings

### 4. Connection Timeout Configuration

The IMAP service includes configurable timeout settings to handle slow connections:

- **EMAIL_CONNECT_TIMEOUT**: Time to establish initial connection (default: 60s)
- **EMAIL_AUTH_TIMEOUT**: Time for authentication process (default: 30s)
- **EMAIL_GREETING_TIMEOUT**: Time for server greeting (default: 20s)
- **EMAIL_SOCKET_TIMEOUT**: Time for socket operations (default: 30s)

**Increase timeouts for slow connections:**
```bash
EMAIL_CONNECT_TIMEOUT=120000    # 2 minutes
EMAIL_AUTH_TIMEOUT=60000        # 1 minute
EMAIL_GREETING_TIMEOUT=40000    # 40 seconds
EMAIL_SOCKET_TIMEOUT=60000      # 1 minute
```

## API Endpoints

### Test Connection
```http
GET /api/emails/connection-test
```

### Get Emails
```http
GET /api/emails?limit=10&folder=INBOX
```

### Get Email by ID
```http
GET /api/emails/:id?folder=INBOX
```

### Search Emails
```http
GET /api/emails/search/:term?folder=INBOX
```

### List Folders
```http
GET /api/emails/folders/list
```

### Test Route
```http
GET /api/emails/test
```

### Email Service Status (via Puppeteer routes)
```http
GET /api/puppeteer/email-status
```

### Get Last SmartClean Email
```http
GET /api/puppeteer/last-email
```

### Test Email Connection
```http
POST /api/puppeteer/test-email-connection
```

### Wait for Email Update
```http
POST /api/puppeteer/wait-for-email
Content-Type: application/json

{
  "maxWaitTime": 60000,
  "checkInterval": 2000
}
```

### Get Last Email URLs
```http
GET /api/puppeteer/last-email-urls
```

### Navigate to Email URLs
```http
POST /api/puppeteer/navigate-to-email-urls
```

## Usage Examples

### Fetch Recent Emails
```javascript
const response = await fetch('/api/emails?limit=5');
const emails = await response.json();
```

### Search for Specific Content
```javascript
const response = await fetch('/api/emails/search/meeting');
const results = await response.json();
```

### Get Email Details
```javascript
const response = await fetch('/api/emails/12345');
const email = await response.json();
```

## Testing

### Basic IMAP Test
Run the basic test script to verify your IMAP connection:

```bash
node test-imap.js
```

### Email Service Test
Run the comprehensive email service test:

```bash
node test-email-service.js
```

This will:
1. Test email service initialization
2. Check connection status
3. Test IMAP connection
4. Monitor for new emails (30 seconds)
5. Display final status

## Error Handling

The service includes comprehensive error handling:

- Connection failures
- Authentication errors
- Invalid folder names
- Email not found
- Network timeouts

## Security Notes

- ✅ Uses TLS encryption
- ✅ Supports App Passwords (Gmail)
- ✅ No email content is stored in database
- ✅ Connection is closed after each operation
- ⚠️ Store credentials securely in environment variables
- ⚠️ Consider rate limiting for production use

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check username/password
   - For Gmail, use App Password, not regular password
   - Ensure 2FA is enabled

2. **Connection Timeout**
   - Check firewall settings
   - Verify port number
   - Check network connectivity
   - Increase timeout values in environment variables
   - For slow networks, try:
     ```bash
     EMAIL_CONNECT_TIMEOUT=120000
     EMAIL_AUTH_TIMEOUT=60000
     EMAIL_GREETING_TIMEOUT=40000
     EMAIL_SOCKET_TIMEOUT=60000
     ```

3. **Folder Not Found**
   - Use exact folder names (case-sensitive)
   - Common folders: INBOX, Sent, Drafts, Trash

### Debug Mode

Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## Dependencies

- `imap-simple`: Main IMAP library
- `dotenv`: Environment variable management
- `express`: Web framework (already installed)

## Performance Optimization

### Timeout Tuning

Adjust timeout values based on your network conditions:

**Fast Network (LAN/High-speed internet):**
```bash
EMAIL_CONNECT_TIMEOUT=30000    # 30 seconds
EMAIL_AUTH_TIMEOUT=15000       # 15 seconds
EMAIL_GREETING_TIMEOUT=10000   # 10 seconds
EMAIL_SOCKET_TIMEOUT=15000     # 15 seconds
```

**Slow Network (Mobile/Remote connections):**
```bash
EMAIL_CONNECT_TIMEOUT=180000   # 3 minutes
EMAIL_AUTH_TIMEOUT=90000       # 1.5 minutes
EMAIL_GREETING_TIMEOUT=60000   # 1 minute
EMAIL_SOCKET_TIMEOUT=90000     # 1.5 minutes
```

## Next Steps

Consider adding:
- Email filtering by date range
- Attachment handling
- Email composition (SMTP)
- Email notifications
- Scheduled email fetching
