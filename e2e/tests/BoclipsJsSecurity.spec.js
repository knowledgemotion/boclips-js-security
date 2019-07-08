import uuid from 'uuid/v4';

describe('Login journey', function() {
  it('Creates account, logs in, and logs out', function() {
    const username = `${uuid()}@boclips.com`;
    const password = uuid();

    cy.visit('http://localhost:8081').debug();
    createAccount(username, password);

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

function createAccount(username, password) {
  cy.get('[data-qa="create-account"]').click();
  cy.get('[data-qa="first-name"]').type('test');
  cy.get('[data-qa="last-name"]').type('test');
  cy.get('[data-qa="email"]').type(username);
  cy.get('[data-qa="password"]').type(password);
  cy.get('[data-qa="password-confirm"]').type(password);
  cy.get('[data-qa="privacy-policy"]').click();
  cy.get('[data-qa="register-button"]').click();
  cy.get('h1.big-title');
}

function logIn(username, password) {
  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('#kc-form-login').submit();
  return this;
}
