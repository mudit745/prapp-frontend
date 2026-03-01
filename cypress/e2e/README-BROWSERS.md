# Browser Support in Cypress

## Available Browsers

Cypress automatically detects installed browsers on your system. To see available browsers:

```bash
cd frontend
npx cypress info
```

## Running Tests in Different Browsers

### Chrome Browser

**Interactive Mode:**
```bash
npm run cypress:open:chrome
```

**Headless Mode:**
```bash
npm run cypress:run:chrome
# or
npm run cypress:run:chrome:headless
```

**From Makefile:**
```bash
make test-e2e-chrome
make test-e2e-chrome-headless
```

### Electron Browser (Default)

**Interactive Mode:**
```bash
npm run cypress:open
```

**Headless Mode:**
```bash
npm run cypress:run
# or
npm run cypress:run:headless
```

**From Makefile:**
```bash
make test-e2e
make test-e2e-headless
```

## Browser Selection in Test Runner

When you open Cypress in interactive mode (`npm run cypress:open`), you can:
1. Click on a test file
2. Select the browser from the dropdown in the top-right corner
3. Available browsers will be listed (Chrome, Electron, Edge, Firefox if installed)

## Why Use Chrome?

- **Real Browser Environment**: Tests run in actual Chrome, matching user experience
- **Better Debugging**: Chrome DevTools are available for debugging
- **Performance Testing**: More accurate performance metrics
- **Extension Support**: Can test with browser extensions if needed

## Why Use Electron?

- **Faster**: Optimized for testing, faster execution
- **CI/CD Friendly**: Works well in headless environments
- **No Installation**: Built into Cypress, no additional setup
- **Consistent**: Same environment across different machines

## Browser-Specific Considerations

### Chrome
- Requires Chrome to be installed on the system
- Uses system Chrome installation
- May have different behavior than Electron in some edge cases

### Electron
- Default browser, always available
- May have slight differences from real browsers
- Better for automated/CI testing

## Troubleshooting

### Chrome not detected
```bash
# Check if Chrome is installed
which google-chrome
which chromium-browser

# If Chrome is installed but not detected, you may need to specify the path
# Edit cypress.config.js and add:
browsers: [
  {
    name: 'chrome',
    family: 'chromium',
    displayName: 'Chrome',
    channel: 'stable',
    path: '/usr/bin/google-chrome', // or your Chrome path
  }
]
```

### Browser crashes
- Ensure browser is up to date
- Check system resources (memory, CPU)
- Try running tests in headless mode for stability

