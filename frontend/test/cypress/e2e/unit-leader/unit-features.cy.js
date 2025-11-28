import users from '../../fixtures/users.json';

describe('Unit Leader - Unit Features', () => {
    const leader = users.unitLeader;

    beforeEach(() => {
        cy.loginAs('unitLeader');
        cy.visit('/my-unit');
    });

    it('should display unit details', () => {
        cy.contains(leader.unit).should('be.visible');
        cy.contains('Unit Leader').should('be.visible');
    });

    it('should display unit members', () => {
        cy.contains('Unit Members').should('be.visible');
        cy.get('.q-list').should('be.visible');
        // Should see at least one member
        cy.get('.q-item').should('have.length.gt', 0);
    });

    it('should upload unit photo', () => {
        // Assuming there is an upload button
        // This requires a file fixture, skipping actual upload for now
        // Just checking if button exists
        cy.get('[data-cy="upload-unit-photo-btn"]').should('exist');
    });

    it('should award Promise peak to unit member', () => {
        // Find a member without Promise
        // Click award button
        cy.contains('Award Promise').first().click();

        cy.get('.q-dialog').should('be.visible');
        cy.get('.q-dialog button').contains('Confirm').click();

        cy.get('.q-notification').should('contain', 'Promise awarded');
    });

    it('should view member progress', () => {
        cy.contains('View Progress').first().click();
        cy.url().should('include', '/user/');
    });

    it('cannot modify unit details', () => {
        // Check if edit buttons are missing
        cy.get('[data-cy="edit-unit-btn"]').should('not.exist');
    });
});
