describe('Super Admin - Dashboard', () => {
    beforeEach(() => {
        cy.loginAs('superAdmin');
        cy.visit('/admin/dashboard');
    });

    it('should display dashboard statistics', () => {
        // Check for 4 stats cards
        cy.get('[data-cy^="stat-card-"]').should('have.length', 4);

        // Check values are numbers
        cy.get('[data-cy^="stat-value-"]').each(($el) => {
            cy.wrap($el).invoke('text').should('match', /\d+/);
        });
    });

    it('should display charts', () => {
        cy.get('canvas').should('be.visible'); // Assuming Chart.js uses canvas
    });
});
