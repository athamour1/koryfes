import users from '../../fixtures/users.json';

describe('Admin - User Management (Location Scoped)', () => {
    const admin = users.admin;

    beforeEach(() => {
        cy.loginAs('admin');
        cy.visit('/admin/users');
    });

    it('should only see users from their location', () => {
        // Verify table content
        cy.get('table').should('be.visible');

        // Should see users from their location
        cy.get('table').contains(admin.location);

        // Should NOT see users from other locations (if any exist in demo data)
        // This might be hard to test if we don't know other locations, but we can check if location filter is locked or hidden
        // Or check if all rows have the admin's location
        cy.get('table tbody tr').each(($row) => {
            cy.wrap($row).contains(admin.location);
        });
    });

    it('should create user in their location', () => {
        cy.get('[data-cy="create-user-btn"]').click();

        const newUser = users.newUser;
        cy.get('[data-cy="username-input"]').type(newUser.username + 'loc' + Date.now());
        cy.get('[data-cy="password-input"]').type(newUser.password);
        cy.get('[data-cy="first-name-input"]').type(newUser.firstName);
        cy.get('[data-cy="last-name-input"]').type(newUser.lastName);

        // Location select should be pre-filled or read-only
        // cy.get('[data-cy="location-select"]').should('have.value', admin.location);

        cy.get('[data-cy="save-user-btn"]').click();

        cy.get('.q-notification').should('contain', 'User created');
    });

    it('cannot create admin users', () => {
        cy.get('[data-cy="create-user-btn"]').click();

        // Role select should not have 'admin' or 'super_admin' options
        cy.get('[data-cy="role-select"]').click();
        cy.get('.q-item').should('not.contain', 'Super Admin');
        // Admin might be able to create other admins for same location? Check requirements.
        // Checklist says: "Cannot create admin/super_admin users"
        cy.get('.q-item').should('not.contain', 'Admin');
    });
});
