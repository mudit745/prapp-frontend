# Cypress E2E Testing Setup

## Overview

Cypress has been set up for end-to-end testing of the Procurement application. All tests include safety measures to ensure only test data is created and deleted.

## Installation

Cypress is already installed. If you need to reinstall:

```bash
cd frontend
npm install --save-dev cypress
```

## Running Tests

### Interactive Mode (Recommended for Development)

**Electron Browser (Default - Always Available):**
```bash
cd frontend
npm run cypress:open
```

**Chrome Browser (If Installed):**
```bash
cd frontend
npm run cypress:open:chrome
```

**Note:** If Chrome is not installed, use Electron (default) or install Chrome first.

This opens the Cypress Test Runner where you can:
- See all test files
- Run tests individually
- Watch tests execute in real-time
- Debug test failures
- Select browser from the browser dropdown

### Headless Mode (CI/CD)

**Electron Browser (Default):**
```bash
cd frontend
npm run cypress:run
# or
npm run cypress:run:headless
```

**Chrome Browser (If Installed):**
```bash
cd frontend
npm run cypress:run:chrome
# or headless
npm run cypress:run:chrome:headless
```

Or from the project root:
```bash
make test-e2e                 # Electron (default)
make test-e2e-electron       # Electron (explicit)
make test-e2e-chrome         # Chrome (if installed)
make test-e2e-headless        # Electron headless (default)
make test-e2e-electron-headless # Electron headless (explicit)
make test-e2e-chrome-headless # Chrome headless (if installed)
```

## Test Files

1. **00-setup.cy.js** - Verifies backend services are running
2. **01-login.cy.js** - Login functionality tests
3. **02-masterdata-crud.cy.js** - Master Data CRUD (Projects, Cost Centers, Vendors)
4. **03-requisitions-crud.cy.js** - Purchase Requisitions CRUD
5. **04-user-management-crud.cy.js** - User Management CRUD

## Safety Features

### Test Data Identification

All test data uses specific prefixes:
- **Projects**: `TEST-PROJ-`, `TEST-UPDATE-`, `TEST-DELETE-`
- **Cost Centers**: `TEST-CC-`
- **Vendors**: `TEST-VENDOR-`
- **Users**: `TEST-USER-`
- **PRs**: Auto-generated as `PR-{timestamp}` (only Draft status PRs are deleted)

### Safe Deletion

The `cy.safeDelete()` command:
1. Validates the ID matches test data patterns
2. For PRs: Verifies status is "Draft" before deletion
3. For other resources: Checks for test prefixes
4. Logs actions but never deletes real data

### Cleanup

All tests automatically clean up test data in `after()` hooks:
- Only test data matching patterns is deleted
- Real/production data is never touched
- Tests can be run multiple times safely

## Configuration

- **Base URL**: `http://localhost:3000` (configured in `cypress.config.js`)
- **Test User**: `admin@org.sg` (from environment variables)
- **Timeouts**: 10 seconds for commands and requests
- **Default Browser**: **Electron** (always available, no installation needed)
- **Other Browsers**: Chrome, Edge, Firefox (if installed)

## Browser Selection

Cypress supports multiple browsers. Electron is the default (always available):

1. **Electron** - Default browser, built into Cypress
   - Command: `npm run cypress:open` or `npm run cypress:run` (default)
   - No additional installation needed
   - Faster, good for CI/CD
   - Always works, even in headless environments

2. **Chrome** - Real browser environment, better for debugging
   - Command: `npm run cypress:open:chrome` or `npm run cypress:run:chrome`
   - Requires Chrome to be installed on your system
   - Recommended for local development and debugging
   - Best for testing real user experience
   - **Installation required** (see below)

To see all available browsers:
```bash
cd frontend
npx cypress info
```

You can also select the browser from the Cypress Test Runner UI when running in interactive mode.

## Installing Chrome (Optional)

If you want to use Chrome for testing, install it first:

**Ubuntu/Debian (WSL):**
```bash
# Option 1: Install Google Chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install ./google-chrome-stable_current_amd64.deb

# Option 2: Install Chromium (lighter alternative)
sudo apt update && sudo apt install chromium-browser
```

**Verify Installation:**
```bash
cd frontend
npx cypress info
```

After installation, Chrome will appear in the available browsers list, and you can use:
- `npm run cypress:open:chrome`
- `npm run cypress:run:chrome`
- `make test-e2e-chrome`

## Prerequisites

Before running E2E tests:

1. **Backend Services Running**:
   - Auth Service: `http://localhost:8081`
   - Master Data Service: `http://localhost:8082`
   - Requisition Service: `http://localhost:8083`

2. **Frontend Dev Server Running**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Database Seeded**:
   - Test user should exist: `admin@org.sg`
   - Seed data should be loaded

## Custom Commands

Available in all test files:

- `cy.login(email)` - Login as a user
- `cy.apiRequest(method, url, body)` - Make authenticated API requests
- `cy.safeDelete(type, id)` - Safely delete test data
- `cy.generateTestId(prefix)` - Generate unique test IDs
- `cy.isTestData(id, type)` - Check if ID is test data

## Troubleshooting

### Tests fail with "Element not found"
- Ensure the frontend is running on `http://localhost:3000`
- Check that the UI matches the selectors in tests
- Use `cypress:open` to debug interactively

### API requests fail
- Verify backend services are running
- Check network tab in Cypress for error details
- Ensure test user exists in database

### Cleanup doesn't work
- Check that test data has correct prefixes
- Verify PRs are in "Draft" status
- Check Cypress logs for deletion attempts

## Best Practices

1. **Always use test prefixes** when creating test data
2. **Never hardcode real data IDs** in tests
3. **Use `cy.safeDelete()`** for all cleanup
4. **Run tests in order** (numbered files ensure proper sequence)
5. **Check logs** if tests fail to understand what happened

## Example Test Structure

```javascript
describe('Feature Tests', () => {
  let testId = null

  before(() => {
    cy.login()
  })

  it('should create resource', () => {
    cy.generateTestId('TEST-PREFIX').then((id) => {
      testId = id
      // ... create resource
    })
  })

  after(() => {
    if (testId) {
      cy.safeDelete('type', testId)
    }
  })
})
```

