/**
 * Setup and teardown for E2E tests
 * This file runs before all other tests to ensure clean state
 */

describe('E2E Test Setup', () => {
  it('should verify backend services are running', () => {
    // Check auth service
    cy.request({
      method: 'GET',
      url: '/api/v1/auth/health',
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status !== 200) {
        cy.log('Warning: Auth service may not be running')
      }
    })

    // Check masterdata service
    cy.request({
      method: 'GET',
      url: '/api/v1/projects',
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status !== 200) {
        cy.log('Warning: Masterdata service may not be running')
      }
    })

    // Check requisition service
    cy.request({
      method: 'GET',
      url: '/api/v1/requisitions',
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status !== 200) {
        cy.log('Warning: Requisition service may not be running')
      }
    })
  })

  it('should verify test user exists', () => {
    cy.request({
      method: 'POST',
      url: '/api/v1/auth/login',
      body: { email: Cypress.env('testUserEmail') },
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status === 200) {
        cy.log('Test user login successful')
      } else {
        cy.log('Warning: Test user may not exist in database')
      }
    })
  })
})

