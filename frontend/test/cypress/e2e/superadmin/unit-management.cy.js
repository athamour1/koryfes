describe('Super Admin - Unit Management', () => {
    beforeEach(() => {
        cy.loginAs('superAdmin');
        cy.visit('/admin/units');
    });

    it('should display units list', () => {
        cy.get('table').should('be.visible');
        cy.contains('Units').should('be.visible');
    });

    it('should filter units by location', () => {
        cy.get('[data-cy="location-filter"]').click();
        cy.contains('ΤΤ Μεγαρων').click();

        cy.get('table').contains('ΤΤ Μεγαρων');
    });

    it('should create a new unit', () => {
        cy.get('[data-cy="create-unit-btn"]').click();

        const unitName = 'Test Unit ' + Date.now();
        cy.get('[data-cy="unit-name-input"]').type(unitName);

        // Select location
        cy.get('[data-cy="location-select"]').click();
        cy.get('.q-item').first().click();

        cy.get('[data-cy="save-unit-btn"]').click();

        cy.get('.q-notification').should('contain', 'Unit created');
    });

    it('should update a unit', () => {
        cy.get('table tbody tr').first().within(() => {
            cy.get('[data-cy="edit-btn"]').click();
        });

        cy.get('[data-cy="unit-name-input"]').type(' Updated');
        cy.get('[data-cy="save-unit-btn"]').click();

        cy.get('.q-notification').should('contain', 'Unit updated');
    });
});
