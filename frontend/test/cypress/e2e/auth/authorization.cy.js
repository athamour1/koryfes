import users from '../../fixtures/users.json';

describe('Authentication - Authorization', () => {

    context('Unauthenticated User', () => {
        it('should redirect to login when accessing protected route', () => {
            cy.visit('/profile');
            cy.url().should('include', '/login');
        });

        it('should redirect to login when accessing admin route', () => {
            cy.visit('/admin/dashboard');
            cy.url().should('include', '/login');
        });
    });

    context('Regular User', () => {
        beforeEach(() => {
            cy.loginAs('user');
        });

        it('can access profile page', () => {
            cy.visit('/profile');
            cy.url().should('include', '/profile');
        });

        it('cannot access super admin routes', () => {
            cy.visit('/admin/locations');
            // Should be redirected to 404 or home or show error
            // Depending on app implementation, usually 404 or home
            cy.get('body').then(($body) => {
                if ($body.text().includes('404')) {
                    cy.contains('404').should('exist');
                } else {
                    cy.url().should('not.include', '/admin/locations');
                }
            });
        });
    });

    context('Unit Leader', () => {
        beforeEach(() => {
            cy.loginAs('unitLeader');
        });

        it('can access my unit page', () => {
            cy.visit('/my-unit');
            cy.url().should('include', '/my-unit');
        });
    });

    context('Admin (Location Admin)', () => {
        beforeEach(() => {
            cy.loginAs('admin');
        });

        it('can access admin dashboard', () => {
            cy.visit('/admin/dashboard');
            cy.url().should('include', '/admin/dashboard');
        });

        it('cannot access super admin locations page', () => {
            cy.visit('/admin/locations');
            cy.url().should('not.include', '/admin/locations');
        });
    });

    context('Super Admin', () => {
        beforeEach(() => {
            cy.loginAs('superAdmin');
        });

        it('can access all admin routes', () => {
            cy.visit('/admin/dashboard');
            cy.url().should('include', '/admin/dashboard');

            cy.visit('/admin/users');
            cy.url().should('include', '/admin/users');

            cy.visit('/admin/locations');
            cy.url().should('include', '/admin/locations');
        });
    });
});
