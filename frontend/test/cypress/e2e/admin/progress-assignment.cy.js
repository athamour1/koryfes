describe('Admin - Progress Assignment', () => {
    beforeEach(() => {
        cy.loginAs('admin');
        cy.visit('/admin/users');
    });

    it('gives the Promise and awards a path from the user dialog', () => {
        cy.contains('table tbody tr', 'user').within(() => {
            cy.get('[data-cy="edit-btn"]').click();
        });

        cy.get('[data-cy="add-path-btn"]').should('be.visible');
        cy.get('.q-dialog').then(($dialog) => {
            // the Promise may already have been given in an earlier run
            if ($dialog.find('[data-cy="give-promise-btn"]').length) {
                cy.get('[data-cy="give-promise-btn"]').click();
            }
        });
        cy.get('[data-cy="add-path-btn"]').click();

        cy.get('[data-cy="award-select"]').click();
        cy.get('.q-menu .q-item').not('.text-primary').first().click();
        cy.get('[data-cy="award-confirm-btn"]').click();
        cy.get('.q-notification').should('be.visible');
    });

    it('can view the catalog but not edit it', () => {
        cy.visit('/admin/progress');
        cy.url().should('include', '/admin/progress');
        cy.get('[data-cy="create-path-btn"]').should('not.exist');
    });
});
