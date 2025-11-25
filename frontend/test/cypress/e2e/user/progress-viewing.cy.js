describe('Regular User - Progress Viewing', () => {
    beforeEach(() => {
        cy.loginAs('user');
        cy.visit('/my-progress');
    });

    it('should display progress overview', () => {
        cy.contains('My Progress').should('be.visible');
        cy.contains('Current Peak').should('be.visible');
    });

    it('should display peaks', () => {
        cy.get('[data-cy="peak-card"]').should('have.length.at.least', 1);
    });

    it('should display paths', () => {
        cy.contains('Paths').should('be.visible');
        cy.get('[data-cy="path-item"]').should('exist');
    });

    it('should display diplomas', () => {
        cy.contains('Diplomas').should('be.visible');
    });
});
