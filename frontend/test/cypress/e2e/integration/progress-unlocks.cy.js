import users from '../../fixtures/users.json';

describe('Integration - Progress Unlocks', () => {
    const admin = users.superAdmin;
    const timestamp = Date.now();
    const testUser = `progress_user_${timestamp}`;

    before(() => {
        cy.loginAs('superAdmin');
        // Create a test user for progress testing
        cy.visit('/admin/users');
        cy.get('[data-cy="create-user-btn"]').click();
        cy.get('[data-cy="username-input"]').type(testUser);
        cy.get('[data-cy="password-input"]').type('password123');
        cy.get('[data-cy="first-name-input"]').type('Progress');
        cy.get('[data-cy="last-name-input"]').type('Test');
        cy.get('[data-cy="save-user-btn"]').click();
    });

    after(() => {
        // Cleanup
        cy.visit('/admin/users');
        cy.contains(testUser).parents('tr').find('[data-cy="delete-btn"]').click();
        cy.contains('Confirm').click();
    });

    it('should unlock peaks automatically', () => {
        // 1. Award Promise
        cy.visit('/admin/users');
        cy.contains(testUser).parents('tr').find('[data-cy="view-profile-btn"]').click();
        cy.contains('Award Promise').click();
        cy.contains('Confirm').click();
        cy.contains('Promise').should('have.class', 'unlocked'); // Assuming class or visual indicator

        // 2. Award Paths for Bronze (4 paths)
        // This loop might need adjustment based on actual UI for awarding paths
        for (let i = 0; i < 4; i++) {
            cy.get('[data-cy="award-path-btn"]').click();
            cy.get('.q-item').eq(i).click(); // Select different paths
            cy.contains('Confirm').click();
        }

        // 3. Verify Bronze Unlock
        cy.reload();
        cy.contains('Bronze').should('have.class', 'unlocked');
    });
});
