describe('login journey', function () {
  const username = Cypress.env('USERNAME');
  const password = Cypress.env('PASSWORD');

  beforeEach(() => {
    if (username === undefined || password === undefined) {
      throw new Error('Must set CYPRESS_USERNAME and CYPRESS_PASSWORD');
    }
  });

  it('logs in and out', () => {
    cy.visit('http://localhost:8081').logIn(username, password);
    cy.contains('WORKS');
    cy.get('#logout').click().get('#kc-form-login');
  });

  it('can log in using username and password instead of prompting user', () => {
    cy.visit('http://localhost:8081/autologin.html').contains(
      'Not entered yet',
    );

    cy.logIn('wrong username', 'wrong password');
    cy.contains('Authentication failure!');

    cy.logIn(username, password);
    cy.contains('Successful authentication!');
  });
});
