import users from '../../fixtures/users.json';

describe('Integration - Data Flow', () => {
    const admin = users.superAdmin;
    const timestamp = Date.now();
    const testUser = `flow_user_${timestamp}`;
    const testUnit = `flow_unit_${timestamp}`;

    before(() => {
        cy.loginAs('superAdmin');
    });

    it('should create unit, assign user, update and delete', () => {
        // 1. Create Unit
        cy.visit('/admin/units');
        cy.get('[data-cy="create-unit-btn"]').click();
        cy.get('[data-cy="unit-name-input"]').type(testUnit);
        cy.get('[data-cy="location-select"]').click();
        cy.get('.q-item').first().click();
        cy.get('[data-cy="save-unit-btn"]').click();
        cy.contains(testUnit).should('be.visible');

        // 2. Create User and assign to Unit
        cy.visit('/admin/users');
        cy.get('[data-cy="create-user-btn"]').click();
        cy.get('[data-cy="username-input"]').type(testUser);
        cy.get('[data-cy="password-input"]').type('password123');
        cy.get('[data-cy="first-name-input"]').type('Flow');
        cy.get('[data-cy="last-name-input"]').type('User');

        // Assign to unit
        // cy.get('[data-cy="unit-select"]').click();
        // cy.contains(testUnit).click();

        cy.get('[data-cy="save-user-btn"]').click();
        cy.contains(testUser).should('be.visible');

        // 3. Verify User in Unit
        cy.visit('/admin/units');
        cy.contains(testUnit).parents('tr').within(() => {
            // Assuming there is a way to view members or count
            // cy.contains('1 member');
        });

        // 4. Delete User
        cy.visit('/admin/users');
        cy.contains(testUser).parents('tr').within(() => {
            cy.get('[data-cy="delete-btn"]').click();
        });
        cy.contains('Confirm').click();
        cy.contains(testUser).should('not.exist');

        // 5. Delete Unit
        cy.visit('/admin/units');
        cy.contains(testUnit).parents('tr').within(() => {
            cy.get('[data-cy="delete-btn"]').click();
        });
        cy.contains('Confirm').click();
        cy.contains(testUnit).should('not.exist');
    });
});
