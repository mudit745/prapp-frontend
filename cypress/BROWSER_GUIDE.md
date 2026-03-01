# Browser Testing Guide

## Quick Start

### Run Tests in Chrome
```bash
# Interactive mode
npm run cypress:open:chrome

# Headless mode
npm run cypress:run:chrome
```

### Run Tests in Electron (Default)
```bash
# Interactive mode
npm run cypress:open

# Headless mode
npm run cypress:run
```

## Available Browsers

Cypress automatically detects browsers installed on your system. Common browsers:

- **Chrome** - Real browser, best for debugging
- **Electron** - Default, built into Cypress
- **Edge** - If Microsoft Edge is installed
- **Firefox** - If Firefox is installed

## Check Available Browsers

```bash
cd frontend
npx cypress info
```

This will show all detected browsers.

## Browser Selection Methods

### Method 1: Command Line Flag (Recommended)

```bash
# Chrome
npm run cypress:run:chrome
npm run cypress:open:chrome

# Electron (default)
npm run cypress:run
npm run cypress:open

# Edge (if installed)
npx cypress run --browser edge
npx cypress open --browser edge

# Firefox (if installed)
npx cypress run --browser firefox
npx cypress open --browser firefox
```

### Method 2: Interactive Selection

1. Run `npm run cypress:open`
2. Click on a test file
3. Use the browser dropdown in the top-right corner
4. Select your preferred browser

## Makefile Commands

```bash
make test-e2e                 # Electron browser
make test-e2e-chrome          # Chrome browser
make test-e2e-headless        # Electron headless
make test-e2e-chrome-headless # Chrome headless
```

## Installing Chrome for Testing

### Ubuntu/Debian (WSL)
```bash
# Install Google Chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install ./google-chrome-stable_current_amd64.deb

# Or use Chromium
sudo apt install chromium-browser
```

### macOS
```bash
# Chrome should already be installed, or download from:
# https://www.google.com/chrome/
```

### Windows
```bash
# Download and install from:
# https://www.google.com/chrome/
```

After installation, verify:
```bash
cd frontend
npx cypress info
```

You should see Chrome listed in the browsers section.

## Browser-Specific Notes

### Chrome
- **Best for**: Real-world testing, debugging with DevTools
- **Requires**: Chrome or Chromium installed
- **Command**: `--browser chrome`

### Electron
- **Best for**: Fast execution, CI/CD pipelines
- **Requires**: Nothing (built into Cypress)
- **Command**: Default, or `--browser electron`

### Edge
- **Best for**: Testing Microsoft Edge compatibility
- **Requires**: Microsoft Edge installed
- **Command**: `--browser edge`

### Firefox
- **Best for**: Cross-browser compatibility testing
- **Requires**: Firefox installed
- **Command**: `--browser firefox`

## Troubleshooting

### Chrome Not Detected

1. **Check if Chrome is installed:**
   ```bash
   which google-chrome
   which chromium-browser
   ```

2. **If Chrome is installed but not detected:**
   - Restart your terminal
   - Run `npx cypress info` again
   - Chrome should appear in the list

3. **Manual Chrome path (if needed):**
   Edit `cypress.config.js`:
   ```javascript
   browsers: [
     {
       name: 'chrome',
       family: 'chromium',
       displayName: 'Chrome',
       path: '/usr/bin/google-chrome', // Your Chrome path
     }
   ]
   ```

### Browser Crashes

- Ensure browser is up to date
- Check system resources
- Try running in headless mode
- Clear browser cache: `npx cypress clear-cache`

### WSL/Headless Environment

In WSL or headless environments:
- Use Electron for headless testing (works out of the box)
- For Chrome headless, ensure display server is configured
- Consider using `--headless` flag for CI/CD

## Best Practices

1. **Local Development**: Use Chrome for better debugging
2. **CI/CD**: Use Electron or Chrome headless for speed
3. **Cross-Browser**: Test in multiple browsers before release
4. **Debugging**: Use interactive mode (`cypress:open`) with Chrome DevTools

## Example: Running All Tests in Chrome

```bash
cd frontend
npm run cypress:run:chrome
```

This will:
- Run all E2E tests
- Use Chrome browser
- Run in headless mode by default
- Generate screenshots on failure
- Clean up test data automatically

