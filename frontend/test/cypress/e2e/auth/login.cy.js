import users from '../../fixtures/users.json';

describe('Authentication - Login', () => {
    beforeEach(() => {
        // Clear local storage to ensure clean state
        cy.clearLocalStorage();
        cy.visit('/login');
    });

    it('should display login form correctly', () => {
        cy.get('[data-cy="username-input"]').should('be.visible');
        cy.get('[data-cy="password-input"]').should('be.visible');
        cy.get('[data-cy="login-btn"]').should('be.visible');
    });

    it('should show error with invalid credentials', () => {
        cy.get('[data-cy="username-input"]').type('wronguser');
        cy.get('[data-cy="password-input"]').type('wrongpass');
        cy.get('[data-cy="login-btn"]').click();

        cy.get('.q-notification').should('be.visible').and('contain', 'Invalid credentials');
    });

    // Test login for each role
    Object.entries(users).forEach(([role, user]) => {
        if (role === 'newUser') return; // Skip new user for login tests

        it(`should login successfully as ${role}`, () => {
            cy.get('[data-cy="username-input"]').type(user.username);
            cy.get('[data-cy="password-input"]').type(user.password);
            cy.get('[data-cy="login-btn"]').click();

            // Should redirect to home or dashboard
            cy.url().should('not.include', '/login');

            // Check if token is stored
            cy.window().its('localStorage.token').should('exist');

            // Verify user specific redirection or element
            if (role === 'superAdmin') {
                cy.url().should('include', '/admin');
            }
        });
    });

    it('should persist session after refresh', () => {
        const user = users.user;
        cy.login(user.username, user.password);
        cy.visit('/');

        cy.reload();

        // Should still be logged in
        cy.checkAuth();
        cy.url().should('not.include', '/login');
    });

    it('should logout successfully', () => {
        const user = users.user;
        cy.login(user.username, user.password);
        cy.visit('/');

        // Click logout button in drawer
        // Ensure drawer is open if on mobile, but for now assume desktop or accessible
        cy.get('[data-cy="nav-logout"]').click();

        cy.url().should('include', '/login');
        cy.window().its('localStorage.token').should('not.exist');
    });
});
