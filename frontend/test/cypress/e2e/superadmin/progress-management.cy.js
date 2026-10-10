describe('Super Admin - Progress Catalog', () => {
    beforeEach(() => {
        cy.loginAs('superAdmin');
        cy.visit('/admin/progress');
    });

    it('shows the fixed catalog from the book', () => {
        cy.get('[data-cy="tab-peaks"]').should('be.visible');
        cy.contains("Α' Κορυφή (Χάλκινη)").should('be.visible');
        cy.get('[data-cy="tab-paths"]').should('contain', '123');
        cy.get('[data-cy="tab-elective-diplomas"]').should('contain', '70');
    });

    it('cannot change the catalog', () => {
        cy.get('[data-cy="create-peak-btn"]').should('not.exist');
        cy.get('[data-cy="tab-elective-diplomas"]').click();
        cy.get('[data-cy="create-diploma-btn"]').should('not.exist');
        cy.contains('Αστρονομίας').click();
        cy.get('.q-dialog').should('contain', 'Απαιτήσεις');
    });
});
