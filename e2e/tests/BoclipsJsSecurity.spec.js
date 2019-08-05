import uuid from 'uuid/v4';

describe('Login journey', function() {
  it('Creates account, logs in, and logs out', function() {
    const username = Cypress.env('USERNAME');
    const password = Cypress.env('PASSWORD');

    cy.visit('http://localhost:8081').debug();
    logIn(username, password);

    cy.get('#header')
      .then(node => node.text())
      .should('not.be.empty');
    cy.wait(3000);
    cy.get('#content')
      .then(node => node.text())
      .should('not.be.empty');

    cy.get('#logout').click();

    cy.get('#kc-form-login')
      .then(node => node.text())
      .should('not.be.empty');
  });
});

function logIn(username, password) {
  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('#kc-form-login').submit();
  return this;
}
