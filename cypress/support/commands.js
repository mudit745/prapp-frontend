// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Login as test user
 */
Cypress.Commands.add('login', (email = Cypress.env('testUserEmail')) => {
  cy.request({
    method: 'POST',
    url: '/api/v1/auth/login',
    body: { email },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200 && response.body.token) {
      cy.window().then((win) => {
        win.localStorage.setItem('token', response.body.token)
        win.localStorage.setItem('user', JSON.stringify(response.body.user))
        // Trigger tokenChanged event for PermissionsContext
        win.dispatchEvent(new Event('tokenChanged'))
      })
    }
  })
  // Visit a page to ensure the app is loaded
  cy.visit('/dashboard')
  cy.wait(1000) // Wait for app to initialize
})

/**
 * Get auth token for API requests
 */
Cypress.Commands.add('getAuthToken', () => {
  return cy.window().then((win) => {
    return win.localStorage.getItem('token')
  })
})

/**
 * Make authenticated API request
 */
Cypress.Commands.add('apiRequest', (method, url, body = null) => {
  return cy.getAuthToken().then((token) => {
    const options = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      failOnStatusCode: false,
    }
    if (body) {
      options.body = body
    }
    return cy.request(options)
  })
})

/**
 * Check if ID is test data (safe to delete)
 */
Cypress.Commands.add('isTestData', (id, type) => {
  if (!id || typeof id !== 'string') return false
  
  const testPatterns = {
    pr: /^PR-\d+$/, // PR-{timestamp} - all PRs are test data if in Draft status
    project: /^TEST-(PROJ|UPDATE|DELETE)-/, // TEST-PROJ-, TEST-UPDATE-, TEST-DELETE-
    costCenter: /^TEST-CC-/, // TEST-CC-{timestamp}
    vendor: /^TEST-VENDOR-/, // TEST-VENDOR-{timestamp}
    user: /^TEST-USER-/, // TEST-USER-{timestamp}
  }
  
  const pattern = testPatterns[type]
  return pattern ? pattern.test(id) : false
})

/**
 * Safely delete test data via API
 */
Cypress.Commands.add('safeDelete', (type, id) => {
  if (!id) {
    cy.log(`Skipping deletion - no ID provided`)
    return
  }
  
  // Check if it's test data
  const isTest = Cypress.Commands.isTestData(id, type)
  if (!isTest) {
    cy.log(`Skipping deletion of ${type} ${id} - not test data (doesn't match test pattern)`)
    return
  }
  
  const endpoints = {
    pr: `/api/v1/requisitions/${id}`,
    project: `/api/v1/projects/${id}`,
    costCenter: `/api/v1/cost-centers/${id}`,
    vendor: `/api/v1/vendors/${id}`,
    user: `/api/v1/users/${id}`,
  }
  
  const endpoint = endpoints[type]
  if (!endpoint) {
    cy.log(`Unknown type for deletion: ${type}`)
    return
  }
  
  // For PRs, verify it's in Draft status before deleting
  if (type === 'pr') {
    cy.apiRequest('GET', endpoint).then((getResponse) => {
      if (getResponse.status === 200 && getResponse.body.status === 'Draft') {
        cy.apiRequest('DELETE', endpoint).then((response) => {
          if (response.status >= 200 && response.status < 300) {
            cy.log(`Successfully deleted test ${type}: ${id}`)
          } else {
            cy.log(`Failed to delete test ${type} ${id}: ${response.status}`)
          }
        })
      } else {
        cy.log(`Skipping deletion of PR ${id} - not in Draft status (status: ${getResponse.body?.status || 'unknown'})`)
      }
    })
  } else {
    cy.apiRequest('DELETE', endpoint).then((response) => {
      if (response.status >= 200 && response.status < 300) {
        cy.log(`Successfully deleted test ${type}: ${id}`)
      } else {
        cy.log(`Failed to delete test ${type} ${id}: ${response.status}`)
      }
    })
  }
})

/**
 * Generate unique test ID with prefix
 */
Cypress.Commands.add('generateTestId', (prefix) => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  const testId = `${prefix}-${timestamp}-${random}`
  return cy.wrap(testId)
})

// Add isTestData as a helper function (not a command)
Cypress.Commands.isTestData = (id, type) => {
  if (!id || typeof id !== 'string') return false
  
  const testPatterns = {
    pr: /^PR-\d+$/, // PR-{timestamp} - all PRs are test data if in Draft status
    project: /^TEST-(PROJ|UPDATE|DELETE)-/, // TEST-PROJ-, TEST-UPDATE-, TEST-DELETE-
    costCenter: /^TEST-CC-/, // TEST-CC-{timestamp}
    vendor: /^TEST-VENDOR-/, // TEST-VENDOR-{timestamp}
    user: /^TEST-USER-/, // TEST-USER-{timestamp}
  }
  
  const pattern = testPatterns[type]
  return pattern ? pattern.test(id) : false
}

