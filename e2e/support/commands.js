Cypress.Commands.add('logIn', (username, password) => {
  cy.get('#username')
    .clear()
    .type(username)

    .get('#password')
    .clear()
    .type(password)

    .get('form')
    .submit();
});
