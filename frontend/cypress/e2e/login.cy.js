import { loginPage } from '../support/pages/LoginPage';

describe('Login Page E2E Tests (POM)', () => {
  beforeEach(() => {
    // Visit the login page using the Page Object method
    loginPage.visit();
  });

  it('should display the login form and its elements', () => {
    loginPage.form.should('exist');
    loginPage.emailInput.should('exist');
    loginPage.passwordInput.should('exist');
    loginPage.submitButton.should('contain', 'Sign In');
  });

  it('should show validation errors for empty fields', () => {
    // Submit empty form using Page Object method
    loginPage.submit();
    
    // Check validation error messages (React Hook Form / Zod)
    loginPage.form.should('contain', 'Please enter a valid email address');
  });

  it('should show validation error for invalid email format', () => {
    loginPage.fillEmail('notanemail');
    loginPage.submit();
    loginPage.form.should('contain', 'Please enter a valid email address');
  });

  it('should show validation error for short password', () => {
    loginPage.fillEmail('test@university.edu');
    loginPage.fillPassword('123');
    loginPage.submit();
    loginPage.form.should('contain', 'Password must be at least 6 characters');
  });

  it('should show error banner when authentication fails (API Error)', () => {
    // Mock a 401 Unauthorized response from backend
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { error: 'Invalid email or password' },
    }).as('loginFail');

    loginPage.login('wrong@university.edu', 'wrongpassword');

    cy.wait('@loginFail');
    
    // Verify error banner is displayed
    loginPage.errorContainer.should('contain', 'Invalid email or password');
  });

  it('should disable submit button and show loading state during request', () => {
    // Intercept with a delay to observe the loading state
    cy.intercept('POST', '**/auth/login', {
      delay: 1000,
      statusCode: 200,
      body: { accessToken: 'token', user: { role: 'ADMIN' } }
    }).as('loginDelay');

    loginPage.login('test@university.edu', 'password123');

    // Verify loading state is shown
    loginPage.submitButton.should('be.disabled');
    loginPage.submitButton.should('contain', 'Signing in...');

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

    loginPage.login('test@university.edu', 'password123');

    // Verify it intercepted the API request
    cy.wait('@loginRequest');

    // Verify token is set in localStorage
    cy.window().then((window) => {
      expect(window.localStorage.getItem('token')).to.equal('mocked-jwt-token-12345');
    });
  });
});
