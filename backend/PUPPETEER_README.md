# Puppeteer Integration

This backend now includes Puppeteer functionality for web scraping, automation, and browser control.

## Features

- ✅ **Browser Management**: Launch, control, and close headless browsers
- ✅ **Web Navigation**: Navigate to URLs with custom wait conditions
- ✅ **Screenshot Capture**: Take full-page or viewport screenshots
- ✅ **Text Extraction**: Extract text from specific elements or multiple elements
- ✅ **Attribute Extraction**: Get HTML attributes from elements
- ✅ **Element Interaction**: Click elements and type text
- ✅ **Table Scraping**: Extract structured data from HTML tables
- ✅ **Custom Functions**: Execute custom JavaScript in the browser context
- ✅ **Page Information**: Get page title, URL, and metadata
- ✅ **Target Site Integration**: Automatic connection to https://smartclean-1333e.web.app
- ✅ **Auto-Initialization**: Puppeteer starts automatically when backend starts

## Installation

Puppeteer is already installed. It will automatically download Chromium browser binaries.

## Auto-Initialization

When the backend server starts, Puppeteer automatically:
1. Launches a headless browser
2. Connects to the target site: `https://smartclean-1333e.web.app`
3. Verifies the connection
4. Logs the initialization status

This ensures Puppeteer is always ready to monitor and interact with the target site.

## API Endpoints

### Browser Management

#### Launch Browser
```http
POST /api/puppeteer/launch
Content-Type: application/json

{
  "headless": true,
  "args": ["--no-sandbox"]
}
```

#### Close Browser
```http
POST /api/puppeteer/close
```

#### Browser Status
```http
GET /api/puppeteer/browser-status
```

### Target Site Management

#### Initialize Target Site
```http
POST /api/puppeteer/initialize-target
```

#### Get Target Site Status
```http
GET /api/puppeteer/target-status
```

#### Refresh Target Site
```http
POST /api/puppeteer/refresh-target
```

#### Take Target Site Screenshot
```http
POST /api/puppeteer/target-screenshot
Content-Type: application/json

{
  "fullPage": true,
  "quality": 90
}
```

### Navigation

#### Navigate to URL
```http
POST /api/puppeteer/navigate
Content-Type: application/json

{
  "url": "https://example.com",
  "waitForSelector": ".content"
}
```

#### Get Page Info
```http
GET /api/puppeteer/page-info
```

### Screenshots

#### Take Screenshot
```http
POST /api/puppeteer/screenshot
Content-Type: application/json

{
  "fullPage": true,
  "quality": 90
}
```

Screenshots are saved to `/backend/screenshots/` and accessible via `/screenshots/filename.png`

### Data Extraction

#### Extract Text
```http
POST /api/puppeteer/extract-text
Content-Type: application/json

{
  "selector": "h1.title",
  "multiple": false
}
```

#### Extract Multiple Texts
```http
POST /api/puppeteer/extract-text
Content-Type: application/json

{
  "selector": ".item",
  "multiple": true
}
```

#### Extract Attribute
```http
POST /api/puppeteer/extract-attribute
Content-Type: application/json

{
  "selector": "a.link",
  "attribute": "href"
}
```

### Element Interaction

#### Click Element
```http
POST /api/puppeteer/click
Content-Type: application/json

{
  "selector": "button.submit",
  "waitForNavigation": true
}
```

#### Type Text
```http
POST /api/puppeteer/type
Content-Type: application/json

{
  "selector": "input.search",
  "text": "search term",
  "clearFirst": true
}
```

### Advanced Features

#### Scrape Table
```http
POST /api/puppeteer/scrape-table
Content-Type: application/json

{
  "selector": "table.data"
}
```

#### Execute Custom Function
```http
POST /api/puppeteer/evaluate
Content-Type: application/json

{
  "functionCode": "return document.querySelectorAll('.item').length;",
  "args": []
}
```

## Usage Examples

### Basic Web Scraping Workflow

```javascript
// 1. Launch browser
const launchResponse = await fetch('/api/puppeteer/launch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ headless: true })
});

// 2. Navigate to page
const navigateResponse = await fetch('/api/puppeteer/navigate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    url: 'https://example.com',
    waitForSelector: '.content' 
  })
});

// 3. Extract data
const textResponse = await fetch('/api/puppeteer/extract-text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ selector: 'h1.title' })
});

// 4. Take screenshot
const screenshotResponse = await fetch('/api/puppeteer/screenshot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fullPage: true })
});

// 5. Close browser
await fetch('/api/puppeteer/close', { method: 'POST' });
```

### Table Scraping Example

```javascript
const tableResponse = await fetch('/api/puppeteer/scrape-table', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ selector: 'table.products' })
});

const tableData = await tableResponse.json();
console.log('Headers:', tableData.data.headers);
console.log('Rows:', tableData.data.data);
```

### Custom Function Execution

```javascript
const functionResponse = await fetch('/api/puppeteer/evaluate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    functionCode: `
      const items = document.querySelectorAll('.product');
      return Array.from(items).map(item => ({
        name: item.querySelector('.name').textContent,
        price: item.querySelector('.price').textContent
      }));
    `
  })
});
```

## Testing

### Basic Puppeteer Test
Run the basic test script to verify Puppeteer integration:

```bash
node test-puppeteer.js
```

This will:
1. Launch a headless browser
2. Navigate to Google
3. Take a screenshot
4. Extract page title
5. Close the browser

### Target Site Test
Run the target site test script to verify the specific functionality:

```bash
node test-target-site.js
```

This will:
1. Initialize Puppeteer for the target site
2. Connect to https://smartclean-1333e.web.app
3. Get target site status
4. Take a screenshot of the target site
5. Refresh the target site
6. Close the browser

## Error Handling

The service includes comprehensive error handling:

- Browser launch failures
- Navigation timeouts
- Element not found errors
- Network connectivity issues
- Invalid selectors

## Security Considerations

- ✅ **Sandboxed Execution**: Browser runs in isolated environment
- ✅ **No File System Access**: Limited to screenshots directory
- ✅ **Timeout Protection**: Prevents infinite waits
- ✅ **Resource Cleanup**: Automatic browser cleanup
- ⚠️ **Custom Code Execution**: Be careful with user-provided JavaScript
- ⚠️ **Network Access**: Can access any website

## Performance Tips

1. **Use Headless Mode**: Set `headless: true` for production
2. **Limit Screenshots**: Only take screenshots when necessary
3. **Close Browser**: Always close browser after use
4. **Optimize Selectors**: Use specific, efficient CSS selectors
5. **Batch Operations**: Group multiple operations together

## Troubleshooting

### Common Issues

1. **Browser Won't Launch**
   - Check system resources
   - Verify no other Chrome instances running
   - Check firewall settings

2. **Navigation Timeout**
   - Increase timeout values
   - Check network connectivity
   - Verify URL accessibility

3. **Element Not Found**
   - Verify selector syntax
   - Check if element is loaded
   - Use `waitForSelector` option

4. **Memory Issues**
   - Close browser after use
   - Limit concurrent operations
   - Monitor system resources

### Debug Mode

Enable visible browser for debugging:

```javascript
{
  "headless": false,
  "slowMo": 100
}
```

## Dependencies

- `puppeteer`: Main browser automation library
- `express`: Web framework (already installed)
- `path`: Node.js path utilities
- `fs`: File system operations

## Next Steps

Consider adding:
- **PDF Generation**: Convert web pages to PDF
- **Performance Monitoring**: Track page load times
- **Cookie Management**: Handle authentication cookies
- **Proxy Support**: Route through different IP addresses
- **Mobile Emulation**: Test responsive designs
- **Network Interception**: Monitor API calls
- **File Downloads**: Handle file downloads
- **Form Automation**: Fill and submit forms automatically
