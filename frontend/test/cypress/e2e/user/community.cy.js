describe('Regular User - Community', () => {
    beforeEach(() => {
        cy.loginAs('user');
        cy.visit('/users');
    });

    it('should display community page', () => {
        cy.contains('Guides Community').should('be.visible');
    });

    it('should list other users', () => {
        cy.get('[data-cy="user-card"]').should('have.length.gt', 0);
    });

    it('should search users', () => {
        cy.get('[data-cy="search-input"]').type('admin');
        cy.wait(500);
        cy.get('[data-cy="user-card"]').should('contain', 'admin');
    });

    it('should view other user profile', () => {
        cy.get('[data-cy="user-card"]').first().click();
        cy.url().should('include', '/user/');
        cy.contains('Progress').should('be.visible');
    });
});
