describe('Login Page E2E Tests', () => {
  beforeEach(() => {
    // Visit the login page
    cy.visit('/login');
  });

  it('should display the login form and its elements', () => {
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Sign In');
  });

  it('should show validation errors for empty fields', () => {
    // Submit empty form
    cy.get('button[type="submit"]').click();
    
    // Check validation error messages (React Hook Form / Zod)
    cy.get('form').should('contain', 'Please enter a valid email address');
  });

  it('should show validation error for invalid email format', () => {
    cy.get('input[type="email"]').type('notanemail');
    cy.get('button[type="submit"]').click();
    cy.get('form').should('contain', 'Please enter a valid email address');
  });

  it('should show validation error for short password', () => {
    cy.get('input[type="email"]').type('test@university.edu');
    cy.get('input[type="password"]').type('123');
    cy.get('button[type="submit"]').click();
    cy.get('form').should('contain', 'Password must be at least 6 characters');
  });

  it('should show error banner when authentication fails (API Error)', () => {
    // Mock a 401 Unauthorized response from backend
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { error: 'Invalid email or password' },
    }).as('loginFail');

    cy.get('input[type="email"]').type('wrong@university.edu');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFail');
    
    // Verify error banner is displayed
    cy.get('form').parent().should('contain', 'Invalid email or password');
  });

  it('should disable submit button and show loading state during request', () => {
    // Intercept with a delay to observe the loading state
    cy.intercept('POST', '**/auth/login', {
      delay: 1000,
      statusCode: 200,
      body: { accessToken: 'token', user: { role: 'ADMIN' } }
    }).as('loginDelay');

    cy.get('input[type="email"]').type('test@university.edu');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Verify loading state is shown
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('button[type="submit"]').should('contain', 'Signing in...');

    cy.wait('@loginDelay');
  });

  it('should mock a successful login', () => {
    // Mock the /auth/login POST request
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'mocked-jwt-token-12345',
        user: {
          id: 'mock-user-uuid',
          email: 'test@university.edu',
          role: 'ADMIN',
        },
      },
    }).as('loginRequest');

    // Fill form and submit
    cy.get('input[type="email"]').type('test@university.edu');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Verify it intercepted the API request
    cy.wait('@loginRequest');

    // Verify token is set in localStorage
    cy.window().then((window) => {
      expect(window.localStorage.getItem('token')).to.equal('mocked-jwt-token-12345');
    });
  });
});
