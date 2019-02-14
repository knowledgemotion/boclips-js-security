describe('Login journey', function () {
    it('Logs-in and logs-out', function () {
        cy.visit('http://localhost:8081').debug();
        logIn();

        cy.get('#header').then(node => node.text()).should('not.be.empty');
        cy.wait(3000);
        cy.get('#content').then(node => node.text()).should('not.be.empty');

        cy.get('#logout').click();

        cy.get("#kc-form-login").then(node => node.text()).should('not.be.empty');
    });
});

function logIn() {
    cy.get("#username").type(Cypress.env("USERNAME"));
    cy.get("#password").type(Cypress.env("PASSWORD"));
    cy.get("#kc-form-login").submit();
    return this;
}