describe('Super Admin - Location Management', () => {
    beforeEach(() => {
        cy.loginAs('superAdmin');
        cy.visit('/admin/locations');
    });

    it('should display locations list', () => {
        cy.get('table').should('be.visible');
        cy.contains('Locations').should('be.visible');
    });

    it('should create a new location', () => {
        cy.get('[data-cy="create-location-btn"]').click();

        const locationName = 'Test Location ' + Date.now();
        cy.get('[data-cy="location-name-input"]').type(locationName);

        cy.get('[data-cy="save-location-btn"]').click();

        cy.get('.q-notification').should('contain', 'Location created');
        cy.contains(locationName).should('be.visible');
    });

    it('should update a location', () => {
        cy.get('table tbody tr').first().within(() => {
            cy.get('[data-cy="edit-btn"]').click();
        });

        cy.get('[data-cy="location-name-input"]').type(' Updated');
        cy.get('[data-cy="save-location-btn"]').click();

        cy.get('.q-notification').should('contain', 'Location updated');
    });

    it('should delete a location', () => {
        // Check delete confirmation
        cy.get('table tbody tr').last().within(() => {
            cy.get('[data-cy="delete-btn"]').click();
        });

        cy.contains('Are you sure').should('be.visible');
    });
});
