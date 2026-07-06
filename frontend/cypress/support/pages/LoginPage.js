class LoginPage {
  // Elements / Getters
  get emailInput() {
    return cy.get('input[type="email"]');
  }

  get passwordInput() {
    return cy.get('input[type="password"]');
  }

  get submitButton() {
    return cy.get('button[type="submit"]');
  }

  get form() {
    return cy.get('form');
  }

  get errorContainer() {
    return cy.get('form').parent();
  }

  // Action Methods
  visit() {
    cy.visit('/login');
  }

  fillEmail(email) {
    this.emailInput.clear().type(email);
  }

  fillPassword(password) {
    this.passwordInput.clear().type(password);
  }

  submit() {
    this.submitButton.click();
  }

  // Combined flows
  login(email, password) {
    this.fillEmail(email);
    this.fillPassword(password);
    this.submit();
  }
}

export const loginPage = new LoginPage();
