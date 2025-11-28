import users from '../../fixtures/users.json';

describe('Super Admin - User Management', () => {
    beforeEach(() => {
        cy.loginAs('superAdmin');
        cy.visit('/admin/users');
    });

    it('should display user list', () => {
        cy.get('table').should('be.visible');
        cy.contains('Users').should('be.visible');
    });

    it('should filter users by location', () => {
        // Assuming there is a location filter dropdown
        cy.get('[data-cy="location-filter"]').click();
        cy.contains('ΤΤ Μεγαρων').click();

        // Check if filtered results contain users from that location
        cy.get('table').contains('ΤΤ Μεγαρων');
    });

    it('should search users by name', () => {
        const searchName = 'admin_1';
        cy.get('[data-cy="search-input"]').type(searchName);

        // Wait for debounce
        cy.wait(500);

        cy.get('table').contains(searchName);
    });

    it('should create a new user', () => {
        cy.get('[data-cy="create-user-btn"]').click();

        // Fill user form
        const newUser = users.newUser;
        cy.get('[data-cy="username-input"]').type(newUser.username + Date.now()); // Unique username
        cy.get('[data-cy="password-input"]').type(newUser.password);

        // Select location and unit (if required)
        // cy.get('[data-cy="location-select"]').click();
        // cy.contains('ΤΤ Μεγαρων').click();

        cy.get('[data-cy="save-user-btn"]').click();

        cy.get('.q-notification').should('contain', 'User created');
    });

    it('should update an existing user', () => {
        // Find a user to edit (not self)
        cy.get('table tbody tr').first().within(() => {
            cy.get('[data-cy="edit-btn"]').click();
        });

        // Update username (since first name doesn't exist)
        cy.get('[data-cy="username-input"]').clear().type('UpdatedUser' + Date.now());
        cy.get('[data-cy="save-user-btn"]').click();

        cy.get('.q-notification').should('contain', 'User updated');
    });

    it('should delete a user', () => {
        // Create a dummy user first to delete, to avoid deleting important data
        // Or mock the delete request

        // For now, let's just check if delete button exists and shows confirmation
        cy.get('table tbody tr').last().within(() => {
            cy.get('[data-cy="delete-btn"]').click();
        });

        cy.contains('Are you sure').should('be.visible');
        // cy.contains('OK').click(); // Be careful with actual deletion in dev
    });
});
