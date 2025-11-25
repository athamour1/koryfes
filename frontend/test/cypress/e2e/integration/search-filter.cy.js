describe('Integration - Search & Filter', () => {
    beforeEach(() => {
        cy.loginAs('superAdmin');
    });

    it('should filter users and units consistently', () => {
        const location = 'ΤΤ Μεγαρων';

        // 1. Filter Users
        cy.visit('/admin/users');
        cy.get('[data-cy="location-filter"]').click();
        cy.contains(location).click();
        cy.get('table tbody tr').should('have.length.gt', 0);
        cy.get('table').contains(location);

        // 2. Filter Units
        cy.visit('/admin/units');
        cy.get('[data-cy="location-filter"]').click();
        cy.contains(location).click();
        cy.get('table tbody tr').should('have.length.gt', 0);
        cy.get('table').contains(location);
    });

    it('should search across pages', () => {
        const searchTerm = 'admin';

        cy.visit('/admin/users');
        cy.get('[data-cy="search-input"]').type(searchTerm);
        cy.wait(500);
        cy.get('table').contains(searchTerm);
    });
});
