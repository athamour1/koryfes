describe('Regular User - Avatar Editor', () => {
    beforeEach(() => {
        cy.loginAs('user');
        cy.visit('/profile');
        cy.get('[data-cy="customize-avatar-btn"]').click();
    });

    it('should display avatar options', () => {
        cy.contains('Skin').should('be.visible');
        cy.contains('Eyes').should('be.visible');
        cy.contains('Hair').should('be.visible');
        // Note: Clothing option has been removed as all avatars now have white shirts
    });

    it('should change avatar appearance', () => {
        // Change skin tone
        cy.contains('Skin').click();
        cy.get('.q-color-picker').should('be.visible'); // Assuming color picker
        // Or selecting from a list
        // cy.get('[data-cy="option-item"]').first().click();

        // Check if preview updates (might be hard to check visually without visual regression)
        // But we can check if save button is enabled
        cy.get('[data-cy="save-avatar-btn"]').should('be.enabled');
    });

    it('should randomize avatar', () => {
        cy.get('[data-cy="randomize-avatar-btn"]').click();
        // Verify changes
    });

    it('should save avatar changes', () => {
        cy.get('[data-cy="save-avatar-btn"]').click();
        cy.get('.q-notification').should('contain', 'Avatar saved');
        cy.get('.q-dialog').should('not.exist');
    });
});
