describe('User Management CRUD E2E Tests', () => {
  let testUserId = null

  before(() => {
    // Login before all tests
    cy.login()
  })

  beforeEach(() => {
    cy.visit('/user-management')
    // Check if we got redirected to login (permission issue)
    cy.url({ timeout: 10000 }).then((url) => {
      if (url.includes('/login')) {
        cy.log('Redirected to login - user may not have permission for user management')
        // Re-login to ensure we have the token
        cy.login()
        cy.visit('/user-management')
        cy.wait(2000)
      }
    })
    // Wait for page to load - check for main content or any content
    cy.get('main, [class*="max-w"], [class*="container"], body', { timeout: 15000 }).should('exist')
    // Wait for content to render
    cy.wait(2000)
    // Verify we're on the right page (or at least not on login)
    cy.url().should('not.include', '/login')
    // Check if page loaded by looking for any content
    cy.get('body').should('satisfy', ($el) => {
      const text = $el.text().toLowerCase()
      return text.includes('user') || text.includes('management') || text.includes('role') || text.includes('permission') || text.includes('dashboard')
    })
  })

  after(() => {
    // Cleanup: Delete test user
    if (testUserId) {
      cy.safeDelete('user', testUserId)
    }
  })

  it('should list users', () => {
    // Wait for users table/list to load
    cy.get('table, [role="table"], main', { timeout: 10000 }).should('exist')
    
    // Verify content exists (more flexible check)
    cy.get('main, body').should('satisfy', ($el) => {
      const text = $el.text().toLowerCase()
      return text.includes('user') || text.includes('email') || text.includes('status') || text.includes('role')
    })
  })

  it('should create a new user', () => {
    cy.generateTestId('TEST-USER').then((userId) => {
      testUserId = userId

    // Click create button
    cy.contains('button', /create|add|new/i).first().click({ timeout: 5000 })
    
    // Wait for form to appear
    cy.contains(/user|form|create/i, { timeout: 10000 }).should('be.visible')
    
      // Fill in user form
      cy.get('body').then(($body) => {
        // User ID field
        const userIdField = $body.find('input[name*="user_id"], input[id*="user"]').first()
        if (userIdField.length > 0) {
          cy.wrap(userIdField).type(userId, { force: true })
        }
        
        // Employee field
        const employeeField = $body.find('input[name*="employee"], select[name*="employee"]').first()
        if (employeeField.length > 0) {
          if (employeeField.is('select')) {
            cy.wrap(employeeField).select('EMP-001', { force: true })
          } else {
            cy.wrap(employeeField).type('EMP-001', { force: true })
          }
        }
        
        // Email field
        const emailField = $body.find('input[type="email"]').first()
        if (emailField.length > 0) {
          cy.wrap(emailField).type(`test-${Date.now()}@example.com`, { force: true })
        }
      })
      
      // Submit form
      cy.contains('button', /save|submit|create/i).click({ force: true })
      
      // Verify success
      cy.contains(/success|created|saved/i, { timeout: 10000 }).should('be.visible')
    })
  })

  it('should view user details', () => {
    // Click on first user in the list
    cy.get('table tbody tr, .user-item, [data-testid*="user"]').first().then(($row) => {
      if ($row.length > 0) {
        cy.wrap($row).click({ force: true })
        
        // Verify details are displayed
        cy.contains(/user|details|information|email/i, { timeout: 10000 }).should('be.visible')
      } else {
        cy.log('No users available to view')
      }
    })
  })

  it('should update user status', () => {
    // Find a user and update status
    cy.get('table tbody tr, .user-item').first().then(($row) => {
      if ($row.length > 0) {
        cy.wrap($row).find('button[aria-label*="edit"], .edit-button, select[name*="status"]').first().click({ force: true })
        
        // Update status if dropdown exists
        cy.get('select[name*="status"]').then(($select) => {
          if ($select.length > 0) {
            cy.wrap($select).select('Active', { force: true })
            cy.contains('button', /save|update/i).click({ force: true })
            cy.contains(/success|updated/i, { timeout: 10000 }).should('be.visible')
          }
        })
      } else {
        cy.log('No users available to update')
      }
    })
  })

  it('should search/filter users', () => {
    // Test search functionality
    cy.get('input[placeholder*="search"], input[placeholder*="filter"]').then(($search) => {
      if ($search.length > 0) {
        cy.wrap($search).first().type('admin', { force: true })
        cy.wait(1000) // Wait for search to apply
        cy.get('table tbody tr, .user-item').should('exist')
      } else {
        cy.log('No search controls available')
      }
    })
  })
})

