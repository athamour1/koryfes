describe('Integration - File Uploads', () => {
    beforeEach(() => {
        cy.loginAs('superAdmin');
    });

    it('should upload user avatar', () => {
        cy.visit('/profile');

        // Mock file upload
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('file contents'),
            fileName: 'avatar.png',
            mimeType: 'image/png',
            lastModified: Date.now(),
        }, { force: true }); // Force because input might be hidden

        // Verify upload success message or visual change
        cy.get('.q-notification').should('contain', 'uploaded');
    });

    it('should validate file size/type', () => {
        cy.visit('/profile');

        // Upload invalid file (e.g., text file)
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('text contents'),
            fileName: 'test.txt',
            mimeType: 'text/plain',
        }, { force: true });

        cy.get('.q-notification').should('contain', 'Invalid file type');
    });
});
