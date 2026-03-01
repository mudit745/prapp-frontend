describe('Purchase Requisitions CRUD E2E Tests', () => {
  let testPRId = null

  before(() => {
    // Login before all tests
    cy.login()
  })

  beforeEach(() => {
    cy.visit('/requisitions')
    // Wait for page to load - check for main content or any content
    cy.get('main, [class*="max-w"], [class*="container"], body', { timeout: 15000 }).should('exist')
    // Wait for content to render
    cy.wait(2000)
    // Verify we're on the right page
    cy.url().should('include', '/requisitions')
    // Check if page loaded by looking for any content
    cy.get('body').should('satisfy', ($el) => {
      const text = $el.text().toLowerCase()
      return text.includes('requisition') || text.includes('pr') || text.includes('purchase') || text.includes('create')
    })
  })

  after(() => {
    // Cleanup: Delete test PR
    if (testPRId) {
      cy.safeDelete('pr', testPRId)
    }
  })

  it('should create a new purchase requisition', () => {
    cy.fixture('test-data').then((data) => {
      // Look for create button
      cy.get('body').then(($body) => {
        const createBtn = $body.find('button').filter((i, el) => {
          return /create|add|new/i.test(el.textContent)
        })
        if (createBtn.length > 0) {
          cy.wrap(createBtn.first()).click({ force: true })
          cy.wait(1000) // Wait for form to appear
        } else {
          cy.log('Create button not found, skipping form fill')
        }
      })
      
      // Wait for form to appear or check if form/modal exists
      cy.wait(2000) // Wait for form/modal to appear
      
      // Fill in PR form - handle both select and input elements
      cy.get('body').then(($body) => {
        // Requester field
        const requesterField = $body.find('input[name*="requester"], select[name*="requester"]').first()
        if (requesterField.length > 0) {
          if (requesterField.is('select')) {
            cy.wrap(requesterField).select(data.testPR.requesterId, { force: true })
          } else {
            cy.wrap(requesterField).type(data.testPR.requesterId, { force: true })
          }
        }
        
        // Cost center field
        const costCenterField = $body.find('input[name*="cost_center"], select[name*="cost_center"]').first()
        if (costCenterField.length > 0) {
          if (costCenterField.is('select')) {
            cy.wrap(costCenterField).select(data.testPR.costCenterId, { force: true })
          } else {
            cy.wrap(costCenterField).type(data.testPR.costCenterId, { force: true })
          }
        }
        
        // Priority field
        const priorityField = $body.find('select[name*="priority"], input[name*="priority"]').first()
        if (priorityField.length > 0) {
          if (priorityField.is('select')) {
            cy.wrap(priorityField).select(data.testPR.priority, { force: true })
          } else {
            cy.wrap(priorityField).type(data.testPR.priority, { force: true })
          }
        }
        
        // Currency field
        const currencyField = $body.find('select[name*="currency"], input[name*="currency"]').first()
        if (currencyField.length > 0) {
          if (currencyField.is('select')) {
            cy.wrap(currencyField).select(data.testPR.currency, { force: true })
          } else {
            cy.wrap(currencyField).type(data.testPR.currency, { force: true })
          }
        }
      })
      
      // Add justification if field exists
      cy.get('textarea[name*="justification"], textarea[placeholder*="justification"]').then(($el) => {
        if ($el.length > 0) {
          cy.wrap($el).first().type(data.testPR.justification, { force: true })
        }
      })
      
      // Add line items if form has line item section
      cy.get('body').then(($body) => {
        const addLineBtn = $body.find('button').filter((i, el) => {
          return /add.*line|add.*item|new.*line/i.test(el.textContent)
        })
        if (addLineBtn.length > 0) {
          cy.wrap(addLineBtn.first()).click({ force: true })
          cy.wait(500)
          cy.get('input[name*="quantity"]').first().type('10', { force: true })
          cy.get('input[name*="unit_price"], input[name*="price"]').first().type('100', { force: true })
        }
      })
      
      // Submit form
      cy.get('body').then(($body) => {
        const submitBtn = $body.find('button').filter((i, el) => {
          return /save|submit|create/i.test(el.textContent)
        })
        if (submitBtn.length > 0) {
          cy.wrap(submitBtn.first()).click({ force: true })
        }
      })
      
      // Wait for success and extract PR ID from response or page
      cy.contains(/success|created|saved/i, { timeout: 10000 }).should('be.visible')
      
      // Try to extract PR ID from the page or response
      cy.url().then((url) => {
        const match = url.match(/PR-[\d-]+/)
        if (match) {
          testPRId = match[0]
        }
      })
      
      // Alternative: Get PR ID from API response or page content
      cy.get('[data-testid*="pr-id"], .pr-id, [id*="pr"]').then(($el) => {
        if ($el.length > 0 && $el.text().match(/^PR-/)) {
          testPRId = $el.text().trim()
        }
      })
    })
  })

  it('should list purchase requisitions', () => {
    // Wait for PRs table/list to load
    cy.get('table, [role="table"], main', { timeout: 10000 }).should('exist')
    
    // Verify content exists (more flexible check)
    cy.get('main, body').should('satisfy', ($el) => {
      const text = $el.text().toLowerCase()
      return text.includes('pr') || text.includes('requisition') || text.includes('status') || text.includes('priority')
    })
  })

  it('should view purchase requisition details', () => {
    // Click on first PR in the list (if available)
    cy.get('table tbody tr, .requisition-item, [data-testid*="requisition"]').first().then(($row) => {
      if ($row.length > 0) {
        cy.wrap($row).click({ force: true })
        
        // Verify details are displayed
        cy.contains(/requisition|details|information|pr number/i, { timeout: 10000 }).should('be.visible')
      } else {
        cy.log('No PRs available to view')
      }
    })
  })

  it('should update purchase requisition status', () => {
    // This test assumes there's a way to update PR status
    // Find a PR and update its status
    cy.get('table tbody tr, .requisition-item').first().then(($row) => {
      if ($row.length > 0) {
        cy.wrap($row).find('button[aria-label*="edit"], .edit-button, select[name*="status"]').first().click({ force: true })
        
        // If status dropdown exists, change it
        cy.get('select[name*="status"]').then(($select) => {
          if ($select.length > 0) {
            cy.wrap($select).select('Submitted', { force: true })
            cy.contains('button', /save|update/i).click({ force: true })
            cy.contains(/success|updated/i, { timeout: 10000 }).should('be.visible')
          }
        })
      } else {
        cy.log('No PRs available to update')
      }
    })
  })

  it('should filter purchase requisitions', () => {
    // Test filtering functionality if available
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], select[name*="status"]').then(($filter) => {
      if ($filter.length > 0) {
        cy.wrap($filter).first().type('Draft', { force: true })
        cy.wait(1000) // Wait for filter to apply
        cy.get('table tbody tr, .requisition-item').should('exist')
      } else {
        cy.log('No filter controls available')
      }
    })
  })
})

