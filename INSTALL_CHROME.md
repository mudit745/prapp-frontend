# Installing Chrome for Cypress Testing

## Quick Install (Ubuntu/Debian/WSL)

### Option 1: Google Chrome (Recommended)
```bash
# Download Chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

# Install
sudo apt install ./google-chrome-stable_current_amd64.deb

# Clean up
rm google-chrome-stable_current_amd64.deb
```

### Option 2: Chromium (Lighter Alternative)
```bash
sudo apt update
sudo apt install chromium-browser
```

## Verify Installation

After installation, verify Chrome is detected:

```bash
cd frontend
npx cypress info
```

You should see Chrome listed in the browsers section.

## Test Chrome Detection

Run the check script:
```bash
cd frontend
bash cypress/scripts/check-chrome.sh
```

## Using Chrome After Installation

Once Chrome is installed, you can use:

```bash
# Interactive mode
npm run cypress:open:chrome

# Headless mode
npm run cypress:run:chrome

# Or from project root
make test-e2e-chrome
```

## Notes

- Electron (default) works without any installation
- Chrome provides a more realistic browser environment
- Both browsers support all safety features (safe deletion, cleanup)
- You can switch between browsers in the Cypress Test Runner UI

