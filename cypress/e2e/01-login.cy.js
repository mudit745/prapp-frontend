describe('Signin E2E Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage()
    cy.visit('/login')
  })

  it('should display Signin page', () => {
    cy.contains('Sign in').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('should Signin successfully with valid credentials', () => {
    cy.get('input[type="email"]').type(Cypress.env('testUserEmail'))
    cy.get('button[type="submit"]').click()
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')
    cy.window().its('localStorage.token').should('exist')
  })

  it('should show error for invalid email', () => {
    cy.get('input[type="email"]').type('invalid@example.com')
    cy.get('button[type="submit"]').click()
    
    // Wait for error message to appear - check for error div or any error text
    cy.get('.bg-red-50, .bg-red-900, [class*="red"]', { timeout: 10000 }).should('exist').then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).should('be.visible')
      } else {
        // Fallback: check if page still shows login (didn't redirect) or has error text
        cy.url().should('include', '/login')
        cy.get('body').should('satisfy', ($body) => {
          const text = $body.text().toLowerCase()
          return text.includes('failed') || text.includes('error') || text.includes('invalid') || text.includes('not found')
        })
      }
    })
  })

  it('should require email field', () => {
    cy.get('button[type="submit"]').click()
    
    // Should show validation error or prevent submission
    cy.get('input[type="email"]').should('have.attr', 'required')
  })
})

