describe('Login journey', function () {
    it('Logs-in and logs-out', function () {
        cy.visit('http://localhost:8080').debug();
        logIn();

        cy.get('#header').then(node => node.text()).should('not.be.empty');
        cy.get('#content').then(node => node.text()).should('not.be.empty');

        cy.get('#logout').click();

        cy.get("#kc-form-login").then(node => node.text()).should('not.be.empty');
    });
});

function logIn() {
    cy.get("#username").type(Cypress.env("EDUCATORS_USERNAME"));
    cy.get("#password").type(Cypress.env("EDUCATORS_PASSWORD"));
    cy.get("#kc-form-login").submit();
    return this;
}