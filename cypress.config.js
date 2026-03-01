import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
  env: {
    // Test user credentials (should match seed data)
    testUserEmail: 'admin@org.sg',
    testUserId: 'USER-001',
    testTenantId: 'TENANT-001',
  },
  // Browser configuration
  // Default: Electron (always available)
  // Chrome: Use --browser chrome if Chrome is installed
  // Cypress auto-detects installed browsers (Chrome, Edge, Firefox, Electron)
  // To see available browsers: npx cypress info
  // To install Chrome: See cypress/scripts/check-chrome.sh or CYPRESS_SETUP.md
})

