# IMAP Integration with imap-simple

This backend now includes IMAP email functionality using the `imap-simple` library.

## Features

- ✅ Connect to IMAP servers (Gmail, Outlook, Yahoo, etc.)
- ✅ Fetch emails with pagination
- ✅ Search emails by text content
- ✅ Get email details by ID
- ✅ List available folders
- ✅ Test connection status

## Setup

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Email Configuration (IMAP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
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

Run the test script to verify your IMAP connection:

```bash
node test-imap.js
```

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

## Next Steps

Consider adding:
- Email filtering by date range
- Attachment handling
- Email composition (SMTP)
- Email notifications
- Scheduled email fetching
