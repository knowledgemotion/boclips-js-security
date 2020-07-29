import uuid from 'uuid/v4';

describe('login journey', function () {
  const username = Cypress.env('USERNAME');
  const password = Cypress.env('PASSWORD');

  beforeEach(() => {
    if (username === undefined || password === undefined) {
      throw new Error('Must set CYPRESS_USERNAME and CYPRESS_PASSWORD');
    }
  });

  it('logs in and out', function () {
    cy.visit('http://localhost:8081').debug();
    logIn(username, password);

    cy.get('#header')
      .then((node) => node.text())
      .should('not.be.empty');
    cy.wait(3000);
    cy.get('#content')
      .then((node) => node.text())
      .should('not.be.empty');

    cy.get('#logout').click();

    cy.get('#kc-form-login')
      .then((node) => node.text())
      .should('not.be.empty');
  });

  it('can log in using username and password instead of prompting user', function () {
    cy.visit('http://localhost:8081/autologin.html').debug();
    cy.contains('Not entered yet');
    logIn('wrong-user', 'wrong-password');
    cy.contains('Authentication failure!');
    logIn(username, password);
    cy.contains('Successful authentication!');
  });
});

function logIn(username, password) {
  cy.get('#username').clear().type(username);
  cy.get('#password').clear().type(password);
  cy.get('#kc-form-login').submit();
  return this;
}
