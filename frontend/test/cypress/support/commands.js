// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import users from '../fixtures/users.json';

// Login command
Cypress.Commands.add('login', (username, password) => {
    cy.session([username, password], () => {
        cy.request({
            method: 'POST',
            url: '/api/auth/login',
            body: { username, password },
        }).then((response) => {
            expect(response.status).to.eq(201);
            window.localStorage.setItem('token', response.body.access_token);
            // Also set the user data in local storage if your app needs it
            // window.localStorage.setItem('user', JSON.stringify(response.body.user));
        });
    });
});

// Login as specific role
Cypress.Commands.add('loginAs', (role) => {
    const user = users[role];
    if (!user) {
        throw new Error(`User role "${role}" not found in fixtures`);
    }
    cy.login(user.username, user.password);
    cy.visit('/');
});

// Logout command
Cypress.Commands.add('logout', () => {
    window.localStorage.removeItem('token');
    cy.visit('/login');
});

// Check if authenticated
Cypress.Commands.add('checkAuth', () => {
    const token = window.localStorage.getItem('token');
    expect(token).to.be.a('string').and.not.be.empty;
});

// Navigate to route and wait for it
Cypress.Commands.add('navigateTo', (route) => {
    cy.visit(route);
    cy.url().should('include', route);
});

// Fill form helper
Cypress.Commands.add('fillForm', (data) => {
    Object.entries(data).forEach(([key, value]) => {
        cy.get(`[data-cy="${key}"]`).type(value);
    });
});
