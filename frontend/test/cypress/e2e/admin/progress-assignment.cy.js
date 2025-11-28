describe('Admin - Progress Assignment', () => {
    beforeEach(() => {
        cy.loginAs('admin');
        // Navigate to a user profile in their location to award progress
        // Or use a dedicated progress assignment page if exists
        cy.visit('/admin/users');
    });

    it('should award Promise peak to user', () => {
        // Select a user
        cy.get('table tbody tr').first().within(() => {
            cy.get('[data-cy="view-profile-btn"]').click();
        });

        // Check if we are on user profile
        cy.url().should('include', '/user/');

        // Award Promise
        cy.contains('Award Promise').click();
        cy.get('.q-dialog').should('be.visible');
        cy.get('.q-dialog button').contains('Confirm').click();

        cy.get('.q-notification').should('contain', 'Promise awarded');
    });

    it('cannot modify progress definitions', () => {
        // Try to access progress management page
        cy.visit('/admin/progress');

        // Should be redirected or show error
        cy.url().should('not.include', '/admin/progress');
    });
});
