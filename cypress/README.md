# Cypress E2E Tests

This directory contains end-to-end tests for the Procurement application using Cypress.

## Setup

1. Install dependencies (already done):
   ```bash
   npm install
   ```

2. Make sure the backend services are running:
   - Auth Service: `http://localhost:8081`
   - Master Data Service: `http://localhost:8082`
   - Requisition Service: `http://localhost:8083`

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Running Tests

### Open Cypress Test Runner (Interactive)

**Electron Browser (Default - Always Available):**
```bash
npm run cypress:open
```

**Chrome Browser (If Installed):**
```bash
npm run cypress:open:chrome
```

### Run Tests Headless

**Electron Browser (Default):**
```bash
npm run cypress:run
# or
npm run cypress:run:headless
```

**Chrome Browser (If Installed):**
```bash
npm run cypress:run:chrome
# or headless
npm run cypress:run:chrome:headless
```

### Run All E2E Tests
```bash
npm run test:e2e              # Electron browser (default)
npm run test:e2e:electron     # Electron browser (explicit)
npm run test:e2e:chrome       # Chrome browser (if installed)
```

### From Makefile
```bash
make test-e2e                 # Electron browser (default)
make test-e2e-electron        # Electron browser (explicit)
make test-e2e-chrome          # Chrome browser (if installed)
make test-e2e-headless        # Electron headless (default)
make test-e2e-electron-headless # Electron headless (explicit)
make test-e2e-chrome-headless # Chrome headless (if installed)
```

## Installing Chrome

If you want to use Chrome for testing, install it first:

**Ubuntu/Debian (WSL):**
```bash
# Install Google Chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install ./google-chrome-stable_current_amd64.deb

# Or install Chromium
sudo apt update && sudo apt install chromium-browser
```

**Verify Installation:**
```bash
cd frontend
npx cypress info
```

You should see Chrome listed in the browsers section.

## Test Structure

- `cypress/e2e/01-login.cy.js` - Login functionality tests
- `cypress/e2e/02-masterdata-crud.cy.js` - Master Data CRUD operations (Projects, Cost Centers, Vendors)
- `cypress/e2e/03-requisitions-crud.cy.js` - Purchase Requisitions CRUD operations
- `cypress/e2e/04-user-management-crud.cy.js` - User Management CRUD operations

## Custom Commands

The following custom commands are available:

- `cy.login(email)` - Login as a user
- `cy.apiRequest(method, url, body)` - Make authenticated API requests
- `cy.safeDelete(type, id)` - Safely delete test data (only deletes test data)
- `cy.generateTestId(prefix)` - Generate unique test IDs with prefix
- `cy.isTestData(id, type)` - Check if ID matches test data patterns

## Safety Features

All cleanup functions use safety checks to ensure only test data is deleted:

1. **PR Deletion**: Only deletes PRs that:
   - Start with "PR-" prefix
   - Are in "Draft" status
   - Were created by test users

2. **Project Deletion**: Only deletes projects with "TEST-PROJ-", "TEST-UPDATE-", or "TEST-DELETE-" prefixes

3. **Other Resources**: Only deletes resources with "TEST-" prefixes matching their type

## Test Data

Test data is defined in `cypress/fixtures/test-data.json` and uses specific prefixes:
- Projects: `TEST-PROJ-`, `TEST-UPDATE-`, `TEST-DELETE-`
- Cost Centers: `TEST-CC-`
- Vendors: `TEST-VENDOR-`
- Users: `TEST-USER-`
- PRs: Auto-generated as `PR-{timestamp}` (only Draft status PRs are deleted)

## Configuration

Configuration is in `cypress.config.js`. Key settings:
- Base URL: `http://localhost:3000`
- Test user email: `admin@org.sg` (from environment)
- Default command timeout: 10 seconds
- Default browser: **Electron** (always available, no installation needed)
- Supported browsers: Electron (default), Chrome (if installed), Edge, Firefox

## Browser Support

Cypress is configured to support multiple browsers:

1. **Chrome** - Recommended for testing in a real browser environment
   - Run: `npm run cypress:open:chrome` or `npm run cypress:run:chrome`
   - Uses system Chrome installation
   - Better for debugging and seeing actual browser behavior

2. **Electron** - Default browser (headless-friendly)
   - Run: `npm run cypress:open` or `npm run cypress:run`
   - Built into Cypress, no additional installation needed
   - Faster for CI/CD pipelines

To see available browsers:
```bash
cd frontend
npx cypress info
```

## Notes

- Tests automatically clean up test data after execution
- Real/production data is never deleted
- Tests are designed to be idempotent and can be run multiple times safely

