import users from '../../fixtures/users.json';

describe('Admin - Unit Management (Location Scoped)', () => {
    const admin = users.admin;

    beforeEach(() => {
        cy.loginAs('admin');
        cy.visit('/admin/units');
    });

    it('should only see units from their location', () => {
        cy.get('table').should('be.visible');

        // Verify all displayed units belong to admin's location
        cy.get('table tbody tr').each(($row) => {
            cy.wrap($row).contains(admin.location);
        });
    });

    it('should create unit in their location', () => {
        cy.get('[data-cy="create-unit-btn"]').click();

        const unitName = 'Loc Unit ' + Date.now();
        cy.get('[data-cy="unit-name-input"]').type(unitName);

        // Location should be auto-selected

        cy.get('[data-cy="save-unit-btn"]').click();

        cy.get('.q-notification').should('contain', 'Unit created');
    });
});
