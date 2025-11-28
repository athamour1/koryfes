describe('Super Admin - Progress Management', () => {
    beforeEach(() => {
        cy.loginAs('superAdmin');
        cy.visit('/admin/progress');
    });

    it('should display progress tabs', () => {
        cy.contains('Peaks').should('be.visible');
        cy.contains('Paths').should('be.visible');
        cy.contains('Diplomas').should('be.visible');
    });

    it('should manage peaks', () => {
        cy.contains('Peaks').click();
        cy.get('[data-cy="create-peak-btn"]').should('be.visible');

        // Verify existing peaks
        cy.contains('Promise').should('be.visible');
        cy.contains('Bronze').should('be.visible');
        cy.contains('Silver').should('be.visible');
        cy.contains('Gold').should('be.visible');
    });

    it('should manage paths', () => {
        cy.contains('Paths').click();
        cy.get('[data-cy="create-path-btn"]').should('be.visible');

        // Check list visibility
        cy.get('.q-list').should('be.visible');
    });

    it('should manage diplomas', () => {
        cy.contains('Diplomas').click();
        cy.get('[data-cy="create-diploma-btn"]').should('be.visible');
    });
});
