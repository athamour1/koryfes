describe('Regular User - Profile Management', () => {
    beforeEach(() => {
        cy.loginAs('user');
        cy.visit('/profile');
    });

    it('should display user profile', () => {
        cy.contains('My Profile').should('be.visible');
        cy.get('[data-cy="user-avatar"]').should('be.visible');
        cy.get('[data-cy="user-name"]').should('be.visible');
    });

    it('should update user name', () => {
        cy.get('[data-cy="edit-profile-btn"]').click();

        cy.get('[data-cy="first-name-input"]').clear().type('NewName');
        cy.get('[data-cy="save-profile-btn"]').click();

        cy.get('.q-notification').should('contain', 'Profile updated');
        cy.contains('NewName').should('be.visible');
    });

    it('should open avatar editor', () => {
        cy.get('[data-cy="customize-avatar-btn"]').click();
        cy.get('.q-dialog').should('be.visible');
        cy.contains('Avatar Editor').should('be.visible');
    });
});
